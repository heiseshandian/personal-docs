const range = (min, max) =>
  new Proxy(Object.create(null), {
    has: (_, prop) => +prop >= min && +prop <= max,
  });

const getCookieObject = () => {
  const cookies = document.cookie.split(';').reduce(
    (cks, ck) => ({
      [ck.substr(0, ck.indexOf('=')).trim()]: ck.substr(ck.indexOf('=') + 1),
      ...cks,
    }),
    {},
  );
  const setCookie = (name, val) => (document.cookie = `${name}=${val}`);
  const deleteCookie = name =>
    (document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`);

  return new Proxy(cookies, {
    set: (obj, prop, val) => (
      setCookie(prop, val), Reflect.set(obj, prop, val)
    ),
    deleteProperty: (obj, prop) => (
      deleteCookie(prop), Reflect.deleteProperty(obj, prop)
    ),
  });
};
