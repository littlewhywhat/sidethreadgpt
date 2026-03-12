import { h, render, type VNode } from "preact";

const mountFloating = (
  // biome-ignore lint/suspicious/noExplicitAny: VNode type parameter is contravariant
  vnode: VNode<any>,
): { host: HTMLDivElement; dispose: () => void } => {
  const bgColor = getComputedStyle(document.body).backgroundColor;
  const host = document.createElement("div");
  host.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "top:2%",
    "right:1%",
    "width:33vw",
    "height:96%",
    "transform:translateX(calc(100% + 1vw))",
    "border-radius:10px",
    "overflow:hidden",
    "border:solid 1px rgba(155,155,155,0.18)",
    "box-shadow:-4px 0 12px 0 rgba(0,0,0,0.12)",
    `background-color:${bgColor}`,
  ].join(";");

  host.addEventListener("click", (e) => e.stopPropagation());
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
