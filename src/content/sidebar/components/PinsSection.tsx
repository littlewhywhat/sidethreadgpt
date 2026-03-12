import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  getPins,
  onPinsChange,
  type Pin,
  removePin,
  updatePinPreview,
} from "../../storage";

const VISIBLE_LIMIT = 5;

const PinItem = ({ pin }: { pin: Pin }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(pin.preview);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pinKey = `${pin.conversationId}:${pin.messageId}`;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== pin.preview) {
      updatePinPreview(pin.conversationId, pin.messageId, trimmed);
    }
    setRenaming(false);
  }, [renameValue, pin]);

  const handleMenuClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleUnpin = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    removePin(pin.conversationId, pin.messageId);
  };

  const handleStartRename = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setRenameValue(pin.preview);
    setRenaming(true);
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setRenaming(false);
    }
  };

  const handleLinkClick = (e: MouseEvent) => {
    if (renaming) e.preventDefault();
  };

  return (
    <a
      key={pinKey}
      tabIndex={0}
      data-fill=""
      class="group __menu-item hoverable"
      data-sidebar-item="true"
      href={`/branch/${pin.conversationId}/${pin.messageId}`}
      data-discover="true"
      onClick={handleLinkClick}
    >
      <div class="flex min-w-0 grow items-center gap-2.5">
        {renaming ? (
          <input
            ref={inputRef}
            class="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
            type="text"
            value={renameValue}
            name="title-editor"
            onInput={(e: Event) =>
              setRenameValue((e.target as HTMLInputElement).value)
            }
            onBlur={commitRename}
            onKeyDown={handleInputKeyDown}
            onClick={(e: MouseEvent) => e.preventDefault()}
          />
        ) : (
          <div class="truncate">{pin.preview || "Pinned message"}</div>
        )}
      </div>
      <div class="trailing-pair" style={{ position: "relative" }}>
        <div class="trailing highlight text-token-text-tertiary">
          <button
            tabIndex={0}
            data-trailing-button=""
            class="__menu-item-trailing-btn"
            type="button"
            onClick={handleMenuClick}
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                aria-hidden="true"
                class="icon"
              >
                <use
                  href="/cdn/assets/sprites-core-fk4oovux.svg#f6d0e2"
                  fill="currentColor"
                />
              </svg>
            </div>
          </button>
        </div>
        <div class="trailing text-token-text-tertiary" tabIndex={-1}>
          <span aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              aria-hidden="true"
              class="icon-xs text-token-icon-tertiary opacity-50"
            >
              <use
                href="/cdn/assets/sprites-core-fk4oovux.svg#a8c6bd"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
        {menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              zIndex: 50,
              minWidth: "140px",
            }}
            class="bg-token-surface-primary shadow-lg rounded-lg border border-token-border-light py-1"
          >
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm text-token-text-primary hover:bg-token-bg-secondary"
              onClick={handleStartRename}
            >
              Rename
            </button>
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm text-token-text-primary hover:bg-token-bg-secondary"
              onClick={handleUnpin}
            >
              Unpin
            </button>
          </div>
        )}
      </div>
    </a>
  );
};

const PinsSection = () => {
  const [pins, setPins] = useState<Pin[]>(getPins);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => onPinsChange(setPins), []);

  if (pins.length === 0) return null;

  const visible = expanded ? pins : pins.slice(0, VISIBLE_LIMIT);
  const hasMore = pins.length > VISIBLE_LIMIT;

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
          data-rtl-flip=""
          class={
            collapsed
              ? "hidden h-3 w-3 shrink-0 group-hover/sidebar-expando-section:block"
              : "invisible h-3 w-3 shrink-0 group-hover/sidebar-expando-section:visible"
          }
        >
          <use
            href={`/cdn/assets/sprites-core-fk4oovux.svg#${collapsed ? "d3876b" : "ba3792"}`}
            fill="currentColor"
          />
        </svg>
      </button>
      {!collapsed &&
        visible.map((pin) => (
          <PinItem key={`${pin.conversationId}:${pin.messageId}`} pin={pin} />
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
