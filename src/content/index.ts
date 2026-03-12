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

initBranchChatButtons();

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
