import { OVERLAY_IFRAME_ID } from "../lib/constants.js";
import { buildBranchUrl } from "../lib/url.js";

let stylesEl = null;
let dismissInitialized = false;

const ensureStyles = () => {
  if (stylesEl?.isConnected) {
    return stylesEl;
  }

  stylesEl = document.querySelector('[style-id="sidethreadgpt-styles"]');

  if (stylesEl) {
    return stylesEl;
  }

  stylesEl = document.createElement("style");
  stylesEl.setAttribute("style-id", "sidethreadgpt-styles");
  stylesEl.setAttribute("style-state", "hidden");
  stylesEl.textContent = `iframe#${OVERLAY_IFRAME_ID} {}`;
  document.head.appendChild(stylesEl);

  return stylesEl;
};

const recreateIframe = ({ conversationId, messageId }) =>
  new Promise((resolve) => {
    const overlayIframe = document.createElement("iframe");
    overlayIframe.id = OVERLAY_IFRAME_ID;
    overlayIframe.style.zIndex = "20000";

    document.body.querySelectorAll(`#${OVERLAY_IFRAME_ID}`).forEach((oldIframe) => {
      oldIframe.remove();
    });

    overlayIframe.onload = () => {
      const overlayDoc = overlayIframe.contentDocument;

      if (!overlayDoc) {
        resolve();
        return;
      }

      const style = document.createElement("style");
      style.textContent =
        "body{margin:0;padding:0;}iframe{width:100%;height:100%;border:none;}";
      overlayDoc.head.appendChild(style);

      const contentIframe = document.createElement("iframe");
      contentIframe.id = "sidethreadgpt-content-iframe";
      contentIframe.src = buildBranchUrl({ conversationId, messageId });
      overlayDoc.body.appendChild(contentIframe);

      contentIframe.onload = () => {
        const contentDoc = contentIframe.contentDocument;

        if (!contentDoc) {
          resolve();
          return;
        }

        const innerStyle = document.createElement("style");
        innerStyle.textContent =
          "div.h-header-height > div:nth-child(1){display:none!important;}div.h-header-height > div:last-child{display:none!important;}";
        contentDoc.head.appendChild(innerStyle);
        resolve();
      };
    };

    document.body.appendChild(overlayIframe);
  });

export const showSidebar = async ({ conversationId, messageId }) => {
  const styleTag = ensureStyles();

  await recreateIframe({ conversationId, messageId });

  styleTag.setAttribute("style-state", "visible");
  styleTag.sheet.cssRules[0].style.cssText =
    "transform: translateX(calc(-33vw - 2%)) !important";
};

export const hideSidebar = () => {
  const styleTag = ensureStyles();
  styleTag.setAttribute("style-state", "hidden");
  styleTag.sheet.cssRules[0].style.cssText =
    "transform: translateX(calc(33vw - 2%)) !important";
};

export const isSidebarVisible = () =>
  ensureStyles().getAttribute("style-state") === "visible";

export const initSidebar = () => {
  ensureStyles();

  if (dismissInitialized) {
    return;
  }

  dismissInitialized = true;

  document.addEventListener("click", () => {
    if (isSidebarVisible()) {
      hideSidebar();
    }
  });
};
