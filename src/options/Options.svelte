<script lang="ts">
  import { onMount } from 'svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: Record<string, any>;

  const strings = {
    general: chrome.i18n.getMessage('optionHeadingGeneral'),
    bookmarks: chrome.i18n.getMessage('optionHeadingBookmarks'),
    appearance: chrome.i18n.getMessage('optionHeadingAppearance'),
    openInNewTab: chrome.i18n.getMessage('optionOpenInNewTab'),
    truncate: chrome.i18n.getMessage('optionTruncateLongTitles'),
    tooltips: chrome.i18n.getMessage('optionDisplayTooltips'),
    showRecentlyVisited: chrome.i18n.getMessage('optionShowRecentlyVisited'),
    colorScheme: chrome.i18n.getMessage('optionColorScheme'),
    colorSchemeLight: chrome.i18n.getMessage('optionColorSchemeLight'),
    colorSchemeDark: chrome.i18n.getMessage('optionColorSchemeDark'),
    optionSourceAttributions: chrome.i18n.getMessage('openSourceAttributions'),
  };

  async function handleCheckboxChange(event: Event) {
    const target = event.target! as HTMLInputElement;
    const optionName = target.dataset.optionName!;
    const value = target.checked;
    await chrome.storage.local.set({ [optionName]: value });
  }

  async function handleRadioChange(event: Event) {
    const target = event.target! as HTMLInputElement;
    const optionName = target.name;
    const value = target.value;
    await chrome.storage.local.set({ [optionName]: value });
  }

  onMount(() => {
    async function getOptions() {
      options = await chrome.storage.local.get();
    }

    getOptions().catch((err) => {
      console.error(err);
    });
  });
</script>

<style>
  /* Based on the following stylesheets:
     - https://github.com/mozilla/multi-account-containers/blob/f0afc0d/src/css/options.css
     - https://hg.mozilla.org/mozilla-central/raw-file/a445f1762c895000bcdabd9d95697522359d41ed/browser/components/extensions/extension.css
  */
  :global(body) {
    background-color: #ffffff;
    box-sizing: border-box;
    color: #222426;
    cursor: default;
    display: flex;
    flex-direction: column;
    font: caption;
    margin: 0;
    padding: 0;
    user-select: none;
  }

  main {
    margin: 0px 20px 20px 20px;
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
  <main>
    <h3>{strings.general}</h3>
    <div>
      <label>
        <input
          type="checkbox"
          bind:checked={options.openInNewTab}
          on:change={handleCheckboxChange}
          data-option-name="openInNewTab" />
        {strings.openInNewTab}
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
  </main>
{/if}
