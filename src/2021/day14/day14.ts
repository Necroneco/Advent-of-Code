import {loadInput} from "../../utils/loadInput.js";

class Node {
    next?: Node

    constructor(readonly char: string) {
    }
}

type SearchMap = { [pair: string]: string }

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")
    const arr = lines[0].split("").map(c => new Node(c))
    const head = new Node("")
    let prev: Node = head
    for (let node of arr) {
        prev.next = node
        prev = node
    }

    const searchMap: SearchMap = {}
    for (let line of lines.slice(2)) {
        const [_, pair, insert] = /(\w\w) -> (\w)/.exec(line)!
        searchMap[pair] = insert
    }

    for (let i = 0; i < 10; i++) {
        let ptr = head.next
        while (ptr && ptr.next) {
            const insertChar = searchMap[`${ptr.char}${ptr.next.char}`]
            if (insertChar) {
                const insert = new Node(insertChar)
                insert.next = ptr.next
                ptr.next = insert
                ptr = insert.next
            } else {
                ptr = ptr.next
            }
        }
    }

    const counts: CountMap = {}
    let ptr = head.next
    while (ptr) {
        counts[ptr.char] = (counts[ptr.char] ?? 0) + 1
        ptr = ptr.next
    }
    console.log(`Q1: ${calc(counts)}`)
}

await Q1()


type DataMap = { [pair: string]: number }
type ActionMap = { [pair: string]: (data: DataMap, count: number) => void }

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    const dataMap: DataMap = {}
    const data = lines[0].split("")
    const edgeStart = data[0]
    const edgeEnd = data[data.length - 1]
    for (let i = 0; i < data.length - 1; i++) {
        const key = `${data[i]}${data[i + 1]}`
        dataMap[key] = (dataMap[key] ?? 0) + 1
    }

    const actionMap: ActionMap = {}
    for (let line of lines.slice(2)) {
        const [_, pair, insert] = /(\w\w) -> (\w)/.exec(line)!
        const [left, right] = pair
        actionMap[pair] = (data: DataMap, count: number) => {
            const leftKey = `${left}${insert}`
            data[leftKey] = (data[leftKey] ?? 0) + count
            const rightKey = `${insert}${right}`
            data[rightKey] = (data[rightKey] ?? 0) + count
            data[pair] = (data[pair] ?? 0) - count
        }
    }

    for (let i = 0; i < 40; i++) {
        const stepData: DataMap = {}
        for (let pair in dataMap) {
            actionMap[pair]?.(stepData, dataMap[pair])
        }
        for (let pair in stepData) {
            dataMap[pair] = (dataMap[pair] ?? 0) + stepData[pair]
        }
    }

    const countMap: CountMap = {}
    countMap[edgeStart] = (countMap[edgeStart] ?? 0) + 1
    countMap[edgeEnd] = (countMap[edgeEnd] ?? 0) + 1
    for (let pair in dataMap) {
        const [left, right] = pair
        countMap[left] = (countMap[left] ?? 0) + dataMap[pair]
        countMap[right] = (countMap[right] ?? 0) + dataMap[pair]
    }
    for (let char in countMap) {
        countMap[char] /= 2
    }

    // console.log(countMap);
    console.log(`Q2: ${calc(countMap)}`)
}

await Q2()


type CountMap = { [char: string]: number }

function calc(counts: CountMap) {
    let max = -Infinity
    let min = Infinity
    for (let char in counts) {
        if (counts[char] > max) {
            max = counts[char]
        }
        if (counts[char] < min) {
            min = counts[char]
        }
    }
    return max - min
}
