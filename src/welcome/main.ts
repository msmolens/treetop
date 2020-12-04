// eslint-disable-next-line simple-import-sort/imports
import 'normalize.css/normalize.css';

import Welcome from './Welcome.svelte';

new Welcome({
  intro: true,
  target: document.body,
});
