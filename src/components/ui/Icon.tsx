import React from "react";

export type IconName =
  | "dashboard"
  | "contacts"
  | "companies"
  | "deals"
  | "tasks"
  | "settings"
  | "search"
  | "plus"
  | "edit"
  | "trash"
  | "close"
  | "back"
  | "check"
  | "mail"
  | "phone"
  | "calendar"
  | "globe"
  | "dollar"
  | "briefcase"
  | "flag"
  | "clock"
  | "activity"
  | "user"
  | "trend-up"
  | "trend-down"
  | "target"
  | "sparkle"
  | "download"
  | "inbox"
  | "log-out"
  | "log-in";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Feather-style stroke icons rendered from a shared path table. */
export class Icon extends React.Component<IconProps> {
  private static paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
    contacts: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    companies: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
        <path d="M15 21V9h2a2 2 0 0 1 2 2v10" />
        <path d="M9 7h2M9 11h2M9 15h2" />
      </>
    ),
    deals: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 3 5-6" />
        <path d="M18 8h3v3" />
      </>
    ),
    tasks: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    close: (
      <>
        <path d="M18 6L6 18M6 6l12 12" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </>
    ),
    check: (
      <>
        <path d="M20 6L9 17l-5-5" />
      </>
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 6L2 7" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    dollar: (
      <>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
    briefcase: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    flag: (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <path d="M4 22v-7" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    activity: (
      <>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </>
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    "trend-up": (
      <>
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </>
    ),
    "trend-down": (
      <>
        <path d="M23 18l-9.5-9.5-5 5L1 6" />
        <path d="M17 18h6v-6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    sparkle: (
      <>
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5M12 15V3" />
      </>
    ),
    inbox: (
      <>
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </>
    ),
    "log-out": (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    ),
    "log-in": (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5M15 12H3" />
      </>
    ),
  };

  render(): React.ReactNode {
    const { name, size = 20, className, strokeWidth = 2 } = this.props;
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {Icon.paths[name]}
      </svg>
    );
  }
}
