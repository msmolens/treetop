<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: Snippet;
    detail1: Snippet;
    detail2?: Snippet;
  }

  let { title, detail1, detail2 }: Props = $props();
</script>

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
      {@render title()}
    </div>
    <hr />
    <div class="detail">
      &bull;
      {@render detail1()}
    </div>
    {#if detail2}
      <div class="detail">
        &bull;
        {@render detail2()}
      </div>
    {/if}
  </div>
</div>
