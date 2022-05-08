<script lang="ts">
  import { fade } from 'svelte/transition';

  import icon from '../icons/generated/icons/icon.svg';

  import InfoBox from './InfoBox.svelte';
</script>

<style>
  @media (prefers-color-scheme: light) {
    :root {
      --background-color: #676778;
      --color: #212121;
      --main-background-color: #fefefa;
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background-color: #3e3e3e;
      --color: #e8e8e8;
      --main-background-color: #202023;
    }
  }

  :global(body) {
    background-color: var(--background-color);
    color: var(--color);
    font-family: 'Open Sans', -apple-system, 'Segoe UI', 'Roboto', sans-serif;
    font-size: 1.75rem;
    font-weight: 400;
  }

  header {
    color: white;
    margin: 30px;
  }

  main {
    background-color: var(--main-background-color);
    padding: 1px;
  }

  .logo {
    position: relative;
    top: 1rem;
  }

  .icon {
    height: 1.5rem;
    position: relative;
    top: 0.2rem;
  }

  .title {
    display: flex;
    flex-direction: column;
    font-size: larger;
    margin: 0 auto;
    max-width: 60rem;
  }

  .subtitle {
    color: lightgray;
    font-size: smaller;
    font-style: italic;
    margin-left: 30px;
    margin-top: 30px;
  }
</style>

<header>
  <div class="title">
    <div>
      <img class="logo" src={icon} alt="Treetop Logo" />
      <span>Welcome to Treetop!</span>
    </div>
    <div class="subtitle">
      Treetop is a high-level live view of your bookmarks.
    </div>
  </div>
</header>

<main transition:fade={{ delay: 400, duration: 300 }}>
  <InfoBox>
    <span slot="title">Getting started</span>
    <span slot="detail1">
      Open Treetop by clicking its icon (<img
        class="icon"
        src={icon}
        alt="Treetop Icon" />) in the toolbar.
    </span>
    <span slot="detail2"
      >Treetop shows all your bookmarks on a single page.</span>
  </InfoBox>

  <InfoBox>
    <span slot="title">Always up-to-date</span>
    <span slot="detail1">Treetop updates automatically as you browse.</span>
    <span slot="detail2">Recently visited bookmarks have a larger font. </span>
  </InfoBox>

  <InfoBox>
    <span slot="title">Find and edit your bookmarks</span>
    <span slot="detail1">Search for bookmarks by name or URL.</span>
    <span slot="detail2">
      Right-click to edit or delete bookmarks and folders.
    </span>
  </InfoBox>

  <InfoBox>
    <span slot="title">Customize</span>
    <span slot="detail1">
      Click the Preferences button to customize Treetop's display.
    </span>
    <span slot="detail2">Click on a folder to make it the root folder.</span>
  </InfoBox>
</main>
