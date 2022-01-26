/**
 * [a, b]
 */
export function* rangeInclude(a: number, b: number) {
    if (a < b) {
        for (let i = a; i <= b; i++) {
            yield i
        }
    } else {
        for (let i = a; i >= b; i--) {
            yield i
        }
    }
}