import {AsciiCapable, IntcodeComputer} from "../IntcodeComputer.js"
import {loadInput} from "../../utils/loadInput.js";

async function Q1() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    const computer = new IntcodeComputer(program)
    computer.run()

    const map = computer.takeOutputs().map(v => String.fromCharCode(v)).join("").split("\n")
    const width = map[0].length
    const height = map.length

    let sum = 0
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (map[y][x] === "#" &&
                map[y - 1][x] === "#" &&
                map[y + 1][x] === "#" &&
                map[y][x + 1] === "#" &&
                map[y][x - 1] === "#") {
                sum += x * y
            }
        }
    }

    console.log(`Q1: ${sum}`);
}

await Q1()

const enum Direction {
    up, right, down, left,
}

interface XY {
    x: number
    y: number
}

const enum Turn {
    L = "L",
    NO = "no",
    R = "R",
    END = "end"
}

async function Q2() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    const computer = new IntcodeComputer(program)
    computer.run()

    const map = computer.takeOutputs().map(v => String.fromCharCode(v))
    const stringMap = map.join("")
    console.log(stringMap);
    const lineMap = stringMap.split("\n")
    const width = lineMap[0].length
    const height = lineMap.length

    let direction: Direction = Direction.up
    let position = {x: 0, y: 0}
    findStart: {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (lineMap[y][x] === "^") {
                    direction = Direction.up
                    position.x = x
                    position.y = y
                    break findStart
                }
            }
        }
    }

    function findNextTurn(p: XY, d: Direction) {
        if (getFront(p, d) === "#") {
            return Turn.NO
        }
        if (getFront(p, (d - 1 + 4) % 4) === "#") {
            return Turn.L
        }
        if (getFront(p, (d + 1) % 4) === "#") {
            return Turn.R
        }
        return Turn.END
    }

    function getFront(p: XY, d: Direction): string | undefined {
        switch (d) {
            case Direction.up:
                return lineMap[p.y - 1]?.[p.x]
            case Direction.right:
                return lineMap[p.y]?.[p.x + 1]
            case Direction.down:
                return lineMap[p.y + 1]?.[p.x]
            case Direction.left:
                return lineMap[p.y]?.[p.x - 1]
        }
    }

    let instructions: (string | number)[] = []
    let count = 0
    while (true) {
        let t = findNextTurn(position, direction!)
        if (t === Turn.END) {
            if (count > 0) {
                instructions.push(count)
                count = 0
            }
            break
        } else if (t === Turn.L) {
            if (count > 0) {
                instructions.push(count)
                count = 0
            }
            instructions.push(t)
            direction = (direction - 1 + 4) % 4
        } else if (t === Turn.R) {
            if (count > 0) {
                instructions.push(count)
                count = 0
            }
            instructions.push(t)
            direction = (direction + 1) % 4
        } else { // no
            count++
            switch (direction) {
                case Direction.up:
                    position.y -= 1
                    break
                case Direction.right:
                    position.x += 1
                    break
                case Direction.down:
                    position.y += 1
                    break
                case Direction.left:
                    position.x -= 1
                    break
            }
        }
    }

    console.log(instructions.join(","));

    // R,6,R,6,R,8,L,10,L,4, R,6,L,10,R,8, R,6,L,10,R,8, R,6,R,6,R,8,L,10,L,4, L,4,L,12,R,6,L,10, R,6,R,6,R,8,L,10,L,4, L,4,L,12,R,6,L,10, R,6,R,6,R,8,L,10,L,4, L,4,L,12,R,6,L,10, R,6,L,10,R,8
    const instructions_copy = instructions.concat()


    function findFunction(instructions: unknown[]) {
        let pointer = 0
        let lenA = 2
        while (hasSomeSame(instructions.slice(pointer + lenA), instructions.slice(pointer, lenA))) {
            lenA += 2
        }
        const F = instructions.splice(0, lenA - 2)
        for (let pA = 0; pA <= instructions.length - F.length; pA += 2) {
            if (isArrayEqual(instructions.slice(pA, pA + F.length), F)) {
                instructions.splice(pA, F.length)
                pA -= 2
            }
        }
        return F
    }

    function hasSomeSame(instructions: unknown[], find: unknown[]) {
        for (let pA = 0; pA <= instructions.length - find.length; pA += 2) {
            if (isArrayEqual(instructions.slice(pA, pA + find.length), find)) {
                return true
            }
        }
        return false
    }

    let A = findFunction(instructions)
    console.log("A:", A.join(",")) //, "rest:", instructions.join(","));
    let B = findFunction(instructions)
    console.log("B:", B.join(",")) //, "rest:", instructions.join(","));
    let C = findFunction(instructions)
    console.log("C:", C.join(",")) //, "rest:", instructions.join(","));
    // 按理说, 这里应该要判断rest进行回溯的

    instructions = instructions_copy // 还原

    const routines = []
    while (instructions.length) {
        if (isArrayEqual(instructions.slice(0, A.length), A)) {
            routines.push("A")
            instructions.splice(0, A.length)
            continue
        }
        if (isArrayEqual(instructions.slice(0, B.length), B)) {
            routines.push("B")
            instructions.splice(0, B.length)
            continue
        }
        if (isArrayEqual(instructions.slice(0, C.length), C)) {
            routines.push("C")
            instructions.splice(0, C.length)
            continue
        }
        throw new Error("some thing error")
    }

    console.log("routines:", routines.join(","));

    // A,B,B,A,C,A,C,A,C,B
    {
        console.log("Q2:");
        const computer = new IntcodeComputer(program)
        computer.memory[0] = 2
        computer.run()
        log(computer);
        const cable = new AsciiCapable(computer)
        cable.writeLine(routines.join(","));
        log(computer);
        cable.writeLine(A.join(","));
        log(computer);
        cable.writeLine(B.join(","));
        log(computer);
        cable.writeLine(C.join(","));
        log(computer);
        // cable.writeLine("y")
        cable.writeLine("n")
        log(computer)
    }
}

await Q2()


function log(computer: IntcodeComputer) {
    let o = computer.takeOutputs()
    if (o.length) {
        console.log(o.map(v => v > 255 ? v : String.fromCharCode(v)).join("").trimEnd());
    }
}

function isArrayEqual(a: unknown[], b: unknown[]) {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}


// R,6,R,6,R,8,L,10,L,4,R,6,L,10,R,8,R,6,L,10,R,8,R,6,R,6,R,8,L,10,L,4,L,4,L,12,R,6,L,10,R,6,R,6,R,8,L,10,L,4,L,4,L,12,R,6,L,10,R,6,R,6,R,8,L,10,L,4,L,4,L,12,R,6,L,10,R,6,L,10,R,8

// routine: A,B,B,A,C,A,C,A,C,B
// A: R,6,R,6,R,8,L,10,L,4
// B: R,6,L,10,R,8
// C: L,4,L,12,R,6,L,10
