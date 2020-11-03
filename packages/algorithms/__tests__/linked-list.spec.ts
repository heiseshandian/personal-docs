import { LinkedList } from '../src';

let linkList: LinkedList;
beforeEach(() => {
  linkList = new LinkedList();
});

test('append,head is null', () => {
  linkList.append(1);
  expect(linkList.contains(1)).toBe(true);
});

test('append,head is not null', () => {
  linkList.append(1);
  linkList.append(2);
  expect(linkList.contains(1)).toBe(true);
  expect(linkList.contains(2)).toBe(true);
});

test('prepend', () => {
  linkList.prepend(1);
  expect(linkList.contains(1)).toBe(true);
});

test('contains', () => {
  linkList.append(1);
  expect(linkList.contains(1)).toBe(true);
});

test('remove,head is null', () => {
  linkList.remove(1);
  expect(linkList.contains(1)).toBe(false);
});

test('remove,remove head', () => {
  linkList.append(1);
  linkList.remove(1);
  expect(linkList.contains(1)).toBe(false);
});

test('remove,remove other element', () => {
  linkList.append(1);
  linkList.append(2);
  linkList.remove(2);
  expect(linkList.contains(2)).toBe(false);
});
