type Pin = {
  conversationId: string;
  messageId: string;
  preview: string;
  pinnedAt: number;
};

const STORAGE_KEY = "sidethreadgpt-pins";
const MAX_PINS = 1000;

type Listener = (pins: Pin[]) => void;
const listeners = new Set<Listener>();

const readPins = (): Pin[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Pin[]) : [];
  } catch {
    return [];
  }
};

const writePins = (pins: Pin[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  for (const fn of listeners) fn(pins);
};

const getPins = (): Pin[] => readPins();

const addPin = (pin: Pin): void => {
  const pins = readPins().filter(
    (p) =>
      !(
        p.conversationId === pin.conversationId && p.messageId === pin.messageId
      ),
  );
  pins.unshift(pin);
  writePins(pins.slice(0, MAX_PINS));
};

const removePin = (conversationId: string, messageId: string): void => {
  const pins = readPins().filter(
    (p) => !(p.conversationId === conversationId && p.messageId === messageId),
  );
  writePins(pins);
};

const isPinned = (conversationId: string, messageId: string): boolean =>
  readPins().some(
    (p) => p.conversationId === conversationId && p.messageId === messageId,
  );

const onPinsChange = (cb: Listener): (() => void) => {
  listeners.add(cb);

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(readPins());
  };
  window.addEventListener("storage", storageHandler);

  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", storageHandler);
  };
};

const updatePinPreview = (
  conversationId: string,
  messageId: string,
  preview: string,
): void => {
  const pins = readPins().map((p) =>
    p.conversationId === conversationId && p.messageId === messageId
      ? { ...p, preview }
      : p,
  );
  writePins(pins);
};

export { getPins, addPin, removePin, isPinned, onPinsChange, updatePinPreview };
export type { Pin };
