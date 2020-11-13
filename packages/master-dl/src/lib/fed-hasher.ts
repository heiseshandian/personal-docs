import fetch from 'node-fetch';

import constants from './constants';

export default async function (timestamp: number) {
  return fetch(`${constants.fedHasherUrl}${timestamp}`)
    .then(res => res.json())
    .then(json => json.hash);
}
