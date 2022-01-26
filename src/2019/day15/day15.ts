import {IntcodeComputer} from "../IntcodeComputer.js"
import {makeArray} from "../utils.js"
import {loadInput} from "../../utils/loadInput.js";

const enum Status {
    hitWall = 0,
    moved = 1,
    win = 2,
}

const enum Movement {
    north = 1,
    south = 2,
    west = 3,
    east = 4,
}

const enum Tile {
    wall = 0,
    empty = 1,
    final = 2,
    start = -1,
    route = 3,
    oxygen = 4,
}

declare module "../IntcodeComputer" {
    interface IntcodeComputer {
        x: number
        y: number
        steps: number
        prev?: IntcodeComputer
    }
}

function drawConsole(data: string) {
    process.stdout.write("\u001b[0;0H" + data + "\n");
}

function getTileDisplay(tile: Tile) {
    switch (tile) {
        case Tile.wall:
            return "░";
        case Tile.final:
            return "F";
        case Tile.empty:
            return " ";
        case Tile.start:
            return "S"
        case Tile.route:
            return "."
        case Tile.oxygen:
            return "o"
        default:
            return " ";
    }
}

class Canvas {
    bitmap: string[][]

    constructor(width = 0, height = 0) {
        this.bitmap = makeArray(height, () => makeArray(width, () => getTileDisplay(null!)))
    }

    setBit(x: number, y: number, tile: Tile) {
        const bitmap = this.bitmap;
        (bitmap[y] || (bitmap[y] = []))[x] = getTileDisplay(tile)
    }

    render() {
        this.bitmap.forEach(line => {
            for (let i = 0, len = line.length; i < len; i++) {
                if (!line[i]) line[i] = getTileDisplay(null!)
            }
        })
        return this.bitmap.map(line => line.join("")).join("\n")
    }
}

async function Q() {
    const program = (await loadInput(import.meta.url)).trimEnd()

    const movements = [Movement.north, Movement.south, Movement.west, Movement.east] as const

    const map = new Map<string, Tile>()
    let left = -22//Infinity
    let top = -22//Infinity

    function save(c: IntcodeComputer, t: Tile) {
        // if (c.x < minX) minX = c.x
        // if (c.y < minY) minY = c.y
        map.set(`${c.x},${c.y}`, t)
    }

    function look(c: IntcodeComputer, movement: Movement) {
        switch (movement) {
            case Movement.north:
                return map.get(`${c.x},${c.y - 1}`)
            case Movement.south:
                return map.get(`${c.x},${c.y + 1}`)
            case Movement.west:
                return map.get(`${c.x - 1},${c.y}`)
            case Movement.east:
                return map.get(`${c.x + 1},${c.y}`)
        }
    }

    function step(c: IntcodeComputer, movement: Movement) {
        c.steps++
        move(c, movement)
        c.run(movement)
    }

    function move(c: IntcodeComputer, movement: Movement) {
        switch (movement) {
            case Movement.north:
                c.y--
                break
            case Movement.south:
                c.y++
                break
            case Movement.west:
                c.x--
                break
            case Movement.east:
                c.x++
                break
        }
    }

    const computer = new IntcodeComputer(program)
    computer.x = 0
    computer.y = 0
    computer.steps = 0
    save(computer, Tile.start)

    let final: IntcodeComputer = undefined!

    const computers: IntcodeComputer[] = []
    computers.push(computer)

    function search(computer: IntcodeComputer) {
        for (let movement of movements) {
            const target = look(computer, movement)
            if (target !== undefined) {
                continue
            }
            const c = computer.clone()
            c.x = computer.x
            c.y = computer.y
            c.steps = computer.steps
            c.prev = computer
            step(c, movement)
            switch (c.takeOutputs()[0]) {
                case Status.hitWall:
                    save(c, Tile.wall)
                    continue
                case Status.moved:
                    save(c, Tile.empty)
                    break
                case Status.win:
                    save(c, Tile.final)
                    final = c
                    break
            }
            computers.push(c)
        }
    }

    function fill(computer: IntcodeComputer) {
        for (let movement of movements) {
            const target = look(computer, movement)
            switch (target) {
                case Tile.empty:
                case Tile.route:
                case Tile.start:
                    break
                case Tile.final:
                case Tile.wall:
                case Tile.oxygen:
                default:
                    continue;
            }
            const c = computer.clone()
            c.x = computer.x
            c.y = computer.y
            c.steps = computer.steps
            // c.prev = computer
            step(c, movement)
            switch (c.takeOutputs()[0]) {
                case Status.hitWall:
                    continue
                case Status.moved:
                    save(c, Tile.oxygen)
                    break
                case Status.win:
                    break
            }
            computers.push(c)
        }
    }

    console.clear()

    // answer
    let min: number | undefined = undefined
    while (computers.length) {
        const computer = computers.shift()!
        if (final && min === undefined) {
            min = final.steps
            let c: IntcodeComputer | undefined = final.prev
            while (c) {
                if (c.prev) save(c, Tile.route)
                const prev = c.prev
                c.prev = undefined
                c = prev
            }
        }

        search(computer)

        const canvas = new Canvas(42, 42)
        map.forEach((t, xy) => {
            const [x, y] = xy.split(",").map(Number)
            canvas.setBit(x - left, y - top, t)
        })

        drawConsole(canvas.render());
    }

    save(final, Tile.oxygen)
    final.steps = 0
    computers.push(final)

    let time = 0
    while (computers.length) {
        const computer = computers.shift()!

        fill(computer)

        time = computer.steps

        const canvas = new Canvas(42, 42)
        map.forEach((t, xy) => {
            const [x, y] = xy.split(",").map(Number)
            canvas.setBit(x - left, y - top, t)
        })
        drawConsole(canvas.render());
    }
    console.log(`
Q1: The fewest number of movement commands: ${min}
Q2: It takes ${time} minutes to fill with oxygen`)
}

Q()
