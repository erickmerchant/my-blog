use actix_files::NamedFile;
use actix_web::{error::ErrorInternalServerError, error::ErrorNotFound, web, Result};
use lightningcss::{stylesheet, targets};
use parcel_sourcemap::SourceMap;
use std::{env::var, fs, path::Path};

pub async fn css(file: web::Path<String>) -> Result<NamedFile> {
    let src = Path::new("theme")
        .join(file.to_string())
        .with_extension("css");

    let file = if let Some(file) = super::Cache::get(&src) {
        file?
    } else {
        let file_contents = fs::read_to_string(&src).map_err(ErrorNotFound)?;
        let targets =
            targets::Browsers::from_browserslist(["supports es6-module and last 2 versions"])
                .unwrap_or_default();
        let parser_options = stylesheet::ParserOptions::default();
        let minifier_options = stylesheet::MinifyOptions {
            targets,
            ..stylesheet::MinifyOptions::default()
        };
        let mut source_map = None;

        if let Ok(source_maps) = var("SOURCE_MAPS") {
            if source_maps == "true" {
                let mut sm = SourceMap::new("/");

                if let Some(src_str) = src.to_str() {
                    sm.add_source(src_str);
                };

                if sm.set_source_content(0, &file_contents).is_ok() {
                    source_map = Some(sm)
                };
            }
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

            if let Ok(source_map_data_url) = source_map.to_data_url(None) {
                code.push_str(
                    format!("\n/*# sourceMappingURL={} */", &source_map_data_url).as_str(),
                );
            }
        };

        super::Cache::set(&src, &code)?
    };

    super::file(file, src)
}
