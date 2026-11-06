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

pub trait Trait: Send {
    type Item;
    fn method(&self) -> Option<i64>;
}

impl<GenType: Trait> Struct<'_, GenType> {
    pub async fn async_fn(param: &GenType) -> i64 {
        async { param.method().unwrap_or(0) }.await
    }

    pub fn reset(mut self, len: impl Fn() -> usize) -> Self {
        self.vec_field = vec![0; len()];
        self
    }
}

impl<GenType> Trait for Struct<'_, GenType>
where
    GenType: Trait,
{
    type Item = Vec<u8>;

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
    let bytes: [u8; 4] = (parsed as u32).to_be_bytes();
    let is_big = |value: u32| value > CONSTANT;
    println!("parsed {bytes:?} from {}", param);
    match enum_value {
        Enum::Variant { field } if is_big(field) => todo!(),
        _ => {}
    }
    Ok(Alias::new())
}

pub unsafe trait UnsafeTrait {}
