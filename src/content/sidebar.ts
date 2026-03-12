import { h } from "preact";
import { mountFloating } from "../common/content/floating/mount";
import { SidebarOverlay } from "./floating/components/SidebarOverlay";

type SidebarState = {
  host: HTMLDivElement;
  dispose: () => void;
};

let sidebar: SidebarState | null = null;

const hideSidebar = (): void => {
  if (!sidebar) return;
  const { host, dispose } = sidebar;
  sidebar = null;

  host.style.transition = "transform 1s ease-out";
  host.style.transform = "translateX(calc(100% + 1vw))";
  setTimeout(dispose, 1000);

  const promptInput = document.querySelector(
    'textarea[name="prompt-textarea"]',
  );
  if (promptInput instanceof HTMLElement) promptInput.focus();
};

const showSidebar = (
  conversationId: string | null,
  messageId: string | undefined,
): void => {
  if (sidebar) {
    hideSidebar();
    return;
  }

  const convSuffix = conversationId ? `/${conversationId}` : "";
  const messageSuffix = messageId ? `/${messageId}` : "";
  const src = `https://chatgpt.com/branch${convSuffix}${messageSuffix}`;

  const { host, dispose } = mountFloating(
    h(SidebarOverlay, { src, onClose: hideSidebar }),
  );
  sidebar = { host, dispose };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      host.style.transition = "transform 1s ease-out";
      host.style.transform = "translateX(0)";
    });
  });
};

const getIsSidebarVisible = (): boolean => sidebar !== null;

export { showSidebar, hideSidebar, getIsSidebarVisible };
