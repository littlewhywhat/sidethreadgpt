const el = document.createElement("div");
el.className =
  "relative z-50 select-none px-2 py-1 rounded-lg overflow-hidden dark bg-black max-w-xs";
el.style.cssText =
  "position:fixed;pointer-events:none;display:none;z-index:30000";

const wrap = document.createElement("div");
const title = document.createElement("div");
title.className =
  "text-token-text-primary text-xs font-semibold whitespace-pre-wrap text-center";

const lines = [document.createElement("div"), document.createElement("div")];
lines.forEach((l) => {
  l.className =
    "text-token-text-tertiary text-xs font-medium whitespace-pre-wrap text-center";
  wrap.appendChild(l);
});
wrap.insertBefore(title, wrap.firstChild);
el.appendChild(wrap);
document.body.appendChild(el);

let showTimeout: ReturnType<typeof setTimeout> | null = null;

const show = (target: Element, titleText: string, subs?: string[]): void => {
  if (showTimeout) clearTimeout(showTimeout);
  showTimeout = setTimeout(() => {
    title.textContent = titleText;
    const arr = subs ?? [];
    lines.forEach((l, i) => {
      l.textContent = arr[i] ?? "";
      l.style.display = arr[i] ? "block" : "none";
    });
    el.style.display = "block";
    const r = target.getBoundingClientRect();
    el.style.top = `${r.bottom + 6}px`;
    el.style.left = `${r.left + r.width / 2 - el.offsetWidth / 2}px`;
  }, 100);
};

const hide = (): void => {
  if (showTimeout) clearTimeout(showTimeout);
  el.style.display = "none";
};

export { show, hide };
