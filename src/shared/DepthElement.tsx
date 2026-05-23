import React from "react";

type ClickHandler<T> = (() => void) | ((event: React.MouseEvent<T>) => void);

interface DepthButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  active?: boolean;
  sizeClassName?: string;
  inactiveClassName?: string;
  activeClassName?: string;
  inactiveSurfaceClassName?: string;
  activeSurfaceClassName?: string;
  onClick?: ClickHandler<HTMLButtonElement>;
}

export const DepthButton = React.forwardRef<
  HTMLButtonElement,
  DepthButtonProps
>(
  (
    {
      active = false,
      sizeClassName = "w-7 h-7 rounded-3xl",
      className = "",
      inactiveClassName = "text-text-secondary border-select-border hover:text-text-primary",
      activeClassName = "text-text-primary border-btn-active-from",
      inactiveSurfaceClassName = "bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt group-hover:from-select-hover group-hover:via-select-bg group-hover:to-select-hover",
      activeSurfaceClassName = "bg-gradient-to-br from-btn-active-from via-btn-active-to to-btn-active-from",
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { disabled, onClick, ...restButtonProps } = buttonProps;

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || !onClick) return;
      onClick(event);
    };

    return (
      <button
        {...restButtonProps}
        ref={ref}
        onClick={handleClick}
        className={`relative flex items-center justify-center ${sizeClassName} overflow-hidden border transition-all duration-200 outline-none group ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${active ? activeClassName : inactiveClassName} ${className}`}
      >
        <span
          className={`absolute inset-0 transition-all duration-200 ${
            active ? activeSurfaceClassName : inactiveSurfaceClassName
          }`}
        />
        <span
          className="absolute left-1.5 right-1.5 top-1 h-2 rounded-full blur-[1px] opacity-85"
          style={{
            background:
              "color-mix(in srgb, var(--select-bg-alt) 70%, transparent)",
          }}
        />
        <span
          className="absolute inset-[1px] rounded-[inherit]"
          style={{
            boxShadow:
              "inset 0 1px 0 var(--select-border-hover), inset 0 -1px 0 var(--select-border)",
          }}
        />
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
      </button>
    );
  },
);

DepthButton.displayName = "DepthButton";

interface DepthSurfaceProps {
  className?: string;
  surfaceClassName?: string;
  children: React.ReactNode;
  onClick?: ClickHandler<HTMLDivElement>;
  title?: string;
}

export const DepthSurface: React.FC<DepthSurfaceProps> = ({
  className = "",
  surfaceClassName = "bg-gradient-to-br from-select-bg via-select-hover to-select-bg-alt border border-select-border",
  children,
  onClick,
  ...divProps
}) => {
  const handleClick: React.MouseEventHandler<HTMLDivElement> | undefined =
    onClick
      ? (event) => {
          onClick(event);
        }
      : undefined;

  return (
    <div
      {...divProps}
      onClick={handleClick}
      className={`relative overflow-hidden rounded ${className} ${onClick ? "cursor-pointer" : ""}`}
    >
      <span className={`absolute inset-0 ${surfaceClassName}`} />
      <span
        className="absolute left-2 right-2 top-[2px] h-1.5 rounded-full blur-[1px]"
        style={{
          background:
            "color-mix(in srgb, var(--select-bg-alt) 50%, transparent)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[inherit]"
        style={{
          boxShadow:
            "inset 0 1px 0 var(--select-border-hover), inset 0 -1px 0 var(--select-border)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
