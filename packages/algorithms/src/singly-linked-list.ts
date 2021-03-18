// 单链表节点
export class Node {
  constructor(public val: any, public next: Node | null = null) {
    this.val = val;
    this.next = next;
  }

  toString() {
    return `${this.val}`;
  }
}

export class SinglyLinkedList {
  private head: Node | null;
  private tail: Node | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  // 尾部追加
  append(val: any) {
    const node = new Node(val);

    if (this.tail !== null) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = node;
    }

    return this;
  }

  // 头部添加
  prepend(val: any) {
    const node = new Node(val);
    node.next = this.head;
    this.head = node;
    // 不要忘记更新尾节点
    if (this.tail === null) {
      this.tail = node;
    }

    return this;
  }

  find(val: any) {
    let cur = this.head;

    while (cur !== null) {
      if (cur.val === val) {
        return cur;
      } else {
        cur = cur.next;
      }
    }

    return null;
  }

  delete(val: any) {
    if (!this.head) {
      return null;
    }

    let deletedNode = null;
    let cur = this.head;

    // 删除头节点
    if (this.head.val === val) {
      deletedNode = this.head;
      this.head = deletedNode.next;
    }

    // 删除非头节点
    if (!deletedNode) {
      while (cur.next !== null) {
        if (cur.next.val === val) {
          deletedNode = cur.next;
          cur.next = cur.next.next;
        } else {
          cur = cur.next;
        }
      }
    }

    // 删除尾节点
    if (this.tail === deletedNode) {
      this.tail = cur;
    }

    return deletedNode;
  }

  fromArray(vals: any[]) {
    vals.forEach(val => this.append(val));

    return this;
  }

  toArray() {
    let cur = this.head;
    const result = [];

    while (cur !== null) {
      result.push(cur.val);
      cur = cur.next;
    }

    return result;
  }

  toString() {
    return this.toArray().toString();
  }

  reverse() {
    let cur = this.head;
    let prev = null;
    let next = null;

    while (cur !== null) {
      next = cur.next;
      // 核心交换逻辑
      cur.next = prev;

      prev = cur;
      cur = next;
    }

    // 更新head和tail
    this.head = this.tail;
    this.tail = cur;

    return this;
  }
}
