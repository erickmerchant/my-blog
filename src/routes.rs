use crate::assets;
use crate::common::{cacheable_response, render_template, CustomError};
use crate::models;
use crate::views;
use actix_files::NamedFile;
use actix_web::{
  body::BoxBody,
  http::header::{self, HeaderValue},
  web, HttpRequest, HttpResponse, Result,
};
use std::path::Path;

pub fn configure(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("")
      .route("/", web::get().to(home))
      .route("/posts.rss", web::get().to(posts_rss))
      .route("/posts/{post:.*.html}", web::get().to(post))
      .route("/{file:.*?}", web::get().to(assets::file)),
  );
}

async fn home() -> Result<NamedFile> {
  cacheable_response(Path::new("index.html"), || {
    let site = models::Site::get();
    let posts: Vec<Option<models::Post>> = site
      .posts
      .iter()
      .map(|slug| models::Post::get_by_slug(slug.to_string()))
      .collect();

    let title = "Home".to_string();

    match posts.len() > 1 {
      true => render_template(views::Home { site, title, posts }),
      false => render_template(views::Post {
        site,
        title,
        post: posts.get(0).and_then(|p| p.clone()),
      }),
    }
  })
}

async fn posts_rss(req: HttpRequest) -> HttpResponse<BoxBody> {
  let result = cacheable_response(Path::new("posts.rss"), || {
    let site = models::Site::get();
    let posts: Vec<Option<models::Post>> = site
      .posts
      .iter()
      .map(|slug| models::Post::get_by_slug(slug.to_string()))
      .collect();

    render_template(views::Feed { site, posts })
  })
  .unwrap();

  // Content-Type:
  // x-content-type-options: nosniff

  let mut res = result.into_response(&req);

  let header_map = res.headers_mut();

  header_map.insert(
    header::CONTENT_TYPE,
    HeaderValue::from_static("application/xml; charset=utf-8"),
  );

  header_map.insert(
    header::X_CONTENT_TYPE_OPTIONS,
    HeaderValue::from_static("nosniff"),
  );

  res
}

async fn post(post: web::Path<String>) -> Result<NamedFile> {
  let slug = Path::new(post.as_ref().as_str()).with_extension("");

  let slug = slug.to_str().expect("invalid slug");

  cacheable_response(post.as_ref().as_str(), || {
    let site = models::Site::get();

    let post = models::Post::get_by_slug(slug.to_string());

    match post {
      Some(post) => render_template(views::Post {
        site,
        title: post.data.title.clone(),
        post: Some(post),
      }),
      None => Err(CustomError::NotFound {}),
    }
  })
}
