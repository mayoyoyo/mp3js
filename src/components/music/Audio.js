class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class AudioData {
    constructor() {
        this.head = null;
        this.last = null;
        this.size = 0;
        this.sum = 0;
    }

    add(energy) {
        const node = new LinkedListNode(energy);
        if (this.head == null) {
            this.head = node;
        }
        else {
            this.last.next = node;
        }
        this.last = node;
        this.size++;
        this.sum += energy;

        if (this.size > 30) {
            this.sum -= this.head.data;
            this.head = this.head.next;;
            this.size--;
        }
    }

    averageLocalEnergy() {
        if (this.head == null) {
            return 0;
        }
        return this.sum / this.size;
    }

    variance(average) {
        if (this.head == null) {
            return 0;
        }
        var sum = 0;
        var node = this.head;
        for (var i = 0; i < this.size; i++) {
            sum += (node.data - average) * (node.data - average);
            node = node.next;
        }
        return sum / 30;
    }

}

export default AudioData;