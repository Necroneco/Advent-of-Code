import { loadInput } from "../../utils/loadInput.js"

const pair = {
    "(": ")",
    "[": "]",
    "{": "}",
    "<": ">",
    ")": "(",
    "]": "[",
    "}": "{",
    ">": "<",
}

function getFirstIllegalCharacterValue(line: string, values: Record<string, number>): number {
    const stack: string[] = []
    for (const char of line) {
        switch (char) {
            case "(":
            case "[":
            case "{":
            case "<":
                stack.push(char)
                break
            case ")":
            case "]":
            case "}":
            case ">":
                if (stack.pop() !== pair[char]) {
                    return values[char]
                }
                break
        }
    }
    return 0
}

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const values = {
        "": 0,
        ")": 3,
        "]": 57,
        "}": 1197,
        ">": 25137,
    }

    let result = 0
    for (const line of lines) {
        result += getFirstIllegalCharacterValue(line, values)
    }
    console.log(`Q1: ${result}`)
}

Q1()


function getIncompleteStack(line: string): (keyof typeof pair)[] | null {
    const stack: (keyof typeof pair)[] = []
    for (const char of line) {
        switch (char) {
            case "(":
            case "[":
            case "{":
            case "<":
                stack.push(char)
                break
            case ")":
            case "]":
            case "}":
            case ">":
                if (stack.pop() !== pair[char]) {
                    return null
                }
                break
        }
    }
    return stack
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const value: Record<string, number> = {
        ")": 1,
        "]": 2,
        "}": 3,
        ">": 4,
    }

    const results: number[] = []
    for (const line of lines) {
        const stack = getIncompleteStack(line)
        if (stack !== null) {
            let result = 0
            let char: keyof typeof pair | undefined
            while (char = stack.pop()) {
                result = 5 * result + value[pair[char]]
            }
            results.push(result)
        }
    }
    results.sort((a, b) => a - b)
    console.log(`Q2: ${results[Math.floor(results.length / 2)]}`)
}

Q2()
