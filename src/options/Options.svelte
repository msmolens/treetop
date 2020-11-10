<script lang="ts">
  import { browser } from 'webextension-polyfill-ts';

  import { onMount } from 'svelte';

  let options: { [key: string]: any };

  const strings = {
    general: browser.i18n.getMessage('optionHeadingGeneral'),
    bookmarks: browser.i18n.getMessage('optionHeadingBookmarks'),
    showBookmarksToolbar: browser.i18n.getMessage('optionShowBookmarksToolbar'),
    showBookmarksMenu: browser.i18n.getMessage('optionShowBookmarksMenu'),
    showOtherBookmarks: browser.i18n.getMessage('optionShowOtherBookmarks'),
    truncate: browser.i18n.getMessage('optionTruncateLongTitles'),
    tooltips: browser.i18n.getMessage('optionDisplayTooltips'),
    showRecentlyVisited: browser.i18n.getMessage('optionShowRecentlyVisited'),
  };

  async function handleCheckboxChange(event: Event) {
    const target = event.target! as HTMLInputElement;
    const optionName = target.dataset.optionName!;
    const value = target.checked;
    await browser.storage.local.set({ [optionName]: value });
  }

  onMount(() => {
    async function getOptions() {
      options = await browser.storage.local.get();
    }

    getOptions();
  });
</script>

<style>
</style>

{#if options}
  <header class="panel-section panel-section-header">
    <div class="text-section-header">{strings.general}</div>
  </header>

  <div class="panel-section panel-section-formElements">
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.showBookmarksToolbar}
          on:change={handleCheckboxChange}
          data-option-name="showBookmarksToolbar" />
        {strings.showBookmarksToolbar}
      </label>
    </div>
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.showBookmarksMenu}
          on:change={handleCheckboxChange}
          data-option-name="showBookmarksMenu" />
        {strings.showBookmarksMenu}
      </label>
    </div>
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.showOtherBookmarks}
          on:change={handleCheckboxChange}
          data-option-name="showOtherBookmarks" />
        {strings.showOtherBookmarks}
      </label>
    </div>
  </div>

  <header class="panel-section panel-section-header">
    <div class="text-section-header">{strings.bookmarks}</div>
  </header>

  <div class="panel-section panel-section-formElements">
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.truncate}
          on:change={handleCheckboxChange}
          data-option-name="truncate" />
        {strings.truncate}
      </label>
    </div>
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.tooltips}
          on:change={handleCheckboxChange}
          data-option-name="tooltips" />
        {strings.tooltips}
      </label>
    </div>
    <div class="browser-style">
      <label>
        <input
          type="checkbox"
          bind:checked={options.showRecentlyVisited}
          on:change={handleCheckboxChange}
          data-option-name="showRecentlyVisited" />
        {strings.showRecentlyVisited}
      </label>
    </div>
  </div>
{/if}
