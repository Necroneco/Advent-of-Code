import {loadInput} from "../../utils/loadInput.js"
import {BinaryHeap} from "../../utils/BinaryHeap.js"

const amphipods = ["A", "B", "C", "D"] as const

type Amphipod = typeof amphipods[number]

type Cost = number

type Position = number

const energy: Record<Amphipod, Cost> = {A: 1, B: 10, C: 100, D: 1000}
const hallwayStops: Position[] = [0, 1, 3, 5, 7, 9, 10] // 可停留位置
const doorways: Record<Amphipod, Position> = {A: 2, B: 4, C: 6, D: 8} // 出口坐标

type Burrow = string

interface State {
    cost: Cost
    burrow: Burrow
    history: Burrow[]
}

/*
#############
#0123456789A#
###B#C#D#E###
  #F#G#H#I#
  #J#K#L#M#
  #N#O#P#Q#
  #########
*/
function parseInput(input: string): Burrow {
    const lines = input.split("\n")
    let burrow = lines[1].slice(1, -1)
    for (let i = 2; lines[i][3] !== "#"; i++) {
        burrow += `${lines[i][3]}${lines[i][5]}${lines[i][7]}${lines[i][9]}`
    }
    return burrow
}

function canEnterRoom(burrow: Burrow, amphipod: Amphipod, roomPositions: Position[]): Position | undefined {
    let best: Position | undefined = undefined
    for (const roomPos of roomPositions) {
        if (burrow[roomPos] === ".") {
            best = roomPos
        } else if (burrow[roomPos] !== amphipod) {
            return
        }
    }
    return best
}

/**
 * 这个房间最外面的Amphipod的坐标
 */
function getOutermostAmphipod(burrow: Burrow, roomPos: Position[]): Position | undefined {
    for (const pos of roomPos) {
        if (burrow[pos] !== ".") {
            return pos
        }
    }
}

/**
 * from 和 to 都是 hallway 上的坐标
 */
function blocked(burrow: Burrow, from: Position, to: Position): boolean {
    if (from > to) {
        for (let i = from - 1; i >= to; i--) {
            if (burrow[i] !== ".") {
                return true
            }
        }
    } else {
        for (let i = from + 1; i <= to; i++) {
            if (burrow[i] !== ".") {
                return true
            }
        }
    }
    return false
}

function* getPossibleHallwayStop(burrow: Burrow, doorway: Position) {
    for (const pos of hallwayStops) {
        if (!blocked(burrow, doorway, pos)) {
            yield pos
        }
    }
}

function* possibleMoves(burrow: Burrow, rooms: Record<Amphipod, Position[]>): Generator<[Position, Position]> {
    for (const p1 of hallwayStops) {
        const amphipod1 = burrow[p1] as Amphipod | "."
        if (amphipod1 !== "." && !blocked(burrow, p1, doorways[amphipod1])) {
            const p2 = canEnterRoom(burrow, amphipod1, rooms[amphipod1])
            if (p2 !== undefined) {
                yield [p1, p2]
            }
        }
    }
    for (const amphipod of amphipods) {
        const p1 = getOutermostAmphipod(burrow, rooms[amphipod])
        if (p1 !== undefined) {
            for (const p2 of getPossibleHallwayStop(burrow, doorways[amphipod])) {
                yield [p1, p2]
            }
        }
    }
}

function move(burrow: Burrow, a: Position, b: Position): Burrow {
    const list = burrow.split("");
    [list[a], list[b]] = [list[b], list[a]]
    return list.join("")
}

// ...........ABCDABCD
function solve(burrow: Burrow) {
    const rooms: Record<Amphipod, Position[]> = {A: [], B: [], C: [], D: []}
    const roomPosToAmphipod = {} as Record<Position, Amphipod> // 房间坐标 -> Amphipod
    for (let i = 11; i < burrow.length;) {
        for (const amphipod of amphipods) {
            rooms[amphipod].push(i)
            roomPosToAmphipod[i] = amphipod
            i++
        }
    }

    const heap = new BinaryHeap<State>(s => s.cost)
    const visited = new Map<Burrow, Cost>()

    const solution: Burrow = ".".repeat(11) + "ABCD".repeat((burrow.length - 11) / 4)
    heap.push({cost: 0, burrow, history: []})
    visited.set(burrow, 0)
    while (heap.size() > 0) {
        const {cost, burrow, history} = heap.pop()!
        if (burrow === solution) {
            return {cost, burrow, history}
        }
        const newHistory = [...history, burrow]
        for (const [from, to] of possibleMoves(burrow, rooms)) {
            const [hallwayPos, roomPos] = from < to ? [from, to] : [to, from]
            const distance = Math.abs(doorways[roomPosToAmphipod[roomPos]] - hallwayPos) + Math.ceil((roomPos - 10) / 4) // roomPos: 11~14 -> 1;  15~18 -> 2; ...
            const newCost = cost + distance * energy[burrow[from] as Amphipod]
            const newBurrow = move(burrow, from, to)
            if ((visited.get(newBurrow) ?? Infinity) <= newCost) {
                continue
            }
            visited.set(newBurrow, newCost)
            heap.push({cost: newCost, burrow: newBurrow, history: newHistory})
        }
    }
}

function print(burrow: Burrow) {
    console.log("#############")
    process.stdout.write("#")
    process.stdout.write(burrow.slice(0, 11))
    process.stdout.write("#")
    process.stdout.write("\n")
    let i = 11
    process.stdout.write("###")
    process.stdout.write(burrow[i++])
    process.stdout.write("#")
    process.stdout.write(burrow[i++])
    process.stdout.write("#")
    process.stdout.write(burrow[i++])
    process.stdout.write("#")
    process.stdout.write(burrow[i++])
    process.stdout.write("###")
    process.stdout.write("\n")
    while (i < burrow.length) {
        process.stdout.write("  #")
        process.stdout.write(burrow[i++])
        process.stdout.write("#")
        process.stdout.write(burrow[i++])
        process.stdout.write("#")
        process.stdout.write(burrow[i++])
        process.stdout.write("#")
        process.stdout.write(burrow[i++])
        process.stdout.write("#  ")
        process.stdout.write("\n")
    }
    console.log("  #########  ")
}

async function Q1() {
    const input = (await loadInput(import.meta.url)).trimEnd()
    const puzzle = parseInput(input)
    const start = Date.now()
    const {cost, history, burrow} = solve(puzzle)!
    console.log(`Cost: ${Date.now() - start}ms`)
    // for (const burrow of history) {
    //     print(burrow)
    //     // await new Promise(resolve => setTimeout(resolve, 1000))
    // }
    // print(burrow)
    // await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Q1: ${cost}`)
}

await Q1()

async function Q2() {
    const input = (await loadInput(import.meta.url)).trimEnd()
    const lines = input.split("\n")
    const puzzle = parseInput([...lines.slice(0, 3), "  #D#C#B#A#", "  #D#B#A#C#", ...lines.slice(3)].join("\n"))
    const start = Date.now()
    const {cost, history, burrow} = solve(puzzle)!
    console.log(`Cost: ${Date.now() - start}ms`)
    // for (const burrow of history) {
    //     print(burrow)
    //     await new Promise(resolve => setTimeout(resolve, 1000))
    // }
    // print(burrow)
    // await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Q2: ${cost}`)
}

await Q2()
