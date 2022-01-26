import {loadInput} from "../../utils/loadInput.js"
import {IntcodeComputer} from "../IntcodeComputer.js";

async function Q() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    {
        const computer = new IntcodeComputer(program)
        computer.run(1)
        const outputs = computer.takeOutputs()
        console.log(`Q1: ${outputs[outputs.length - 1]}`)
    }
    {
        const computer = new IntcodeComputer(program)
        computer.run(5)
        console.log(`Q2: ${computer.takeOutputs()}`)
    }
}

await Q()
