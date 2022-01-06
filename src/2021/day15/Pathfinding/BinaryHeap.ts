export class BinaryHeap<T> {
    readonly content: T[]

    constructor(private readonly scoreFunction: (item: T) => number) {
        this.content = []
        this.scoreFunction = scoreFunction
    }

    push(element: T): void {
        // Add the new element to the end of the array.
        this.content.push(element)
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1)
    }

    pop(): T | undefined {
        // Store the first element so we can return it later.
        const result = this.content[0]
        // Get the element at the end of the array.
        const end = this.content.pop()
        // If there are any elements left, put the end element at the start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end!
            this.sinkDown(0)
        }
        return result
    }

    remove(node: T): void {
        const length = this.content.length
        // To remove a value, we must search through the array to find it.
        for (let i = 0; i < length; i++) {
            if (this.content[i] != node) continue
            // When it is found, the process seen in 'pop' is repeated to fill up the hole.
            const end = this.content.pop()!
            // If the element we popped was the one we needed to remove, we're done.
            if (i == length - 1) break
            // Otherwise, we replace the removed element with the popped one, and allow it to float up or sink down as appropriate.
            this.content[i] = end
            if (this.scoreFunction(end) > this.scoreFunction(node)) {
                this.sinkDown(i)
            } else {
                this.bubbleUp(i)
            }
            break
        }
    }

    size(): number {
        return this.content.length
    }

    bubbleUp(n: number): void {
        // Fetch the element that has to be moved.
        const element = this.content[n]
        const score = this.scoreFunction(element)
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.ceil(n / 2) - 1
            const parent = this.content[parentN]
            // If the parent has a lesser score, things are in order and we are done.
            if (score >= this.scoreFunction(parent))
                break

            // Otherwise, swap the parent with the current element and continue.
            this.content[parentN] = element
            this.content[n] = parent
            n = parentN
        }
    }

    sinkDown(n: number): void {
        // Look up the target element and its score.
        const length = this.content.length
        const element = this.content[n]
        const elemScore = this.scoreFunction(element)

        while (true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) * 2
            const child1N = child2N - 1
            // This is used to store the new position of the element, if any.
            let swap: number | null = null
            let child1Score: number | undefined
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                child1Score = this.scoreFunction(this.content[child1N])
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N
                }
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2Score = this.scoreFunction(this.content[child2N])
                if (child2Score < (swap == null ? elemScore : child1Score!)) {
                    swap = child2N
                }
            }

            // No need to swap further, we are done.
            if (swap == null) break

            // Otherwise, swap and continue.
            this.content[n] = this.content[swap]
            this.content[swap] = element
            n = swap
        }
    }
}
