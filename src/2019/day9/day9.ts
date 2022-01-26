import {loadInput} from "../../utils/loadInput.js";
import {IntcodeComputer} from "../IntcodeComputer.js";

async function Q() {
    const program = (await loadInput(import.meta.url)).trimEnd()
    {
        const computer = new IntcodeComputer(program)
        computer.run(1)
        console.log(`Q1: ${computer.takeOutputs()}`);
    }
    {
        const computer = new IntcodeComputer(program)
        computer.run(2)
        console.log(`Q2: ${computer.takeOutputs()}`);
    }
}

await Q()
