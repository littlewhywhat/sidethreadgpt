import { render, type VNode } from "preact";

const mountInline = (
  container: Element,
  // biome-ignore lint/suspicious/noExplicitAny: VNode type parameter is contravariant
  vnode: VNode<any>,
): { dispose: () => void } => {
  render(vnode, container);
  return {
    dispose: () => render(null, container),
  };
};

export { mountInline };
