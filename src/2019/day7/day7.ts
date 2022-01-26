import {loadInput} from "../../utils/loadInput.js";
import {IntcodeComputer} from "../IntcodeComputer.js";

function* allSequence(arr: number[]): Generator<number[]> {
    arr = arr.concat()
    if (arr.length === 1) {
        yield arr
    } else {
        let n = arr.pop()!
        for (let seq of allSequence(arr)) {
            for (let i = 0; i <= seq.length; i++) {
                yield [...seq.slice(0, i), n, ...seq.slice(i)]
            }
        }
    }
}

function series(program: string, sequence: number[]) {
    return sequence.reduce((output, phase) => {
        const m = new IntcodeComputer(program)
        m.run(phase)
        m.takeOutputs()
        m.run(output)
        return m.takeOutputs()[0]
    }, 0)
}

function feedbackLoop(program: string, sequence: number[]) {
    const amplifiers = sequence.map(phase => {
        const m = new IntcodeComputer(program)
        m.run(phase)
        return m
    })

    let result = 0
    let output = 0
    while (true) {
        for (let amplifier of amplifiers) {
            if (amplifier.isHalt) {
                return result
            }
            amplifier.run(output)
            output = amplifier.takeOutputs()[0]
        }
        result = output
        // console.log(result);
    }
}

async function Q1() {
    const program = (await loadInput(import.meta.url)).trimEnd()

    let max = -Infinity
    for (let sequence of allSequence([0, 1, 2, 3, 4])) {
        const thruster = series(program, sequence)
        if (thruster > max) {
            max = thruster
        }
    }
    console.log(`Q1: ${max}`);
}

await Q1()

async function Q2() {
    const program = (await loadInput(import.meta.url)).trimEnd()

    let max = -Infinity
    for (let sequence of allSequence([9, 8, 7, 6, 5])) {
        const thruster = feedbackLoop(program, sequence)
        if (thruster > max) {
            max = thruster
        }
    }
    console.log(`Q2: ${max}`);
}

await Q2()
