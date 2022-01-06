import assert from "assert"
import { loadInput } from "../../utils/loadInput.js"

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    let result = 0
    for (const line of lines) {
        const [left, right] = line.split("|")
        const rightArray = right.trim().split(" ")
        for (let item of rightArray) {
            switch (item.length) {
                case 2:
                case 3:
                case 4:
                case 7:
                    result++
                    break
            }
        }
    }

    console.log(`Q1: ${result}`)
}

Q1()

function toBits(data: string) {
    let value = 0
    for (let char of data) {
        value |= 1 << char.charCodeAt(0) - 97
    }
    return value
}

const m1 = 0x55555555; //binary: 0101...
const m2 = 0x33333333; //binary: 00110011..
const m4 = 0x0f0f0f0f; //binary:  4 zeros,  4 ones ...
const m8 = 0x00ff00ff; //binary:  8 zeros,  8 ones ...
const m16 = 0x0000ffff; //binary: 16 zeros, 16 ones ...

// @see https://zh.wikipedia.org/wiki/%E6%B1%89%E6%98%8E%E9%87%8D%E9%87%8F
//This is a naive implementation, shown for comparison,
//and to help in understanding the better functions.
//It uses 24 arithmetic operations (shift, add, and).
function popcount_1(x: number) {
    x = (x & m1) + ((x >> 1) & m1); //put count of each  2 bits into those  2 bits
    x = (x & m2) + ((x >> 2) & m2); //put count of each  4 bits into those  4 bits
    x = (x & m4) + ((x >> 4) & m4); //put count of each  8 bits into those  8 bits
    x = (x & m8) + ((x >> 8) & m8); //put count of each 16 bits into those 16 bits
    x = (x & m16) + ((x >> 16) & m16); //put count of each 32 bits into those 32 bits
    return x;
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")

    let result = 0

    for (const line of lines) {
        const [left, right] = line.split("|")
        const leftArray = left.trim().split(" ").map(toBits)
        const rightArray = right.trim().split(" ").map(toBits)

        const bitsToValue: { [b: number]: number } = {}
        const valueToBits: { [n: number]: number } = {}
        const valueIs = (bits: number, value: number) => {
            assert(bitsToValue[bits] === undefined)
            assert(valueToBits[value] === undefined)
            bitsToValue[bits] = value
            valueToBits[value] = bits
        }
        for (const leftValue of leftArray) {
            switch (popcount_1(leftValue)) {
                case 2:
                    valueIs(leftValue, 1)
                    break
                case 3:
                    valueIs(leftValue, 7)
                    break
                case 4:
                    valueIs(leftValue, 4)
                    break
                case 7:
                    valueIs(leftValue, 8)
                    break
                case 5:
                    // 2 3 5
                    break
                case 6:
                    // 6 9 0
                    break
            }
        }
        for (const leftValue of leftArray) {
            switch (popcount_1(leftValue)) {
                case 6:
                    if ((valueToBits[4] & leftValue) === valueToBits[4]) {
                        valueIs(leftValue, 9)
                    } else if ((valueToBits[1] & leftValue) !== valueToBits[1]) {
                        valueIs(leftValue, 6)
                    } else {
                        valueIs(leftValue, 0)
                    }
                    break
            }
        }
        for (const leftValue of leftArray) {
            switch (popcount_1(leftValue)) {
                case 5:
                    if ((valueToBits[1] & leftValue) === valueToBits[1]) {
                        valueIs(leftValue, 3)
                    } else if ((valueToBits[6] & leftValue) === leftValue) {
                        valueIs(leftValue, 5)
                    } else {
                        valueIs(leftValue, 2)
                    }
                    break
            }
        }
        const numbers: number[] = []
        for (const rightValue of rightArray) {
            numbers.push(bitsToValue[rightValue])
        }
        result += parseInt(numbers.join(""))
    }

    console.log(`Q2: ${result}`)
}

Q2()
