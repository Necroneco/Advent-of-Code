import {IGraph, searchPath} from "../../../utils/AStar.js";
import {GridNode} from "./GridNode.js"
import {diagonal, manhattan} from "./Heuristics.js"

export class Graph implements IGraph<GridNode> {
    private readonly diagonal: boolean
    private readonly grid: GridNode[][]
    readonly width: number
    readonly height: number

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
        this.grid = []
        for (let y = 0; y < gridIn.length; y++) {
            this.grid[y] = []
            const row = gridIn[y]
            for (let x = 0; x < row.length; x++) {
                this.grid[y][x] = new GridNode(x, y, row[x])
                // this.nodes.push(node)
            }
        }

        this.heuristic = this.diagonal ? diagonal : manhattan
    }

    searchPath(start: GridNode, end: GridNode): GridNode[] {
        return searchPath<GridNode>({
            calcCost: GridNode.calcCost,
            neighbors: node => this.neighbors(node),
            heuristic: this.diagonal ? diagonal : manhattan,
        }, start, end)
    }

    heuristic: (node: GridNode, goal: GridNode) => number

    calcCost(from: GridNode, to: GridNode): number {
        // Take diagonal weight into consideration.
        if (from.x != to.x && from.y != to.y) {
            return to.weight * 1.41421
        } else {
            return to.weight
        }
    }

    /**
     * @param x {int}
     * @param y {int}
     */
    getGrid(x: number, y: number): GridNode | undefined {
        return this.grid[y]?.[x]
    }

    * neighbors(node: GridNode): Generator<GridNode, void> {
        const x = node.x
        const y = node.y

        let tile: GridNode | undefined

        // West
        tile = this.getGrid(x - 1, y)
        if (tile && tile.weight > 0) yield tile

        // East
        tile = this.getGrid(x + 1, y)
        if (tile && tile.weight > 0) yield tile

        // South
        tile = this.getGrid(x, y - 1)
        if (tile && tile.weight > 0) yield tile

        // North
        tile = this.getGrid(x, y + 1)
        if (tile && tile.weight > 0) yield tile

        if (this.diagonal) {
            // Southwest
            tile = this.getGrid(x - 1, y - 1)
            if (tile && tile.weight > 0) yield tile

            // Southeast
            tile = this.getGrid(x + 1, y - 1)
            if (tile && tile.weight > 0) yield tile

            // Northwest
            tile = this.getGrid(x - 1, y + 1)
            if (tile && tile.weight > 0) yield tile

            // Northeast
            tile = this.getGrid(x + 1, y + 1)
            if (tile && tile.weight > 0) yield tile
        }
    }

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
