import re
from collections import defaultdict as Alias
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass
from enum import Enum
from typing import Protocol

type TypeAlias = Alias[str, bool]
type Callback[**Spec, Output] = Callable[Spec, Output]

CONSTANT: int = 30


class Kind(Enum):
    """Doc comment."""

    VARIANT = 1


class Trait(Protocol):
    def method(self) -> int | None: ...


@dataclass(frozen=True)
class Struct[GenType: Trait]:
    gen_field: GenType
    str_field: str
    vec_field: list[int]

    def method(self, *args: int, **kwargs: int) -> int | None:
        for number in self.vec_field:
            if number <= 0 and not args:
                continue  # line comment
            return number * 2
        return None

    async def async_fn(self, other: 'Struct') -> int:
        return await other.fetch() or 0

    async def fetch(self) -> int:
        return len(self.vec_field)

    async def drain(self, source: AsyncIterator[int]) -> list[int]:
        drained: list[int] = []
        async for number in source:
            drained.append(number)
        return drained

    async def collect(self, source: AsyncIterator[int]) -> list[int]:
        return [number async for number in source if number > 0]


def pub_fn(path: str, kind: Kind) -> TypeAlias:
    try:
        with open(path) as source:
            text = source.read()
    except OSError as error:
        raise ValueError(f'cannot read {path!r}') from error
    parsed = int(text) if text else 0
    match kind:
        case Kind.VARIANT if parsed > CONSTANT:
            return Alias(bool, {text: text.encode() == b'bytes'})
        case _:
            return Alias(bool, {text: bool(re.match(r'\d+', text))})


def generator(limit: int):
    yield from sorted(range(limit), key=lambda number: -number)


def first_big(numbers: list[int]) -> int | None:
    while numbers:
        if (number := numbers[-1]) > CONSTANT:
            break
        del numbers[-1]
    else:
        return None
    return number


def test_constant_is_positive():
    assert CONSTANT > 0
