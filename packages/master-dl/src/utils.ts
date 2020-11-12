export const sanitize = (str: string) => str.replace(/[^\w\s-._]/gi, '-');
