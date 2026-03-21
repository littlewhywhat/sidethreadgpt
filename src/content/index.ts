import { h } from "preact";
import { mountInline } from "../common/content/inline/mount";
import {
  getConversationIdFromUrl,
  getLastAssistantMessageId,
  isBranchingAvailable,
} from "../utils/chatgpt";
import { trackAction } from "./analytics";
import { UnpinModalHost } from "./floating/components/UnpinModalHost";
import {
  getIsSidebarVisible,
  hideSidebar,
  showSidebar,
} from "./floating/sidebar";
import { initBranchChatButtons } from "./inline/inject-branch-button";
import { initPinButtons } from "./inline/inject-pin-button";
import { injectPinsSection } from "./sidebar/inject-pins-section";

initBranchChatButtons();
initPinButtons();
injectPinsSection();

const modalContainer = document.createElement("div");
document.body.appendChild(modalContainer);
mountInline(modalContainer, h(UnpinModalHost, null));

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
      trackAction("close_branch");
      hideSidebar();
    } else {
      trackAction("open_branch");
      showSidebar(getConversationIdFromUrl(), getLastAssistantMessageId());
    }
  }
});
