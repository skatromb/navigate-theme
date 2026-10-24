//! Crate doc comment.
use std::collections::HashMap as Map;

const MAX_DAYS: u32 = 30;
#[derive(Debug, Clone)]
pub struct Listing<'title> {
    pub title: &'title str,
    pub prices: Vec<i64>,
}
pub enum Status {
    Sold { days: u32 },
}
pub trait Priced {
    fn price(&self) -> Option<i64>;
}
impl Priced for Listing<'_> {
    fn price(&self) -> Option<i64> {
        for price in &self.prices {
            if *price <= 0 {
                continue; // line comment
            }
            return Some(*price);
        }
        None
    }
}
impl Listing<'_> {
    pub async fn settle<GenType: Priced>(item: &GenType) -> i64 {
        async { item.price().unwrap_or(0) }.await
    }
}
pub fn load(path: &str, status: Status) -> Result<Map<String, bool>, std::io::Error> {
    let raw = std::fs::read_to_string(path)?;
    let parsed = raw.parse::<u64>().unwrap_or(0);
    println!("parsed {parsed} from {}", path);
    match status {
        Status::Sold { days } if days > MAX_DAYS => todo!(),
        _ => {}
    }
    Ok(Map::new())
}
