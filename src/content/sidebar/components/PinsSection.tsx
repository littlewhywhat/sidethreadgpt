import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  getPins,
  onPinsChange,
  type Pin,
  removePin,
  updatePinPreview,
} from "../../storage";

const VISIBLE_LIMIT = 5;

type PinItemProps = {
  pin: Pin;
  onUnpinClick: (pin: Pin) => void;
};

const PinItem = ({ pin, onUnpinClick }: PinItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(pin.preview);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
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
    if (!menuOpen && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ left: rect.left, top: rect.bottom + 4 });
    }
    setMenuOpen((v) => !v);
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
      <div class="trailing-pair">
        <div class="trailing highlight text-token-text-tertiary">
          <button
            ref={menuBtnRef}
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
            aria-orientation="vertical"
            onMouseLeave={() => setMenuOpen(false)}
            class="z-50 flex flex-col max-w-xs rounded-2xl popover bg-token-main-surface-primary dark:bg-[#353535] shadow-long py-1.5 px-1.5"
            tabIndex={-1}
            style={{
              position: "fixed",
              left: `${menuPos.left}px`,
              top: `${menuPos.top}px`,
              zIndex: 50,
              minWidth: "max-content",
              outline: "none",
            }}
          >
            <div
              role="menuitem"
              tabIndex={0}
              class="group __menu-item hoverable gap-1.5 w-full"
              onClick={handleStartRename}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter")
                  handleStartRename(e as unknown as MouseEvent);
              }}
            >
              <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  class="icon"
                >
                  <use
                    href="/cdn/assets/sprites-core-fk4oovux.svg#6d87e1"
                    fill="currentColor"
                  />
                </svg>
              </div>
              Rename
            </div>
            <div
              role="menuitem"
              tabIndex={0}
              data-color="danger"
              class="group __menu-item hoverable gap-1.5 w-full"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onUnpinClick(pin);
              }}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setMenuOpen(false);
                  onUnpinClick(pin);
                }
              }}
            >
              <div class="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  class="icon"
                >
                  <use
                    href="/cdn/assets/sprites-core-fk4oovux.svg#13322a"
                    // href="/cdn/assets/sprites-core-mlj80iqy.svg#3ee541"
                    fill="currentColor"
                  />
                </svg>
              </div>
              Unpin
            </div>
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
  const [unpinConfirmTarget, setUnpinConfirmTarget] = useState<Pin | null>(
    null,
  );

  useEffect(() => onPinsChange(setPins), []);

  const handleUnpinConfirm = useCallback(() => {
    if (unpinConfirmTarget) {
      removePin(
        unpinConfirmTarget.conversationId,
        unpinConfirmTarget.messageId,
      );
      setUnpinConfirmTarget(null);
    }
  }, [unpinConfirmTarget]);

  if (pins.length === 0 && !unpinConfirmTarget) return null;

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
          Pinned replies
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
          <PinItem
            key={`${pin.conversationId}:${pin.messageId}`}
            pin={pin}
            onUnpinClick={setUnpinConfirmTarget}
          />
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
      {unpinConfirmTarget && (
        <div
          class="fixed inset-0 z-50 before:starting:backdrop-blur-0 before:absolute before:inset-0 before:bg-gray-200/50 before:backdrop-blur-[1px] not-motion-reduce:before:transition not-motion-reduce:before:duration-250 dark:before:bg-black/50 before:starting:opacity-0"
          style="pointer-events: auto;"
          data-testid="modal-unpin-confirmation"
        >
          <button
            type="button"
            data-state="open"
            class="fixed inset-0 z-50 w-full h-full border-none cursor-default before:starting:backdrop-blur-0 before:absolute before:inset-0 before:bg-gray-200/50 before:backdrop-blur-[1px] not-motion-reduce:before:transition not-motion-reduce:before:duration-250 dark:before:bg-black/50 before:starting:opacity-0"
            style="pointer-events: auto;"
            onClick={() => setUnpinConfirmTarget(null)}
          />
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              role="dialog"
              class="popover bg-token-bg-primary rounded-2xl shadow-long flex flex-col max-w-md w-full overflow-hidden pointer-events-auto"
              tabIndex={-1}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
            >
              <header class="min-h-header-height flex justify-between p-2.5 ps-4 select-none">
                <h2 class="text-token-text-primary text-lg font-normal">
                  Unpin message?
                </h2>
              </header>
              <div class="grow overflow-y-auto p-4 pt-1 min-w-0">
                <div class="flex gap-1 min-w-0">
                  <span class="shrink-0">This will remove</span>
                  <strong
                    class="truncate min-w-0"
                    title={unpinConfirmTarget.preview || "Pinned message"}
                  >
                    {unpinConfirmTarget.preview || "Pinned message"}
                  </strong>
                  <span class="shrink-0">from pinned replies.</span>
                </div>
              </div>
              <div class="flex w-full flex-row items-center text-sm select-none justify-end p-4 pt-0">
                <div class="flex flex-col gap-3 sm:flex-row-reverse flex w-full flex-row-reverse">
                  <button
                    type="button"
                    class="btn relative btn-danger"
                    data-testid="unpin-confirm-button"
                    onClick={handleUnpinConfirm}
                  >
                    <div class="flex items-center justify-center">Unpin</div>
                  </button>
                  <button
                    type="button"
                    class="btn relative btn-secondary"
                    onClick={() => setUnpinConfirmTarget(null)}
                  >
                    <div class="flex items-center justify-center">Cancel</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { PinsSection };
