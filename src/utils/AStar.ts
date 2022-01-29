import {BinaryHeap} from "./BinaryHeap.js"

export interface IGraph<N extends object> {
    heuristic: (node: N, goal: N) => number
    calcCost: (from: N, to: N) => number
    neighbors: (node: N) => Iterable<N>
}

export interface AStarSearchOptions {
    closest?: boolean
}

interface INode<T = object> {
    value: T
    f: number
    g: number
    h: number
    visited: boolean
    closed: boolean
    parent?: INode<T>
}

function createNodesMap<N extends object>(): (n: N) => INode<N> {
    const nodeMap = new WeakMap<N, INode<N>>()
    return (n: N) => {
        let node = nodeMap.get(n)
        if (!node) {
            node = {
                visited: false,
                f: 0, g: 0, h: 0,
                closed: false,
                value: n,
            }
            nodeMap.set(n, node)
        }
        return node
    }
}

/**
 * Perform an A* Search on a graph given a start and end node.
 * @param graph
 * @param {object} start
 * @param {object} end
 * @param {Object} [options]
 * @param {boolean} [options.closest] Specifies whether to return the path to the closest node if the target is unreachable.
 */
export function searchPath<T extends object>(graph: IGraph<T>, start: T, end: T, {closest}: AStarSearchOptions = {}): T[] {
    const getNode = createNodesMap<T>()
    const startNode = getNode(start)

    const openHeap = new BinaryHeap<INode<T>>(node => node.f)

    let closestNode = startNode // set the start node to be the closest if required
    startNode.h = graph.heuristic(start, end)
    // dirtyNodes.push(start)

    openHeap.push(startNode)

    while (openHeap.size() > 0) {

        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        const currentNode = openHeap.pop()!

        // End case -- result has been found, return the traced path.
        if (currentNode.value === end) {
            return pathTo(currentNode)
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors.
        currentNode.closed = true

        // Find all neighbors for the current node.
        for (const n of graph.neighbors(currentNode.value)) {
            const neighbor = getNode(n)
            if (neighbor.closed) {
                // Not a valid node to process, skip to next neighbor.
                continue
            }

            // The g score is the shortest distance from start to current node.
            // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
            const gScore = currentNode.g + graph.calcCost(neighbor.value, currentNode.value)
            const beenVisited = neighbor.visited

            if (!beenVisited || gScore < neighbor.g) {

                // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                neighbor.visited = true
                neighbor.parent = currentNode
                neighbor.h = neighbor.h || graph.heuristic(neighbor.value, end)
                neighbor.g = gScore
                neighbor.f = neighbor.g + neighbor.h
                // dirtyNodes.push(neighbor)
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
                    openHeap._bubbleUp(openHeap.content.indexOf(neighbor))
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

function pathTo<N extends object>(node: INode<N>): N[] {
    let curr = node
    const path: N[] = []
    while (curr.parent) {
        path.unshift(curr.value)
        curr = curr.parent
    }
    return path
}
