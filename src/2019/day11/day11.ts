import {loadInput} from "../../utils/loadInput.js";
import {makeArray} from "../utils.js"
import {IntcodeComputer} from "../IntcodeComputer.js";

const enum Color {black = 0, white = 1}

const enum Turn {left = 0, right = 1}

const enum Direction {up = 0, left = 1, down = 2, right = 3}

async function Q2() {
    const program = (await loadInput(import.meta.url)).trimEnd()

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

    console.log("Q2:")
    for (let line of canvas) {
        console.log(line.map(v => v ? "#" : " ").join(""));
    }
}

Q2()
