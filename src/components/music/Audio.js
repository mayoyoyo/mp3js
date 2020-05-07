class AudioData {
    constructor(data, avgFreq) {
        this.data = data;
        this.avgFreq = avgFreq;
    }


    getLevels(bins) {
        var freqPerBin = 1024 / bins;
        var levels = [];
        for (var i = 0; i < bins; i++) {
            var sum = 0;
            for (var j = 0; j < freqPerBin; j++) {
                sum += [i * freqPerBin + j];
            }
            levels.push(sum / (256 * freqPerBin));
        }
        return levels;
    }

    findInstantEnergy() {
        var energy = 0;
        for (var i = 0; i < 1024; i++) {
            energy += this.spectrum[i];
        }
        return energy;
    }

}

class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Buffer {
    constructor() {
        this.head = null;
        this.last = null;
        this.size = 0;
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

        if (this.size > 43) {
            this.head = this.head.next;;
            this.size--;
        }
    }

    averageLocalEnergy() {
        if (this.head == null) {
            return 0;
        }
        var sum = 0;
        var node = this.head;
        for (var i = 0; i < this.size; i++) {
            sum += node.data;
            node = node.next;
        }
        return sum / 43;
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
        return sum / 43;
    }

}

export default AudioData;