//! Crate doc comment.
use std::collections::HashMap as Alias;

const CONSTANT: u32 = 30;
#[derive(Debug, Clone)]
pub struct Struct<'lifetime> {
    pub str_field: &'lifetime str,
    pub vec_field: Vec<i64>,
}
fn _private_fn(_param: &Struct) {}
pub enum Enum {
    Variant { field: u32 },
}
pub trait Trait {
    fn method(&self) -> Option<i64>;
}
impl Struct<'_> {
    pub async fn async_fn<GenType: Trait>(param: &GenType) -> i64 {
        async { param.method().unwrap_or(0) }.await
    }
}
impl Trait for Struct<'_> {
    fn method(&self) -> Option<i64> {
        for item in &self.vec_field {
            if *item <= 0 {
                continue; // line comment
            }
            return Some(*item);
        }
        None
    }
}
pub fn pub_fn(param: &str, enum_value: Enum) -> Result<Alias<String, bool>, std::io::Error> {
    let local = std::fs::read_to_string(param)?;
    let parsed = local.parse::<u64>().unwrap_or(0);
    println!("parsed {parsed} from {}", param);
    match enum_value {
        Enum::Variant { field } if field > CONSTANT => todo!(),
        _ => {}
    }
    Ok(Alias::new())
}
