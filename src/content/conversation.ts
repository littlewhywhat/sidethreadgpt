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
  const articles = document.querySelectorAll('article[data-turn="assistant"]');
  if (!articles.length) return undefined;
  const lastArticle = articles[articles.length - 1];
  const messageEl = lastArticle.querySelector("div[data-message-id]");
  return messageEl?.getAttribute("data-message-id") ?? undefined;
};

export {
  getConversationIdFromUrl,
  isBranchingAvailable,
  getLastAssistantMessageId,
};
