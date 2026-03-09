import { initMessageActions } from "./components/message-actions.js";
import { initPinsPanel } from "./components/pins-panel.js";
import { initSidebar } from "./features/sidebar.js";

const init = async () => {
  initSidebar();
  initMessageActions();
  await initPinsPanel();
};

init();
