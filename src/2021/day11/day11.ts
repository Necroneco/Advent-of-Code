import { loadInput } from "../../utils/loadInput.js"
import sum from "lodash-es/sum.js"

async function loadPuzzle() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const puzzleMap: number[][] = []
    for (const line of lines) {
        const row = line.split("").map(Number)
        puzzleMap.push(row)
    }

    return puzzleMap
}

function runStep(puzzleMap: number[][], flashMask: boolean[][]) {
    let flashCount = 0
    for (let y = 0; y < puzzleMap.length; y++) {
        const row = puzzleMap[y]
        for (let x = 0; x < row.length; x++) {
            row[x] += 1
        }
    }
    let finished = false
    while (!finished) {
        finished = true
        for (let y = 0; y < puzzleMap.length; y++) {
            const row = puzzleMap[y]
            for (let x = 0; x < row.length; x++) {
                const value = row[x]
                if (value > 9 && !flashMask[y][x]) {
                    flashMask[y][x] = true
                    flashCount += 1
                    finished = false
                    const above = puzzleMap[y - 1]
                    if (above !== undefined) {
                        above[x] += 1
                        if (above[x - 1] !== undefined) {
                            above[x - 1] += 1
                        }
                        if (above[x + 1] !== undefined) {
                            above[x + 1] += 1
                        }
                    }
                    const below = puzzleMap[y + 1]
                    if (below !== undefined) {
                        below[x] += 1
                        if (below[x - 1] !== undefined) {
                            below[x - 1] += 1
                        }
                        if (below[x + 1] !== undefined) {
                            below[x + 1] += 1
                        }
                    }
                    if (row[x - 1] !== undefined) {
                        row[x - 1] += 1
                    }
                    if (row[x + 1] !== undefined) {
                        row[x + 1] += 1
                    }
                }
            }
        }
    }
    for (let y = 0; y < flashMask.length; y++) {
        const row = flashMask[y]
        for (let x = 0; x < row.length; x++) {
            if (row[x]) {
                row[x] = false
                puzzleMap[y][x] = 0
            }
        }
    }
    return flashCount
}

async function Q1() {
    const puzzleMap = await loadPuzzle()

    const flashMask = puzzleMap.map(r => r.map(() => false))

    let result = 0
    let loop = 100
    while (loop--) {
        result += runStep(puzzleMap, flashMask)
    }
    console.log(`Q1: ${result}`)
}

Q1()

async function Q2() {
    const puzzleMap = await loadPuzzle()
    const totalCount = sum(puzzleMap.map(v => v.length))

    const flashMask = puzzleMap.map(r => r.map(() => false))
    let step = 0
    while (true) {
        const flashCount = runStep(puzzleMap, flashMask)
        step += 1
        if (flashCount === totalCount) {
            console.log(`Q2: ${step}`)
            return
        }
    }
}

Q2()
