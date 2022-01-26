const enum ParameterMode {
    position = 0,
    immediate = 1,
    relative = 2,
}

function getMode1(op: number): ParameterMode {
    return Math.floor(op / 100) % 10 as ParameterMode
}

function getMode2(op: number): ParameterMode {
    return Math.floor(op / 1000) % 10 as ParameterMode
}

function getMode3(op: number): ParameterMode {
    return Math.floor(op / 10000) % 10 as ParameterMode
}

function dump(memory: number[], pointer: number) {
    console.log(`memory:`, JSON.stringify(memory))
    console.log(`pointer:`, pointer)
}


export class AsciiCapable {
    constructor(readonly computer: IntcodeComputer) {

    }

    writeLine(line: string) {
        console.log(`<== ${line}`);
        line.split("").forEach(v => {
            this.computer.run(v.charCodeAt(0))
        })
        this.computer.run("\n".charCodeAt(0))
    }
}

export class IntcodeComputer {
    constructor(readonly program: string, public $debug = false) {
        this.memory = this.program.split(",").map(Number)
        // if ($debug) console.log("memory:", this.memory.length);
        this.pointer = 0
    }

    clone(): IntcodeComputer {
        const c = new IntcodeComputer(this.program)
        for (let i = 0, len = this.memory.length; i < len; i++) {
            c.memory[i] = this.memory[i]
        }
        c.pointer = this.pointer
        c.isHalt = this.isHalt
        c.relativeBase = this.relativeBase
        return c
    }

    readonly memory: number[]

    pointer: number

    isHalt = false

    relativeBase = 0

    private outputs: number[] = []

    takeOutputs() {
        return this.outputs.splice(0, this.outputs.length)
    }

    private readMemory(position: number, mode: ParameterMode) {
        switch (mode) {
            case ParameterMode.relative:
                return this.memory[position + this.relativeBase] ?? 0
            case ParameterMode.immediate:
                return position
            case ParameterMode.position:
            default:
                return this.memory[position] ?? 0
        }
    }

    private writeMemory(position: number, mode: ParameterMode, value: number) {
        if (isNaN(value)) {
            throw new Error("非法数据")
        }
        switch (mode) {
            case ParameterMode.relative:
                this.memory[position + this.relativeBase] = value
            // fall through
            case ParameterMode.position:
                this.memory[position] = value
                break
            case ParameterMode.immediate:
            default:
                throw new Error("writeMemory wrong mode")
        }
    }

    run(input?: number) {
        if (this.isHalt) {
            throw new Error("Computer is Halt!")
        }

        const memory = this.memory

        while (true) {
            // instruction 指令
            const op = memory[this.pointer++]
            const opCode = op % 100
            if (opCode === 99) {
                this.isHalt = true
                return
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

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, ADD ${this.printV(param1, mode1, value1)} + ${this.printV(param2, mode2, value2)} => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
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
                        if (this.$debug) console.log("等待输入")
                        return
                    }
                    if (this.$debug) console.log("input:", input);

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

                    this.outputs.push(value1)

                    if (this.$debug) console.log(`${printOP(this.pointer - 2)}, OUT ${this.printV(param1, mode1, value1)}`);

                    break
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

                    if (this.$debug) console.log(`${printOP(this.pointer - 4)}, LSS ${this.printV(param1, mode1, value1)} < ${this.printV(param2, mode2, value2)} ? => ${this.printV(param3, mode3, this.readMemory(param3, mode3))}`);
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

    private printV(param: number, mode: ParameterMode, value: number) {
        switch (mode) {
            case ParameterMode.immediate:
                return `${value}`
            case ParameterMode.relative:
                return `${value}(memory[${this.relativeBase}+${param}])`
            case ParameterMode.position:
            default:
                return `${value}(memory[${param}])`
        }
    }
}
