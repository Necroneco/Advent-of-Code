export function IntcodeComputer(input: string, noun: number, verb: number) {
    const memory = input.split(",").map(Number)
    memory[1] = noun
    memory[2] = verb

    let pointer = 0

    while (true) {
        // instruction
        const op = memory[pointer++]
        if (op === 99)
            return memory
        switch (op) {
            case 1: {
                const data1 = memory[pointer++]
                const data2 = memory[pointer++]
                const out = memory[pointer++]
                memory[out] = memory[data1] + memory[data2]
                break
            }
            case 2: {
                const data1 = memory[pointer++]
                const data2 = memory[pointer++]
                const out = memory[pointer++]
                memory[out] = memory[data1] * memory[data2]
                break
            }
            default:
                throw new Error(`Unknown opcode: ${op}`)
        }
    }
}


// test
// console.log(JSON.stringify(computer("1,0,0,0,99")))
// console.log(JSON.stringify(computer("2,3,0,3,99")))
// console.log(JSON.stringify(computer("2,4,4,5,99,0")))
// console.log(JSON.stringify(computer("1,1,1,4,99,5,6,0,99")))


// answer
function main() {
    const input = "1,0,0,3,1,1,2,3,1,3,4,3,1,5,0,3,2,10,1,19,1,19,6,23,2,13,23,27,1,27,13,31,1,9,31,35,1,35,9,39,1,39,5,43,2,6,43,47,1,47,6,51,2,51,9,55,2,55,13,59,1,59,6,63,1,10,63,67,2,67,9,71,2,6,71,75,1,75,5,79,2,79,10,83,1,5,83,87,2,9,87,91,1,5,91,95,2,13,95,99,1,99,10,103,1,103,2,107,1,107,6,0,99,2,14,0,0"
    for (let noun = 0; noun <= 99; noun++) {
        for (let verb = 0; verb <= 99; verb++) {
            const output = IntcodeComputer(input, noun, verb)[0]
            if (output === 19690720) {
                console.log(100 * noun + verb);
            }
        }
    }
}
main()
