import countBy from "lodash-es/countBy.js"
import {BinaryHeap} from "./BinaryHeap.js"
import {loadInput} from "../../utils/loadInput.js"

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const puzzleMap: number[][] = []
    for (const line of lines) {
        const row = line.split("").map(Number)
        puzzleMap.push(row)
    }

    let result = 0
    for (let y = 0; y < puzzleMap.length; y++) {
        const row = puzzleMap[y]
        for (let x = 0; x < row.length; x++) {
            const value = row[x]
            // 如果value比上下左右都小
            if (value !== 9
                && (y === 0 || value < puzzleMap[y - 1][x])
                && (y === puzzleMap.length - 1 || value < puzzleMap[y + 1][x])
                && (x === 0 || value < row[x - 1])
                && (x === row.length - 1 || value < row[x + 1])
            ) {
                result += value + 1
            }
        }
    }

    console.log(`Q1: ${result}`)
}

Q1()

interface Point {
    x: number
    y: number
    value: number
    visited: boolean
    groupId: number
}

function visit(puzzleMap: readonly Point[][], openList: Point[], groupId: number) {
    const point = openList.pop()
    if (!point) return
    point.groupId = groupId
    point.visited = true
    const {x, y} = point
    const row = puzzleMap[y]
    if (x > 0 && !row[x - 1].visited && row[x - 1].value !== 9) openList.push(row[x - 1])
    if (x < row.length - 1 && !row[x + 1].visited && row[x + 1].value !== 9) openList.push(row[x + 1])
    if (y > 0 && !puzzleMap[y - 1][x].visited && puzzleMap[y - 1][x].value !== 9) openList.push(puzzleMap[y - 1][x])
    if (y < puzzleMap.length - 1 && !puzzleMap[y + 1][x].visited && puzzleMap[y + 1][x].value !== 9) openList.push(puzzleMap[y + 1][x])
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const allList: Point[] = []
    const puzzleMap: Point[][] = []
    for (let y = 0; y < lines.length; y++) {
        const row: Point[] = []
        const line = lines[y]
        for (let x = 0; x < line.length; x++) {
            const point = {x, y, value: Number(line[x]), visited: false, groupId: 0}
            row.push(point)
            allList.push(point)
        }
        puzzleMap.push(row)
    }

    let $groupId = 0


    let result = new BinaryHeap<number>(v => v)
    for (let i = 0; i < allList.length; i++) {
        const point = allList[i]
        if (point.visited || point.groupId > 0 || point.value === 9) continue

        ++$groupId
        const openList = [point]
        while (openList.length > 0) {
            visit(puzzleMap, openList, $groupId)
        }
    }
    const counts = countBy(allList, v => v.groupId)
    console.log(counts);
    for (let groupId in counts) {
        if (groupId != "0") {
            result.push(counts[groupId])
            if (result.size() > 3) {
                result.pop()
            }
        }
    }

    const top3 = result.pop()!
    const top2 = result.pop()!
    const top1 = result.pop()!
    console.log(`Q2: ${top1} * ${top2} * ${top3} = ${top1 * top2 * top3}`)
}

Q2()
