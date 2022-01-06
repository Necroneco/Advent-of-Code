import {loadInput} from "../../utils/loadInput.js"

async function Q1() {
    const input = await loadInput(import.meta.url)
    const inputArray = input.trim().split("\n").map(v => parseInt(v))
    let count = 0
    let prev = inputArray[0]
    for (let i = 1; i < inputArray.length; i++) {
        let current = inputArray[i]
        if (current > prev) {
            count++
        }
        prev = current
    }
    console.log(`Q1: ${count}`)
}

Q1()

async function Q2() {
    const input = await loadInput(import.meta.url)
    const inputArray = input.split("\n").map(v => parseInt(v))
    let count = 0
    let prev = Infinity
    for (let i = 0; i + 2 < inputArray.length; i++) {
        let current = inputArray[i] + inputArray[i + 1] + inputArray[i + 2]
        if (current > prev) {
            count++
        }
        prev = current
    }
    console.log(`Q2: ${count}`)
}

Q2()
