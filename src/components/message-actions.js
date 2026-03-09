import {
  ACTIONS_SELECTOR,
  BRANCH_BUTTON_ATTR,
  PIN_BUTTON_ATTR,
} from "../lib/constants.js";
import { savePin } from "../lib/storage.js";
import { getConversationIdFromUrl } from "../lib/url.js";
import { showSidebar } from "../features/sidebar.js";

const getArticleMessageId = (article) => {
  const messageNode = article?.querySelector("div[data-message-id]");
  return messageNode?.getAttribute("data-message-id") || null;
};

const getArticleLabel = (article, messageId) => {
  const source = article?.querySelector("div[data-message-id]") || article;
  const text = source?.innerText?.replace(/\s+/g, " ").trim();
  return text?.slice(0, 120) || messageId || "Pinned thread";
};

const getMessageContext = (button) => {
  const article = button.closest("article");
  const messageId = getArticleMessageId(article);
  const conversationId = getConversationIdFromUrl();

  return {
    article,
    conversationId,
    messageId,
    label: getArticleLabel(article, messageId),
  };
};

const createButton = ({ markerAttr, ariaLabel, svgPaths, onClick }) => {
  const button = document.createElement("button");
  button.className =
    "text-token-text-secondary hover:bg-token-bg-secondary rounded-lg";
  button.type = "button";
  button.setAttribute(markerAttr, "1");
  button.setAttribute("aria-label", ariaLabel);
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("data-state", "closed");

  const span = document.createElement("span");
  span.className = "flex items-center justify-center touch:w-10 h-8 w-8";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "currentColor");

  svgPaths.forEach((pathValue) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathValue);
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
  });

  span.appendChild(svg);
  button.appendChild(span);
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    await onClick(button);
  });

  return button;
};

const createBranchButton = () =>
  createButton({
    markerAttr: BRANCH_BUTTON_ATTR,
    ariaLabel: "Open branch in sidebar",
    svgPaths: [
      "M3.35 1.675h13.4c0.921 0 1.675 0.754 1.675 1.675v10.05c0 0.921 -0.754 1.675 -1.675 1.675H5.025l-3.35 3.35V3.35c0 -0.921 0.754 -1.675 1.675 -1.675m0.98 11.725H16.75V3.35H3.35v11.03z",
      "M5.025 4.188h10.05v1.675H5.025z",
      "M5.025 7.538h6.7v1.675H5.025z",
      "M5.025 10.888h3.35v1.675H5.025z",
    ],
    onClick: async (button) => {
      const { conversationId, messageId } = getMessageContext(button);
      await showSidebar({ conversationId, messageId });
    },
  });

const createPinButton = () =>
  createButton({
    markerAttr: PIN_BUTTON_ATTR,
    ariaLabel: "Pin thread",
    svgPaths: [
      "M12.643 1.94a1.675 1.675 0 0 1 2.369 0l1.048 1.048a1.675 1.675 0 0 1 0 2.369l-1.819 1.819 1.16 4.061a.838.838 0 0 1-.208.813l-1.675 1.675a.838.838 0 0 1-.592.245H10.49l-4.925 4.924-.838-.838 4.924-4.925V7.074a.838.838 0 0 1 .245-.592l1.675-1.675a.838.838 0 0 1 .813-.208l4.061 1.16 1.819-1.819a1.675 1.675 0 0 1 0-2.369L17.215.523a1.675 1.675 0 0 1-2.369 0l-2.203 2.203z",
    ],
    onClick: async (button) => {
      const { conversationId, messageId, label } = getMessageContext(button);

      if (!messageId) {
        return;
      }

      await savePin({
        id: [conversationId || "root", messageId].join(":"),
        conversationId,
        messageId,
        label,
        savedAt: Date.now(),
      });
    },
  });

const insertBeforeMenu = (node, button) => {
  const candidates = Array.from(node.querySelectorAll('[aria-haspopup="menu"]'));
  const target = candidates.find((element) => !element.closest("span")) || candidates[0];
  let beforeElement = target;

  while (
    beforeElement &&
    beforeElement.parentElement &&
    beforeElement.parentElement !== node
  ) {
    beforeElement = beforeElement.parentElement;
  }

  if (beforeElement && beforeElement.parentElement === node) {
    node.insertBefore(button, beforeElement);
    return;
  }

  if (node.lastElementChild) {
    node.insertBefore(button, node.lastElementChild);
    return;
  }

  node.appendChild(button);
};

const injectInto = (node) => {
  if (!node.querySelector(`button[${BRANCH_BUTTON_ATTR}="1"]`)) {
    insertBeforeMenu(node, createBranchButton());
  }

  if (!node.querySelector(`button[${PIN_BUTTON_ATTR}="1"]`)) {
    insertBeforeMenu(node, createPinButton());
  }
};

export const initMessageActions = (doc = document) => {
  doc.querySelectorAll(ACTIONS_SELECTOR).forEach((node) => injectInto(node));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (node.matches?.(ACTIONS_SELECTOR)) {
          injectInto(node);
        }

        node.querySelectorAll?.(ACTIONS_SELECTOR).forEach((element) => injectInto(element));
      });
    });
  });

  observer.observe(doc.body, {
    childList: true,
    subtree: true,
  });
};
