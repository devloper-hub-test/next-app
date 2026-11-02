import React from "react";

// Brand icons we don't ship as components come from the Simple Icons CDN
export default function BrandIcon({ slug, name }: { slug: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://cdn.simpleicons.org/${slug}`} alt={name} loading="lazy" />;
}
