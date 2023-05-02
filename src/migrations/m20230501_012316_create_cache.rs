use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Cache::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Cache::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Cache::Path).string().not_null())
                    .col(ColumnDef::new(Cache::Etag).string().not_null())
                    .col(ColumnDef::new(Cache::Body).binary().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                sea_query::Index::create()
                    .name("idx-cache-path-uniq")
                    .table(Cache::Table)
                    .col(Cache::Path)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Cache::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum Cache {
    Table,
    Id,
    Path,
    Etag,
    Body,
}
