import type { ReactNode } from "react";
import type { NavigationIconName } from "@/lib/types";

interface NavigationIconProps {
  name: NavigationIconName;
  size?: number;
  className?: string;
}

function iconShape(name: NavigationIconName): ReactNode {
  switch (name) {
    case "guides":
      return (
        <>
          <path d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v9.5H7.5A2.5 2.5 0 0 0 5 19V4.5Z" />
          <path d="M5 19a2.5 2.5 0 0 1 2.5-2.5H17" />
          <path d="M8.5 8h5.5M8.5 11h4" />
        </>
      );
    case "tier-lists":
      return (
        <>
          <path d="M5 5.5h3v3H5zM11 5.5h6v3h-6zM5 11h6v3H5zM14 11h3v3h-3zM5 16.5h3v3H5zM11 16.5h6v3h-6z" />
        </>
      );
    case "codes":
      return (
        <>
          <path d="m8 6-5 6 5 6M16 6l5 6-5 6M13.5 3.5l-3 17" />
        </>
      );
    case "updates":
      return (
        <>
          <path d="M18.5 8.5A7 7 0 1 0 19 14" />
          <path d="M18.5 4.5v4h-4M19 12v4h-4" />
        </>
      );
    case "tools":
      return (
        <>
          <path d="m14.5 5.5 4-1 1 1-1 4-2 2-3-3 1-3Z" />
          <path d="m12.5 11.5-7 7a1.5 1.5 0 1 1-2-2l7-7" />
          <path d="m5 5 3.5 3.5M4 4l3 1" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
          <path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
        </>
      );
    case "characters":
      return (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0M18 5.5l2 1.5M6 5.5 4 7" />
        </>
      );
    case "maps":
      return (
        <>
          <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
          <path d="M9 4v14M15 6v14" />
        </>
      );
    case "sources":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2M12 4v1M12 19v1M4 12h1M19 12h1" />
        </>
      );
    case "overview":
    default:
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M8 12h8M12 8v8" />
        </>
      );
  }
}

export function NavigationIcon({
  name,
  size = 18,
  className,
}: NavigationIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      >
        {iconShape(name)}
      </g>
    </svg>
  );
}
