import { logoContainerStyle, logoStyle } from "./styles";

import { token } from "@/styled-system/tokens";

export function Logo() {
  return (
    <div class={logoContainerStyle}>
      <svg class={logoStyle} viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="58" fill="transparent" stroke={token("colors.accent.purple")} stroke-width="3"/>
        <path d="M 30 35 Q 45 25, 60 35" stroke={token("colors.accent.purple")} stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 60 45 Q 75 35, 90 45" stroke={token("colors.accent.blue")} stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 30 75 Q 45 85, 60 75" stroke={token("colors.accent.green")} stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 60 85 Q 75 95, 90 85" stroke={token("colors.accent.yellow")} stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 60 35 L 60 85" stroke={token("colors.accent.purple")} stroke-width="2" fill="none" stroke-dasharray="4 4"/>
        <circle cx="30" cy="35" r="6" fill={token("colors.accent.purple")} stroke="#fff" stroke-width="2"/>
        <circle cx="60" cy="35" r="6" fill={token("colors.brand.600")} stroke="#fff" stroke-width="2"/>
        <circle cx="90" cy="45" r="6" fill={token("colors.accent.blue")} stroke="#fff" stroke-width="2"/>
        <circle cx="30" cy="75" r="6" fill={token("colors.accent.green")} stroke="#fff" stroke-width="2"/>
        <circle cx="60" cy="75" r="6" fill={token("colors.brand.600")} stroke="#fff" stroke-width="2"/>
        <circle cx="90" cy="85" r="6" fill={token("colors.accent.yellow")} stroke="#fff" stroke-width="2"/>
        <rect x="50" y="50" width="20" height="20" rx="4" fill={token("colors.brand.600")} stroke="#fff" stroke-width="2"/>
      </svg>
    </div>
  );
}
