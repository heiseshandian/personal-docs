// 按照指定大小对数组进行分组
// groupByLen([1,2,3,4],2) => [[1,2],[3,4]]
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
