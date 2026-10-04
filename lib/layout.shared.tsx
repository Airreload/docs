import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { gitConfig } from "./shared";
import { BrandMark } from "@/components/brand";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <BrandMark />
          <span className="docs-brand-name">airreload</span>
          <span className="brand-label">DOCS</span>
        </>
      ),
      url: "/",
    },
    links: [
      {
        text: "Get Airreload Go",
        url: "https://github.com/Airreload/airreload-go/releases",
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
