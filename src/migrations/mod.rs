pub use sea_orm_migration::prelude::*;

mod m20230329_075500_create_page;
mod m20230501_012316_create_cache;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20230329_075500_create_page::Migration),
            Box::new(m20230501_012316_create_cache::Migration),
        ]
    }
}
