import type { BackgroundMessages } from "../types/messages";

const sendMessage = <K extends keyof BackgroundMessages>(
  type: K,
  payload: BackgroundMessages[K]["request"],
): Promise<BackgroundMessages[K]["response"]> =>
  chrome.runtime.sendMessage({ type, payload });

export { sendMessage };
