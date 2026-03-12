import { h } from "preact";
import { mountInline } from "../common/content/inline/mount";
import { observe } from "../common/content/inline/observe";
import {
  getConversationIdFromUrl,
  getLastAssistantMessageId,
  isBranchingAvailable,
} from "../utils/chatgpt";
import { BranchButton } from "./inline/components/BranchButton";
import { getIsSidebarVisible, hideSidebar, showSidebar } from "./sidebar";

const ADDED_ATTR = "data-cgpt-branching-added";
const SELECTOR =
  'article[data-turn="assistant"] > div > div > div.justify-start > div';

observe({
  selector: SELECTOR,
  onElement: (node) => {
    const container = document.createElement("div");

    const candidates = Array.from(
      node.querySelectorAll('[aria-haspopup="menu"]'),
    );
    const target =
      candidates.find((el) => !el.closest("span")) ?? candidates[0] ?? null;
    let beforeEl: Element | null = target;
    while (beforeEl?.parentElement && beforeEl.parentElement !== node) {
      beforeEl = beforeEl.parentElement;
    }

    if (beforeEl?.parentElement === node)
      node.insertBefore(container, beforeEl);
    else if (node.lastElementChild)
      node.insertBefore(container, node.lastElementChild);
    else node.appendChild(container);

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
  markerAttr: ADDED_ATTR,
});

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
