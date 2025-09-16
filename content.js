let conversationId = null;
const getConversationIdFromUrl = () => {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
};
const setConversationId = (doc = document) => {
  const hasAssistant = doc.querySelector('article[data-turn="assistant"]');
  if (hasAssistant) {
    conversationId = getConversationIdFromUrl();
  }
};

const OVERLAY_IFRAME_ID = "sidethreadgpt-overlay-iframe";
const sidebar = (() => {
  let styles = document.querySelector(`[style-tag="sidethreadgpt-styles"]`);
  const showSidebar = async (messageId) => {
    // add styles if not exists
    if (!styles) {
      styles = document.createElement("style");
      styles.setAttribute("style-id", "sidethreadgpt-styles");
      styles.setAttribute("style-state", "hidden");
      styles.appendChild(
        document.createTextNode(`iframe#${OVERLAY_IFRAME_ID} {}`)
      );
      document.head.appendChild(styles);
    }

    // recreate iframe
    const recreateIframe = async () => {
      return new Promise((resolve) => {
        const overlayIframe = document.createElement("iframe");
        overlayIframe.id = "sidethreadgpt-overlay-iframe";
        overlayIframe.style.zIndex = "20000";

        document.body
          .querySelectorAll(`#${OVERLAY_IFRAME_ID}`)
          .forEach((oldIframe) => {
            oldIframe.parentElement.removeChild(oldIframe);
          });

        overlayIframe.onload = async () => {
          const style = document.createElement("style");
          style.innerText = `
              body {
                margin: 0;
                padding: 0;
              }

              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
              `;
          overlayIframe.contentDocument.head.appendChild(style);
          const contentIframe = document.createElement("iframe");
          contentIframe.id = "sidethreadgpt-content-iframe";

          const convSuffix = conversationId ? `/${conversationId}` : "";
          const messageSuffix = messageId ? `/${messageId}` : "";
          contentIframe.src = `https://chatgpt.com/branch${convSuffix}${messageSuffix}`;
          overlayIframe.contentDocument.body.appendChild(contentIframe);
          contentIframe.onload = () => {
            const style = document.createElement("style");
            style.innerText = `
            div.h-header-height > div:nth-child(1) {
              display: none !important;
            }

            div.h-header-height > div:last-child {
              display: none !important;
            }
            `;
            contentIframe.contentDocument.head.appendChild(style);
            resolve();
          };
        };

        document.body.appendChild(overlayIframe);
      });
    };
    await recreateIframe();

    // show sidebar
    styles.setAttribute("style-state", "visible");
    styles.sheet.cssRules[0].style = `transform: translateX(calc(-33vw - 2%)) !important`;
  };

  const hideSidebar = () => {
    styles.setAttribute("style-state", "hidden");
    styles.sheet.cssRules[0].style = `transform: translateX(calc(33vw - 2%)) !important`;
  };

  const getIsSidebarVisible = () => {
    return styles.getAttribute("style-state") === "visible";
  };

  return {
    showSidebar,
    hideSidebar,
    getIsSidebarVisible,
  };
})();

const createSidebar = (() => {
  document.addEventListener("click", () => {
    const isSidebarVisible = sidebar.getIsSidebarVisible();
    if (isSidebarVisible) {
      sidebar.hideSidebar();
    }
  });

  return (messageId) => {
    sidebar.showSidebar(messageId);
  };
})();

const ADDED_ATTR = "data-cgpt-branching-added";
const SELECTOR =
  'article[data-turn="assistant"] > div > div > div.justify-start > div';

const createActionButton = () => {
  const child = document.createElement("button");
  child.className =
    "text-token-text-secondary hover:bg-token-bg-secondary rounded-lg";
  child.setAttribute("aria-label", "Bad response");
  child.setAttribute("aria-pressed", "false");
  child.setAttribute("data-testid", "bad-response-turn-action-button");
  child.setAttribute("data-state", "closed");

  const span = document.createElement("span");
  span.className = "flex items-center justify-center touch:w-10 h-8 w-8";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M3.35 1.675h13.4c0.921 0 1.675 0.754 1.675 1.675v10.05c0 0.921 -0.754 1.675 -1.675 1.675H5.025l-3.35 3.35V3.35c0 -0.921 0.754 -1.675 1.675 -1.675m0.98 11.725H16.75V3.35H3.35v11.03z"
  );
  path.setAttribute("fill", "currentColor");

  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", "M5.025 4.188h10.05v1.675H5.025z");
  path2.setAttribute("fill", "currentColor");

  const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path3.setAttribute("d", "M5.025 7.538h6.7v1.675H5.025z");
  path3.setAttribute("fill", "currentColor");

  const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path4.setAttribute("d", "M5.025 10.888h3.35v1.675H5.025z");
  path4.setAttribute("fill", "currentColor");

  svg.appendChild(path);
  svg.appendChild(path2);
  svg.appendChild(path3);
  svg.appendChild(path4);
  span.appendChild(svg);
  child.appendChild(span);

  child.addEventListener("click", () => {
    const article = child.closest("article");
    let messageId = undefined;
    if (article) {
      const nearestWithMessageId = child.closest("div[data-message-id]");
      if (nearestWithMessageId && article.contains(nearestWithMessageId)) {
        messageId = nearestWithMessageId.getAttribute("data-message-id");
      } else {
        const anyInArticle = article.querySelector("div[data-message-id]");
        messageId = anyInArticle
          ? anyInArticle.getAttribute("data-message-id")
          : undefined;
      }
    }
    createSidebar(messageId);
  });
  return child;
};

function injectInto(node, doc = document) {
  if (node.querySelector(`button[${ADDED_ATTR}="1"]`)) return;
  const btn = createActionButton(doc);
  btn.setAttribute(ADDED_ATTR, "1");
  const candidates = Array.from(
    node.querySelectorAll('[aria-haspopup="menu"]')
  );
  const target =
    candidates.find((el) => !el.closest("span")) || candidates[0] || null;
  let beforeEl = target;
  while (
    beforeEl &&
    beforeEl.parentElement &&
    beforeEl.parentElement !== node
  ) {
    beforeEl = beforeEl.parentElement;
  }
  if (beforeEl && beforeEl.parentElement === node)
    node.insertBefore(btn, beforeEl);
  else if (node.lastElementChild) node.insertBefore(btn, node.lastElementChild);
  else node.appendChild(btn);
}

function initInjection(doc = document) {
  setConversationId(doc);
  doc.querySelectorAll(SELECTOR).forEach((n) => injectInto(n, doc));
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (!(n instanceof Element)) continue;
        setConversationId(doc);
        if (n.matches && n.matches(SELECTOR)) injectInto(n, doc);
        if (n.querySelectorAll)
          n.querySelectorAll(SELECTOR).forEach((el) => injectInto(el, doc));
      }
    }
  });
  obs.observe(doc.body, { childList: true, subtree: true });
}

initInjection();
console.log("content.js loaded");
