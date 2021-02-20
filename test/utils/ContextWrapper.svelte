<script>
  // Wrapper component to test Svelte components that use the Context API.
  // See https://github.com/svelte-society/recipes-mvp/blob/master/testing.md#testing-the-context-api
  import { setContext, SvelteComponent } from 'svelte';

  // Component
  export let Component: SvelteComponent;
  export let Props: Record<string, any>;

  // Context
  export let Context: Record<string, any>;
  for (const [key, value] of Object.entries(Context)) {
    setContext(key, value);
  }
</script>

<svelte:component this={Component} {...Props} />
