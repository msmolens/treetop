// eslint-disable-next-line simple-import-sort/imports
import 'normalize.css/normalize.css';

import Welcome from './Welcome.svelte';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing app element');
}

new Welcome({
  // Play transitions on first render
  intro: true,
  target,
});
