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
  const msgEl = article.querySelector("div[data-message-id]");
  const text = (msgEl ?? article).textContent ?? "";
  return text
    .trim()
    .replace(/^ChatGPT\s*(said)?:?\s*/i, "")
    .slice(0, 60);
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          aria-hidden="true"
          class="icon"
          style={pinned ? { opacity: 1 } : { opacity: 0.7 }}
        >
          <use
            href="/cdn/assets/sprites-core-fk4oovux.svg#23d2ff"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
};

export { PinButton };
