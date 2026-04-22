import json
import math
import sys
from pathlib import Path


def _read_params(params_path: Path) -> dict:
    if not params_path.exists():
        return {}

    with params_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    return payload if isinstance(payload, dict) else {}


def _read_number(params: dict, key: str, fallback: float) -> float:
    value = params.get(key, fallback)
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return fallback

    if not math.isfinite(parsed):
        return fallback

    return parsed


def main() -> int:
    if len(sys.argv) < 2:
        raise ValueError("sandbox path argument is required")

    sandbox_dir = Path(sys.argv[1]).resolve()
    params = _read_params(sandbox_dir / "params.json")

    frequency = _read_number(params, "frequency", 1.0)
    amplitude = _read_number(params, "amplitude", 1.0)

    point_count = 256
    x_values = []
    y_values = []

    for index in range(point_count):
        x = (2.0 * math.pi * index) / (point_count - 1)
        y = amplitude * math.sin(frequency * x)
        x_values.append(round(x, 6))
        y_values.append(round(y, 6))

    output = {"data": {"x": x_values, "y": y_values}}
    with (sandbox_dir / "output.json").open("w", encoding="utf-8") as handle:
        json.dump(output, handle, ensure_ascii=False)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
