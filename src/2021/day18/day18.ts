import {loadInput} from "../../utils/loadInput.js"

type Value = [Value, Value] | number

interface Element {
    leftmost?: Num
    rightmost?: Num
    parent?: Pair
    selfPos?: "left" | "right"
    nest: number
    get leftEdge(): Num
    get rightEdge(): Num
    explodes(): boolean
    splits(): boolean
    toRaw(): Value
}

class Pair implements Element {
    left: Element
    right: Element
    leftmost?: Num
    rightmost?: Num
    parent?: Pair
    selfPos?: "left" | "right"
    nest: number

    constructor(left: Element, right: Element, nest: number) {
        left.parent = this
        left.selfPos = "left"
        this.left = left
        right.parent = this
        right.selfPos = "right"
        this.right = right
        this.nest = nest
    }

    explodes(): boolean {
        if (this.parent && this.selfPos && this.left instanceof Num && this.right instanceof Num) {
            if (this.nest > 4) {
                if (this.leftmost) {
                    this.leftmost.value += this.left.value
                }
                if (this.rightmost) {
                    this.rightmost.value += this.right.value
                }
                const n = new Num(0, this.nest)
                n.parent = this.parent
                n.selfPos = this.selfPos
                this.parent[this.selfPos] = n
                return true
            }
        }
        return this.left.explodes() || this.right.explodes()
    }

    splits(): boolean {
        return this.left.splits() || this.right.splits()
    }

    toRaw(): Value {
        return [this.left.toRaw(), this.right.toRaw()]
    }

    get leftEdge(): Num {
        if (this.left instanceof Num) {
            return this.left
        }
        return this.left.leftEdge
    }

    get rightEdge(): Num {
        if (this.right instanceof Num) {
            return this.right
        }
        return this.right.rightEdge
    }
}

class Num implements Element {
    value: number
    parent?: Pair
    selfPos?: "left" | "right"
    nest: number

    constructor(value: number, nest: number) {
        this.value = value
        this.nest = nest
    }

    explodes(): boolean {
        return false
    }

    splits(): boolean {
        if (this.value > 9) {
            const n = new Pair(new Num(Math.floor(this.value / 2), this.nest + 1), new Num(Math.ceil(this.value / 2), this.nest + 1), this.nest)
            n.parent = this.parent
            n.selfPos = this.selfPos
            this.parent![this.selfPos!] = n
            return true
        }
        return false
    }

    toRaw(): number {
        return this.value
    }

    get leftEdge() {
        return this
    }

    get rightEdge() {
        return this
    }
}

function connect(data: Element): void {
    if (data instanceof Pair) {
        if (data.left instanceof Pair) {
            data.left.rightmost = data.right.leftEdge
            data.left.leftmost = data.leftmost
        }
        if (data.right instanceof Pair) {
            data.right.leftmost = data.left.rightEdge
            data.right.rightmost = data.rightmost
        }
        connect(data.left)
        connect(data.right)
    }
}

function reduce(data: Value): Value {
    function build(data: Value, nest: number): Element {
        if (typeof data === "number") {
            return new Num(data, nest)
        } else {
            return new Pair(build(data[0], nest + 1), build(data[1], nest + 1), nest)
        }
    }

    const root = build(data, 1)
    connect(root)
    // console.log(JSON.stringify(root.toRaw()))
    while (root.explodes() || root.splits()) {
        connect(root)
        // console.log(JSON.stringify(root.toRaw()))
    }
    return root.toRaw()
}

function add(a: Value, b: Value): Value {
    if (a === undefined) return b
    return reduce([a, b])
}

function magnitude(data: Value): number {
    if (typeof data === "number") return data
    return 3 * magnitude(data[0]) + 2 * magnitude(data[1])
}

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trimEnd().split("\n")

    let result: Value = JSON.parse(lines[0])
    result = reduce(result)
    for (let i = 1; i < lines.length; i++) {
        result = add(result, JSON.parse(lines[i]))
    }
    console.log(`Q1: ${magnitude(result)} | ${JSON.stringify(result)}`)
}

await Q1()

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trimEnd().split("\n")
    const length = lines.length

    let max = -Infinity
    let maxPair: [number, number] = [-1, -1]
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            if (j === i) continue
            const value = magnitude(add(JSON.parse(lines[i]), JSON.parse(lines[j])))
            if (value > max) {
                max = value
                maxPair = [i, j]
            }
        }
    }
    console.log(`Q2: ${max} | ${lines[maxPair[0]]} + ${lines[maxPair[1]]}`)
}

await Q2()
