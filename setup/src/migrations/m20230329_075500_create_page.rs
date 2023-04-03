/*
@todo
- date should be a date type
- elements should be json
*/

use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Page::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Page::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Page::Title).string().not_null())
                    .col(ColumnDef::new(Page::Slug).string().not_null())
                    .col(ColumnDef::new(Page::Category).string().not_null())
                    .col(ColumnDef::new(Page::Date).string().not_null())
                    .col(ColumnDef::new(Page::Description).string().not_null())
                    .col(ColumnDef::new(Page::Content).string().not_null())
                    .col(ColumnDef::new(Page::Template).string().not_null())
                    .col(ColumnDef::new(Page::Elements).string().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_query::Index::create()
                    .name("idx-page-category-slug-uniq")
                    .table(Page::Table)
                    .col(Page::Category)
                    .col(Page::Slug)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Page::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum Page {
    Table,
    Id,
    Slug,
    Category,
    Title,
    Date,
    Description,
    Content,
    Template,
    Elements,
}
