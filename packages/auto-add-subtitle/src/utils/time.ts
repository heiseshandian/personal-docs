const timeRegex = /^([+-]?)(\d{2}):(\d{2}):(\d{2})[,.](\d{2,3})$/;
export function parseTime(value: string) {
  if (!value) {
    return 0;
  }
  const match = value.trim().match(timeRegex);
  if (!match) {
    return 0;
  }

  const [, symbol, hours, minutes, seconds, milliseconds] = match;
  return (
    (symbol === '-' ? -1 : 1) *
    ([hours, minutes, seconds]
      .map(val => Number(val))
      .reduce((acc, cur, i) => acc + cur * 60 ** (2 - i), 0) +
      Number(milliseconds) / 1000)
  );
}

export function formatTime(value: number, separator = ',') {
  const hours = Math.floor(value / (60 * 60));
  value -= hours * 60 * 60;
  const minutes = Math.floor(value / 60);
  value -= minutes * 60;
  const seconds = Math.floor(value);
  value -= seconds;
  const milliseconds = Math.round(value * 1000);

  return (
    (value < 0 ? '-' : '') +
    [hours, minutes, seconds].map(val => `${val}`.padStart(2, '0')).join(':') +
    separator +
    `${milliseconds}`.padStart(3, '0')
  );
}

export function formatDuration(value: number) {
  return formatTime(value, '.');
}
