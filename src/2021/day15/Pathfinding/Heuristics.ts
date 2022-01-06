/**
 * @see See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
 */
interface XY {
    x: number
    y: number
}

export function manhattan(node: XY, goal: XY): number {
    const d1 = Math.abs(goal.x - node.x)
    const d2 = Math.abs(goal.y - node.y)
    return d1 + d2
}

export function diagonal(node: XY, goal: XY): number {
    const D = 1
    const D2 = Math.sqrt(2)
    const d1 = Math.abs(goal.x - node.x)
    const d2 = Math.abs(goal.y - node.y)
    return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2))
}
