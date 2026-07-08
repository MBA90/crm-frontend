import React from "react";
import { avatarColor } from "@/lib/format";

interface AvatarProps {
  label: string; // text shown (usually initials)
  seed?: string; // color seed; defaults to label
  size?: "sm" | "md" | "lg";
}

export class Avatar extends React.Component<AvatarProps> {
  render(): React.ReactNode {
    const { label, seed, size = "md" } = this.props;
    const cls =
      size === "sm" ? "avatar avatar--sm" : size === "lg" ? "avatar avatar--lg" : "avatar";
    return (
      <div className={cls} style={{ background: avatarColor(seed ?? label) }}>
        {label}
      </div>
    );
  }
}
