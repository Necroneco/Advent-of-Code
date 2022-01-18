import {loadInput} from "../../utils/loadInput.js"

async function loadData() {
    const input = await loadInput(import.meta.url);
    const [_, _p1, _p2] = /Player 1 starting position: (\d+)\nPlayer 2 starting position: (\d+)/.exec(input)!
    return [parseInt(_p1), parseInt(_p2)]
}

function turn(dice: Iterator<number, never>, p: number) {
    const value = dice.next().value + dice.next().value + dice.next().value
    return (p + value - 1) % 10 + 1
}

async function Q1() {
    let [p1, p2] = await loadData()

    const deterministicDiced = (function* () {
        let i = 0
        while (true) {
            yield (++i) % 100
        }
    })()

    let s1 = 0
    let s2 = 0
    let rolled = 0
    while (true) {
        p1 = turn(deterministicDiced, p1)
        s1 += p1
        rolled += 3
        if (s1 >= 1000) {
            console.log(`Q1: ${s2 * rolled}`)
            break
        }

        p2 = turn(deterministicDiced, p1)
        s2 += p2
        rolled += 3
        if (s2 >= 1000) {
            console.log(`Q1: ${s1 * rolled}`)
            break
        }
    }
}

await Q1()

interface Node {
    p1: number
    p2: number
    s1: number
    s2: number
    wins: number
}

async function Q2() {
    const [p1, p2] = await loadData()

    const scoreAdd: { [n: number]: number } = {}
    for (let d1 = 1; d1 <= 3; d1++) {
        for (let d2 = 1; d2 <= 3; d2++) {
            for (let d3 = 1; d3 <= 3; d3++) {
                const d = d1 + d2 + d3
                scoreAdd[d] = (scoreAdd[d] ??= 0) + 1
            }
        }
    }
    // console.log(scoreAdd);

    // const print = () => {
    //     if (Date.now() - lastPrintTime > 100) {
    //         process.stdout.clearLine(0)
    //         process.stdout.cursorTo(0)
    //         process.stdout.write(`${player1Wins}:${player2Wins}`)
    //         lastPrintTime = Date.now()
    //     }
    // }

    // const start = Date.now()
    // let lastPrintTime = Date.now()

    let player1Wins = 0
    let player2Wins = 0
    const dfs = (node: Node, nextIsP1: boolean) => {
        for (let d = 3; d <= 9; d++) {
            if (nextIsP1) {
                const value = (node.p1 + d - 1) % 10 + 1
                const s1 = node.s1 + value
                if (s1 >= 21) {
                    player1Wins += node.wins * scoreAdd[d]
                    // print()
                    continue
                }
                dfs({p1: value, p2: node.p2, s1, s2: node.s2, wins: node.wins * scoreAdd[d]}, false)
            } else {
                const value = (node.p2 + d - 1) % 10 + 1
                const s2 = node.s2 + value
                if (s2 >= 21) {
                    player2Wins += node.wins * scoreAdd[d]
                    // print()
                    continue
                }
                dfs({p1: node.p1, p2: value, s1: node.s1, s2, wins: node.wins * scoreAdd[d]}, true)
            }
        }
    }
    dfs({p1: p1, p2: p2, s1: 0, s2: 0, wins: 1}, true)
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    console.log(`Q2: ${player1Wins > player2Wins ? player1Wins : player2Wins}`)
    // console.log(`cost: ${Date.now() - start}ms`)
}

await Q2()
