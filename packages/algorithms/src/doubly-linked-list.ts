// https://www.youtube.com/watch?v=JdQeNxWCguQ&t=7s&index=72&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8
class Node {
  value: any;

  next: Node | null = null;

  previous: Node | null = null;

  constructor(val: any) {
    this.value = val;
  }
}

export class DoublyLinkedList {
  private head: Node | null;

  private tail: Node | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  append(val: any) {
    const node = new Node(val);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.previous = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.next = node;
      this.tail = node;
    }
  }

  remove(val: any) {
    if (this.head === null) {
      return;
    }
    if (this.head.value === val) {
      if (this.head == this.tail) {
        this.head = null;
        this.tail = null;
      } else {
        this.head = this.head.next;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.head!.previous = null;
      }
      return;
    }

    // find the next node to remove, skip it
    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === val) {
        current.next = current.next.next;
        if (current.next?.next) {
          current.next.next.previous = current;
        }
        return;
      }
      current = current.next;
    }
  }

  contains(val: any) {
    let current = this.head;
    while (current !== null) {
      if (current.value === val) {
        return true;
      }
      current = current.next;
    }
    return false;
  }
}
