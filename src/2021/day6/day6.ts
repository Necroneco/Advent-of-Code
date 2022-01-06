import sum from "lodash-es/sum.js"
import {loadInput} from "../../utils/loadInput.js"

function algorithm1(list: number[], rest: number): number {
    while (rest--) {
        const len = list.length
        for (let i = 0; i < len; i++) {
            if (list[i] === 0) {
                list[i] = 6
                list.push(8)
            } else {
                list[i]--
            }
        }
    }

    return list.length
}

async function Q1() {
    const input = await loadInput(import.meta.url)
    const list = input.trim().split(",").map(Number)
    console.log(`Q1: ${algorithm1(list, 80)}`)
}

Q1()


function algorithm2(list: number[], rest: number): number {
    const group = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let item of list) {
        group[item]++
    }

    while (rest--) {
        const a = group.shift()!
        group[6] += a
        group[8] = a
    }

    return sum(group)
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const list = input.trim().split(",").map(Number)
    console.log(`Q2: ${algorithm2(list, 256)}`)
}

Q2()
