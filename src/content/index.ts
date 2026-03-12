import { h } from "preact";
import {
  getConversationIdFromUrl,
  getLastAssistantMessageId,
  isBranchingAvailable,
} from "./conversation";
import { BranchButton } from "./inline/components/BranchButton";
import { PinButton } from "./inline/components/PinButton";
import { mountInline } from "./inline/mount";
import { observeAndInject } from "./inline/observe-and-inject";
import { getIsSidebarVisible, hideSidebar, showSidebar } from "./sidebar";
import { injectPinsSection } from "./sidebar/inject-pins-section";

const BRANCH_ATTR = "data-cgpt-branching-added";
const PIN_ATTR = "data-cgpt-pin-added";
const SELECTOR =
  'article[data-turn="assistant"] > div > div > div.justify-start > div';

const findInsertionTarget = (node: Element): Element | null => {
  const candidates = Array.from(
    node.querySelectorAll('[aria-haspopup="menu"]'),
  );
  const target =
    candidates.find((el) => !el.closest("span")) ?? candidates[0] ?? null;
  let beforeEl: Element | null = target;
  while (beforeEl?.parentElement && beforeEl.parentElement !== node) {
    beforeEl = beforeEl.parentElement;
  }
  return beforeEl?.parentElement === node ? beforeEl : null;
};

const insertContainer = (node: Element): HTMLDivElement => {
  const container = document.createElement("div");
  const before = findInsertionTarget(node);
  if (before) node.insertBefore(container, before);
  else if (node.lastElementChild)
    node.insertBefore(container, node.lastElementChild);
  else node.appendChild(container);
  return container;
};

observeAndInject({
  selector: SELECTOR,
  mount: (node) => {
    const container = insertContainer(node);
    const { dispose } = mountInline(
      container,
      h(BranchButton, {
        available: isBranchingAvailable(),
        onBranch: (messageId) => {
          showSidebar(getConversationIdFromUrl(), messageId);
        },
      }),
    );
    return () => {
      dispose();
      container.remove();
    };
  },
  markerAttr: BRANCH_ATTR,
});

observeAndInject({
  selector: SELECTOR,
  mount: (node) => {
    const container = insertContainer(node);
    const { dispose } = mountInline(
      container,
      h(PinButton, { available: isBranchingAvailable() }),
    );
    return () => {
      dispose();
      container.remove();
    };
  },
  markerAttr: PIN_ATTR,
});

injectPinsSection();

document.addEventListener("click", () => {
  if (getIsSidebarVisible()) hideSidebar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && getIsSidebarVisible()) {
    hideSidebar();
    return;
  }
  if (e.ctrlKey && e.shiftKey && e.key === "B") {
    e.preventDefault();
    if (!isBranchingAvailable()) return;
    if (getIsSidebarVisible()) {
      hideSidebar();
    } else {
      showSidebar(getConversationIdFromUrl(), getLastAssistantMessageId());
    }
  }
});
