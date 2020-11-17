// Import fonts first so @import url() statements are at top of bundled CSS.
// eslint-disable-next-line simple-import-sort/imports
import './fonts.css';
import 'normalize.css/normalize.css';
import './main.css';

import Treetop from './Treetop.svelte';

// Get root bookmark ID from hash
const rootBookmarkId = decodeURIComponent(location.hash.substr(1));

new Treetop({
  target: document.body,
  props: {
    rootBookmarkId,
  },
});
