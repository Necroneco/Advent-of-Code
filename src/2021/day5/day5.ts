import {loadInput} from "../../utils/loadInput.js"
import {rangeInclude} from "../../utils/rangeInclude.js";

class PuzzleMap {
    readonly map: number[][] = []

    private over2 = 0

    addLine(x1: number, y1: number, x2: number, y2: number) {
        if (x1 === x2) {
            const start = Math.min(y1, y2)
            const end = Math.max(y1, y2)
            for (let y = start; y <= end; y++) {
                const row = (this.map[y] ??= [])
                row[x1] = (row[x1] ?? 0) + 1
                if (row[x1] === 2) {
                    this.over2++
                }
            }
        } else if (y1 === y2) {
            const row = (this.map[y1] ??= [])
            const start = Math.min(x1, x2)
            const end = Math.max(x1, x2)
            for (let x = start; x <= end; x++) {
                row[x] = (row[x] ?? 0) + 1
                if (row[x] === 2) {
                    this.over2++
                }
            }
        } else if (Math.abs(x1 - x2) === Math.abs(y1 - y2)) {
            let x = x1
            const diffX = x1 > x2 ? -1 : 1
            for (let y of rangeInclude(y1, y2)) {
                const row = (this.map[y] ??= [])
                row[x] = (row[x] ?? 0) + 1
                if (row[x] === 2) {
                    this.over2++
                }
                x += diffX
            }
        }
    }

    getResult() {
        return this.over2
    }

    draw() {
        if (typeof document === "undefined") {
            return
        }
        let width = 0
        for (let row of this.map) {
            if (row?.length > width) {
                width = row.length
            }
        }
        const size = 1
        const height = this.map.length
        const canvas = document.getElementById("canvas") as HTMLCanvasElement
        canvas.width = width * size
        canvas.height = height * size
        const ctx = canvas.getContext("2d")!
        for (let y = 0; y < this.map.length; y++) {
            const row = this.map[y] ?? []
            for (let x = 0; x < width; x++) {
                const cell = row[x]
                if (!cell) {
                    ctx.fillStyle = "black"
                    ctx.fillRect(x * size, y * size, size, size)
                } else {
                    ctx.fillStyle = cell >= 2 ? "red" : "white"
                    ctx.fillRect(x * size, y * size, size, size)
                }
            }
        }
    }
}

async function Q1Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n").map(line => {
        const [_, x1, y1, x2, y2] = /(\d+),(\d+) -> (\d+),(\d+)/.exec(line)!
        return [parseInt(x1), parseInt(y1), parseInt(x2), parseInt(y2)]
    })

    const puzzle1 = new PuzzleMap()
    for (const [x1, y1, x2, y2] of lines) {
        if (x1 === x2 || y1 === y2) {
            puzzle1.addLine(x1, y1, x2, y2)
        }
    }
    console.log(`Q1: ${puzzle1.getResult()}`)

    const puzzle2 = new PuzzleMap()
    for (const [x1, y1, x2, y2] of lines) {
        puzzle2.addLine(x1, y1, x2, y2)
    }
    puzzle2.draw()
    console.log(`Q2: ${puzzle2.getResult()}`)
}

Q1Q2()
