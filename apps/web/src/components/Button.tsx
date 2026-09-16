import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "danger" | "link";

type Shared = {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
};

type ButtonAsButton = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    to?: undefined;
  };

type ButtonAsLink = Shared & {
  to: string;
  disabled?: boolean;
  className?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = "primary", loading = false, loadingLabel, className } = props;
  const classes = ["btn", variant === "primary" ? "" : variant === "secondary" ? "ghost" : variant, className]
    .filter(Boolean)
    .join(" ");
  const label = loading ? loadingLabel ?? "Working…" : children;

  if ("to" in props && props.to) {
    return (
      <Link className={classes} to={props.to} aria-disabled={props.disabled || loading} aria-busy={loading}>
        {label}
      </Link>
    );
  }

  const button = props as ButtonAsButton;
  const { loading: isLoading, loadingLabel: _loadingLabel, variant: _variant, children: _children, className: _className, ...rest } = button;
  return (
    <button
      {...rest}
      className={classes}
      disabled={button.disabled || isLoading}
      aria-busy={isLoading}
    >
      {label}
    </button>
  );
}
