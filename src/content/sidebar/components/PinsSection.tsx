import { useEffect, useState } from "preact/hooks";
import { getPins, onPinsChange, type Pin, removePin } from "../../storage";

const VISIBLE_LIMIT = 5;

const PinsSection = () => {
  const [pins, setPins] = useState<Pin[]>(getPins);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => onPinsChange(setPins), []);

  if (pins.length === 0) return null;

  const visible = expanded ? pins : pins.slice(0, VISIBLE_LIMIT);
  const hasMore = pins.length > VISIBLE_LIMIT;

  const handleUnpin = (e: MouseEvent, pin: Pin) => {
    e.preventDefault();
    e.stopPropagation();
    removePin(pin.conversationId, pin.messageId);
  };

  return (
    <div class="group/sidebar-expando-section mb-[var(--sidebar-expanded-section-margin-bottom)]">
      <button
        type="button"
        aria-expanded={!collapsed}
        class="text-token-text-tertiary flex w-full items-center justify-start gap-0.5 px-4 py-1.5"
        onClick={() => setCollapsed((c) => !c)}
      >
        <h2 class="__menu-label" data-no-spacing="true">
          Pinned
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          aria-hidden="true"
          class="invisible h-3 w-3 shrink-0 group-hover/sidebar-expando-section:visible"
          style={{
            transform: collapsed ? "rotate(-90deg)" : undefined,
            transition: "transform 0.15s ease",
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      {!collapsed &&
        visible.map((pin) => (
          <a
            key={`${pin.conversationId}:${pin.messageId}`}
            tabIndex={0}
            data-fill=""
            class="group __menu-item hoverable"
            data-sidebar-item="true"
            href={`/branch/${pin.conversationId}/${pin.messageId}`}
            data-discover="true"
          >
            <div class="flex min-w-0 items-center gap-1.5">
              <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  class="icon"
                >
                  <path d="M16 3a1 1 0 0 0-1.4-.2L9.7 6.6 8.3 5.2a1 1 0 0 0-1.4 0l-2 2a1 1 0 0 0 0 1.4l1.4 1.4-3 4.8a1 1 0 0 0 .2 1.4l.2.1-2.4 2.4a1 1 0 1 0 1.4 1.4l2.4-2.4.1.2a1 1 0 0 0 1.4.2l4.8-3 1.4 1.4a1 1 0 0 0 1.4 0l2-2a1 1 0 0 0 0-1.4l-1.4-1.4 3.8-4.9A1 1 0 0 0 16 3z" />
                </svg>
              </div>
              <div class="flex min-w-0 grow items-center gap-2.5">
                <div class="truncate">{pin.preview || "Pinned message"}</div>
              </div>
            </div>
            <div class="trailing highlight text-token-text-tertiary">
              <button
                tabIndex={0}
                data-trailing-button=""
                class="__menu-item-trailing-btn"
                type="button"
                onClick={(e: MouseEvent) => handleUnpin(e, pin)}
              >
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    class="icon"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </div>
              </button>
            </div>
          </a>
        ))}
      {!collapsed && hasMore && (
        <button
          type="button"
          class="group __menu-item hoverable gap-1.5 w-full"
          data-sidebar-item="true"
          onClick={() => setExpanded((e) => !e)}
        >
          <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="icon"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </div>
          <div class="flex min-w-0 grow items-center gap-2.5">
            <div class="truncate">{expanded ? "Show less" : "More"}</div>
          </div>
        </button>
      )}
    </div>
  );
};

export { PinsSection };
