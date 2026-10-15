import { useEffect, useState } from "react";
import { Kbd } from "@/components/ui/Kbd";
import { modKeyShortcut } from "@/shared/lib/mod-key";
import { cx } from "@/shared/lib/cx";

/** Keyboard hint that shows ⌘K on Apple and Ctrl K elsewhere. */
export function ModKbd({
  keyLabel = "K",
  className,
}: {
  keyLabel?: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => `Ctrl ${keyLabel}`);

  useEffect(() => {
    setLabel(modKeyShortcut(keyLabel));
  }, [keyLabel]);

  return <Kbd className={cx(className)}>{label}</Kbd>;
}
