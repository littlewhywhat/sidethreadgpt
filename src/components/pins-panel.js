import { PINS_ROOT_ID } from "../lib/constants.js";
import { buildBranchUrl } from "../lib/url.js";
import { getPins, removePin, subscribeToPins } from "../lib/storage.js";

let root = null;
let list = null;
let initialized = false;

const truncate = (value, maxLength) => {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
};

const ensureRoot = () => {
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

const createPinItem = (pin) => {
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
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", `Remove ${pin.label || pin.messageId}`);
  removeButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    await removePin(pin.id);
  });

  item.appendChild(openButton);
  item.appendChild(removeButton);

  return item;
};

const render = (pins) => {
  ensureRoot();

  if (!pins.length) {
    root.hidden = true;
    list.replaceChildren();
    return;
  }

  root.hidden = false;
  list.replaceChildren(...pins.map((pin) => createPinItem(pin)));
};

export const initPinsPanel = async () => {
  ensureRoot();
  render(await getPins());

  if (initialized) {
    return;
  }

  initialized = true;
  subscribeToPins(render);
};
