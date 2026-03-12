import { h, render, type VNode } from "preact";

const mountFloating = (
  // biome-ignore lint/suspicious/noExplicitAny: VNode type parameter is contravariant
  vnode: VNode<any>,
  hostStyles: string,
): { host: HTMLDivElement; dispose: () => void } => {
  const host = document.createElement("div");
  host.style.cssText = hostStyles;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  render(h("div", { style: "width:100%;height:100%;" }, vnode), shadow);

  return {
    host,
    dispose: () => {
      render(null, shadow);
      host.remove();
    },
  };
};

export { mountFloating };
