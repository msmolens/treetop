<script lang="ts">
  import { onMount } from 'svelte';
  import * as browser from 'webextension-polyfill';

  let options: Awaited<ReturnType<typeof browser.storage.local.get>>;

  const strings = {
    general: browser.i18n.getMessage('optionHeadingGeneral'),
    bookmarks: browser.i18n.getMessage('optionHeadingBookmarks'),
    appearance: browser.i18n.getMessage('optionHeadingAppearance'),
    showBookmarksToolbar: browser.i18n.getMessage('optionShowBookmarksToolbar'),
    showBookmarksMenu: browser.i18n.getMessage('optionShowBookmarksMenu'),
    showOtherBookmarks: browser.i18n.getMessage('optionShowOtherBookmarks'),
    truncate: browser.i18n.getMessage('optionTruncateLongTitles'),
    tooltips: browser.i18n.getMessage('optionDisplayTooltips'),
    showRecentlyVisited: browser.i18n.getMessage('optionShowRecentlyVisited'),
    colorScheme: browser.i18n.getMessage('optionColorScheme'),
    colorSchemeLight: browser.i18n.getMessage('optionColorSchemeLight'),
    colorSchemeDark: browser.i18n.getMessage('optionColorSchemeDark'),
    optionSourceAttributions: browser.i18n.getMessage('openSourceAttributions'),
  };

  async function handleCheckboxChange(event: Event) {
    const target = event.target! as HTMLInputElement;
    const optionName = target.dataset.optionName!;
    const value = target.checked;
    await browser.storage.local.set({ [optionName]: value });
  }

  async function handleRadioChange(event: Event) {
    const target = event.target! as HTMLInputElement;
    const optionName = target.name;
    const value = target.value;
    await browser.storage.local.set({ [optionName]: value });
  }

  onMount(() => {
    async function getOptions() {
      options = await browser.storage.local.get();
    }

    getOptions().catch((err) => {
      console.error(err);
    });
  });
</script>

<style>
  /* Based on https://github.com/mozilla/multi-account-containers/blob/f0afc0d/src/css/options.css */
  :global(body) {
    background-color: #fff;
    color: #202023;
    margin-bottom: 1rem;
  }

  a {
    color: #0060df;
    text-decoration: none;
  }

  h3 {
    font-weight: normal;
    margin-bottom: 0.5rem;
  }

  h4 {
    font-weight: normal;
    margin-bottom: 0;
    margin-top: 0;
  }

  div {
    margin: 0.2rem 0;
  }

  label {
    color: #4a4a4f;
  }

  .group {
    margin-left: 0.5rem;
  }

  .attributions {
    margin-top: 1rem;
    margin-left: auto;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background-color: #202023;
      color: #fff;
    }

    a {
      color: #809fff;
    }

    label {
      color: #b1b1b3;
    }
  }
</style>

{#if options}
  <h3>{strings.general}</h3>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.showBookmarksToolbar}
        on:change={handleCheckboxChange}
        data-option-name="showBookmarksToolbar" />
      {strings.showBookmarksToolbar}
    </label>
  </div>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.showBookmarksMenu}
        on:change={handleCheckboxChange}
        data-option-name="showBookmarksMenu" />
      {strings.showBookmarksMenu}
    </label>
  </div>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.showOtherBookmarks}
        on:change={handleCheckboxChange}
        data-option-name="showOtherBookmarks" />
      {strings.showOtherBookmarks}
    </label>
  </div>

  <h3>{strings.bookmarks}</h3>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.truncate}
        on:change={handleCheckboxChange}
        data-option-name="truncate" />
      {strings.truncate}
    </label>
  </div>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.tooltips}
        on:change={handleCheckboxChange}
        data-option-name="tooltips" />
      {strings.tooltips}
    </label>
  </div>
  <div>
    <label>
      <input
        type="checkbox"
        bind:checked={options.showRecentlyVisited}
        on:change={handleCheckboxChange}
        data-option-name="showRecentlyVisited" />
      {strings.showRecentlyVisited}
    </label>
  </div>

  <h3>{strings.appearance}</h3>
  <h4>{strings.colorScheme}</h4>
  <div class="group">
    <div>
      <label>
        <input
          type="radio"
          name="colorScheme"
          value="light"
          bind:group={options.colorScheme}
          on:change={handleRadioChange} />
        {strings.colorSchemeLight}
      </label>
    </div>
    <div>
      <label>
        <input
          type="radio"
          name="colorScheme"
          value="dark"
          bind:group={options.colorScheme}
          on:change={handleRadioChange} />
        {strings.colorSchemeDark}
      </label>
    </div>
  </div>
  <div class="attributions">
    <a href="attributions.txt" target="_blank"
      >{strings.optionSourceAttributions}</a>
  </div>
{/if}
