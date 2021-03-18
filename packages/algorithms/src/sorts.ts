// n轮冒泡，每次将最大（最小）的数放到最后
export function bubbleSort(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    // 标示一轮遍历是否存在位置交换，若无则提前结束冒泡
    let flag = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        flag = true;
      }
    }
    if (!flag) {
      break;
    }
  }

  return arr;
}

export function insertSort(arr: number[]) {
  // 从第二个元素开始，第一个元素是已排序的（已排序数组只有一个数字）
  for (let i = 1; i < arr.length; i++) {
    const cur = arr[i];
    // 在已排序数组中找到合适的位置插入
    let j = i - 1;
    while (j >= 0 && arr[j] > cur) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = cur;
  }

  return arr;
}

export function selectSort(arr: number[]) {
  for (let i = 0; i < arr.length; i++) {
    let min = arr[i];
    let minIndex = i;
    for (let j = i; j < arr.length; j++) {
      if (min > arr[j]) {
        min = arr[j];
        minIndex = j;
      }
    }

    // 此轮交换会破坏稳定性
    swap(arr, i, minIndex);
  }

  return arr;
}

function swap(arr: number[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

export function mergeSort(arr: number[]) {
  function sort(arr: number[], start: number, end: number) {
    if (start < end) {
      // js整数运算会得到小数，这里需要使用Math.floor确保得到的值是整数
      const mid = Math.floor(start + (end - start) / 2);
      sort(arr, start, mid);
      sort(arr, mid + 1, end);
      merge(arr, start, mid, end);
    }
  }

  function merge(arr: number[], start: number, mid: number, end: number) {
    let i = start;
    let j = mid + 1;
    let k = 0;
    // 开辟个临时数组用于存放合并后的数据
    const tmp = [];

    // 同时遍历两个数组
    while (i <= mid && j <= end) {
      tmp[k++] = arr[i] <= arr[j] ? arr[i++] : arr[j++];
    }

    // 将剩余数组copy到临时数组中
    if (i > mid) {
      arr.slice(j, end + 1).forEach(val => tmp.push(val));
    } else {
      arr.slice(i, mid + 1).forEach(val => tmp.push(val));
    }

    // 将tmp copy回arr
    for (let i = 0; i <= end - start; i++) {
      arr[start + i] = tmp[i];
    }
  }

  sort(arr, 0, arr.length - 1);
  return arr;
}

export function quickSort(arr: number[]) {
  function sort(arr: number[], start: number, end: number) {
    if (start < end) {
      const p = partition(arr, start, end);
      // 此处是p-1，不是p
      sort(arr, start, p - 1);
      sort(arr, p + 1, end);
    }
  }

  function partition(arr: number[], start: number, end: number) {
    let i = start;
    const p = arr[end];
    for (let j = i; j <= end - 1; j++) {
      if (arr[j] < p) {
        swap(arr, i, j);
        i++;
      }
    }
    swap(arr, i, end);
    return i;
  }

  sort(arr, 0, arr.length - 1);
  return arr;
}
