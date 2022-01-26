import {loadInput} from "../../utils/loadInput.js"
import {IntcodeComputer} from "../IntcodeComputer.js"

async function Q1() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    const computer = new IntcodeComputer(program)
    computer.memory[1] = 12
    computer.memory[2] = 2
    computer.run()
    console.log(`Q1: ${computer.memory[0]}`)
}

await Q1()

async function Q2() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    for (let noun = 0; noun <= 99; noun++) {
        for (let verb = 0; verb <= 99; verb++) {
            const computer = new IntcodeComputer(program)
            computer.memory[1] = noun
            computer.memory[2] = verb
            computer.run()
            if (computer.memory[0] === 19690720) {
                console.log(`Q2: ${100 * noun + verb}`);
            }
        }
    }
}

await Q2()
