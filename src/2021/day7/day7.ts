import max from "lodash-es/max.js"
import min from "lodash-es/min.js"
import {loadInput} from "../../utils/loadInput.js"

function score1(data: number[], target: number) {
    return data.reduce((acc, curr) => acc + Math.abs(curr - target), 0)
}

async function Q1() {
    const input = await loadInput(import.meta.url)
    const data = input.trim().split(",").map(Number)

    data.sort((a, b) => a - b)
    const target = data[Math.floor(data.length / 2)] // 中位数
    console.log(`target: ${target}`)

    const result = score1(data, target)
    console.log(`Q1: ${result}`)
}

Q1()


function score2(data: number[], target: number) {
    return data.reduce((acc, curr) => {
        const distance = Math.abs(curr - target)
        return acc + (1 + distance) * distance / 2
    }, 0)
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const data = input.trim().split(",").map(Number)

    const start = min(data)!
    const end = max(data)!
    let result = Infinity
    let target: number = null!
    for (let i = start; i <= end; i++) {
        const score = score2(data, i)
        if (score < result) {
            result = score
            target = i
        }
    }
    console.log(`target: ${target}`);
    console.log(`Q2: ${result}`)
}

Q2()
