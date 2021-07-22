<script>
  import { createEventDispatcher } from 'svelte';
  import { elasticOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import IconButton from '@smui/icon-button/styled';
  import { browser } from 'webextension-polyfill-ts';

  const dispatch = createEventDispatcher();

  function openPreferences() {
    browser.runtime.openOptionsPage().catch(() => {
      dispatch('error');
    });
  }
</script>

<style>
  @media (prefers-color-scheme: light) {
    header {
      --color: #24292e;
    }
  }

  @media (prefers-color-scheme: dark) {
    header {
      --color: #eeeeee;
    }
  }

  header {
    color: var(--color);
    display: flex;
    margin: 0 1rem;
  }

  :global(.colorSchemeLight) header {
    --color: #24292e;
  }

  :global(.colorSchemeDark) header {
    --color: #eeeeee;
  }

  .treetop {
    font-family: 'News Cycle', sans-serif;
    font-size: 3rem;
    font-weight: 400;
    letter-spacing: -0.1rem;
    text-decoration: solid #ff4088 underline 3px;
    text-underline-offset: 3px;
    user-select: none;
  }

  .slot {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  .preferences {
    font-family: 'Material Icons';
    padding: 0.5rem;
  }
</style>

<header>
  <div
    class="treetop"
    transition:fly={{ y: -72, duration: 1200, easing: elasticOut, opacity: 1 }}>
    Treetop
  </div>
  <div class="slot">
    <slot />
  </div>
  <div>
    <div class="preferences">
      <IconButton
        aria-label={browser.i18n.getMessage('preferences')}
        on:click={openPreferences}>
        settings
      </IconButton>
    </div>
  </div>
</header>
