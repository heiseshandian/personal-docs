// https://www.youtube.com/watch?v=njTh_OwMljA&index=2&t=1s&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8
class Node {
  value: any;

  next: Node | null = null;

  constructor(val: any) {
    this.value = val;
  }
}

export class LinkedList {
  private head: Node | null;

  constructor() {
    this.head = null;
  }

  public append(val: any) {
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

  public prepend(val: any) {
    const newHead = new Node(val);
    newHead.next = this.head;
    this.head = newHead;
  }

  public contains(val: any) {
    let current = this.head;
    while (current !== null) {
      if (current.value === val) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  public remove(val: any) {
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
