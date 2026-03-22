import { useRef } from "preact/hooks";
import { trackAction } from "../../analytics";
import * as tooltip from "../tooltip";

type BranchButtonProps = {
  available: boolean;
  onBranch: (messageId: string | undefined) => void;
};

const BranchButton = ({ available, onBranch }: BranchButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const tooltipTitle = available ? "Branch conversation" : "Not available";
  const tooltipSubs = available
    ? ["Ctrl+Shift+B", "Esc to close"]
    : ["in branches or when logged out"];

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    const btn = ref.current;
    if (!btn) return;
    const section = btn.closest("section");
    let messageId: string | undefined;
    if (section) {
      const nearest = btn.closest("div[data-message-id]");
      if (nearest && section.contains(nearest)) {
        messageId = nearest.getAttribute("data-message-id") ?? undefined;
      } else {
        const any = section.querySelector("div[data-message-id]");
        messageId = any?.getAttribute("data-message-id") ?? undefined;
      }
    }
    trackAction("open_branch");
    onBranch(messageId);
  };

  return (
    <button
      ref={ref}
      type="button"
      class="text-token-text-secondary hover:bg-token-bg-secondary rounded-lg"
      aria-label="Bad response"
      aria-pressed="false"
      data-testid="bad-response-turn-action-button"
      data-state="closed"
      style={available ? undefined : { opacity: 0.4, cursor: "not-allowed" }}
      onMouseEnter={() => {
        if (ref.current) tooltip.show(ref.current, tooltipTitle, tooltipSubs);
      }}
      onMouseLeave={() => tooltip.hide()}
      onClick={handleClick}
    >
      <span class="flex items-center justify-center touch:w-10 h-8 w-8">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.35 1.675h13.4c0.921 0 1.675 0.754 1.675 1.675v10.05c0 0.921 -0.754 1.675 -1.675 1.675H5.025l-3.35 3.35V3.35c0 -0.921 0.754 -1.675 1.675 -1.675m0.98 11.725H16.75V3.35H3.35v11.03z"
            fill="currentColor"
          />
          <path d="M5.025 4.188h10.05v1.675H5.025z" fill="currentColor" />
          <path d="M5.025 7.538h6.7v1.675H5.025z" fill="currentColor" />
          <path d="M5.025 10.888h3.35v1.675H5.025z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
};

export { BranchButton };
