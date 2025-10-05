import { Show, type ParentComponent } from "solid-js";

import { css } from "../../styled-system/css";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
}

export const Drawer: ParentComponent<DrawerProps> = (props) => {
  const width = () => props.width ?? 400;
  const onClose = () => props.onClose();

  return (
    <Show when={props.isOpen}>
      {/* Overlay */}
      <div class={overlayStyle} onClick={onClose} />

      {/* Drawer */}
      <div class={drawerStyle} style={{ width: `${width()}px` }}>
        {/* Header */}
        <div class={headerStyle}>
          <h3 class={titleStyle}>{props.title || "Settings"}</h3>
          <button class={closeButtonStyle} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div class={contentStyle}>{props.children}</div>
      </div>
    </Show>
  );
};

const overlayStyle = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  animation: "fadeIn 0.2s ease-out",
});

const drawerStyle = css({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  background: "#1a1a1a",
  borderLeft: "1px solid #3a3a3a",
  boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
  zIndex: 1001,
  display: "flex",
  flexDirection: "column",
  animation: "slideIn 0.3s ease-out",
});

const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px",
  borderBottom: "1px solid #3a3a3a",
});

const titleStyle = css({
  color: "white",
  fontSize: "20px",
  fontWeight: "700",
  margin: 0,
});

const closeButtonStyle = css({
  background: "transparent",
  border: "none",
  color: "#9ca3af",
  fontSize: "32px",
  cursor: "pointer",
  padding: "0",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  transition: "all 0.2s",
  "&:hover": {
    background: "#2a2a2a",
    color: "white",
  },
});

const contentStyle = css({
  flex: 1,
  overflowY: "auto",
  padding: "24px",
});
