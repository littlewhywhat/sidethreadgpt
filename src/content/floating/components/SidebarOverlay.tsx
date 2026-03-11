import { useRef } from "preact/hooks";

type SidebarOverlayProps = {
  src: string;
  onClose: () => void;
};

const SidebarOverlay = ({ src, onClose }: SidebarOverlayProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const headerStyle = document.createElement("style");
    headerStyle.innerText = `
      div.h-header-height > div:nth-child(1) { display: none !important; }
      div.h-header-height > div:last-child { display: none !important; }
    `;
    iframe.contentDocument.head.appendChild(headerStyle);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.ctrlKey && e.shiftKey && e.key === "B")) {
        e.preventDefault();
        onClose();
      }
    };
    iframe.contentDocument.addEventListener("keydown", keyHandler);
  };

  return (
    <iframe
      ref={iframeRef}
      title="SideThreadGPT"
      src={src}
      onLoad={handleLoad}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
    />
  );
};

export { SidebarOverlay };
