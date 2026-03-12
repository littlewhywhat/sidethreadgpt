import {
  getConversationIdFromUrl,
  getLastAssistantMessageId,
  isBranchingAvailable,
} from "../utils/chatgpt";
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
