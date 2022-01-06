import {loadInput} from "../../utils/loadInput.js"
import {BitStream} from "./BitStream.js"
import assert from "assert";

type Packet = [version: number, value: number | Packet[]]

function readLiteralValue(stream: BitStream) {
    let value: number = 0
    let hasNext: number
    do {
        hasNext = stream.readBits(1)
        value = value * (2 ** 4) + stream.readBits(4)
    } while (hasNext)
    // console.log(`literal value: ${value}`)
    return value
}

function readSubPackets<Packet>(stream: BitStream, readPacket: (stream: BitStream) => Packet): Packet[] {
    const lengthType = stream.readBits(1)
    const packets: Packet[] = []
    if (lengthType === 0) {
        const totalLength = stream.readBits(15)
        // console.log(`total length: ${totalLength}`)
        const endPos = stream.bitPosition + totalLength
        while (stream.bitPosition < endPos) {
            packets.push(readPacket(stream))
        }
    } else {
        const subPacketsNum = stream.readBits(11)
        // console.log(`sub packets num: ${subPacketsNum}`)
        for (let i = 0; i < subPacketsNum; i++) {
            packets.push(readPacket(stream))
        }
    }
    return packets
}

async function Q1() {
    function readPacket(stream: BitStream): Packet {
        const version = stream.readBits(3)
        // console.log(`version: ${version}`)
        const packetType = stream.readBits(3)
        // console.log(`packetType: ${packetType}`)
        if (packetType === 4) {
            // literal value
            return [version, readLiteralValue(stream)]
        } else {
            // operator
            return [version, readSubPackets(stream, readPacket)]
        }
    }

    const input = await loadInput(import.meta.url)
    const buffer = Buffer.from(input.trim(), 'hex')
    // new Uint8Array(buffer).forEach(byte => process.stdout.write(byte.toString(2).padStart(8, '0')))
    // process.stdout.write('\n')
    const stream = new BitStream(new Uint8Array(buffer))
    const packet = readPacket(stream)
    const iter = (packet: Packet, sum: number) => {
        const [version, value] = packet
        sum += version
        if (Array.isArray(value)) {
            for (const subPacket of value) {
                sum = iter(subPacket, sum)
            }
        }
        return sum
    }
    // console.log(JSON.stringify(packet));
    console.log(`Q1: ${iter(packet, 0)}`)
}

Q1()


async function Q2() {
    const sum = (a: number, b: number) => a + b
    const product = (a: number, b: number) => a * b
    const min = (a: number, b: number) => Math.min(a, b)
    const max = (a: number, b: number) => Math.max(a, b)

    function readPacket(stream: BitStream): number {
        const version = stream.readBits(3)
        const packetType = stream.readBits(3)
        switch (packetType) {
            case 4: // literal value
                const value = readLiteralValue(stream)
                assert(value > 0, value.toString())
                return value
            case 0: // sum
                return readSubPackets(stream, readPacket).reduce(sum, 0)
            case 1: // product
                return readSubPackets(stream, readPacket).reduce(product, 1)
            case 2: // min
                return readSubPackets(stream, readPacket).reduce(min, Number.MAX_SAFE_INTEGER)
            case 3: // max
                return readSubPackets(stream, readPacket).reduce(max, Number.MIN_SAFE_INTEGER)
            case 5: // greater than
                const [a, b] = readSubPackets(stream, readPacket)
                return a > b ? 1 : 0
            case 6: // less than
                const [c, d] = readSubPackets(stream, readPacket)
                return c < d ? 1 : 0
            case 7: // equal
                const [e, f] = readSubPackets(stream, readPacket)
                return e === f ? 1 : 0
            default:
                throw new Error("Index out of range")
        }
    }

    const input = await loadInput(import.meta.url)
    const buffer = Buffer.from(input.trim(), 'hex')
    const stream = new BitStream(new Uint8Array(buffer))
    const result = readPacket(stream)
    console.log(`Q2: ${result}`)
}

Q2()
