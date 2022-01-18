import {loadInput} from "../../utils/loadInput.js"

async function enhance(times: number) {
    const input = await loadInput(import.meta.url)
    const lines = input.trimEnd().split("\n")

    const imageEnhancementAlgorithm = lines[0]

    const maxW = 1000
    const maxH = 1000
    let width = 100
    let height = 100
    let startX = Math.floor((maxW - width) / 2)
    let startY = Math.floor((maxH - height) / 2)

    const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement
    const ctx1 = canvas1.getContext("2d")!
    const canvas2 = document.getElementById("canvas2") as HTMLCanvasElement
    const ctx2 = canvas2.getContext("2d")!
    canvas2.style.display = "none"

    render(ctx1, lines.slice(2))

    function render(ctx: CanvasRenderingContext2D, data: string[]) {
        for (let y = 0; y < data.length; y++) {
            const line = data[y]
            for (let x = 0; x < line.length; x++) {
                const char = line[x]
                ctx.fillStyle = char === "#" ? "white" : "black";
                ctx.fillRect(x + startX, y + startY, 1, 1)
            }
        }
    }

    function next(ctx: CanvasRenderingContext2D, prev: CanvasRenderingContext2D, defaultLight: 0 | 1) {
        startX -= 1
        startY -= 1
        width += 2
        height += 2
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                const isLight = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
                    if (x <= startX || x >= startX + width - 1 || y <= startY || y >= startY + height - 1) {
                        return defaultLight
                    }
                    const data = ctx.getImageData(x, y, 1, 1).data
                    return data[0] === 255 ? 1 : 0
                }

                let value = 0
                value |= (isLight(prev, x - 1, y - 1) << 8)
                value |= (isLight(prev, x, y - 1) << 7)
                value |= (isLight(prev, x + 1, y - 1) << 6)
                value |= (isLight(prev, x - 1, y) << 5)
                value |= (isLight(prev, x, y) << 4)
                value |= (isLight(prev, x + 1, y) << 3)
                value |= (isLight(prev, x - 1, y + 1) << 2)
                value |= (isLight(prev, x, y + 1) << 1)
                value |= (isLight(prev, x + 1, y + 1) << 0)
                ctx.fillStyle = imageEnhancementAlgorithm[value] === "#" ? "white" : "black"
                ctx.fillRect(x, y, 1, 1)
            }
        }

        let count = 0
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                if (ctx.getImageData(x, y, 1, 1).data[0] === 255) {
                    count++
                }
            }
        }
        return count
    }

    let count: number
    const defaultLight2 = imageEnhancementAlgorithm[0] === "#" ? 1 : 0
    for (let i = 1; i <= times; i++) {
        await new Promise(resolve => setTimeout(resolve, 10))
        if (i % 2 === 1) {
            count = next(ctx2, ctx1, 0)
            // console.log(`${i}: ${count}`);
            canvas1.style.display = "none"
            canvas2.style.display = "block"
        } else {
            count = next(ctx1, ctx2, defaultLight2)
            // console.log(`${i}: ${count}`);
            canvas1.style.display = "block"
            canvas2.style.display = "none"
        }
    }
    return count!
}

async function Q1() {
    console.log(`Q1: ${await enhance(2)}`)
}

await Q1()

async function Q2() {
    console.log(`Q2: ${await enhance(50)}`)
}

await Q2()

