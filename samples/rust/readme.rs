use std::collections::HashMap as Alias;
pub type TypeAlias = Alias<String, bool>;

const CONSTANT: u32 = 30;

/// Doc comment.
#[derive(Debug, Clone)]
pub struct Struct<'lifetime, GenType> {
    pub gen_field: &'lifetime GenType,
    pub vec_field: Vec<i64>,
}

pub enum Enum {
    Variant { field: u32 },
    Tuple(Vec<u8>),
}

pub unsafe trait Trait {
    fn method(&self) -> Option<i64>;
}

impl<GenType: Trait> Struct<'_, GenType> {
    pub async fn async_fn(param: &GenType) -> i64 {
        async { param.method().unwrap_or(0) }.await
    }
}

unsafe impl<GenType: Trait> Trait for Struct<'_, GenType> {
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

pub fn pub_fn(param: &str, enum_value: crate::Enum) -> Result<TypeAlias, std::io::Error> {
    let local: String = std::fs::read_to_string(param)?;
    let parsed = local.parse::<u64>().unwrap_or(0);
    let is_big = |value: u32| value > CONSTANT;
    println!("parsed {parsed:?} from {}", param);
    match enum_value {
        Enum::Variant { field } if is_big(field) => todo!(),
        _ => {}
    }
    Ok(Alias::new())
}
