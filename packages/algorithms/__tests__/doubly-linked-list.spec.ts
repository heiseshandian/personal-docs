import { DoublyLinkedList } from '../src';

let doublyLinkedList: DoublyLinkedList;
beforeEach(() => {
  doublyLinkedList = new DoublyLinkedList();
});

test('append, head is null', () => {
  doublyLinkedList.append(1);
  expect(doublyLinkedList.contains(1)).toBe(true);
});

test('append, head is not null', () => {
  doublyLinkedList.append(1);
  doublyLinkedList.append(2);
  expect(doublyLinkedList.contains(1)).toBe(true);
  expect(doublyLinkedList.contains(2)).toBe(true);
});

test('remove, head equal to tail', () => {
  doublyLinkedList.append(1);
  doublyLinkedList.remove(1);
  expect(doublyLinkedList.contains(1)).toBe(false);
});

test('remove, head not equal to tail', () => {
  doublyLinkedList.append(1);
  doublyLinkedList.append(2);
  doublyLinkedList.remove(1);
  expect(doublyLinkedList.contains(1)).toBe(false);
  expect(doublyLinkedList.contains(2)).toBe(true);
});

test('remove, tail', () => {
  doublyLinkedList.append(1);
  doublyLinkedList.append(2);
  doublyLinkedList.remove(2);
  expect(doublyLinkedList.contains(2)).toBe(false);
  expect(doublyLinkedList.contains(1)).toBe(true);
});
