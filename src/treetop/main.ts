// eslint-disable-next-line simple-import-sort/imports
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/material-icons';
import '@fontsource/news-cycle/latin-400.css';
import 'normalize.css/normalize.css';
import './main.css';

import Treetop from './Treetop.svelte';

// Get root bookmark ID from hash
const rootBookmarkId = decodeURIComponent(location.hash.substring(1));

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing app element');
}

new Treetop({
  target,
  props: {
    rootBookmarkId,
  },
});
