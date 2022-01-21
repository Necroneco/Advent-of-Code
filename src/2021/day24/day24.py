from os import path
import re

class ALU:
    input: list[int]

    def __init__(self, instructions: list[str]):
        self.w: int = 0
        self.x: int = 0
        self.y: int = 0
        self.z: int = 0
        self.instructions = instructions

    def __getitem__(self, key):
        if re.match(r"[wxyz]", key) is not None:
            return getattr(self, key)
        elif re.match(r"-?\d+", key) is not None:
            return int(key)
        else:
            return key

    def __setitem__(self, key, value):
        setattr(self, key, value)

    def run(self, input: int):
        self.input = [int(value) for value in list(str(input))]
        if 0 in self.input:
            index = self.input.index(0)
            self.z = (input % 10 ** (14 - index - 1)) + 1
            return self.z

        self.input.reverse()
        self.x = 0
        self.y = 0
        self.z = 0
        self.w = 0

        for instruction in self.instructions:
            if instruction == "":
                continue
            getattr(self, instruction[:3])(instruction[4:])

        return self.z

    def inp(self, instruction):
        # print(self)
        value = self.input.pop()
        # print(f"input: {value}")
        setattr(self, instruction, value)

    def add(self, instruction):
        a, b = instruction.split(' ')
        self[a] += self[b]

    def mul(self, instruction):
        a, b = instruction.split(' ')
        self[a] *= self[b]

    def div(self, instruction):
        a, b = instruction.split(' ')
        self[a] //= self[b]

    def mod(self, instruction):
        a, b = instruction.split(' ')
        self[a] %= self[b]

    def eql(self, instruction):
        a, b = instruction.split(' ')
        self[a] = 1 if self[a] == self[b] else 0

    def __str__(self):
        return f"w:{self.w} x:{self.x} y:{self.y} z:{self.z}"

    def __repr__(self):
        return self.__str__()


def load_data():
    instructions = []
    with open(path.join(path.dirname(__file__), "input.txt")) as f:
        for line in f:
            instructions.append(line.strip())
    return instructions


def Q():
    instructions = load_data()
    alu = ALU(instructions)

    # +4 +11 +5 +11 +14 -10 +11 -9 -3 +5 -5 -10 -4 -5
    #  9   2  9   1   5   9   7  9  9  9  9   4  9  8
    #  2   1  6   1   1   5   1  3  9  1  1   1  8  1

    print(f"Q1: {92915979999498}")
    alu.run(92915979999498)
    print(alu)

    print(f"Q2: {21611513911181}")
    alu.run(21611513911181)
    print(alu)


if __name__ == "__main__":
    Q()
