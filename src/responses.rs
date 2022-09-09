use crate::Config;
use actix_files::NamedFile;
use actix_web::{error::Error, error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use serde_json::{from_value, json};
use std::{convert::AsRef, fs, path::Path, sync::Arc};

pub fn html_response<F: Fn() -> Result<String, Error>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    cacheable_response(src, || {
        use minify_html::{minify, Cfg};

        let body = process()?;

        let cfg = Cfg::spec_compliant();
        let minified = minify(body.as_bytes(), &cfg);

        String::from_utf8(minified).map_err(ErrorInternalServerError)
    })
}

pub fn cacheable_response<F: Fn() -> Result<String, Error>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let cache = Path::new("storage/cache").join(src.as_ref());

    if let Err(_meta) = fs::metadata(&cache) {
        let body = process()?;

        fs::create_dir_all(&cache.with_file_name("")).map_err(ErrorInternalServerError)?;

        fs::write(&cache, body).map_err(ErrorInternalServerError)?;
    }

    static_response(cache)
}

pub fn static_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
    let file = NamedFile::open(src).map_err(ErrorNotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(false)
        .disable_content_disposition();

    Ok(file)
}

pub fn js_response<P: AsRef<Path>>(src: P, config: web::Data<Config>) -> Result<NamedFile> {
    use swc::{config::Options, config::SourceMapsConfig};
    use swc_common::{errors::ColorConfig, errors::Handler, SourceMap};

    cacheable_response(&src, || {
        let cm = Arc::<SourceMap>::default();
        let handler = Arc::new(Handler::with_tty_emitter(
            ColorConfig::Auto,
            true,
            false,
            Some(cm.clone()),
        ));
        let c = swc::Compiler::new(cm.clone());
        let fm = cm.load_file(src.as_ref()).map_err(ErrorNotFound)?;
        let options = json!({
          "minify": true,
          "env": {
            "targets": config.targets,
            "bugfixes": true
          },
          "jsc": {
            "transform": {
                "react": {
                    "pragma": "Element.h",
                    "pragmaFrag": "Element.fragment"
                },
            },
            "parser": {
                "syntax": "ecmascript",
                "jsx": true,
            },
            "minify": {
              "compress": true,
              "mangle": true
            },
          },
          "module": {
            "type": "es6"
          }
        });
        let mut options = from_value::<Options>(options).map_err(ErrorInternalServerError)?;

        if config.source_maps {
            options.source_maps = Some(SourceMapsConfig::Str("inline".to_string()));
        }

        c.process_js_file(fm, &handler, &options)
            .map(|transformed| transformed.code)
            .map_err(ErrorInternalServerError)
    })
}

pub fn css_response<P: AsRef<Path>>(src: P, config: web::Data<Config>) -> Result<NamedFile> {
    use lightningcss::{stylesheet, targets};
    use parcel_sourcemap::SourceMap;

    cacheable_response(&src, || -> Result<String, Error> {
        let file_contents = fs::read_to_string(&src).map_err(ErrorNotFound)?;
        let targets =
            targets::Browsers::from_browserslist([config.targets.as_str()]).unwrap_or_default();

        let parser_options = stylesheet::ParserOptions::default();
        let minifier_options = stylesheet::MinifyOptions {
            targets,
            ..stylesheet::MinifyOptions::default()
        };
        let mut source_map = None;

        if config.source_maps {
            let mut sm = SourceMap::new("/");

            if let Some(src_str) = src.as_ref().to_str() {
                sm.add_source(src_str);
            };

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
        let mut stylesheet = stylesheet::StyleSheet::parse(&file_contents, parser_options)
            .map_err(|e| ErrorInternalServerError(e.to_string()))?;

        stylesheet
            .minify(minifier_options)
            .map_err(ErrorInternalServerError)?;

        let css = stylesheet
            .to_css(printer_options)
            .map_err(ErrorInternalServerError)?;
        let mut code = css.code;

        if let Some(mut source_map) = source_map {
            let mut vlq_output = Vec::<u8>::new();

            source_map.write_vlq(&mut vlq_output).ok();

            let sm = json!({
              "version": 3,
              "mappings": String::from_utf8(vlq_output).map_err(ErrorInternalServerError)?,
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
