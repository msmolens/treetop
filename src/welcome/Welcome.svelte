<script lang="ts">
  import icon from '../icons/generated/icons/icon.svg';

  import InfoBox from './InfoBox.svelte';
</script>

<style>
  @media (prefers-color-scheme: light) {
    :root {
      --background-color: #fefefa;
      --color: #212121;
      --header-footer-background-color: #676778;
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background-color: #202023;
      --color: #e8e8e8;
      --header-footer-background-color: #3e3e3e;
    }
  }

  :global(body) {
    background-color: var(--background-color);
    color: var(--color);
    font-family: 'Open Sans', -apple-system, 'Segoe UI', 'Roboto', sans-serif;
    font-size: 2rem;
    font-weight: 400;
    margin: 0;
  }

  header {
    background-color: var(--header-footer-background-color);
    color: white;
    padding: 20px 0px;
  }

  footer {
    background-color: var(--header-footer-background-color);
    height: 3rem;
    padding: 20px 0px;
  }

  main {
    margin: 3rem 0;
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
    max-width: 100rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    color: lightgray;
    font-size: smaller;
    font-style: italic;
    margin-top: 30px;
  }
</style>

<div>
  <header>
    <div class="title">
      <div>
        <img class="logo" src={icon} alt="Treetop Logo" />
        Thanks for installing Treetop!
      </div>
      <div class="subtitle">
        Treetop is a high-level live view of your bookmarks.
      </div>
    </div>
  </header>

  <main>
    <InfoBox>
      <span slot="title">Getting started</span>
      <span slot="detail1">
        Open Treetop by clicking its icon (<img
          class="icon"
          src={icon}
          alt="Treetop Icon" />) in the toolbar.
      </span>
      <span slot="detail2">Treetop shows all your bookmarks on a single page.</span>
    </InfoBox>

    <InfoBox>
      <span slot="title">Always up-to-date</span>
      <span slot="detail1"> Treetop updates automatically as you browse.</span>
      <span slot="detail2">
        Recently visited bookmarks have a larger font.
      </span>
    </InfoBox>

    <InfoBox>
      <span slot="title">Edit your bookmarks</span>
      <span slot="detail1">
        Right-click to edit or delete bookmarks and folders.
      </span>
    </InfoBox>

    <InfoBox>
      <span slot="title">Customize</span>
      <span slot="detail1">
        Click the Preferences button to customize Treetop's display.
      </span>
      <span slot="detail2">Click a folder to set Treetop's root.</span>
    </InfoBox>
  </main>

  <footer />
</div>
