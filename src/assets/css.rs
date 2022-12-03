use crate::{config, responses};
use actix_files::NamedFile;
use actix_web::{error::Error, error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use lightningcss::{stylesheet, targets};
use parcel_sourcemap::SourceMap;
use serde_json::json;
use std::{fs, path::Path};

pub async fn handler(
    file: web::Path<String>,
    config: web::Data<config::Config>,
) -> Result<NamedFile> {
    let src = Path::new("assets")
        .join(file.to_string())
        .with_extension("css");

    responses::cacheable(&src, || -> Result<String, Error> {
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

            if let Some(src_str) = src.to_str() {
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
