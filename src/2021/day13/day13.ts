import {loadInput} from "../../utils/loadInput.js"

async function loadData() {
    const input = await loadInput(import.meta.url)

    let width = 0
    let height = 0
    const graph: boolean[][] = []
    const folds: [type: "x" | "y", position: number][] = []
    let phase = 1
    for (const line of input.trim().split("\n")) {
        if (line === "") {
            phase = 2
            continue
        }
        if (phase === 1) {
            const [_, _x, _y] = /(\d+),(\d+)/.exec(line)!
            const x = parseInt(_x)
            const y = parseInt(_y)
            width = Math.max(width, x + 1)
            height = Math.max(height, y + 1);
            (graph[y] ??= [])[x] = true
        } else if (phase === 2) {
            const [_, type, position] = /fold along ([x|y])=(\d+)/.exec(line)!
            folds.push([type as "x" | "y", parseInt(position)])
        }
    }

    return {graph, folds, width, height}
}

function doFold(graph: boolean[][], width: number, height: number, foldType: "x" | "y", foldPosition: number) {
    if (foldType === "x") {
        for (let y = 0; y < graph.length; y++) {
            graph[y] ??= []
            for (let x = 0; x < foldPosition; x++) {
                const xx = foldPosition - (x - foldPosition)
                if (xx < graph[y].length) {
                    graph[y][x] ||= graph[y][xx]
                }
            }
        }
        return {width: foldPosition, height}
    } else {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < foldPosition; y++) {
                if (x === 0) {
                    graph[y] ??= []
                }
                const yy = foldPosition - (y - foldPosition)
                if (yy < graph.length) {
                    graph[y][x] ||= graph[yy][x]
                }
            }
        }
        graph.length = foldPosition
        return {width, height: foldPosition}
    }
}

function countDots(graph: boolean[][], width: number, height: number) {
    let count = 0
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (graph[y][x]) {
                count++
            }
        }
    }
    return count
}


async function Q1() {
    let {graph, folds, width, height} = await loadData();
    ({width, height} = doFold(graph, width, height, folds[0][0], folds[0][1]))
    console.log(countDots(graph, width, height))
}

Q1()


async function Q2() {
    let {graph, folds, width, height} = await loadData()
    for (let fold of folds) {
        ({width, height} = doFold(graph, width, height, fold[0], fold[1]))
    }

    const size = 10
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = width * size
    canvas.height = height * size
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "blue"
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (graph[y][x]) {
                ctx.fillRect(x * size, y * size, size, size)
            }
        }
    }
}

Q2()
