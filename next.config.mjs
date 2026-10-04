import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      ['/docs/installation', '/docs/quickstart#install-the-cli'],
      ['/docs/faq', '/docs/quickstart#before-you-start'],
      ['/docs/guides/airreload-go', '/docs/quickstart#get-airreload-go'],
      ['/docs/guides/configuration', '/docs/reference/cli#run-options'],
      ['/docs/guides/flutter-versions', '/docs/reference/cli#flutter-versions'],
      ['/docs/guides/updates', '/docs/reference/cli#update'],
      ['/docs/reference/compatibility', '/docs/quickstart#compatibility'],
      ['/docs/reference/how-it-works', '/docs/guides/development#project-preparation'],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default withMDX(config);
