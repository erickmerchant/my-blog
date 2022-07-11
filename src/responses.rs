use crate::CustomError;

use actix_files::NamedFile;
use actix_web::Result;
use serde_json::{from_value, json};
use std::{convert::AsRef, fs, path::Path, sync::Arc};

pub fn cacheable_response<F: Fn() -> Result<String, CustomError>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let cache = Path::new("storage/cache").join(src.as_ref());

    if let Err(_meta) = fs::metadata(&cache) {
        let body = process()?;

        fs::create_dir_all(&cache.with_file_name("")).map_err(CustomError::new_internal)?;

        fs::write(&cache, body).map_err(CustomError::new_internal)?;
    }

    static_response(cache)
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
    let file = NamedFile::open(src).map_err(|_| CustomError::NotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(true)
        .disable_content_disposition();

    Ok(file)
}

pub fn js_response<P: AsRef<Path>>(src: P, source_maps: bool) -> Result<NamedFile> {
    use swc::{
        common::errors::ColorConfig, common::errors::Handler, common::SourceMap, config::Options,
        config::SourceMapsConfig,
    };

    cacheable_response(&src, || {
        let cm = Arc::<SourceMap>::default();
        let handler = Arc::new(Handler::with_tty_emitter(
            ColorConfig::Auto,
            true,
            false,
            Some(cm.clone()),
        ));
        let c = swc::Compiler::new(cm.clone());
        let fm = cm
            .load_file(src.as_ref())
            .map_err(CustomError::new_not_found)?;
        let options = json!({
          "minify": true,
          "env": {
            "targets": "supports es6-module and last 2 versions",
            "bugfixes": true
          },
          "jsc": {
            "minify": {
              "compress": true,
              "mangle": true
            }
          },
          "module": {
            "type": "es6"
          }
        });
        let mut options = from_value::<Options>(options).map_err(CustomError::new_internal)?;

        if source_maps {
            options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
        }

        c.process_js_file(fm, &handler, &options)
            .map(|transformed| transformed.code)
            .map_err(CustomError::new_internal)
    })
}

pub fn css_response<P: AsRef<Path>>(src: P, source_maps: bool) -> Result<NamedFile> {
    use parcel_css::{stylesheet, targets};
    use parcel_sourcemap::SourceMap;

    cacheable_response(&src, || -> Result<String, CustomError> {
        let file_contents = fs::read_to_string(&src).map_err(CustomError::new_not_found)?;
        let targets = Some(targets::Browsers {
            android: Some(6619136),
            chrome: Some(6553600),
            edge: Some(6553600),
            firefox: Some(6488064),
            ios_saf: Some(983552),
            opera: Some(5570560),
            safari: Some(983552),
            samsung: Some(983040),
            ie: None,
        });
        let parser_options = stylesheet::ParserOptions {
            nesting: true,
            custom_media: true,
            ..stylesheet::ParserOptions::default()
        };
        let minifier_options = stylesheet::MinifyOptions {
            targets,
            ..stylesheet::MinifyOptions::default()
        };
        let mut source_map = None;

        if source_maps {
            let mut sm = SourceMap::new("/");

            sm.add_source(src.as_ref().to_str().unwrap_or_default());

            if sm.set_source_content(0, &file_contents).is_ok() {
                source_map = Some(sm)
            };
        };

        let printer_options = stylesheet::PrinterOptions {
            minify: true,
            targets,
            source_map: source_map.as_mut(),
            ..stylesheet::PrinterOptions::default()
        };
        let mut stylesheet = stylesheet::StyleSheet::parse(
            src.as_ref().to_str().unwrap_or_default(),
            &file_contents,
            parser_options,
        )
        .map_err(CustomError::new_internal)?;

        stylesheet
            .minify(minifier_options)
            .map_err(CustomError::new_internal)?;

        let css = stylesheet
            .to_css(printer_options)
            .map_err(CustomError::new_internal)?;
        let mut code = css.code;

        if let Some(mut source_map) = source_map {
            let mut vlq_output = Vec::<u8>::new();

            source_map.write_vlq(&mut vlq_output).ok();

            let sm = json!({
              "version": 3,
              "mappings": String::from_utf8(vlq_output).map_err(CustomError::new_internal)?,
              "sources": source_map.get_sources(),
              "sourcesContent": source_map.get_sources_content(),
              "names": source_map.get_names(),
            });

            code.push_str("\n/*# sourceMappingURL=data:application/json;base64,");

            base64::encode_config_buf(
                sm.to_string().as_bytes(),
                base64::Config::new(base64::CharacterSet::Standard, true),
                &mut code,
            );

            code.push_str(" */")
        };

        Ok(code)
    })
}
