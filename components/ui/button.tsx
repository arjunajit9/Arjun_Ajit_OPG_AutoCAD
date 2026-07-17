import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(function Button({ className = "", variant = "primary", ...props }, ref) {
  return <button ref={ref} className={`button button-${variant} ${className}`} {...props} />;
});
