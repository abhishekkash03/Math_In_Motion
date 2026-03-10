from pydantic import BaseModel


class PatternRequest(BaseModel):
    pattern: str
    run: bool = False