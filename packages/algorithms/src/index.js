class Node {
  constructor(val) {
    this.value = val;
    this.next = null;
  }

  toString() {
    let index = this;
    let result = [];
    while (index !== null) {
      result.push(index.value);
      index = index.next;
    }
    return result;
  }
}

function merge(node1, node2) {
  const guide = new Node(-1);

  let guideIndex = guide;
  let index1 = node1;
  let index2 = node2;
  while (index1 !== null && index2 !== null) {
    if (index1.value <= index2.value) {
      guideIndex.next = index1;
      guideIndex = guideIndex.next;
      index1 = index1.next;
    } else {
      guideIndex.next = index2;
      guideIndex = guideIndex.next;
      index2 = index2.next;
    }
  }
  guideIndex.next = index1 !== null ? index1 : index2;

  return guide.next;
}

function test() {
  const [node1, node2, node3, node4, node5] = [
    new Node(1),
    new Node(2),
    new Node(3),
    new Node(4),
    new Node(5),
  ];

  node1.next = node2;

  node3.next = node4;
  node4.next = node5;

  console.log(merge(node1, node3).toString());
}

test();
