import { useEffect, useRef, useState } from "preact/hooks";
import { getConversationIdFromUrl } from "../../conversation";
import { addPin, isPinned, onPinsChange, removePin } from "../../storage";
import * as tooltip from "../../tooltip";

type PinButtonProps = {
  available: boolean;
};

const resolveMessageId = (btn: HTMLElement): string | undefined => {
  const article = btn.closest("article");
  if (!article) return undefined;
  const nearest = btn.closest("div[data-message-id]");
  if (nearest && article.contains(nearest))
    return nearest.getAttribute("data-message-id") ?? undefined;
  const any = article.querySelector("div[data-message-id]");
  return any?.getAttribute("data-message-id") ?? undefined;
};

const extractPreview = (btn: HTMLElement): string => {
  const article = btn.closest("article");
  if (!article) return "";
  const text = article.textContent ?? "";
  return text.trim().slice(0, 60);
};

const PinButton = ({ available }: PinButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!available) return;
      const el = ref.current;
      if (!el) return;
      const conversationId = getConversationIdFromUrl();
      const messageId = resolveMessageId(el);
      if (conversationId && messageId) {
        setPinned(isPinned(conversationId, messageId));
      }
    };
    check();
    return onPinsChange(check);
  }, [available]);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    const el = ref.current;
    if (!el) return;
    const conversationId = getConversationIdFromUrl();
    const messageId = resolveMessageId(el);
    if (!conversationId || !messageId) return;

    if (pinned) {
      removePin(conversationId, messageId);
    } else {
      addPin({
        conversationId,
        messageId,
        preview: extractPreview(el),
        pinnedAt: Date.now(),
      });
    }
  };

  const tooltipTitle = !available
    ? "Not available"
    : pinned
      ? "Unpin message"
      : "Pin message";

  return (
    <button
      ref={ref}
      type="button"
      class="text-token-text-secondary hover:bg-token-bg-secondary rounded-lg"
      aria-label={tooltipTitle}
      style={available ? undefined : { opacity: 0.4, cursor: "not-allowed" }}
      onMouseEnter={() => {
        if (ref.current) tooltip.show(ref.current, tooltipTitle);
      }}
      onMouseLeave={() => tooltip.hide()}
      onClick={handleClick}
    >
      <span class="flex items-center justify-center touch:w-10 h-8 w-8">
        {pinned ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M16 3a1 1 0 0 0-1.4-.2L9.7 6.6 8.3 5.2a1 1 0 0 0-1.4 0l-2 2a1 1 0 0 0 0 1.4l1.4 1.4-3 4.8a1 1 0 0 0 .2 1.4l.2.1-2.4 2.4a1 1 0 1 0 1.4 1.4l2.4-2.4.1.2a1 1 0 0 0 1.4.2l4.8-3 1.4 1.4a1 1 0 0 0 1.4 0l2-2a1 1 0 0 0 0-1.4l-1.4-1.4 3.8-4.9A1 1 0 0 0 16 3z" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 17v5" />
            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h6.28" />
            <path d="M19 16h-4.28" />
            <path d="M15.72 16l3.17-1.59a2 2 0 0 0 1.11-1.79V10a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2.76" />
            <path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
          </svg>
        )}
      </span>
    </button>
  );
};

export { PinButton };
