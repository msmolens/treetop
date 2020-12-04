<style>
  .container {
    margin: 50px;
  }

  .title {
    color: #76aa6a;
    font-weight: 500;
  }

  .detail {
    font-size: smaller;
    padding: 0.5rem 0;
  }

  .content {
    border-radius: 0.25em;
    margin: 0 auto;
    max-width: 70rem;
    padding: 0 1em;
  }
</style>

<div class="container">
  <div class="content">
    <div class="title">
      <slot name="title" />
    </div>
    <hr />
    <div class="detail">
      &bull;
      <slot name="detail1" />
    </div>
    {#if $$slots.detail2}
      <div class="detail">
        &bull;
        <slot name="detail2" />
      </div>
    {/if}
  </div>
</div>
