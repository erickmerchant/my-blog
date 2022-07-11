use crate::{models::*, responses::*, views::*, Config, CustomError};

use actix_files::NamedFile;
use actix_web::{web, Result};
use askama::Template;
use std::path::{Path, PathBuf};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("")
            .route("/", web::get().to(home))
            .route("/posts.rss", web::get().to(posts_rss))
            .route("/posts/{slug:.*.html}", web::get().to(post))
            .route("/{file:.*?}", web::get().to(file)),
    );
}

async fn home(site: web::Data<Site>) -> Result<NamedFile> {
    cacheable_response(Path::new("index.html"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();
        let title = "Home".to_string();

        match posts.len() > 1 {
            true => render_template(HomeView { site, title, posts }),
            false => match posts.get(0) {
                Some(post) => render_template(PostView {
                    site,
                    title,
                    post: post.to_owned(),
                }),
                None => Err(CustomError::NotFound {}),
            },
        }
    })
}

async fn posts_rss(site: web::Data<Site>) -> Result<NamedFile> {
    cacheable_response(Path::new("posts.rss"), || {
        let site = site.as_ref().to_owned();
        let posts = Post::get_all();

        Ok(FeedView { site, posts }.render().unwrap_or_default())
    })
}

fn get_post_path(post: web::Path<String>, directory: &str) -> PathBuf {
    let slug = Path::new(post.as_ref().as_str()).with_extension("");
    let slug = slug.to_str().expect("invalid slug");

    Path::new(directory).join(slug).with_extension("html")
}

fn get_post_html(path: PathBuf, site: Site) -> Result<String, CustomError> {
    let post = Post::get_by_path(path);

    match post {
        Some(post) => render_template(PostView {
            site,
            title: post.title.clone(),
            post,
        }),
        None => Err(CustomError::NotFound {}),
    }
}

async fn post(slug: web::Path<String>, site: web::Data<Site>) -> Result<NamedFile> {
    let site = site.as_ref();
    let path = get_post_path(slug, "content/posts");

    cacheable_response(&path, || get_post_html(path.to_owned(), site.to_owned()))
}

async fn file(file: web::Path<String>, data: web::Data<Config>) -> Result<NamedFile> {
    let src = Path::new("assets").join(file.to_string());
    let ext_str = if let Some(ext) = src.extension().and_then(|ext| ext.to_str()) {
        ext
    } else {
        ""
    };

    match ext_str {
        "js" => js_response(src, data.source_maps),
        "css" => css_response(src, data.source_maps),
        _ => static_response(src),
    }
}
