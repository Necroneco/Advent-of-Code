export async function loadInput(importMetaUrl: string): Promise<string> {
    let input: string
    if (typeof fetch === "function") {
        input = await (await fetch("./input.txt")).text()
    } else {
        const path = await import("path")
        const __dirname = path.dirname((await import("url")).fileURLToPath(importMetaUrl))
        input = await (await import("fs")).promises.readFile(path.join(__dirname, "input.txt"), "utf8");
    }
    return input
}
