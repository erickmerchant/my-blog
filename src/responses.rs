use crate::Config;
use actix_files::NamedFile;
use actix_web::{error::Error, error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use serde_json::{from_value, json};
use std::{convert::AsRef, fs, fs::File, io::Write, path::Path, sync::Arc};

pub fn cacheable_response<F: Fn() -> Result<String, Error>, P: AsRef<Path>>(
    src: P,
    process: F,
) -> Result<NamedFile> {
    let src = Path::new("storage/cache").join(src.as_ref());
    let file = match &src.exists() {
        false => {
            let body = process()?;

            fs::create_dir_all(&src.with_file_name("")).map_err(ErrorInternalServerError)?;

            let mut file = File::options()
                .read(true)
                .append(true)
                .create(true)
                .open(&src)
                .map_err(ErrorInternalServerError)?;

            file.write_all(body.as_bytes())
                .map_err(ErrorInternalServerError)?;

            file
        }
        true => File::open(&src).map_err(ErrorInternalServerError)?,
    };

    file_response(file, src)
}

pub fn file_response<P: AsRef<Path>>(file: File, src: P) -> Result<NamedFile> {
    let file = NamedFile::from_file(file, src).map_err(ErrorNotFound)?;
    let file = file
        .prefer_utf8(true)
        .use_etag(true)
        .use_last_modified(false)
        .disable_content_disposition();

    Ok(file)
}

pub fn asset_response<P: AsRef<Path>>(src: P) -> Result<NamedFile> {
    let file = File::open(&src).map_err(ErrorInternalServerError)?;

    file_response(file, src)
}

pub fn js_response<P: AsRef<Path>>(src: P, config: web::Data<Config>) -> Result<NamedFile> {
    use swc::{config::Options, config::SourceMapsConfig};
    use swc_common::{errors::ColorConfig, errors::Handler, SourceMap, GLOBALS};
    cacheable_response(&src, || {
        let src = src.as_ref();

        let cm = Arc::<SourceMap>::default();
        let handler = Arc::new(Handler::with_tty_emitter(
            ColorConfig::Auto,
            true,
            false,
            Some(cm.clone()),
        ));
        let c = swc::Compiler::new(cm.clone());
        let fm = cm.load_file(src).map_err(ErrorNotFound)?;
        let options = json!({
            "minify": true,
            "env": {
                "targets": config.targets,
                "bugfixes": true
            },
            "jsc": {
                "parser": {
                    "syntax": "ecmascript"
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

        GLOBALS.set(&Default::default(), || {
            c.process_js_file(fm, &handler, &options)
                .map(|transformed| transformed.code)
                .map_err(ErrorInternalServerError)
        })
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
