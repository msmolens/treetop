<style>
  @media (prefers-color-scheme: light) {
    .content {
      --background-color: #f4f4f4;
      --box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    }
  }

  @media (prefers-color-scheme: dark) {
    .content {
      --background-color: #3e3e3e;
      --box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.5);
    }
  }

  .container {
    margin: 3rem;
  }

  .title {
    font-weight: 500;
    padding: 1rem 0;
    color: #76aa6a;
  }

  .detail {
    font-size: smaller;
    padding: 1rem 0;
  }

  .content {
    background-color: var(--background-color);
    max-width: 100rem;
    margin: 0 auto;
    padding: 0.5em 1em;
    border-radius: 0.25em;
    box-shadow: var(--box-shadow);
  }
</style>

<div class="container">
  <div class="content">
    <div class="title">
      <slot name="title" />
    </div>
    <div class="detail">
      <slot name="detail1" />
    </div>
    {#if $$slots.detail2}
      <div class="detail">
        <slot name="detail2" />
      </div>
    {/if}
  </div>
</div>
