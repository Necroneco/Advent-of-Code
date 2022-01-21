from os import path


def load_data():
    puzzle = []
    with open(path.join(path.dirname(__file__), "input.txt")) as f:
        for line in f:
            puzzle.append(list(line.strip()))

    return puzzle


def Q1():
    puzzle = load_data()

    width = len(puzzle[0])
    height = len(puzzle)

    def step():
        moved = False

        for y in range(height):
            x = 0
            head = puzzle[y][x]
            while x + 1 < width:
                if puzzle[y][x] == ">" and puzzle[y][x + 1] == ".":
                    puzzle[y][x] = "."
                    puzzle[y][x + 1] = ">"
                    x += 1
                    moved = True
                x += 1
            if x < width and puzzle[y][x] == ">" and head == ".":
                puzzle[y][x] = "."
                puzzle[y][0] = ">"
                moved = True

        for x in range(width):
            y = 0
            head = puzzle[y][x]
            while y + 1 < height:
                if puzzle[y][x] == "v" and puzzle[y + 1][x] == ".":
                    puzzle[y][x] = "."
                    puzzle[y + 1][x] = "v"
                    y += 1
                    moved = True
                y += 1
            if y < height and puzzle[y][x] == "v" and head == ".":
                puzzle[y][x] = "."
                puzzle[0][x] = "v"
                moved = True

        return moved

    i = 0
    moved = True
    while moved:
        print(i, "-" * (width - 2))
        for y in range(height):
            print("".join(puzzle[y]))
        i += 1
        moved = step()

    print(f"Q1: {i}")


if __name__ == "__main__":
    Q1()
