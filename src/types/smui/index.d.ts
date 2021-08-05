/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@smui/dialog/styled' {
  import type { SvelteComponent } from 'svelte';

  class Dialog extends SvelteComponent {
    $$prop_def: Record<string, unknown>;
  }

  class Actions extends SvelteComponent {
    $$prop_def: Record<string, unknown>;
  }
  class Content extends SvelteComponent {
    $$prop_def: {
      id: string;
    };
  }
  class Title extends SvelteComponent {
    $$prop_def: {
      id: string;
    };
  }

  let InitialFocus: (node: HTMLElement) => {
    destroy: () => void;
  };

  export default Dialog;
  export { Actions, Content, InitialFocus, Title };
}

declare module '@smui/button/styled' {
  import type { SvelteComponent } from 'svelte';

  class Button extends SvelteComponent {
    $$prop_def: {
      use?: any[];
      action?: string;
      disabled?: boolean;
    };
  }

  class Label extends SvelteComponent {
    $$prop_def: Record<string, unknown>;
  }

  export default Button;
  export { Label };
}

declare module '@smui/icon-button/styled' {
  import type { SvelteComponent } from 'svelte';

  class IconButton extends SvelteComponent {
    $$prop_def: {
      use?: any[];
      class?: string;
      style?: string;
    };
  }

  export default IconButton;
}

declare module '@smui/linear-progress/styled' {
  import type { SvelteComponent } from 'svelte';

  class LinearProgress extends SvelteComponent {
    $$prop_def: {
      indeterminate?: boolean;
    };
  }

  export default LinearProgress;
}

declare module '@smui/snackbar/styled' {
  import type { SvelteComponent } from 'svelte';

  class Snackbar extends SvelteComponent {
    $$prop_def: {
      leading?: boolean;
      labelText?: string | null;
    };
  }
  class Label extends SvelteComponent {
    $$prop_def: Record<string, unknown>;
  }

  export default Snackbar;
  export { Label };
}

declare module '@smui/textfield/styled' {
  import type { SvelteComponent } from 'svelte';

  class TextField extends SvelteComponent {
    $$prop_def: {
      label?: string;
      value?: string;
      style?: string;
    };
  }

  export default TextField;
}
