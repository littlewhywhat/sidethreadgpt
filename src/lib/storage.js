import { MAX_PINS, PINS_STORAGE_KEY } from "./constants.js";

const normalizePins = (value) =>
  Array.isArray(value)
    ? value.filter((pin) => pin && pin.id && pin.messageId)
    : [];

export const getPins = async () => {
  const result = await chrome.storage.local.get(PINS_STORAGE_KEY);
  return normalizePins(result[PINS_STORAGE_KEY]);
};

export const savePin = async (pin) => {
  const currentPins = await getPins();
  const nextPins = [pin, ...currentPins.filter((item) => item.id !== pin.id)].slice(
    0,
    MAX_PINS
  );

  await chrome.storage.local.set({
    [PINS_STORAGE_KEY]: nextPins,
  });

  return nextPins;
};

export const removePin = async (pinId) => {
  const currentPins = await getPins();
  const nextPins = currentPins.filter((pin) => pin.id !== pinId);

  await chrome.storage.local.set({
    [PINS_STORAGE_KEY]: nextPins,
  });

  return nextPins;
};

export const subscribeToPins = (listener) => {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[PINS_STORAGE_KEY]) {
      return;
    }

    listener(normalizePins(changes[PINS_STORAGE_KEY].newValue));
  });
};
