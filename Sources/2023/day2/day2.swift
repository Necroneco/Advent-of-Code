import Foundation

@main
struct Day2 {
  static func main() throws {
    let input = try String(contentsOfFile: "Resources/2023/day2/input.txt", encoding: .utf8)
    let lines = input.split(separator: "\n")
    var sum = 0
    for line in lines {
      sum += q2(line)
    }
    print(sum)
  }

  static func q1(_ s: String.SubSequence) -> Int {
    let red = 12
    let green = 13
    let blue = 14
    let a = s.split(separator: ":")
    let id = a[0].split(separator: " ")[1]
    for s1 in a[1].split(separator: ";") {
      for s3 in s1.split(separator: ",") {
        let s4 = s3.trimmingCharacters(in: .whitespaces).split(separator: " ")
        let count = Int(s4[0])!
        let color = s4[1]
        switch color {
          case "red":
            if count > red {
              return 0
            }
          case "green":
            if count > green {
              return 0
            }
          case "blue":
            if count > blue {
              return 0
            }
          default:
            print("unknown color", color)
            break
        }
      }
    }
    return Int(id)!
  }

  static func q2(_ s: String.SubSequence) -> Int {
    var red = 0
    var green = 0
    var blue = 0
    for s1 in s.split(separator: ":")[1].split(separator: ";") {
      for s3 in s1.split(separator: ",") {
        let s4 = s3.trimmingCharacters(in: .whitespaces).split(separator: " ")
        let count = Int(s4[0])!
        let color = s4[1]
        switch color {
          case "red":
            red = max(red, count)
            break
          case "green":
            green = max(green, count)
            break
          case "blue":
            blue = max(blue, count)
            break
          default:
            print("unknown color", color)
            break
        }
      }
    }
    return red * green * blue
  }
}
