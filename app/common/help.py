from typing import Any


def orm_to_dict(obj: Any) -> dict[str, Any]:
    """
    Recursively converts SQLAlchemy ORM objects to plain dicts, excluding private attributes.
    Handles nested relationships.
    """
    if obj is None:
        return None
    if hasattr(obj, '__dict__'):
        # Exclude SQLAlchemy internal state
        d = {k: orm_to_dict(v) for k, v in obj.__dict__.items()
             if not k.startswith('_') and v is not None}
        print(f"d: {d}")
        return d
    return obj



def orm_to_dict2(obj: Any) -> dict[str, Any]:
    """
    Recursively converts SQLAlchemy ORM objects to plain dicts, excluding private attributes.
    Handles nested relationships and defaults missing optionals to None.
    """
    if obj is None:
        return None
    if hasattr(obj, '__dict__'):
        d = {}
        for k, v in obj.__dict__.items():
            if not k.startswith('_') and v is not None:
                d[k] = orm_to_dict2(v)
            elif k in ['role'] and v is None:  # Explicitly add optional fields as None
                d[k] = None
        return d
    return obj

