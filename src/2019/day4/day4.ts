import {loadInput} from "../../utils/loadInput.js"
import {rangeInclude} from "../../utils/rangeInclude.js";

function hasDouble(n: number) {
    let last = n % 10
    for (let i = 1; i < 6; i++) {
        const current = Math.floor(n / (10 ** i)) % 10
        if (current === last) {
            return true
        }
        last = current
    }
    return false
}

function neverDecrease(n: number) {
    let last = Math.floor(n / 10 ** 5) % 10
    for (let i = 4; i >= 0; i--) {
        const current = Math.floor(n / (10 ** i)) % 10
        if (current < last) {
            return false
        }
        last = current
    }
    return true
}

async function Q1() {
    const [min, max] = (await loadInput(import.meta.url)).trimEnd().split("-").map(Number)
    let count = 0
    for (const n of rangeInclude(min, max)) {
        if (hasDouble(n) && neverDecrease(n)) {
            count++
        }
    }
    console.log(`Q1: ${count}`);
}

await Q1()

class SM {
    state: number | null = null

    continueCnt: number

    last: number

    constructor(first: number) {
        this.last = first
        this.continueCnt = 1
    }

    // 基于 neverDecrease
    input(n: number) {
        if (n === this.last) {
            this.continueCnt += 1
            if (this.state === null) {
                if (this.continueCnt === 2) {
                    this.state = n
                }
            } else if (this.state === this.last) {
                if (this.continueCnt > 2) {
                    this.state = null
                }
            }
        } else {
            this.continueCnt = 1
        }
        this.last = n
    }
}

function r2(n: number) {
    // return (String(n).match(/(\d)\1+/g) || []).some(l => l.length === 2)
    // return /((?<!0)00(?!0))|((?<!1)11(?!1))|((?<!2)22(?!2))|((?<!3)33(?!3))|((?<!4)44(?!4))|((?<!5)55(?!5))|((?<!6)66(?!6))|((?<!7)77(?!7))|((?<!8)88(?!8))|((?<!9)99(?!9))/.test(n.toString())
    const sm = new SM(Math.floor(n / 10 ** 5) % 10)
    for (let i = 4; i >= 0; i--) {
        sm.input(Math.floor(n / (10 ** i)) % 10)
    }
    return sm.state !== null
}

async function Q2() {
    const [min, max] = (await loadInput(import.meta.url)).trimEnd().split("-").map(Number)
    let count = 0
    for (const n of rangeInclude(min, max)) {
        if (hasDouble(n) && neverDecrease(n) && r2(n)) {
            count++
        }
    }
    console.log(`Q2: ${count}`);
}

await Q2()
