import {loadInput} from "../../utils/loadInput.js"

async function Q1() {
    const {seq, maps} = await CreateInput()
    for (let n of seq) {
        for (let map of maps) {
            map.mark(n)
            if (map.isWin()) {
                console.log(`Q1: ${map.getAnswer() * n}`)
                return
            }
        }
    }
}

Q1()

async function Q2() {
    let {seq, maps} = await CreateInput()
    let result
    for (let n of seq) {
        for (let map of maps) {
            map.mark(n)
            if (map.isWin()) {
                result = map.getAnswer() * n
                if (maps.length === 1) {
                    console.log(`Q2: ${result}`)
                    return
                }
            }
        }
        maps = maps.filter(m => !m.isWin())
    }
    console.log(`Q2: Error ${result}`)
}

Q2()


async function CreateInput(): Promise<{ seq: number[], maps: PuzzleMap[] }> {
    const input = await loadInput(import.meta.url)
    const [seq, ...lines] = input.split("\n")

    const maps: PuzzleMap[] = []
    for (let i = 0; i + 5 < lines.length; i += 6) {
        maps.push(new PuzzleMap(lines.slice(i + 1, i + 6).map(v => v.trim().split(/\s+/).map(Number))))
    }

    return {seq: seq.split(",").map(Number), maps}
}

class PuzzleMap {
    readonly mask: boolean[][]

    constructor(readonly map: readonly number[][]) {
        this.mask = map.map(c => c.map(r => false))
    }

    mark(n: number): void {
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                if (this.map[i][j] === n) {
                    this.mask[i][j] = true
                }
            }
        }
    }

    isWin(): boolean {
        // 行
        for (let i = 0; i < this.mask.length; i++) {
            if (this.mask[i].every(v => v)) {
                return true
            }
        }
        // 列
        for (let i = 0; i < this.mask[0].length; i++) {
            if (this.mask.every(v => v[i])) {
                return true
            }
        }
        return false
    }

    getAnswer() {
        let ans = 0
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                if (!this.mask[i][j]) {
                    ans += this.map[i][j]
                }
            }
        }
        return ans
    }
}
