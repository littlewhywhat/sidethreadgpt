export const getConversationIdFromUrl = (locationLike = window.location) => {
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

export const buildBranchUrl = ({ conversationId, messageId }) => {
  const segments = ["https://chatgpt.com/branch"];

  if (conversationId) {
    segments.push(conversationId);
  }

  if (messageId) {
    segments.push(messageId);
  }

  return segments.join("/");
};
