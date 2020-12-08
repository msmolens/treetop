<script lang="ts">
  import type * as Treetop from './types';
  import type { Writable } from 'svelte/store';

  import { getContext } from 'svelte';
  import lodashTruncate from 'lodash-es/truncate';

  import { clock } from './clock';
  import { truncateMiddle } from './utils';

  export let nodeId: string;
  export let title: string;
  export let url: string;

  const lastVisitTimeMap: Treetop.LastVisitTimeMap = getContext(
    'lastVisitTimeMap'
  );
  const truncate = getContext('truncate') as Writable<boolean>;
  const tooltips = getContext('tooltips') as Writable<boolean>;

  let lastVisitTime = lastVisitTimeMap.get(nodeId) as Writable<number>;

  // Maximum length of displayed bookmark titles and, in tooltips, URLs.
  const maxLength = 78;

  let name: string;
  $: {
    // Set name, truncating based on preference setting.
    // Fall back to URL if title is blank.
    if ($truncate) {
      name = lodashTruncate(title || url, {
        length: maxLength,
        separator: ' ',
      });
    } else {
      name = title || url;
    }
  }

  let tooltip: string | undefined;
  $: {
    // Set tooltip if preference is enabled.
    // Display title and URL on separate lines, truncating long URLs in the middle.
    if ($tooltips) {
      tooltip = `${title}\n${truncateMiddle(url, maxLength)}`;
    } else {
      tooltip = undefined;
    }
  }

  // Number of milliseconds in a day
  const MILLISECONDS_PER_DAY =
    1000 * // ms per second
    60 * // seconds per minute
    60 * // minutes per hour
    24; // hours per day

  // Approximate number of days since last visit
  let lastVisitTimeDays: number;
  $: lastVisitTimeDays =
    ($clock.getTime() - $lastVisitTime) / MILLISECONDS_PER_DAY;

  // Set visited class based on number of days since last visit
  let visitedClass: string;
  $: {
    if (lastVisitTimeDays < 1) {
      visitedClass = 'visitedPastDay';
    } else if (lastVisitTimeDays < 2) {
      visitedClass = 'visitedPastTwoDays';
    } else if (lastVisitTimeDays < 3) {
      visitedClass = 'visitedPastThreeDays';
    } else if (lastVisitTimeDays < 7) {
      visitedClass = 'visitedPastWeek';
    } else {
      visitedClass = '';
    }
  }
</script>

<style>
  @media (prefers-color-scheme: light) {
    a:link,
    a:visited {
      --text-decoration-color: #9e9e9e;
    }

    a:hover {
      --hover-color: #ff4088;
      --text-decoration-color: #c0c0c0;
    }
  }

  @media (prefers-color-scheme: dark) {
    a:link,
    a:visited {
      --text-decoration-color: #6e6e6e;
    }

    a:hover {
      --hover-color: #ff4088;
      --text-decoration-color: #c0c0c0;
    }
  }

  a:link,
  a:visited {
    color: inherit;
    margin-right: 1rem;
    text-decoration-color: var(--text-decoration-color);
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-thickness: 1px;
  }

  a:hover {
    color: var(--hover-color);
  }

  :global(.colorSchemeLight) a:link,
  :global(.colorSchemeLight) a:visited {
    --text-decoration-color: #9e9e9e;
  }
  :global(.colorSchemeLight) a:hover {
    --hover-color: #ff4088;
    --text-decoration-color: #c0c0c0;
  }

  :global(.colorSchemeDark) a:link,
  :global(.colorSchemeDark) a:visited {
    --text-decoration-color: #6e6e6e;
  }
  :global(.colorSchemeDark) a:hover {
    --hover-color: #ff4088;
    --text-decoration-color: #c0c0c0;
  }

  .visitedPastDay {
    font-size: 1.5rem;
  }

  .visitedPastTwoDays {
    font-size: 1.4rem;
  }

  .visitedPastThreeDays {
    font-size: 1.3rem;
  }

  .visitedPastWeek {
    font-size: 1.1rem;
  }
</style>

<a href={url} data-node-id={nodeId} title={tooltip} class={visitedClass}>
  {name}
</a>
