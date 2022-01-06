import { loadInput } from "../../utils/loadInput.js"

class Graph {
    readonly nodes: Record<string, Node> = {}

    addNode(id: string) {
        if (!this.nodes[id]) {
            this.nodes[id] = new Node(id)
        }
    }

    addEdge(sideA: string, sideB: string) {
        this.addNode(sideA)
        this.addNode(sideB)
        this.nodes[sideA].addEdge(this.nodes[sideB])
        this.nodes[sideB].addEdge(this.nodes[sideA])
    }
}

class Node {
    readonly isBigCave: boolean

    readonly edges: Node[] = []

    constructor(readonly id: string) {
        this.isBigCave = id.toUpperCase() === id
    }

    addEdge(node: Node) {
        this.edges.push(node)
    }
}

function isLoop(visited: Node[], toIndex: number): boolean {
    for (let i = visited.length - 1; i > toIndex; i--) {
        if (!visited[i].isBigCave) {
            return false
        }
    }
    return true
}

async function loadGraph() {
    const input = await loadInput(import.meta.url)
    const lines = input.trim().split("\n")
    const graph = new Graph()
    for (const line of lines) {
        const [sideA, sideB] = line.split("-")
        graph.addEdge(sideA, sideB)
    }
    return graph
}

async function Q1() {
    const graph = await loadGraph()
    const start = graph.nodes["start"]
    const end = graph.nodes["end"]

    let result = 0
    function dfs(node: Node, visited: Node[]) {
        visited.push(node)
        if (node === end) {
            // console.log(visited.map(v => v.id).join(","))
            result++
            return
        }
        for (const edge of node.edges) {
            if (edge === start) {
                continue
            }
            const index = visited.lastIndexOf(edge)
            if (index === -1 || (edge.isBigCave && !isLoop(visited, index))) {
                dfs(edge, visited.slice())
            }
        }
    }
    dfs(start, [])

    console.log(`Q1: ${result}`)
}

Q1()


async function Q2() {
    const graph = await loadGraph()
    const start = graph.nodes["start"]
    const end = graph.nodes["end"]

    let result = 0
    function dfs(node: Node, visited: Node[], twice: boolean) {
        visited = [...visited, node]
        if (node === end) {
            // console.log((visited.slice(1) as Node[]).map(v => v.id).join(","))
            result++
            return
        }
        for (const edge of node.edges) {
            if (edge === start) {
                continue
            }
            if (edge.isBigCave || visited.lastIndexOf(edge) === -1) {
                dfs(edge, visited, twice)
            } else if (!twice) {
                dfs(edge, visited, true)
            }
        }
    }
    dfs(start, [], false)

    console.log(`Q2: ${result}`)
}

Q2()
