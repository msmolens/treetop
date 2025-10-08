<script lang="ts" generics="TComponent extends Component<any>">
  // Wrapper component to test Svelte components that use the Context API.
  // See https://github.com/svelte-society/recipes-mvp/blob/master/testing.md#testing-the-context-api
  import type { Component, ComponentProps } from 'svelte';
  import { setContext } from 'svelte';

  interface Props {
    // Component
    Component: TComponent;
    Props: ComponentProps<TComponent>;

    // Context
    Context: Record<string, any>;
  }

  let { Component: WrappedComponent, Props, Context }: Props = $props();

  for (const [key, value] of Object.entries(Context)) {
    setContext(key, value);
  }
</script>

<WrappedComponent {...Props} />
