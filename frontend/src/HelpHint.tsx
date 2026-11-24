import { useEffect, useState, type ReactNode } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";

const hoverQuery = "(hover: hover) and (pointer: fine)";

export function HelpHint({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(() => window.matchMedia(hoverQuery).matches);
  useEffect(() => {
    const media = window.matchMedia(hoverQuery);
    const update = () => {
      setCanHover(media.matches);
      setOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Popover trigger={canHover ? ["hover", "focus"] : "click"}
      placement="bottomLeft" open={open} onOpenChange={setOpen}
      content={<div className="help-hint-content">{children}</div>}>
      <button type="button" className="help-hint-button" aria-label={label} aria-expanded={open}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            setOpen(false);
          }
        }}><InfoCircleOutlined aria-hidden="true" /></button>
    </Popover>
  );
}
