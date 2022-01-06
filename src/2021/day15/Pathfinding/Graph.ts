import {GridNode} from "./GridNode.js"
import {diagonal, manhattan} from "./Heuristics.js"

export class Graph {
    readonly heuristic: (this: void, node: GridNode, goal: GridNode) => number

    // private readonly nodes: GridNode[]
    readonly diagonal: boolean
    private readonly grid: GridNode[][]
    readonly width: number
    readonly height: number

    private dirtyNodes: GridNode[]

    /**
     * A graph memory structure
     * @param {Array} gridIn 2D array of input weights
     * @param {Object} [options]
     * @param {boolean} [options.diagonal] Specifies whether diagonal moves are allowed
     */
    constructor(gridIn: number[][], options: { diagonal?: boolean } = {}) {
        // this.nodes = []
        this.diagonal = !!options.diagonal
        this.width = gridIn[0].length
        this.height = gridIn.length
        this.heuristic = this.diagonal ? diagonal : manhattan
        this.grid = []
        for (let y = 0; y < gridIn.length; y++) {
            this.grid[y] = []
            const row = gridIn[y]
            for (let x = 0; x < row.length; x++) {
                this.grid[y][x] = new GridNode(x, y, row[x])
                // this.nodes.push(node)
            }
        }
        this.dirtyNodes = []
    }

    /**
     * @param x {int}
     * @param y {int}
     */
    getGrid(x: number, y: number): GridNode | undefined {
        return this.grid[y]?.[x]
    }

    cleanDirty(): void {
        for (let i = 0; i < this.dirtyNodes.length; i++) {
            this.dirtyNodes[i].clear()
        }
        this.dirtyNodes = []
    }

    markDirty(node: GridNode): void {
        this.dirtyNodes.push(node)
    }

    * neighbors(node: GridNode): Generator<GridNode, void> {
        const x = node.x
        const y = node.y

        let tile: GridNode | undefined

        // West
        tile = this.getGrid(x - 1, y)
        if (tile) yield tile

        // East
        tile = this.getGrid(x + 1, y)
        if (tile) yield tile

        // South
        tile = this.getGrid(x, y - 1)
        if (tile) yield tile

        // North
        tile = this.getGrid(x, y + 1)
        if (tile) yield tile

        if (this.diagonal) {
            // Southwest
            tile = this.getGrid(x - 1, y - 1)
            if (tile) yield tile

            // Southeast
            tile = this.getGrid(x + 1, y - 1)
            if (tile) yield tile

            // Northwest
            tile = this.getGrid(x - 1, y + 1)
            if (tile) yield tile

            // Northeast
            tile = this.getGrid(x + 1, y + 1)
            if (tile) yield tile
        }
    }

    // reset(): void {
    //     this.dirtyNodes = []
    //     for (let i = 0; i < this.nodes.length; i++) {
    //         this.nodes[i].clear()
    //     }
    // }

    toString() {
        const graphString = []
        const nodes = this.grid
        for (let y = 0; y < nodes.length; y++) {
            const rowDebug = []
            const row = nodes[y]
            for (let x = 0; x < row.length; x++) {
                rowDebug.push(row[x]["weight"])
            }
            graphString.push(rowDebug.join(" "))
        }
        return graphString.join("\n")
    }
}
