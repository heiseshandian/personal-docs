export function groupByLen<T>(arr: Array<T>, groupLen: number) {
  return arr.reduce((acc: Array<Array<T>>, cur, i) => {
    const index = Math.floor(i / groupLen);

    if (i % groupLen === 0) {
      acc[index] = [cur];
    } else {
      acc[index].push(cur);
    }
    return acc;
  }, []);
}
