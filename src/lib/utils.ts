import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* tailwind-merge taught the house type scale (src/styles/theme.css, --text-*).
   Without it, a custom SIZE class (text-display, text-h1 …) and a COLOUR class
   (text-ink …) both look like `text-*`, and one is silently dropped.
   Keep this list equal to the --text-* sizes in theme.css. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "lead", "body", "reading", "small", "caption", "eyebrow", "figure", "title"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
