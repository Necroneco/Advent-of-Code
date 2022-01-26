import {IntcodeComputer} from "../IntcodeComputer.js"
import {makeArray} from "../utils.js"
import {loadInput} from "../../utils/loadInput.js";

async function Q1() {
    const program = (await loadInput(import.meta.url)).trimEnd()

    let count = 0
    const maxX = 50
    const maxY = 50
    let startX = 0
    for (let y = 0, len = maxY; y < len; ++y) {
        let hit = false
        for (let x = startX, len = maxX; x < len; ++x) {
            const computer = new IntcodeComputer(program)
            computer.run(x)
            computer.run(y)
            const output = computer.takeOutputs()[0]
            if (output === 1) count++
            if (!hit) {
                if (output) {
                    hit = true
                    startX = x
                }
            } else {
                if (!output) {
                    break
                }
            }
        }
    }
    console.log(`Q1: ${count}`)
}

await Q1()

async function Q2Prepare() {
    const program = (await loadInput(import.meta.url)).trimEnd()

    let count = 0
    const maxX = 1100
    const maxY = 1350
    const map = makeArray(maxY, () => makeArray(maxX, () => 0))
    let startX = 0
    for (let y = 0, len = maxY; y < len; ++y) {
        let hit = false
        for (let x = startX, len = maxX; x < len; ++x) {
            const computer = new IntcodeComputer(program)
            computer.run(x)
            computer.run(y)
            map[y][x] = computer.takeOutputs()[0]
            if (map[y][x] === 1) {
                count++
            }
            if (!hit) {
                if (map[y][x]) {
                    hit = true
                    startX = x
                }
            } else {
                if (!map[y][x]) {
                    break
                }
            }
        }
        // if (y % 100 === 0) console.log(Math.floor(y / 100));
    }
    return map
}

async function Q2() {
    const map = await Q2Prepare() // todo 这解法不合格
    const maxY = map.length
    const m = map.map(line => [line.indexOf(1), line.lastIndexOf(1)])
    const find = 100
    for (let y = 0, len = maxY - find; y < len; ++y) {
        const [s, e] = m[y]
        const [ds, de] = m[y + find - 1]
        if (ds >= s && ds + find - 1 <= e && de >= e) {
            console.log(ds, y, ds * 10000 + y);
            return
        }
    }
    console.log("not found");
}

await Q2()
