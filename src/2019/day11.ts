import {makeArray} from "./utils.js"

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

    relativeBase = 0

    private outputs: number[] = []

    takeOutputs() {
        return this.outputs.splice(0, this.outputs.length)
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

    run(input?: number) {
        if (this.$debug) console.log("input:", input);


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
                        if (this.$debug) console.log("等待输入")
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

function main() {
    let program: string

    program = "3,8,1005,8,326,1106,0,11,0,0,0,104,1,104,0,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,1,10,4,10,1001,8,0,29,2,1003,17,10,1006,0,22,2,106,5,10,1006,0,87,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,1,10,4,10,1001,8,0,65,2,7,20,10,2,9,17,10,2,6,16,10,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,0,10,4,10,101,0,8,99,1006,0,69,1006,0,40,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,1,10,4,10,101,0,8,127,1006,0,51,2,102,17,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,108,1,8,10,4,10,1002,8,1,155,1006,0,42,3,8,1002,8,-1,10,101,1,10,10,4,10,108,0,8,10,4,10,101,0,8,180,1,106,4,10,2,1103,0,10,1006,0,14,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,1001,8,0,213,1,1009,0,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,108,0,8,10,4,10,1002,8,1,239,1006,0,5,2,108,5,10,2,1104,7,10,3,8,102,-1,8,10,101,1,10,10,4,10,108,0,8,10,4,10,102,1,8,272,2,1104,12,10,1,1109,10,10,3,8,102,-1,8,10,1001,10,1,10,4,10,108,1,8,10,4,10,102,1,8,302,1006,0,35,101,1,9,9,1007,9,1095,10,1005,10,15,99,109,648,104,0,104,1,21102,937268449940,1,1,21102,1,343,0,1105,1,447,21101,387365315480,0,1,21102,1,354,0,1105,1,447,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,21101,0,29220891795,1,21102,1,401,0,1106,0,447,21101,0,248075283623,1,21102,412,1,0,1105,1,447,3,10,104,0,104,0,3,10,104,0,104,0,21101,0,984353760012,1,21102,1,435,0,1105,1,447,21102,1,718078227200,1,21102,1,446,0,1105,1,447,99,109,2,21202,-1,1,1,21102,40,1,2,21101,0,478,3,21101,468,0,0,1106,0,511,109,-2,2106,0,0,0,1,0,0,1,109,2,3,10,204,-1,1001,473,474,489,4,0,1001,473,1,473,108,4,473,10,1006,10,505,1102,1,0,473,109,-2,2105,1,0,0,109,4,1202,-1,1,510,1207,-3,0,10,1006,10,528,21102,1,0,-3,22102,1,-3,1,22101,0,-2,2,21101,0,1,3,21102,1,547,0,1105,1,552,109,-4,2105,1,0,109,5,1207,-3,1,10,1006,10,575,2207,-4,-2,10,1006,10,575,21202,-4,1,-4,1105,1,643,21202,-4,1,1,21201,-3,-1,2,21202,-2,2,3,21102,1,594,0,1106,0,552,22102,1,1,-4,21101,1,0,-1,2207,-4,-2,10,1006,10,613,21101,0,0,-1,22202,-2,-1,-2,2107,0,-3,10,1006,10,635,22101,0,-1,1,21101,0,635,0,106,0,510,21202,-2,-1,-2,22201,-4,-2,-4,109,-5,2105,1,0"
    const computer = new IntcodeComputer(program)

    const map = new Map<string, Color>()
    function getColor(x: number, y: number) {
        return map.get(`${x},${y}`) ?? Color.black
    }

    function setColor(x: number, y: number, color: Color) {
        map.set(`${x},${y}`, color)
    }

    let direction = Direction.up
    let x = 0
    let y = 0
    setColor(0, 0, Color.white)

    while (true) {
        computer.run(getColor(x, y))
        if (computer.isHalt) {
            break
        }
        const output = computer.takeOutputs() as [Color, Turn]

        // paint
        setColor(x, y, output[0])
        // console.log(map.size);

        // turn
        switch (output[1]) {
            case Turn.left:
                direction = (direction + 1) % 4
                break;
            case Turn.right:
                direction = (direction - 1 + 4) % 4
                break;
            default:
                throw new Error("error Turn");
        }

        // move
        switch (direction) {
            case Direction.up:
                y += 1
                break
            case Direction.left:
                x -= 1
                break
            case Direction.down:
                y -= 1
                break
            case Direction.right:
                x += 1
                break
            default:
                throw new Error("error Move");
        }
    }
    const canvas = makeArray(6, () => makeArray(41, () => Color.black))
    for (let [p, color] of map) {
        const [x, y] = p.split(",").map(Number)
        canvas[-y][x] = color
    }

    for (let line of canvas) {
        console.log(line.map(v => v ? "#" : " ").join(""));
    }
}
main()

const enum Color {
    black = 0,
    white = 1,
}

const enum Turn {
    left = 0,
    right = 1,
}

const enum Direction {
    up, left, down, right
}
