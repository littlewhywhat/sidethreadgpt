import type { BackgroundMessages, ContentMessages } from "../types/messages";

const sendMessage = <K extends keyof BackgroundMessages>(
  type: K,
  payload: BackgroundMessages[K]["request"],
): Promise<BackgroundMessages[K]["response"]> =>
  chrome.runtime.sendMessage({ type, payload });

const onContentMessage = <K extends keyof ContentMessages>(
  type: K,
  handler: (
    payload: ContentMessages[K]["request"],
    sender: chrome.runtime.MessageSender,
  ) => Promise<ContentMessages[K]["response"]> | ContentMessages[K]["response"],
): (() => void) => {
  const listener = (
    message: { type: string; payload: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.type !== type) return false;
    const result = handler(
      message.payload as ContentMessages[K]["request"],
      sender,
    );
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true;
    }
    sendResponse(result);
    return false;
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
};

export { sendMessage, onContentMessage };
