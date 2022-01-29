export class GridNode {
    constructor(readonly x: number,
                readonly y: number,
                readonly weight: number) {
    }

    static calcCost(this: void, from: GridNode, to: GridNode): number {
        // Take diagonal weight into consideration.
        if (from.x != to.x && from.y != to.y) {
            return to.weight * 1.41421
        } else {
            return to.weight
        }
    }

    toString() {
        return "[" + this.x + " " + this.y + "]"
    }
}
