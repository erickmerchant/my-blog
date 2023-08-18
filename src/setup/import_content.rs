use super::parse_content::*;
use crate::models::{entry, entry_tag, tag};
use anyhow::Result;
use camino::Utf8Path;
use glob::glob;
use pathdiff::diff_utf8_paths;
use sea_orm::{prelude::*, ActiveModelTrait, ActiveValue::Set, DatabaseConnection, EntityTrait};
use std::fs;

pub async fn import_content(connection: &DatabaseConnection) -> Result<()> {
	let paths = glob("content/*/*.html".to_string().as_str())?;

	let connection = connection.clone();

	for path in paths.flatten() {
		if let Some(path) = Utf8Path::from_path(&path) {
			let diff = diff_utf8_paths(path, Utf8Path::new("content/"))
				.expect("path should be diffable with content");
			let mut entry = entry::ActiveModel {
				..Default::default()
			};
			let slug = diff.file_stem().expect("file stem should exist");
			let category = diff.parent().expect("parent should exist");
			let contents = fs::read_to_string(path)?;
			let (data, content, elements) = parse_content(contents)?;

			if let Some(data) = data.clone() {
				entry.title = Set(data.title);
				entry.description = Set(data.description);
				entry.permalink = Set(data.permalink);
				entry.template = Set(data.template);
				entry.date = Set(data.date);
				entry.feed = Set(data.feed);
			}

			entry.content = Set(String::from_utf8(content)?);
			entry.elements = Set(elements);
			entry.slug = Set(slug.to_string());
			entry.category = Set(category.to_string());

			let entry = entry.insert(&connection).await?;

			if let Some(data) = data {
				if let Some(tags) = data.tags {
					for slug in tags {
						let tag = if let Some(tag) = tag::Entity::find()
							.filter(tag::Column::Slug.eq(slug.clone()))
							.one(&connection)
							.await?
						{
							tag
						} else {
							let mut tag = tag::ActiveModel {
								..Default::default()
							};

							tag.slug = Set(slug);
							tag.insert(&connection).await?
						};

						let mut entry_tag = entry_tag::ActiveModel {
							..Default::default()
						};

						entry_tag.entry_id = Set(entry.id);
						entry_tag.tag_id = Set(tag.id);
						entry_tag.insert(&connection).await?;
					}
				}
			}
		}
	}

	Ok(())
}
