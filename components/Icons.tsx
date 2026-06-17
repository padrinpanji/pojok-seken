import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
      />
    </svg>
  );
}

export function CheckIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="m6 12 4 4 8-8"
      />
    </svg>
  );
}

export function ShareIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 5 8 9m8 10-8-4m10-12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14 8.8V7.3c0-.7.2-1.1 1.2-1.1H17V3.1c-.9-.1-1.8-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v1.2H7v3.5h2.8V21H14v-8.7h2.8l.4-3.5H14Z"
      />
    </svg>
  );
}

export function XIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M13.8 10.6 20.8 3h-1.7l-6.1 6.6L8.2 3H2.6l7.4 10.1L2.6 21h1.7l6.4-6.9 5.1 6.9h5.6l-7.6-10.4Zm-2.3 2.5-.7-1L4.8 4.3h2.6l4.7 6.2.7 1 6.3 8.2h-2.6l-5-6.6Z"
      />
    </svg>
  );
}

export function TelegramIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M21.6 4.2 18.4 19c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.8 12.5.9 11c-1.1-.3-1.1-1.1.2-1.6l19.2-7.4c.9-.3 1.7.2 1.3 2.2Z"
      />
    </svg>
  );
}

export function LinkIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"
      />
    </svg>
  );
}

export function ShieldIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
      />
    </svg>
  );
}

export function SparkIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm6 14 .8 2.7L21 20l-2.2.7L18 23l-.8-2.3L15 20l2.2-1.3L18 16Z"
      />
    </svg>
  );
}

export function MapIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6"
      />
    </svg>
  );
}

export function PinIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 2v4m8-4v4M4 10h16M6 4h12a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}

export function ChatIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-4-.9L3 20l1.2-4A8.2 8.2 0 0 1 3 11.5C3 6.8 7 3 12 3s9 3.8 9 8.5ZM8 12h.01M12 12h.01M16 12h.01"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = "icon", ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12.04 2a9.85 9.85 0 0 0-8.49 14.86L2.5 22l5.28-1.02A9.96 9.96 0 1 0 12.04 2Zm0 2a7.96 7.96 0 0 1 0 15.92 8.05 8.05 0 0 1-3.82-.97l-.33-.18-2.77.54.55-2.69-.2-.35A7.85 7.85 0 0 1 4.08 12 7.96 7.96 0 0 1 12.04 4Zm-3.2 3.9c-.17 0-.43.06-.66.3-.23.25-.87.85-.87 2.08 0 1.23.9 2.42 1.02 2.59.13.16 1.75 2.78 4.35 3.78 2.16.83 2.6.66 3.07.62.47-.04 1.52-.62 1.73-1.22.21-.6.21-1.12.15-1.22-.06-.1-.23-.16-.49-.29-.25-.13-1.51-.74-1.74-.83-.24-.08-.41-.13-.58.13-.17.25-.66.83-.81 1-.15.17-.3.19-.55.06-.26-.13-1.08-.4-2.05-1.26-.76-.68-1.27-1.51-1.42-1.77-.15-.25-.02-.39.11-.52.12-.12.26-.3.38-.45.13-.15.17-.25.26-.42.08-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.91-.21-.5-.42-.43-.58-.44h-.49Z"
      />
    </svg>
  );
}
