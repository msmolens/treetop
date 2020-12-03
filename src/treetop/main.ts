// Import fonts first so @import url() statements are at top of bundled CSS.
// eslint-disable-next-line simple-import-sort/imports
import './fonts.css';
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
