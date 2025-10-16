<script lang="ts">
  import lodashTruncate from 'lodash-es/truncate';

  import {
    getClock,
    getLastVisitTimeMap,
    getTooltips,
    getTruncate,
  } from './context';
  import { truncateMiddle } from './utils';

  interface Props {
    nodeId: string;
    title: string;
    url: string;
  }

  let { nodeId, title, url }: Props = $props();

  const lastVisitTimeMap = getLastVisitTimeMap();
  const truncate = getTruncate();
  const tooltips = getTooltips();
  const clock = getClock();

  const lastVisitTime = $derived(lastVisitTimeMap.get(nodeId)!);

  // Maximum length of displayed bookmark titles and, in tooltips, URLs.
  const maxLength = 78;

  // Set name, truncating based on preference setting.
  // Fall back to URL if title is blank.
  const name = $derived(
    truncate()
      ? lodashTruncate(title || url, {
          length: maxLength,
          separator: ' ',
        })
      : title || url,
  );

  // Set tooltip if preference is enabled.
  // Display title and URL on separate lines, truncating long URLs in the middle.
  const tooltip = $derived(
    tooltips() ? `${title}\n${truncateMiddle(url, maxLength)}` : undefined,
  );

  // Number of milliseconds in a day
  const MILLISECONDS_PER_DAY =
    1000 * // ms per second
    60 * // seconds per minute
    60 * // minutes per hour
    24; // hours per day

  // Approximate number of days since last visit
  const lastVisitTimeDays = $derived(
    (clock.getTime() - lastVisitTime) / MILLISECONDS_PER_DAY,
  );

  // Set visited class based on number of days since last visit
  const visitedClass = $derived.by(() => {
    if (lastVisitTimeDays < 1) return 'visitedPastDay';
    if (lastVisitTimeDays < 2) return 'visitedPastTwoDays';
    if (lastVisitTimeDays < 3) return 'visitedPastThreeDays';
    if (lastVisitTimeDays < 7) return 'visitedPastWeek';
    return '';
  });
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
    text-underline-offset: 0.1em;
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
