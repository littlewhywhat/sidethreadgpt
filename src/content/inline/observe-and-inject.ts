type ObserveConfig = {
  selector: string;
  mount: (target: Element) => (() => void) | null;
  markerAttr: string;
  trigger?: "mutation" | "visible";
};

const observeAndInject = (config: ObserveConfig): { dispose: () => void } => {
  const { selector, mount, markerAttr, trigger = "mutation" } = config;
  const disposers = new Map<Element, () => void>();
  const useVisibility = trigger === "visible";

  const mountElement = (el: Element) => {
    if (el.hasAttribute(markerAttr)) return;
    el.setAttribute(markerAttr, "1");
    const dispose = mount(el);
    if (dispose) disposers.set(el, dispose);
  };

  let intersectionObserver: IntersectionObserver | null = null;

  if (useVisibility) {
    intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          mountElement(entry.target);
          intersectionObserver?.unobserve(entry.target);
        }
      }
    });
  }

  const handleElement = useVisibility
    ? (el: Element) => {
        if (!el.hasAttribute(markerAttr)) {
          intersectionObserver?.observe(el);
        }
      }
    : mountElement;

  document.querySelectorAll(selector).forEach(handleElement);

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(selector)) handleElement(node);
        for (const el of node.querySelectorAll(selector)) handleElement(el);
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return {
    dispose: () => {
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
      for (const d of disposers.values()) d();
      disposers.clear();
    },
  };
};

export { observeAndInject };
export type { ObserveConfig };
