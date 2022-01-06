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

function getMode3(op: number) {
    return Math.floor(op / 10000) % 10 as ParamterMode
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

    runUntilHalt(stdout: (value?: number) => void) {
        while (true) {
            const result = this.run()
            if (!this.isHalt) {
                stdout(result)
            } else {
                return
            }
        }
    }

    private readMemory(position: number, mode: ParamterMode) {
        switch (mode) {
            case ParamterMode.relative:
                return this.memory[position + this.relativeBase] ?? 0
            case ParamterMode.immediate:
                return position
            case ParamterMode.position:
            default:
                return this.memory[position] ?? 0
        }
    }

    private writeMemory(position: number, mode: ParamterMode, value: number) {
        if (isNaN(value)) {
            throw new Error("非法数据")
        }
        switch (mode) {
            case ParamterMode.relative:
                this.memory[position + this.relativeBase] = value
            case ParamterMode.position:
                this.memory[position] = value
                break
            case ParamterMode.immediate:
            default:
                throw new Error("writeMemory wrong mode")
        }
    }

    run(input?: number): number | undefined {

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
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

                    const param3 = memory[this.pointer++]
                    const mode3 = getMode3(op)

                    this.writeMemory(param3, mode3, value1 + value2)

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, ADD ${this.printV(param1, mode1, value1)} * ${this.printV(param2, mode2, value2)} => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
                    break
                }
                case 2: { // multi
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

                    const param3 = memory[this.pointer++]
                    const mode3 = getMode3(op)

                    this.writeMemory(param3, mode3, value1 * value2)

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, MUL ${this.printV(param1, mode1, value1)} * ${this.printV(param2, mode2, value2)} => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
                    break
                }
                case 3: { // set
                    if (input === undefined) {
                        this.pointer -= 1
                        console.log("等待输入")
                        return
                    }

                    const param1_out = memory[this.pointer++]
                    const mode1 = getMode1(op)

                    this.writeMemory(param1_out, mode1, input)

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, SET ${input} => memory[${param1_out}]`);
                    input = undefined!
                    break
                }
                case 4: { // output
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = this.readMemory(param1, mode1)

                    this.ret = value1

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, OUT ${this.printV(param1, mode1, value1)}`);

                    return value1
                }
                case 5: { // jump if true
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

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
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

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
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

                    const param3 = memory[this.pointer++]
                    const mode3 = getMode3(op)

                    this.writeMemory(param3, mode3, value1 < value2 ? 1 : 0)

                    if (this.$debug) console.log(`${printOP(this.pointer - 3)}, LSS ${this.printV(param1, mode1, value1)} < ${this.printV(param2, mode2, value2)} ? => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
                    break
                }
                case 8: { // equals
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = this.readMemory(param1, mode1)

                    const param2 = memory[this.pointer++]
                    const mode2 = getMode2(op)
                    const value2 = this.readMemory(param2, mode2)

                    const param3 = memory[this.pointer++]
                    const mode3 = getMode3(op)

                    this.writeMemory(param3, mode3, value1 === value2 ? 1 : 0)

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, LSS ${this.printV(param1, mode1, value1)} == ${this.printV(param2, mode2, value2)} ? => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
                    break
                }
                case 9: { // adjusts the relative base
                    const param1 = memory[this.pointer++]
                    const mode1 = getMode1(op)
                    const value1 = this.readMemory(param1, mode1)

                    this.relativeBase += value1

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, ARB relativeBase += ${this.printV(param1, mode1, value1)}`);
                    break
                }
                default:
                    throw new Error(`Unknown opcode: ${op}`)
            }
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

    // program = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99"
    // console.log(new IntcodeComputer(program).runUntilHalt(console.log));

    // program = "1102,34915192,34915192,7,4,7,99,0"
    // console.log(new IntcodeComputer(program).runUntilHalt(console.log));

    // program = "104,1125899906842624,99"
    // console.log(new IntcodeComputer(program).runUntilHalt(console.log));

    program = "1102,34463338,34463338,63,1007,63,34463338,63,1005,63,53,1101,3,0,1000,109,988,209,12,9,1000,209,6,209,3,203,0,1008,1000,1,63,1005,63,65,1008,1000,2,63,1005,63,904,1008,1000,0,63,1005,63,58,4,25,104,0,99,4,0,104,0,99,4,17,104,0,99,0,0,1101,37,0,1013,1101,426,0,1027,1101,36,0,1000,1101,0,606,1023,1102,34,1,1011,1102,1,712,1029,1102,1,27,1007,1101,831,0,1024,1102,32,1,1002,1102,1,1,1021,1101,429,0,1026,1102,1,826,1025,1101,0,717,1028,1102,1,20,1018,1101,0,24,1004,1102,31,1,1009,1101,22,0,1015,1102,38,1,1014,1102,613,1,1022,1102,29,1,1017,1102,0,1,1020,1102,1,21,1008,1102,33,1,1012,1101,0,30,1006,1101,0,28,1016,1102,1,26,1005,1102,35,1,1019,1101,25,0,1003,1102,1,23,1001,1102,1,39,1010,109,-3,2102,1,5,63,1008,63,34,63,1005,63,205,1001,64,1,64,1106,0,207,4,187,1002,64,2,64,109,-2,1201,7,0,63,1008,63,34,63,1005,63,227,1105,1,233,4,213,1001,64,1,64,1002,64,2,64,109,21,21102,40,1,3,1008,1019,37,63,1005,63,257,1001,64,1,64,1106,0,259,4,239,1002,64,2,64,109,-4,21101,41,0,2,1008,1014,38,63,1005,63,279,1105,1,285,4,265,1001,64,1,64,1002,64,2,64,109,-10,1201,4,0,63,1008,63,30,63,1005,63,307,4,291,1105,1,311,1001,64,1,64,1002,64,2,64,109,6,1207,0,22,63,1005,63,329,4,317,1105,1,333,1001,64,1,64,1002,64,2,64,109,-5,1207,5,20,63,1005,63,353,1001,64,1,64,1106,0,355,4,339,1002,64,2,64,109,8,2108,29,-5,63,1005,63,375,1001,64,1,64,1105,1,377,4,361,1002,64,2,64,109,15,1206,-6,395,4,383,1001,64,1,64,1105,1,395,1002,64,2,64,109,-11,21107,42,43,4,1005,1019,413,4,401,1106,0,417,1001,64,1,64,1002,64,2,64,109,6,2106,0,6,1105,1,435,4,423,1001,64,1,64,1002,64,2,64,109,-15,1208,-3,24,63,1005,63,455,1001,64,1,64,1105,1,457,4,441,1002,64,2,64,109,-13,1208,10,25,63,1005,63,475,4,463,1106,0,479,1001,64,1,64,1002,64,2,64,109,21,21108,43,42,3,1005,1017,495,1106,0,501,4,485,1001,64,1,64,1002,64,2,64,109,-14,2107,31,2,63,1005,63,519,4,507,1106,0,523,1001,64,1,64,1002,64,2,64,109,-4,1202,8,1,63,1008,63,24,63,1005,63,549,4,529,1001,64,1,64,1105,1,549,1002,64,2,64,109,1,2108,23,4,63,1005,63,567,4,555,1105,1,571,1001,64,1,64,1002,64,2,64,109,2,2101,0,5,63,1008,63,21,63,1005,63,591,1105,1,597,4,577,1001,64,1,64,1002,64,2,64,109,28,2105,1,-4,1001,64,1,64,1105,1,615,4,603,1002,64,2,64,109,-10,1205,4,633,4,621,1001,64,1,64,1106,0,633,1002,64,2,64,109,2,1206,2,645,1106,0,651,4,639,1001,64,1,64,1002,64,2,64,109,-4,1202,-6,1,63,1008,63,28,63,1005,63,671,1105,1,677,4,657,1001,64,1,64,1002,64,2,64,109,-9,21102,44,1,4,1008,1010,44,63,1005,63,699,4,683,1105,1,703,1001,64,1,64,1002,64,2,64,109,31,2106,0,-9,4,709,1105,1,721,1001,64,1,64,1002,64,2,64,109,-30,21108,45,45,6,1005,1013,743,4,727,1001,64,1,64,1106,0,743,1002,64,2,64,109,2,21101,46,0,3,1008,1012,46,63,1005,63,765,4,749,1106,0,769,1001,64,1,64,1002,64,2,64,109,-5,2101,0,0,63,1008,63,24,63,1005,63,795,4,775,1001,64,1,64,1105,1,795,1002,64,2,64,109,6,2107,32,-1,63,1005,63,815,1001,64,1,64,1106,0,817,4,801,1002,64,2,64,109,19,2105,1,-5,4,823,1106,0,835,1001,64,1,64,1002,64,2,64,109,-12,21107,47,46,-1,1005,1016,851,1105,1,857,4,841,1001,64,1,64,1002,64,2,64,109,-2,1205,5,873,1001,64,1,64,1105,1,875,4,863,1002,64,2,64,109,-6,2102,1,-8,63,1008,63,23,63,1005,63,897,4,881,1105,1,901,1001,64,1,64,4,64,99,21101,0,27,1,21101,0,915,0,1106,0,922,21201,1,44808,1,204,1,99,109,3,1207,-2,3,63,1005,63,964,21201,-2,-1,1,21101,942,0,0,1105,1,922,21201,1,0,-1,21201,-2,-3,1,21102,957,1,0,1105,1,922,22201,1,-1,-2,1106,0,968,21202,-2,1,-2,109,-3,2105,1,0"
    console.log(new IntcodeComputer(program).run(2));
}
main()
