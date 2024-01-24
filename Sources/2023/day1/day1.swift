import Foundation

struct Day1 {
  static let strs = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
  static let nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

  static func main() throws {
    let input = try String(contentsOfFile: "Resources/2023/day1/input.txt", encoding: .utf8)
    let lines = input.split(separator: "\n")
    var sum = 0
    for line in lines {
      sum += parseStart(line) * 10 + parseEnd(line)
    }
    print(sum)
  }

  static func parseStart(_ s: String.SubSequence) -> Int {
    var s = s
    while true {
      for n in nums {
        if s.hasPrefix(n) {
          return nums.firstIndex(of: n)!
        }
      }
      for n in strs {
        if s.hasPrefix(n) {
          return strs.firstIndex(of: n)!
        }
      }
      s = s.dropFirst()
      if s.isEmpty {
        return 0
      }
    }
  }

  static func parseEnd(_ s: String.SubSequence) -> Int {
    var s = s
    while true {
      for n in nums {
        if s.hasSuffix(n) {
          return nums.firstIndex(of: n)!
        }
      }
      for n in strs {
        if s.hasSuffix(n) {
          return strs.firstIndex(of: n)!
        }
      }
      s = s.dropLast()
      if s.isEmpty {
        return 0
      }
    }
  }
}
