import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useInView } from "../hooks/useInView.js";

type RevealProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "article" | "li";
};

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
  style,
  ...rest
}: RevealProps) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const merged: CSSProperties = { ...style, ...(delayMs ? { transitionDelay: `${delayMs}ms` } : {}) };
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-in" : ""} ${className}`.trim()}
      style={merged}
      {...rest}
    >
      {children}
    </Tag>
  );
}
