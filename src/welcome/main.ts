// eslint-disable-next-line simple-import-sort/imports
import 'normalize.css/normalize.css';

import Welcome from './Welcome.svelte';

new Welcome({
  // Play transitions on first render
  intro: true,
  target: document.getElementById('app'),
});
