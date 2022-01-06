export class BitStream {
    private position = 0

    get bitPosition() {
        return this.position * 8 - this.bitsPending
    }

    private bitsPending = 0 // position 前面还剩下的位数

    constructor(private readonly data: Uint8Array) {
    }

    readBits(count: number) {
        return this._readBits(count, 0)
    }

    private _readBits(count: number, bitBuffer: number): number {
        if (count === 0) return bitBuffer
        let partial: number
        let bitsConsumed: number
        if (this.bitsPending > 0) {
            const byte = this.data[this.position - 1] & (0xff >> (8 - this.bitsPending))
            bitsConsumed = Math.min(this.bitsPending, count)
            this.bitsPending -= bitsConsumed
            partial = byte >> this.bitsPending
        } else {
            bitsConsumed = Math.min(8, count)
            this.bitsPending = 8 - bitsConsumed
            partial = this.data[this.position++] >> this.bitsPending
        }
        count -= bitsConsumed
        bitBuffer = (bitBuffer << bitsConsumed) | partial
        return this._readBits(count, bitBuffer)
    }

    seekTo(bitPos: number) {
        this.position = (bitPos / 8) | 0
        this.bitsPending = bitPos % 8
        if (this.bitsPending > 0) {
            this.bitsPending = 8 - this.bitsPending
            this.position++
        }
    }

    peek() {
        if (this.position >= this.data.length) return -1
        if (this.bitsPending > 0) {
            return (this.data[this.position - 1] & (1 << (this.bitsPending - 1))) >> (this.bitsPending - 1)
        } else {
            return this.data[this.position] >> 7
        }
    }
}
