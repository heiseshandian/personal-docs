import { isNullOrUndefined } from './base';

export class Node {
  constructor(public val: any, public next: Node | null = null) {
    this.val = val;
    this.next = next;
  }
}

export class SinglyLinkedList {
  private head: Node | null;

  constructor() {
    this.head = null;
  }

  append(val: any) {
    const current = this.head;
  }

  prepend(val: any) {}

  findByIndex() {}

  delete() {}
}
