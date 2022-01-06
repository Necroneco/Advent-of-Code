const enum ParamterMode {
    position = 0,
    immediate = 1,
    relative = 2,
}

function getMode1(op: number) {
    return Math.floor(op / 100) % 10 as ParamterMode
}

function getMode2(op: number) {
    return Math.floor(op / 1000) % 10 as ParamterMode
}

function dump(memory: number[], pointer: number) {
    console.log(`memory:`, JSON.stringify(memory))
    console.log(`pointer:`, pointer)
}


export class IntcodeComputer {
    constructor(readonly program: string, public $debug = false) {
        this.memory = this.program.split(",").map(Number)
        // if ($debug) console.log("memory:", this.memory.length);
        this.pointer = 0
    }

    readonly memory: number[]

    pointer: number

    isHalt = false

    ret = 0

    relativeBase = 0

    run(input: number | undefined): number | undefined {
        function getValue(p: number, m: ParamterMode): number {
            switch (m) {
                case ParamterMode.immediate:
                    return p
                case ParamterMode.position:
                default:
                    return memory[p]
            }
        }

        const memory = this.memory

        while (true) {
            // instruction 指令
            const op = memory[this.pointer++]
            const opCode = op % 100
            if (opCode === 99) {
                this.isHalt = true
                return this.ret
            }
            switch (opCode) {
                case 1: { // add
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[this.pointer++]

                    memory[param3_out] = value1 + value2

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, ADD ${this.printV(param1, mode1, value1)} + ${this.printV(param2, mode2, value2)} => ${printM(param3_out)}`);
                    break
                }
                case 2: { // multi
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[this.pointer++]

                    memory[param3_out] = value1 * value2

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, MUL ${this.printV(param1, mode1, value1)} * ${this.printV(param2, mode2, value2)} => ${printM(param3_out)}`);
                    break
                }
                case 3: { // set
                    if (input === undefined) {
                        this.pointer -= 1
                        return
                    }

                    const param1_out = memory[this.pointer++]

                    memory[param1_out] = input

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, SET ${input} => memory[${param1_out}]`);
                    input = undefined!
                    break
                }
                case 4: { // output
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    this.ret = value1

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, OUT memory[${param1}] => ${value1}`);

                    return value1
                }
                case 5: { // jump if true
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    if (value1 !== 0) {
                        if (this.$debug) console.log(`${printOP(this.pointer - 3)}, JNZ ${value2} => pointer`);
                        this.pointer = value2
                    } else {
                        if (this.$debug) console.log(`${printOP(this.pointer - 3)}, JNZ do nothing`);
                    }

                    break
                }
                case 6: { // jump if false
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    if (value1 === 0) {
                        if (this.$debug) console.log(`${printOP(this.pointer - 3)}, JZ  ${value2} => pointer`);
                        this.pointer = value2
                    } else {
                        if (this.$debug) console.log(`${printOP(this.pointer - 3)}, JZ  do nothing`);
                    }

                    break
                }
                case 7: { // less than
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[this.pointer++]

                    memory[param3_out] = value1 < value2 ? 1 : 0

                    if (this.$debug) console.log(`${printOP(this.pointer - 3)}, LSS ${this.printV(param1, mode1, value1)} < ${this.printV(param2, mode2, value2)} ? => ${printM(param3_out)}`);
                    break
                }
                case 8: { // equals
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = getValue(param2, mode2)

                    const param3_out = memory[this.pointer++]

                    memory[param3_out] = value1 === value2 ? 1 : 0

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, LSS ${this.printV(param1, mode1, value1)} == ${this.printV(param2, mode2, value2)} ? => ${printM(param3_out)}`);
                    break
                }
                case 9: { // adjusts the relative base
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = getValue(param1, mode1)

                    this.relativeBase += value1

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, ARB relativeBase += ${this.printV(param1, mode1, value1)}`);
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

    private printV(param: number, mode: ParamterMode, value: number) {
        switch (mode) {
            case ParamterMode.immediate:
                return `${value}`
            case ParamterMode.relative:
                return `${value}(memory[${this.relativeBase}+${param}])`
            case ParamterMode.position:
            default:
                return `${value}(memory[${param}])`
        }
    }
}

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
        return m.run(output)!
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
            output = amplifier.run(output)!
        }
        result = output
        // console.log(result);
    }
}

function main() {
    let program: string

    // program = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0"
    // console.assert(series(program, [4, 3, 2, 1, 0]) === 43210);

    // program = "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0"
    // console.assert(series(program, [0, 1, 2, 3, 4]) === 54321);

    // program = "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0"
    // console.assert(series(program, [1, 0, 4, 3, 2]) === 65210);

    // program = "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5"
    // console.assert(feedbackLoop(program, [9, 8, 7, 6, 5]) === 139629729);

    // program = "3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10"
    // console.assert(feedbackLoop(program, [9, 7, 8, 5, 6]) === 18216);

    program = "3,8,1001,8,10,8,105,1,0,0,21,38,55,72,93,118,199,280,361,442,99999,3,9,1001,9,2,9,1002,9,5,9,101,4,9,9,4,9,99,3,9,1002,9,3,9,1001,9,5,9,1002,9,4,9,4,9,99,3,9,101,4,9,9,1002,9,3,9,1001,9,4,9,4,9,99,3,9,1002,9,4,9,1001,9,4,9,102,5,9,9,1001,9,4,9,4,9,99,3,9,101,3,9,9,1002,9,3,9,1001,9,3,9,102,5,9,9,101,4,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,99,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,99"

    let max = -Infinity
    for (let sequence of allSequence([9, 8, 7, 6, 5])) {
        const thruster = feedbackLoop(program, sequence)
        if (thruster > max) {
            max = thruster
        }
    }
    console.log(max);
}
main()
