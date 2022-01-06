import {loadInput} from "../../utils/loadInput.js"

const input = (await loadInput(import.meta.url)).trim()

let floor = 0
for (let i = 0, len = input.length; i < len; i++) {
    if (input[i] === "(") {
        floor += 1
    } else {
        floor -= 1
    }
    if (floor === -1) {
        console.log(i + 1);
        break
    }
}
