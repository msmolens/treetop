import Options from './Options.svelte';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Missing app element');
}

new Options({ target });
