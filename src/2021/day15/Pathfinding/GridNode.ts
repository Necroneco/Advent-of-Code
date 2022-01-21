import type {IGridNode} from "./AStar.js"

export class GridNode implements IGridNode {
    f = 0
    g = 0
    h = 0
    visited = false
    closed = false
    parent?: GridNode

    constructor(readonly x: number,
                readonly y: number,
                readonly weight: number) {
    }

    toString() {
        return "[" + this.x + " " + this.y + "]"
    }
}
