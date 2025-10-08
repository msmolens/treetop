// eslint-disable-next-line simple-import-sort/imports
import 'normalize.css/normalize.css';

import { mount } from 'svelte';
import Welcome from './Welcome.svelte';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing app element');
}

mount(Welcome, {
  // Play transitions on first render
  intro: true,
  target,
});
