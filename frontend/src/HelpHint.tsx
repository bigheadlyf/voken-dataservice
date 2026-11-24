import { useState, type ReactNode } from "react";
import { Popover } from "antd";

export function HelpHint({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover trigger="click" placement="bottomLeft" open={open} onOpenChange={setOpen}
      content={<div className="help-hint-content">{children}</div>}>
      <button type="button" className="help-hint-button" aria-label={label} aria-expanded={open}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            setOpen(false);
          }
        }}>?</button>
    </Popover>
  );
}
