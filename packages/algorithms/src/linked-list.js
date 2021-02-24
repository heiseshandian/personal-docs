// https://www.youtube.com/watch?v=njTh_OwMljA&index=2&t=1s&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8
class Node {
  value;

  next = null;

  constructor(val) {
    this.value = val;
  }
}

export class LinkedList {
  head;

  constructor() {
    this.head = null;
  }

  append(val) {
    if (this.head == null) {
      this.head = new Node(val);
      return;
    }

    // find the last element
    let current = this.head;
    while (current.next !== null) {
      current = current.next;
    }
    current.next = new Node(val);
  }

  prepend(val) {
    const newHead = new Node(val);
    newHead.next = this.head;
    this.head = newHead;
  }

  contains(val) {
    let current = this.head;
    while (current !== null) {
      if (current.value === val) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  remove(val) {
    if (this.head === null) {
      return;
    }
    if (this.head.value === val) {
      this.head = this.head.next;
      return;
    }

    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === val) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }
}
