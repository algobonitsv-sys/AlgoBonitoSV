import type { SVGProps } from "react";

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 4h4v4" />
      <path d="M12 2v10a4 4 0 1 1-4-4" />
      <path d="M12 12a4 4 0 0 0 4 4v4a4 4 0 0 1-4-4" />
    </svg>
  );
}
