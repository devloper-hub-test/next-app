import {
  getPage,
  getPageBySlug,
  getPublishedPosts,
  getTags,
} from "shadcn-ui/lib/notion";
import {
  getPostSlug,
  getTagSlug,
  isBlogPostPage,
  isBlogRootPage,
  isPaginatedBlogPage,
  isPaginatedTagPage,
  isTagPage,
} from "shadcn-ui/lib/page-utils";
import { BlogList } from "shadcn-ui/my-uis/Components/BlogList";
import { BlogPost } from "shadcn-ui/my-uis/Components/BlogPost";
import type { NotionPage } from "shadcn-ui/types/notion";
import { notFound } from "next/navigation";

// export { generateBlogStaticParams as generateStaticParams };

// Main page component
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<JSX.Element> {
  const params = await props.params;
  const { slug = [] } = params;

  const postsResponse = await getPublishedPosts();
  const posts = postsResponse.results as NotionPage[];

  const tags = await getTags();
  const pageParams = { slug };

  // Handle blog post page
  if (isBlogPostPage(pageParams)) {
    const postSlug = getPostSlug(pageParams);
    if (!postSlug) notFound();

    const post = await getPageBySlug(postSlug);
    if (!post) notFound();

    const recordMap = await getPage(post.id, tags);
    return <BlogPost recordMap={recordMap} />;
  }

  // Handle tag pages (both paginated and non-paginated)
  if (isTagPage(pageParams) || isPaginatedTagPage(pageParams)) {
    const tagSlug = getTagSlug(pageParams);
    if (!tagSlug) notFound();

    const tag = tags.find((t) => t.value === tagSlug);
    if (!tag) notFound();

    const taggedPosts = posts.filter((post) => {
      const postTags = post.properties.Tags?.relation || [];
      return postTags.some((t) => t.id === tag.id);
    });

    return (
      <BlogList
        activeTag={tag.value}
        basePath={`/blog/tag/${tag.value}`}
        description={`${taggedPosts.length} ${taggedPosts.length === 1 ? "post" : "posts"} tagged with ${tag.label}`}
        heading={tag.label}
        isPaginated
        pageParams={pageParams}
        posts={taggedPosts}
        tags={tags}
      />
    );
  }
  // Handle blog root and paginated blog pages
  if (isBlogRootPage(pageParams) || isPaginatedBlogPage(pageParams)) {
    return (
      <BlogList
        basePath="/blog"
        heading="Latest Posts"
        isPaginated
        pageParams={pageParams}
        posts={posts}
        tags={tags}
      />
    );
  }

  notFound();
}
