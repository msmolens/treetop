// eslint-disable-next-line simple-import-sort/imports
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/material-icons';
import '@fontsource/news-cycle/latin-400.css';
import 'normalize.css/normalize.css';

import Treetop from './Treetop.svelte';

// Import after Treetop component to ensure that MDC style overrides follow
// MDC/SMUI rules in the bundle.
// See https://github.com/hperrin/svelte-material-ui/issues/129
import './main.css';

// Get root bookmark ID from hash
const rootBookmarkId = decodeURIComponent(location.hash.substr(1));

new Treetop({
  target: document.body,
  props: {
    rootBookmarkId,
  },
});
