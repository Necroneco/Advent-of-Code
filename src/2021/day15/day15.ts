import {loadInput} from "../../utils/loadInput.js"
import {searchPath} from "./Pathfinding/AStar.js"
import {Graph} from "./Pathfinding/Graph.js";

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const graph = new Graph(lines.map(line => line.split("").map(Number)))
    const path = searchPath(graph, graph.getGrid(0, 0)!, graph.getGrid(graph.width - 1, graph.height - 1)!)
    console.log(`Q1: ${path.reduce((s, a) => s + a.weight, 0)}`);
}

Q1()


async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const initBlock = lines.map(line => line.split("").map(Number))
    const blocks = [initBlock]
    for (let i = 0; i < 8; i++) {
        blocks.push(blocks[i].map(row => row.map(tile => tile === 9 ? 1 : tile + 1)))
    }

    const grid: number[][] = []
    for (let y = 0; y < 5; y++) {
        const row: number[][] = []
        for (let x = 0; x < 5; x++) {
            appendRight(row, blocks[y + x])
        }
        grid.push(...row)
    }

    const graph = new Graph(grid)
    const path = searchPath(graph, graph.getGrid(0, 0)!, graph.getGrid(graph.width - 1, graph.height - 1)!)
    console.log(`Q2: ${path.reduce((s, a) => s + a.weight, 0)}`);
}

function appendRight(grid: number[][], another: number[][]) {
    for (let y = 0; y < another.length; y++) {
        grid[y] ??= []
        for (let w of another[y]) {
            grid[y].push(w)
        }
    }
}

Q2()