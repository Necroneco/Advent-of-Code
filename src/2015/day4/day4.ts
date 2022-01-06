import {createHash} from "crypto"
import {loadInput} from "../../utils/loadInput.js"

function mine(input: string, prefix: string): number {
    let salt = 0
    while (true) {
        const hash = createHash("md5").update(`${input}${salt}`).digest("hex")
        if (hash.startsWith(prefix)) {
            return salt
        }
        salt++
    }
}

async function Q1() {
    const input = (await loadInput(import.meta.url)).trim()
    console.log(`Q1: ${mine(input, "00000")}`);
}

Q1()

async function Q2() {
    const input = (await loadInput(import.meta.url)).trim()
    console.log(`Q2: ${mine(input, "000000")}`);
}

Q2()
