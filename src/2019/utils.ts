/** [0, length) */
export function makeArray<U = number>(length: number, mapFn?: (value: number) => U): U[]
/** [start, end] */
export function makeArray<U = number>(start: number, end: number, mapFn?: (value: number) => U): U[]
export function makeArray<U>(arg1: number, arg2?: number | ((v: number) => U), mapFn?: (value: number) => U) {
    const a = []
    if (typeof arg2 === "number") {
        if (typeof mapFn === "function") { // start,end,map
            for (let i = arg1; i <= arg2; ++i) {
                a.push(mapFn(i))
            }
        } else { // start,end
            for (let i = arg1; i <= arg2; ++i) {
                a.push(i)
            }
        }
    } else {
        if (typeof arg2 === "function") { // length,map
            for (let i = 0; i < arg1; ++i) {
                a.push(arg2(i))
            }
        } else { // length
            for (let i = 0; i < arg1; ++i) {
                a.push(i)
            }
        }
    }
    return a
}
