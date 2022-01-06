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

    program = "1,380,379,385,1008,2399,848142,381,1005,381,12,99,109,2400,1101,0,0,383,1101,0,0,382,21001,382,0,1,20101,0,383,2,21102,1,37,0,1105,1,578,4,382,4,383,204,1,1001,382,1,382,1007,382,44,381,1005,381,22,1001,383,1,383,1007,383,20,381,1005,381,18,1006,385,69,99,104,-1,104,0,4,386,3,384,1007,384,0,381,1005,381,94,107,0,384,381,1005,381,108,1105,1,161,107,1,392,381,1006,381,161,1102,1,-1,384,1106,0,119,1007,392,42,381,1006,381,161,1101,0,1,384,20101,0,392,1,21101,0,18,2,21101,0,0,3,21102,138,1,0,1105,1,549,1,392,384,392,21002,392,1,1,21102,18,1,2,21102,1,3,3,21102,161,1,0,1105,1,549,1102,0,1,384,20001,388,390,1,20101,0,389,2,21101,0,180,0,1105,1,578,1206,1,213,1208,1,2,381,1006,381,205,20001,388,390,1,20101,0,389,2,21102,205,1,0,1106,0,393,1002,390,-1,390,1101,1,0,384,21002,388,1,1,20001,389,391,2,21101,0,228,0,1105,1,578,1206,1,261,1208,1,2,381,1006,381,253,20101,0,388,1,20001,389,391,2,21102,253,1,0,1106,0,393,1002,391,-1,391,1101,1,0,384,1005,384,161,20001,388,390,1,20001,389,391,2,21102,279,1,0,1105,1,578,1206,1,316,1208,1,2,381,1006,381,304,20001,388,390,1,20001,389,391,2,21102,1,304,0,1105,1,393,1002,390,-1,390,1002,391,-1,391,1102,1,1,384,1005,384,161,20102,1,388,1,20101,0,389,2,21101,0,0,3,21101,0,338,0,1105,1,549,1,388,390,388,1,389,391,389,21001,388,0,1,21001,389,0,2,21102,4,1,3,21101,365,0,0,1105,1,549,1007,389,19,381,1005,381,75,104,-1,104,0,104,0,99,0,1,0,0,0,0,0,0,333,20,15,1,1,22,109,3,22101,0,-2,1,21201,-1,0,2,21102,1,0,3,21102,1,414,0,1105,1,549,21202,-2,1,1,22102,1,-1,2,21101,429,0,0,1105,1,601,2102,1,1,435,1,386,0,386,104,-1,104,0,4,386,1001,387,-1,387,1005,387,451,99,109,-3,2106,0,0,109,8,22202,-7,-6,-3,22201,-3,-5,-3,21202,-4,64,-2,2207,-3,-2,381,1005,381,492,21202,-2,-1,-1,22201,-3,-1,-3,2207,-3,-2,381,1006,381,481,21202,-4,8,-2,2207,-3,-2,381,1005,381,518,21202,-2,-1,-1,22201,-3,-1,-3,2207,-3,-2,381,1006,381,507,2207,-3,-4,381,1005,381,540,21202,-4,-1,-1,22201,-3,-1,-3,2207,-3,-4,381,1006,381,529,21202,-3,1,-7,109,-8,2106,0,0,109,4,1202,-2,44,566,201,-3,566,566,101,639,566,566,2101,0,-1,0,204,-3,204,-2,204,-1,109,-4,2106,0,0,109,3,1202,-1,44,593,201,-2,593,593,101,639,593,593,21001,0,0,-2,109,-3,2106,0,0,109,3,22102,20,-2,1,22201,1,-1,1,21101,0,443,2,21101,0,758,3,21102,1,880,4,21101,0,630,0,1106,0,456,21201,1,1519,-2,109,-3,2105,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,2,2,0,2,2,2,2,2,2,0,2,0,0,2,0,2,2,2,2,2,0,0,2,2,2,2,2,2,0,2,0,0,0,2,0,2,0,0,0,0,0,1,1,0,2,2,2,2,2,2,2,0,2,0,2,0,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,0,2,0,0,0,0,2,0,2,2,2,2,2,0,1,1,0,2,0,0,2,2,2,0,2,2,0,0,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,0,2,2,0,2,0,2,0,2,2,2,2,2,2,0,1,1,0,2,2,2,0,0,0,2,2,2,0,0,2,2,2,0,2,2,2,2,2,0,2,0,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,2,0,1,1,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,2,2,2,0,2,0,2,2,0,2,2,2,2,0,2,2,2,2,2,2,2,2,2,0,0,0,0,1,1,0,0,2,2,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,0,0,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,2,0,0,1,1,0,2,2,2,2,0,0,2,2,0,2,0,2,2,2,2,0,2,2,2,0,2,2,2,2,2,0,2,0,2,2,0,2,2,2,2,2,2,2,2,0,0,1,1,0,2,2,0,2,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,0,0,2,2,0,2,0,2,0,2,0,2,0,2,2,2,2,0,0,2,2,0,1,1,0,2,0,2,2,2,2,2,0,2,2,0,2,2,2,0,2,2,2,0,0,2,2,0,2,0,2,2,0,2,2,2,2,0,2,2,0,0,2,2,0,0,1,1,0,0,2,2,0,2,2,2,2,0,0,0,0,2,2,0,2,2,2,2,2,0,2,2,2,2,2,0,2,2,0,0,2,0,0,2,2,0,2,0,0,0,1,1,0,2,2,2,2,2,2,2,2,0,0,2,0,2,2,2,2,2,2,2,2,2,2,0,2,2,2,2,0,0,2,0,0,2,2,2,2,2,2,2,0,0,1,1,0,2,0,2,0,0,2,2,0,2,0,2,0,2,0,2,2,2,0,0,2,2,2,0,0,2,2,2,0,2,0,2,0,0,2,0,0,2,2,2,2,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,49,63,55,3,42,75,44,11,52,43,19,94,25,84,91,44,85,78,73,32,40,21,13,35,50,35,1,13,10,42,58,90,30,42,52,73,65,49,6,49,20,97,15,59,60,77,89,53,16,70,77,24,6,78,18,5,32,32,82,86,80,66,80,26,57,42,45,27,13,69,43,93,22,79,42,62,36,97,23,41,66,8,4,52,75,31,14,83,21,15,93,64,45,24,41,50,37,98,96,54,66,96,53,78,78,76,43,39,60,81,96,83,14,3,89,51,8,47,66,33,29,32,83,15,37,89,81,57,46,25,45,94,70,80,94,49,6,57,61,59,42,39,45,79,63,68,93,53,65,32,87,56,76,29,70,45,72,12,13,25,67,1,32,55,31,12,96,33,28,64,33,50,53,37,22,50,42,93,64,43,56,47,96,93,22,77,17,5,69,24,88,92,17,18,84,76,4,65,90,43,11,55,60,78,52,34,45,77,10,37,30,48,21,22,52,30,25,40,72,6,12,36,87,96,94,95,78,58,69,38,61,8,29,3,43,95,65,63,24,73,24,42,18,7,7,20,8,25,78,86,21,20,23,69,72,91,54,54,23,68,19,78,79,6,31,14,7,84,21,83,55,11,42,79,94,44,5,50,43,47,40,97,86,23,16,40,64,4,62,94,90,56,87,57,90,8,32,20,75,6,68,6,39,10,92,56,1,8,4,43,22,12,7,72,3,75,25,41,26,42,74,43,64,87,6,97,58,40,35,89,94,64,17,66,61,27,68,58,76,67,94,18,54,52,3,16,94,75,23,57,22,41,66,29,97,33,89,96,82,30,32,22,49,85,46,64,62,82,47,53,1,41,7,55,33,93,33,37,69,98,28,26,48,26,9,55,5,77,60,47,70,53,44,44,43,27,94,9,13,57,9,68,43,64,44,75,13,68,67,74,82,20,24,51,36,21,32,53,37,32,87,4,2,25,22,63,53,85,31,83,51,30,40,52,27,81,83,84,17,57,18,29,17,6,94,20,85,35,23,31,21,19,68,51,11,48,74,49,22,30,22,82,60,74,92,9,26,69,75,48,85,90,85,92,34,39,23,32,39,14,9,66,92,52,34,91,49,36,64,97,15,88,11,81,84,67,98,57,18,24,52,14,19,25,21,62,37,3,51,71,41,12,19,30,13,12,18,57,42,26,84,30,43,24,76,83,19,47,35,86,82,24,31,42,35,42,76,7,58,54,76,83,50,90,81,40,74,56,7,64,58,46,88,71,49,38,52,33,50,11,43,91,38,72,9,9,58,71,74,81,81,29,75,88,23,11,15,73,81,87,43,18,93,21,45,19,46,22,29,10,52,83,38,32,52,72,8,48,34,59,59,16,7,24,17,39,29,42,36,74,53,14,42,82,49,46,68,42,97,96,94,94,44,93,25,82,7,37,31,67,16,61,41,73,23,11,10,70,21,3,94,18,88,14,32,73,95,87,35,31,13,73,42,41,43,70,60,92,44,35,18,15,71,40,75,40,16,25,79,78,7,33,2,39,2,51,6,34,58,98,69,49,2,76,98,55,76,84,53,5,8,30,61,92,43,67,38,81,86,48,64,44,81,88,3,12,5,68,25,94,54,50,85,49,53,52,54,9,80,55,53,63,72,51,83,48,49,7,96,9,43,88,85,46,6,33,75,82,2,34,70,88,15,6,83,3,90,69,95,84,52,61,38,61,4,29,87,94,11,90,62,17,21,17,14,1,83,40,1,12,69,57,67,42,39,43,82,80,14,79,74,33,61,12,20,77,3,88,52,62,82,92,22,37,76,21,69,53,5,23,72,23,39,78,50,37,89,43,65,36,62,34,35,97,23,10,68,80,23,31,69,49,81,40,20,31,56,72,19,36,95,68,64,5,12,92,64,47,73,98,94,54,79,76,76,35,16,51,14,26,72,26,7,58,20,30,47,91,86,24,30,76,64,18,84,6,57,81,67,73,33,44,33,92,44,69,27,88,6,51,848142"
    const computer = new IntcodeComputer(program)
    computer.memory[0] = 2
    computer.run()
    const canvas = new Canvas()
    canvas.input(computer.takeOutputs())
    console.clear()
    console.log(canvas.render());
    while (!computer.isHalt) {
        if (canvas.paddleX > canvas.ballX) {
            computer.run(-1)
        } else if (canvas.paddleX < canvas.ballX) {
            computer.run(1)
        } else {
            computer.run(0)
        }
        canvas.input(computer.takeOutputs())
        console.clear()
        console.log(canvas.render());
    }
}

class Canvas {
    bitmap: string[][] = []

    score: number = 0

    ballX!: number
    ballY!: number

    paddleX!: number

    input(data: number[]) {
        let p = 0
        const end = data.length
        while (p < end) {
            const x = data[p++]
            const y = data[p++]
            const t = data[p++]
            if (x === -1 && y === 0) {
                this.score = t
            } else {
                this.setBit(x, y, t)
                if (t === Tile.ball) {
                    this.ballX = x
                    this.ballY = y
                } else if (t === Tile.horizontalPaddle) {
                    this.paddleX = x
                }
            }
        }
    }

    setBit(x: number, y: number, tile: Tile) {
        const bitmap = this.bitmap;
        (bitmap[y] || (bitmap[y] = []))[x] = getTileDisplay(tile)
    }

    render() {
        return this.bitmap.map(line => line.join("")).join("\n") + " score: " + this.score.toString()
    }
}

function getTileDisplay(tile: Tile) {
    switch (tile) {
        case Tile.empty:
            return " ";
        case Tile.wall:
            return "█";
            // return "░";
        case Tile.block:
            return "▄";
            // return "█";
        case Tile.horizontalPaddle:
            return "▬";
        case Tile.ball:
            // return "☺";
            return "o"
        default:
            return " ";
    }
}

const enum Tile {
    empty = 0,
    wall = 1,
    block = 2,
    horizontalPaddle = 3,
    ball = 4,
}

main()
