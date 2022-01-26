import {loadInput} from "../../utils/loadInput.js"

async function Q() {
    const [line1, line2] = (await loadInput(import.meta.url)).trimEnd().split("\n")

    const map = new Map<string, number>()

    let x = 0
    let y = 0
    map.set(`${x},${y}`, 1)
    let step1 = 0
    for (const move of line1.split(",")) {
        const direction = move[0]
        const length = Number(move.slice(1))
        switch (direction) {
            case "R": {
                let c = length
                while (c--) {
                    x++
                    step1++
                    map.set(`${x},${y}`, step1)
                }
                break
            }
            case "L": {
                let c = length
                while (c--) {
                    x--
                    step1++
                    map.set(`${x},${y}`, step1)
                }
                break
            }
            case "U": {
                let c = length
                while (c--) {
                    y--
                    step1++
                    map.set(`${x},${y}`, step1)
                }
                break
            }
            case "D": {
                let c = length
                while (c--) {
                    y++
                    step1++
                    map.set(`${x},${y}`, step1)
                }
                break
            }
        }
    }

    let closest = Infinity
    let intersectionDistance = Infinity

    function calcDistance(x: number, y: number) {
        return Math.abs(x) + Math.abs(y) //Math.sqrt(x * x + y * y)
    }

    function calcIntersectionDistance() {
        let step1 = map.get(`${x},${y}`)
        if (step1) {
            const dist = step2 + step1
            if (dist < intersectionDistance) {
                intersectionDistance = dist
            }
            const c = calcDistance(x, y)
            if (c < closest) {
                closest = c
            }
        }
    }

    x = 0
    y = 0
    let step2 = 0
    for (const move of line2.split(",")) {
        const direction = move[0]
        const length = Number(move.slice(1))
        switch (direction) {
            case "R": {
                let c = length
                while (c--) {
                    x++
                    step2++
                    calcIntersectionDistance()
                }
                break
            }
            case "L": {
                let c = length
                while (c--) {
                    x--
                    step2++
                    calcIntersectionDistance()
                }
                break
            }
            case "U": {
                let c = length
                while (c--) {
                    y--
                    step2++
                    calcIntersectionDistance()
                }
                break
            }
            case "D": {
                let c = length
                while (c--) {
                    y++
                    step2++
                    calcIntersectionDistance()
                }
                break
            }
        }
    }

    console.log(`Q1: ${closest}`)
    console.log(`Q2: ${intersectionDistance}`);
}

Q()
