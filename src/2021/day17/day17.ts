import {loadInput} from "../../utils/loadInput.js";

async function Q() {
    // target area: x=253..280, y=-73..-46
    const input = (await loadInput(import.meta.url)).trimEnd()
    const [_, x1, x2, y1, y2] = /target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/.exec(input)!.map(Number)
    // assert 0 < x1 < x2
    // assert y1 < y2 < 0

    const calcXSteps = (v0: number) => {
        const a = -1
        let x = 0
        let v = v0
        let t = 0
        const xSteps: number[] = []
        while (v > 0) {
            t += 1
            x += v
            if (x >= x1 && x <= x2) {
                xSteps.push(t)
            } else if (x > x2) {
                return xSteps
            }
            v += a
        }
        return xSteps
    }

    const calcYStep = (v0: number) => {
        const a = -1
        let y = 0
        let t, v
        const ySteps: number[] = []
        if (v0 >= 0) {
            t = v0 * 2 + 1
            v = -v0 + a
        } else {
            t = 0
            v = v0
        }
        while (true) {
            t += 1
            y += v
            if (y >= y1 && y <= y2) {
                ySteps.push(t)
            } else if (y < y1) {
                return ySteps
            }
            v += a
        }
    }

    const initialVelocities = new Set<string>()
    let highest = -Infinity
    for (let x = 1; x <= x2; x++) {
        const xSteps = calcXSteps(x)
        for (const step of xSteps) {
            for (let y = -y1; y >= y1; y--) {
                for (const yStep of calcYStep(y)) {
                    if (step === x ? yStep >= step : yStep === step) {
                        const height = y > 0 ? (1 + y) * y / 2 : 0
                        highest = Math.max(highest, height)
                        // console.log(`${x},${y} (${step},${yStep}) h:${height}`)
                        // break
                        initialVelocities.add(`${x},${y}`)
                    }
                }
            }
        }
    }
    console.log(`Q1: ${highest}`)
    console.log(`Q2: ${initialVelocities.size}`);
}

Q()
