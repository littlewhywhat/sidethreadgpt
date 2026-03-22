import { h } from "preact";
import { mountFloating } from "../../common/content/floating/mount";
import { getBranchUrl } from "../../utils/chatgpt";
import { trackAction } from "../analytics";
import { SidebarOverlay } from "./components/SidebarOverlay";

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

  const src = getBranchUrl(conversationId, messageId);
  const bgColor = getComputedStyle(document.body).backgroundColor;

  const { host, dispose } = mountFloating(
    h(SidebarOverlay, {
      src,
      onClose: () => {
        trackAction("close_branch");
        hideSidebar();
      },
    }),
    [
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
    ].join(";"),
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
