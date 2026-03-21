const getConversationIdFromUrl = (): string | null => {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
};

const isBranchingAvailable = (): boolean => {
  const path = location.pathname;
  if (path.includes("WEB:")) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length >= 2 && parts[0] === "c";
};

const getLastAssistantMessageId = (): string | undefined => {
  const sections = document.querySelectorAll('section[data-turn="assistant"]');
  if (!sections.length) return undefined;
  const lastSection = sections[sections.length - 1];
  const messageEl = lastSection.querySelector("div[data-message-id]");
  return messageEl?.getAttribute("data-message-id") ?? undefined;
};

const getBranchUrl = (
  conversationId: string | null,
  messageId: string | undefined,
): string => {
  const convSuffix = conversationId ? `/${conversationId}` : "";
  const messageSuffix = messageId ? `/${messageId}` : "";
  return `https://chatgpt.com/branch${convSuffix}${messageSuffix}`;
};

export {
  getConversationIdFromUrl,
  isBranchingAvailable,
  getLastAssistantMessageId,
  getBranchUrl,
};
