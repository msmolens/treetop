import path from 'node:path';

// Get target browser
const getTreetopTarget = () => {
  const target = process.env.TREETOP_TARGET;
  if (!target || (target !== 'firefox' && target !== 'chrome')) {
    throw new Error("target must be 'firefox' or 'chrome'");
  }

  return target;
};

// Get dist directory name based on target browser
export const getTreetopDistName = () => {
  const target = getTreetopTarget();
  return path.join('dist', target);
};
