// Random values must be imported first for security.
import 'react-native-get-random-values';

import '@azure/core-asynciterator-polyfill';
import '@ethersproject/shims';
import 'react-native-polyfill-globals/auto';
import 'text-encoding';

// Necessary for @peculiar/webcrypto.
global.Buffer = require('safe-buffer').Buffer;

if (!window.location) {
  window.location = {
    hostname: 'https://ohayo.space',
  } as Location;
}

import { Crypto as WebCrypto } from '@peculiar/webcrypto';
if (!global.crypto.subtle) {
  // Only polyfill SubtleCrypto as we prefer `react-native-get-random-values` for getRandomValues.
  const webCrypto = new WebCrypto();
  (global.crypto.subtle as any) = webCrypto.subtle;
}
