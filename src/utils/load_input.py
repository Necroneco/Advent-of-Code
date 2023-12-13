from os import path


def load_lines(__file__: str) -> list[str]:
    lines: list[str] = []
    with open(path.join(path.dirname(__file__), "input.txt")) as f:
        for line in f:
            lines.append(line.strip())

    return lines
