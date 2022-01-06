import {loadInput} from "../../utils/loadInput.js"

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n").map(v => {
        const [command, value] = v.split(" ")
        return {command, value: parseInt(value)}
    })

    let horizontal = 0
    let depth = 0
    for (const {command, value} of lines) {
        switch (command) {
            case "forward":
                horizontal += value
                break
            case "up":
                depth -= value
                break
            case "down":
                depth += value
                break
            default:
                throw new Error(`Unknown command ${command}`)
        }
    }

    console.log(`Q1: ${horizontal * depth}`)
}

Q1()

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n").map(v => {
        const [command, value] = v.split(" ")
        return {command, value: parseInt(value)}
    })

    let horizontal = 0
    let depth = 0
    let aim = 0
    for (const {command, value} of lines) {
        switch (command) {
            case "forward":
                horizontal += value
                depth += aim * value
                break
            case "up":
                aim -= value
                break
            case "down":
                aim += value
                break
            default:
                throw new Error(`Unknown command ${command}`)
        }
    }

    console.log(`Q2: ${horizontal * depth}`)
}

Q2()
