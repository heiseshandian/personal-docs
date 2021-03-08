export const sanitize = (str: string) =>
  str
    .replace(/\b\)|\(\b|(,$)/gi, '')
    .replace(/\b,/gi, ' -')
    .replace(/[^\w\s-._]/gi, '-');
