import countBy from "lodash-es/countBy.js"
import {loadInput} from "../../utils/loadInput.js"

type Bit = 0 | 1

function mostCommon(data: string[][], position: number): Bit {
    const counts = countBy(data, v => v[position])
    return counts[1] >= counts[0] ? 1 : 0
}

function leastCommon(data: string[][], position: number): Bit {
    const counts = countBy(data, v => v[position])
    return counts[0] <= counts[1] ? 0 : 1
}

async function Q1() {
    const input = await loadInput(import.meta.url)
    const lines = input.split("\n").map(v => v.split(""))

    const gammas: Bit[] = []
    const epsilons: Bit[] = []
    const width = lines[0].length
    for (let i = 0; i < width; i++) {
        gammas[i] = mostCommon(lines, i)
        epsilons[i] = 1 - gammas[i] as Bit
    }

    const gammaRate = parseInt(gammas.join(""), 2)
    const epsilonRate = parseInt(epsilons.join(""), 2)
    console.log(`\
gamma rate   : ${gammaRate.toString(2).padStart(width, "0")}
epsilon rate : ${epsilonRate.toString(2).padStart(width, "0")}`)
    console.log(`Q1: ${gammaRate * epsilonRate}`)
}

Q1()

function findLifeSupportRatings(data: string[][], algorithm: (lines: string[][], position: number) => Bit): number {
    let lines = data.slice()
    const width = lines[0].length
    for (let i = 0; i < width; i++) {
        const bit = algorithm(lines, i).toString()
        lines = lines.filter(line => line[i] === bit)
        if (lines.length <= 1) {
            return parseInt(lines[0].join(""), 2)
        }
    }
    return -1
}

async function Q2() {
    const input = await loadInput(import.meta.url)
    const lines = input.split("\n").map(v => v.split(""))

    const oxygenGeneratorRating = findLifeSupportRatings(lines, mostCommon)
    const CO2ScrubberRating = findLifeSupportRatings(lines, leastCommon)

    console.log(`oxygen generator rating: ${oxygenGeneratorRating.toString(2).padStart(lines[0].length, "0")}`)
    console.log(`CO2 scrubber rating: ${CO2ScrubberRating.toString(2).padStart(lines[0].length, "0")}`)
    console.log(`Q2: ${oxygenGeneratorRating * CO2ScrubberRating}`)
}

Q2()
