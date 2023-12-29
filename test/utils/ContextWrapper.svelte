<script lang="ts">
  // Wrapper component to test Svelte components that use the Context API.
  // See https://github.com/svelte-society/recipes-mvp/blob/master/testing.md#testing-the-context-api
  import { type ComponentType, setContext } from 'svelte';

  // Component
  export let Component: ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let Props: Record<string, any>;

  // Context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let Context: Record<string, any>;
  for (const [key, value] of Object.entries(Context)) {
    setContext(key, value);
  }
</script>

<svelte:component this={Component} {...Props} />
