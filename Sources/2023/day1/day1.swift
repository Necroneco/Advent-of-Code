import Foundation

@main
struct Day1 {
  static func main() throws {
    let input = try String(contentsOfFile: "Resources/2023/day1/input.txt", encoding: .utf8)
    let lines = input.split(separator: "\n")
    print(lines)
  }
}
