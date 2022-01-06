export class GridNode {
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

    getCost(fromNeighbor: GridNode): number {
        // Take diagonal weight into consideration.
        if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            return this.weight * 1.41421
        }
        return this.weight
    }

    isWall(): boolean {
        return this.weight === 0
    }

    clear(): void {
        this.f = 0
        this.g = 0
        this.h = 0
        this.visited = false
        this.closed = false
        this.parent = undefined
    }

    toString() {
        return "[" + this.x + " " + this.y + "]"
    }
}
