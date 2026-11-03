// Your site's name and public links, in one place. Leave a link empty and it is
// hidden: the page never shows a link that goes nowhere.

export const SITE = {
  name: "GetShipKit",
  repo: "https://github.com/DrisH31/GetShipKit",
};

// The template this site was built from: the footer's "Built with GetShipKit"
// credit on a renamed site. Not your repository: leave it as it is.
export const TEMPLATE_REPO = "https://github.com/DrisH31/GetShipKit";

// GetShipKit's self-hosted sibling. Mentioned on the landing page and in the
// footer only while the site is still called "GetShipKit" (isShowcase), so a
// product built from this template never advertises it.
export const SIBLING = {
  name: "OpenShipKit",
  url: "https://github.com/DrisH31/OpenShipKit",
  line: "Want everything on your own server instead?",
};

export const isShowcase = SITE.name === "GetShipKit";

export const SITE_LINKS = {
  social: {
    twitter: "",
    github: isShowcase ? SITE.repo : "",
    linkedin: "",
    facebook: "",
  } as Record<"twitter" | "github" | "linkedin" | "facebook", string>,
  documentation: isShowcase ? `${SITE.repo}#readme` : "",
  blog: "",
  contact: "",
};
