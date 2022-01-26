import {loadInput} from "../../utils/loadInput.js";
import {IntcodeComputer} from "../IntcodeComputer.js";

const enum Tile {
    empty = 0,
    wall = 1,
    block = 2,
    horizontalPaddle = 3,
    ball = 4,
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

async function Q2() {
    const program = (await loadInput(import.meta.url)).trimEnd()

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
        // await new Promise(resolve => setTimeout(resolve, 8))
        console.clear()
        console.log(canvas.render());
    }
    console.log(`Q2: ${canvas.score}`)
}

Q2()
