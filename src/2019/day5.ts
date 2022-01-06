const enum ParamterMode {
    position = 0,
    immediate = 1,
}

function getMode1(op: number) {
    return Math.floor(op / 100) % 10
}

function getMode2(op: number) {
    return Math.floor(op / 1000) % 10
}

function printV(param: number, mode: ParamterMode, value: number, ) {
    if (mode === ParamterMode.immediate) {
        return `${value}`
    } else {
        return `${value}(memory[${param}])`
    }
}

function dump(memory: number[], pointer: number) {
    console.log(`memory:`, JSON.stringify(memory))
    console.log(`pointer:`, pointer)
}

export class IntcodeComputer {
    constructor(readonly program: string) {
    }

    run(input: number) {
        function getValue(p: number, m: ParamterMode): number {
            switch (m) {
                case ParamterMode.immediate:
                    return p
                case ParamterMode.position:
                default:
                    return memory[p]
            }
        }

        const memory = this.program.split(",").map(Number)
        console.log("memory:", memory.length);

        let pointer = 0
        let output: number = undefined!

        while (true) {
            // instruction 指令
            const op = memory[pointer++]
            const opCode = op % 100
            if (opCode === 99)
                return output
            switch (opCode) {
                case 1: { // add
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[pointer++]

                    memory[param3_out] = value1 + value2

                    console.log(`${printOP(pointer - 4)}, ADD ${printV(param1, mode1, value1)} + ${printV(param2, mode2, value2)} => ${printM(param3_out)}`);
                    break
                }
                case 2: { // multi
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[pointer++]

                    memory[param3_out] = value1 * value2

                    console.log(`${printOP(pointer - 4)}, MUL ${printV(param1, mode1, value1)} * ${printV(param2, mode2, value2)} => ${printM(param3_out)}`);
                    break
                }
                case 3: { // set
                    const param1_out = memory[pointer++]

                    memory[param1_out] = input

                    console.log(`${printOP(pointer - 2)}, SET ${input} => memory[${param1_out}]`);
                    break
                }
                case 4: { // output
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    output = value1

                    console.log(`${printOP(pointer - 2)}, OUT memory[${param1}] => ${output}`);
                    break
                }
                case 5: { // jump if true
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    if (value1 !== 0) {
                        console.log(`${printOP(pointer - 3)}, JNZ ${value2} => pointer`);
                        pointer = value2
                    } else {
                        console.log(`${printOP(pointer - 3)}, JNZ do nothing`);
                    }

                    break
                }
                case 6: { // jump if false
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    if (value1 === 0) {
                        console.log(`${printOP(pointer - 3)}, JZ  ${value2} => pointer`);
                        pointer = value2
                    } else {
                        console.log(`${printOP(pointer - 3)}, JZ  do nothing`);
                    }

                    break
                }
                case 7: { // less than
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[pointer++]

                    memory[param3_out] = value1 < value2 ? 1 : 0

                    console.log(`${printOP(pointer - 3)}, LSS ${printV(param1, mode1, value1)} < ${printV(param2, mode2, value2)} ? => ${printM(param3_out)}`);
                    break
                }
                case 8: { // equals
                    const param1 = memory[pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[pointer++]

                    memory[param3_out] = value1 === value2 ? 1 : 0

                    console.log(`${printOP(pointer - 4)}, LSS ${printV(param1, mode1, value1)} == ${printV(param2, mode2, value2)} ? => ${printM(param3_out)}`);
                    break
                }
                default:
                    throw new Error(`Unknown opcode: ${op}`)
            }
        }

        function printM(pointer: number) {
            return `${memory[pointer]}(memory[${pointer}])`
        }

        function printOP(startP: number) {
            return `${startP.toString().padStart(3)}: ${memory[startP].toString().padStart(5)}`
        }
    }
}

// answer
function main() {
    let program = "3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9"
    console.assert(new IntcodeComputer(program).run(0) === 0);
    console.assert(new IntcodeComputer(program).run(1) === 1);

    program = "3,3,1105,-1,9,1101,0,0,12,4,12,99,1"
    console.assert(new IntcodeComputer(program).run(0) === 0);
    console.assert(new IntcodeComputer(program).run(1) === 1);

    program = "3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99"
    console.assert(new IntcodeComputer(program).run(7) === 999);
    console.assert(new IntcodeComputer(program).run(8) === 1000);
    console.assert(new IntcodeComputer(program).run(9) === 1001);

    program = "3,225,1,225,6,6,1100,1,238,225,104,0,1102,88,66,225,101,8,125,224,101,-88,224,224,4,224,1002,223,8,223,101,2,224,224,1,224,223,223,1101,87,23,225,1102,17,10,224,101,-170,224,224,4,224,102,8,223,223,101,3,224,224,1,223,224,223,1101,9,65,225,1101,57,74,225,1101,66,73,225,1101,22,37,224,101,-59,224,224,4,224,102,8,223,223,1001,224,1,224,1,223,224,223,1102,79,64,225,1001,130,82,224,101,-113,224,224,4,224,102,8,223,223,1001,224,7,224,1,223,224,223,1102,80,17,225,1101,32,31,225,1,65,40,224,1001,224,-32,224,4,224,102,8,223,223,1001,224,4,224,1,224,223,223,2,99,69,224,1001,224,-4503,224,4,224,102,8,223,223,101,6,224,224,1,223,224,223,1002,14,92,224,1001,224,-6072,224,4,224,102,8,223,223,101,5,224,224,1,223,224,223,102,33,74,224,1001,224,-2409,224,4,224,1002,223,8,223,101,7,224,224,1,223,224,223,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,107,677,677,224,1002,223,2,223,1006,224,329,101,1,223,223,108,677,677,224,1002,223,2,223,1005,224,344,101,1,223,223,1007,677,677,224,1002,223,2,223,1006,224,359,101,1,223,223,1107,226,677,224,1002,223,2,223,1006,224,374,1001,223,1,223,8,677,226,224,1002,223,2,223,1006,224,389,101,1,223,223,1108,677,677,224,1002,223,2,223,1005,224,404,1001,223,1,223,7,226,226,224,1002,223,2,223,1006,224,419,101,1,223,223,1107,677,677,224,1002,223,2,223,1005,224,434,101,1,223,223,107,226,226,224,102,2,223,223,1005,224,449,101,1,223,223,107,677,226,224,1002,223,2,223,1006,224,464,1001,223,1,223,8,226,677,224,102,2,223,223,1006,224,479,1001,223,1,223,108,677,226,224,102,2,223,223,1005,224,494,1001,223,1,223,1108,677,226,224,1002,223,2,223,1005,224,509,1001,223,1,223,1107,677,226,224,1002,223,2,223,1005,224,524,101,1,223,223,1008,226,226,224,1002,223,2,223,1006,224,539,101,1,223,223,1008,226,677,224,1002,223,2,223,1005,224,554,1001,223,1,223,7,226,677,224,1002,223,2,223,1005,224,569,101,1,223,223,1007,677,226,224,1002,223,2,223,1006,224,584,1001,223,1,223,7,677,226,224,102,2,223,223,1006,224,599,101,1,223,223,1007,226,226,224,102,2,223,223,1006,224,614,101,1,223,223,1008,677,677,224,1002,223,2,223,1006,224,629,101,1,223,223,108,226,226,224,102,2,223,223,1006,224,644,101,1,223,223,1108,226,677,224,1002,223,2,223,1005,224,659,101,1,223,223,8,226,226,224,1002,223,2,223,1005,224,674,101,1,223,223,4,223,99,226"
    console.log(new IntcodeComputer(program).run(5));
}
main()
