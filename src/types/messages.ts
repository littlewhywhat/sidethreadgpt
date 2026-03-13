type Pin = {
  conversationId: string;
  messageId: string;
  preview: string;
  pinnedAt: number;
};

type BackgroundMessages = {
  "pins-get": {
    request: undefined;
    response: Pin[];
  };
  "pins-add": {
    request: Pin;
    response: undefined;
  };
  "pins-remove": {
    request: { conversationId: string; messageId: string };
    response: undefined;
  };
  "pins-update-preview": {
    request: {
      conversationId: string;
      messageId: string;
      preview: string;
    };
    response: undefined;
  };
  "request-show-unpin-modal": {
    request: Pin;
    response: undefined;
  };
};

type ContentMessages = {
  "show-unpin-modal": {
    request: Pin;
    response: undefined;
  };
};

export type { Pin, BackgroundMessages, ContentMessages };
