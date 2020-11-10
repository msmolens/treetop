<script lang="ts">
  import IconButton from '@smui/icon-button';
  import { elasticOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import { browser } from 'webextension-polyfill-ts';

  function openPreferences() {
    browser.runtime.openOptionsPage();
  }
</script>

<style>
  header {
    display: flex;
    margin: 0 1rem;
  }

  .treetop {
    color: #24292e;
    flex: 1;
    font-family: 'News Cycle', sans-serif;
    font-size: 3rem;
    font-weight: 400;
    letter-spacing: -0.1rem;
    text-decoration: solid #ff4088 underline 3px;
    text-underline-offset: 3px;
    user-select: none;
  }

  .preferences {
    padding: 0.5rem;
  }
</style>

<header>
  <div
    class="treetop"
    transition:fly={{ y: -72, duration: 1200, easing: elasticOut, opacity: 1 }}>
    Treetop
  </div>
  <div>
    <div class="preferences">
      <IconButton
        aria-label={browser.i18n.getMessage('preferences')}
        class="material-icons"
        on:click={openPreferences}>
        settings
      </IconButton>
    </div>
  </div>
</header>
