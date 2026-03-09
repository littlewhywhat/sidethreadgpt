(() => {
  // src/lib/constants.js
  var OVERLAY_IFRAME_ID = "sidethreadgpt-overlay-iframe";
  var ACTIONS_SELECTOR = 'article[data-turn="assistant"] > div > div > div.justify-start > div';
  var BRANCH_BUTTON_ATTR = "data-stgpt-branch-button";
  var PIN_BUTTON_ATTR = "data-stgpt-pin-button";
  var PINS_STORAGE_KEY = "sidethreadgptPins";
  var PINS_ROOT_ID = "sidethreadgpt-pins-root";
  var MAX_PINS = 20;

  // src/lib/storage.js
  var normalizePins = (value) => Array.isArray(value) ? value.filter((pin) => pin && pin.id && pin.messageId) : [];
  var getPins = async () => {
    const result = await chrome.storage.local.get(PINS_STORAGE_KEY);
    return normalizePins(result[PINS_STORAGE_KEY]);
  };
  var savePin = async (pin) => {
    const currentPins = await getPins();
    const nextPins = [pin, ...currentPins.filter((item) => item.id !== pin.id)].slice(
      0,
      MAX_PINS
    );
    await chrome.storage.local.set({
      [PINS_STORAGE_KEY]: nextPins
    });
    return nextPins;
  };
  var removePin = async (pinId) => {
    const currentPins = await getPins();
    const nextPins = currentPins.filter((pin) => pin.id !== pinId);
    await chrome.storage.local.set({
      [PINS_STORAGE_KEY]: nextPins
    });
    return nextPins;
  };
  var subscribeToPins = (listener) => {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[PINS_STORAGE_KEY]) {
        return;
      }
      listener(normalizePins(changes[PINS_STORAGE_KEY].newValue));
    });
  };

  // src/lib/url.js
  var getConversationIdFromUrl = (locationLike = window.location) => {
    const parts = locationLike.pathname.split("/").filter(Boolean);
    const cIndex = parts.lastIndexOf("c");
    if (cIndex >= 0 && parts[cIndex + 1]) {
      return parts[cIndex + 1];
    }
    if (parts[0] === "branch" && parts[1]) {
      return parts[1];
    }
    return parts.length ? parts[parts.length - 1] : null;
  };
  var buildBranchUrl = ({ conversationId, messageId }) => {
    const segments = ["https://chatgpt.com/branch"];
    if (conversationId) {
      segments.push(conversationId);
    }
    if (messageId) {
      segments.push(messageId);
    }
    return segments.join("/");
  };

  // src/features/sidebar.js
  var stylesEl = null;
  var dismissInitialized = false;
  var ensureStyles = () => {
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
  var recreateIframe = ({ conversationId, messageId }) => new Promise((resolve) => {
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
      style.textContent = "body{margin:0;padding:0;}iframe{width:100%;height:100%;border:none;}";
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
        innerStyle.textContent = "div.h-header-height > div:nth-child(1){display:none!important;}div.h-header-height > div:last-child{display:none!important;}";
        contentDoc.head.appendChild(innerStyle);
        resolve();
      };
    };
    document.body.appendChild(overlayIframe);
  });
  var showSidebar = async ({ conversationId, messageId }) => {
    const styleTag = ensureStyles();
    await recreateIframe({ conversationId, messageId });
    styleTag.setAttribute("style-state", "visible");
    styleTag.sheet.cssRules[0].style.cssText = "transform: translateX(calc(-33vw - 2%)) !important";
  };
  var hideSidebar = () => {
    const styleTag = ensureStyles();
    styleTag.setAttribute("style-state", "hidden");
    styleTag.sheet.cssRules[0].style.cssText = "transform: translateX(calc(33vw - 2%)) !important";
  };
  var isSidebarVisible = () => ensureStyles().getAttribute("style-state") === "visible";
  var initSidebar = () => {
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

  // src/components/message-actions.js
  var getArticleMessageId = (article) => {
    const messageNode = article?.querySelector("div[data-message-id]");
    return messageNode?.getAttribute("data-message-id") || null;
  };
  var getArticleLabel = (article, messageId) => {
    const source = article?.querySelector("div[data-message-id]") || article;
    const text = source?.innerText?.replace(/\s+/g, " ").trim();
    return text?.slice(0, 120) || messageId || "Pinned thread";
  };
  var getMessageContext = (button) => {
    const article = button.closest("article");
    const messageId = getArticleMessageId(article);
    const conversationId = getConversationIdFromUrl();
    return {
      article,
      conversationId,
      messageId,
      label: getArticleLabel(article, messageId)
    };
  };
  var createButton = ({ markerAttr, ariaLabel, svgPaths, onClick }) => {
    const button = document.createElement("button");
    button.className = "text-token-text-secondary hover:bg-token-bg-secondary rounded-lg";
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
  var createBranchButton = () => createButton({
    markerAttr: BRANCH_BUTTON_ATTR,
    ariaLabel: "Open branch in sidebar",
    svgPaths: [
      "M3.35 1.675h13.4c0.921 0 1.675 0.754 1.675 1.675v10.05c0 0.921 -0.754 1.675 -1.675 1.675H5.025l-3.35 3.35V3.35c0 -0.921 0.754 -1.675 1.675 -1.675m0.98 11.725H16.75V3.35H3.35v11.03z",
      "M5.025 4.188h10.05v1.675H5.025z",
      "M5.025 7.538h6.7v1.675H5.025z",
      "M5.025 10.888h3.35v1.675H5.025z"
    ],
    onClick: async (button) => {
      const { conversationId, messageId } = getMessageContext(button);
      await showSidebar({ conversationId, messageId });
    }
  });
  var createPinButton = () => createButton({
    markerAttr: PIN_BUTTON_ATTR,
    ariaLabel: "Pin thread",
    svgPaths: [
      "M12.643 1.94a1.675 1.675 0 0 1 2.369 0l1.048 1.048a1.675 1.675 0 0 1 0 2.369l-1.819 1.819 1.16 4.061a.838.838 0 0 1-.208.813l-1.675 1.675a.838.838 0 0 1-.592.245H10.49l-4.925 4.924-.838-.838 4.924-4.925V7.074a.838.838 0 0 1 .245-.592l1.675-1.675a.838.838 0 0 1 .813-.208l4.061 1.16 1.819-1.819a1.675 1.675 0 0 1 0-2.369L17.215.523a1.675 1.675 0 0 1-2.369 0l-2.203 2.203z"
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
        savedAt: Date.now()
      });
    }
  });
  var insertBeforeMenu = (node, button) => {
    const candidates = Array.from(node.querySelectorAll('[aria-haspopup="menu"]'));
    const target = candidates.find((element) => !element.closest("span")) || candidates[0];
    let beforeElement = target;
    while (beforeElement && beforeElement.parentElement && beforeElement.parentElement !== node) {
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
  var injectInto = (node) => {
    if (!node.querySelector(`button[${BRANCH_BUTTON_ATTR}="1"]`)) {
      insertBeforeMenu(node, createBranchButton());
    }
    if (!node.querySelector(`button[${PIN_BUTTON_ATTR}="1"]`)) {
      insertBeforeMenu(node, createPinButton());
    }
  };
  var initMessageActions = (doc = document) => {
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
      subtree: true
    });
  };

  // src/components/pins-panel.js
  var root = null;
  var list = null;
  var initialized = false;
  var truncate = (value, maxLength) => {
    if (!value || value.length <= maxLength) {
      return value;
    }
    return `${value.slice(0, maxLength - 1)}\u2026`;
  };
  var ensureRoot = () => {
    if (root?.isConnected && list?.isConnected) {
      return;
    }
    root = document.getElementById(PINS_ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = PINS_ROOT_ID;
      const title = document.createElement("div");
      title.className = "sidethreadgpt-pins-title";
      title.textContent = "Pinned threads";
      list = document.createElement("div");
      list.className = "sidethreadgpt-pins-list";
      root.appendChild(title);
      root.appendChild(list);
      document.body.appendChild(root);
      return;
    }
    list = root.querySelector(".sidethreadgpt-pins-list");
  };
  var createPinItem = (pin) => {
    const item = document.createElement("div");
    item.className = "sidethreadgpt-pin-item";
    const openButton = document.createElement("button");
    openButton.className = "sidethreadgpt-pin-open";
    openButton.type = "button";
    openButton.textContent = truncate(pin.label || pin.messageId, 72);
    openButton.title = pin.label || pin.messageId;
    openButton.addEventListener("click", () => {
      window.location.href = buildBranchUrl(pin);
    });
    const removeButton = document.createElement("button");
    removeButton.className = "sidethreadgpt-pin-remove";
    removeButton.type = "button";
    removeButton.textContent = "\xD7";
    removeButton.setAttribute("aria-label", `Remove ${pin.label || pin.messageId}`);
    removeButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await removePin(pin.id);
    });
    item.appendChild(openButton);
    item.appendChild(removeButton);
    return item;
  };
  var render = (pins) => {
    ensureRoot();
    if (!pins.length) {
      root.hidden = true;
      list.replaceChildren();
      return;
    }
    root.hidden = false;
    list.replaceChildren(...pins.map((pin) => createPinItem(pin)));
  };
  var initPinsPanel = async () => {
    ensureRoot();
    render(await getPins());
    if (initialized) {
      return;
    }
    initialized = true;
    subscribeToPins(render);
  };

  // src/index.js
  var init = async () => {
    initSidebar();
    initMessageActions();
    await initPinsPanel();
  };
  init();
})();
