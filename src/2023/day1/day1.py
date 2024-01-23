from utils.load_input import load_lines
import re

is_num = re.compile(r"\d")

words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]

def parse(s: str) -> str:
    print(s)
    nums = []

    def replace(s: str) -> str:
        if is_num.match(s[0]):
            nums.append(int(s[0]))
            return s[1:]
        for i, word in enumerate(words):
            if s.startswith(word):
                nums.append(i)
                return s[len(word):]
        return s[1:]

    while len(s) > 0:
        s = replace(s)

    n = int(f"{nums[0]}{nums[-1]}")
    print(n)
    return n

sum = 0
for line in load_lines(__file__):
    sum += parse(line)

print(sum)

