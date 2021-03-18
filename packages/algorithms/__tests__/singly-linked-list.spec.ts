import { SinglyLinkedList } from '../src';

test('create empty link list', () => {
  const linkList = new SinglyLinkedList();
  expect(linkList.toString()).toBe('');
});

test('append', () => {
  const linkList = new SinglyLinkedList();
  linkList.append(1);
  linkList.append(2);

  expect(linkList.toString()).toBe('1,2');
});

test('prepend', () => {
  const linkList = new SinglyLinkedList();
  linkList.prepend(1);
  linkList.prepend(2);

  expect(linkList.toString()).toBe('2,1');
});

test('delete head', () => {
  const linkList = new SinglyLinkedList();
  linkList.fromArray([1, 2, 3]);
  const deleted = linkList.delete(1);

  expect(deleted?.val).toBe(1);
  expect(linkList.toString()).toBe('2,3');
});

test('delete tail', () => {
  const linkList = new SinglyLinkedList();
  linkList.fromArray([1, 2, 3]);
  const deleted = linkList.delete(3);

  expect(deleted?.val).toBe(3);
  expect(linkList.toString()).toBe('1,2');
});

test('delete middle', () => {
  const linkList = new SinglyLinkedList();
  linkList.fromArray([1, 2, 3]);
  const deleted = linkList.delete(2);

  expect(deleted?.val).toBe(2);
  expect(linkList.toString()).toBe('1,3');
});

test('reverse', () => {
  const linkList = new SinglyLinkedList();
  linkList.fromArray([1, 2, 3]);
  linkList.reverse();

  expect(linkList.toString()).toBe('3,2,1');
});
