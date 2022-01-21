import {BinaryHeap} from "./BinaryHeap.js"

export interface AStarSearchOptions<N extends IGridNode> {
    closest?: boolean
    heuristic?: (this: void, node: N, goal: N) => number
    calcCost?: (from: N, to: N) => number
}

export interface IGridNode {
    f: number
    g: number
    h: number
    visited: boolean
    closed: boolean
    parent?: IGridNode
}

function resetGridNode(node: IGridNode) {
    node.f = 0
    node.g = 0
    node.h = 0
    node.visited = false
    node.closed = false
    node.parent = undefined
}

export interface IGraph<N extends IGridNode> {
    readonly heuristic: (this: void, node: N, goal: N) => number
    readonly calcCost: (this: void, from: N, to: N) => number
    neighbors(node: N): Iterable<N>
}

/**
 * Perform an A* Search on a graph given a start and end node.
 * @param {IGraph} graph
 * @param {IGridNode} start
 * @param {IGridNode} end
 * @param {Object} [options]
 * @param {boolean} [options.closest] Specifies whether to return the path to the closest node if the target is unreachable.
 */
export function searchPath<G extends IGraph<N>, N extends IGridNode>(graph: G, start: N, end: N, options?: AStarSearchOptions<N>): N[] {
    const dirtyNodes: N[] = []
    const result = _searchPath(graph, start, end, options, dirtyNodes)
    dirtyNodes.forEach(resetGridNode)
    return result
}

function _searchPath<G extends IGraph<N>, N extends IGridNode>(graph: G, start: N, end: N, {closest = false, heuristic = graph.heuristic, calcCost = graph.calcCost}: AStarSearchOptions<N> = {}, dirtyNodes: N[]): N[] {
    const openHeap = new BinaryHeap<N>(node => node.f)
    let closestNode = start // set the start node to be the closest if required

    start.h = heuristic(start, end)
    dirtyNodes.push(start)

    openHeap.push(start)

    while (openHeap.size() > 0) {

        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        const currentNode = openHeap.pop()!

        // End case -- result has been found, return the traced path.
        if (currentNode === end) {
            return pathTo(currentNode)
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors.
        currentNode.closed = true

        // Find all neighbors for the current node.
        for (let neighbor of graph.neighbors(currentNode)) {
            if (neighbor.closed) {
                // Not a valid node to process, skip to next neighbor.
                continue
            }

            // The g score is the shortest distance from start to current node.
            // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
            const gScore = currentNode.g + calcCost(neighbor, currentNode)
            const beenVisited = neighbor.visited

            if (!beenVisited || gScore < neighbor.g) {

                // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                neighbor.visited = true
                neighbor.parent = currentNode
                neighbor.h = neighbor.h || heuristic(neighbor, end)
                neighbor.g = gScore
                neighbor.f = neighbor.g + neighbor.h
                dirtyNodes.push(neighbor)
                if (closest) {
                    // If the neighbour is closer than the current closestNode
                    // or if it's equally close but has a cheaper path than the current closest node
                    // then it becomes the closest node
                    if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                        closestNode = neighbor
                    }
                }

                if (!beenVisited) {
                    // Pushing to heap will put it in proper place based on the 'f' value.
                    openHeap.push(neighbor)
                } else {
                    // Already seen the node, but since it has been rescored we need to reorder it in the heap
                    openHeap.bubbleUp(openHeap.content.indexOf(neighbor))
                }
            }
        }
    }

    if (closest) {
        return pathTo(closestNode)
    }

    // No result was found - empty array signifies failure to find path.
    return []
}

function pathTo<N extends IGridNode>(node: N): N[] {
    let curr = node
    const path: N[] = []
    while (curr.parent) {
        path.unshift(curr)
        curr = curr.parent as N
    }
    return path
}
