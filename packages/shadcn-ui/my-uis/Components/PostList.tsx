import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Pagination } from "./Pagination";
import { PostCover } from "./PostCover";
import { PostListProps, BlogPost } from "../../types/notion";
import { cn } from "@/lib/utils";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function PostList({
  posts,
  currentPage,
  totalPages,
  heading = "Blog Posts",
  description = "Notes, tutorials and lessons learned while building web and mobile apps.",
  basePath = "/blog",
  disablePagination = false,
  tags = [],
  activeTag,
}: PostListProps) {
  // Feature the newest post only on the first page of the main listing
  const [featured, ...rest] = currentPage === 1 && !activeTag ? posts : [];
  const gridPosts = featured ? rest : posts;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mb-10 text-center lg:mb-14">
        <span className="inline-block rounded-full border border-[#4DB6AC]/40 bg-[#4DB6AC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#2f8f86] dark:text-[#4DB6AC]">
          Blog
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl dark:text-white">
          {heading}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 md:text-lg dark:text-gray-400">
            {description}
          </p>
        )}
      </section>

      {tags.length > 0 && (
        <nav
          aria-label="Filter by tag"
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          <TagChip href="/blog" active={!activeTag}>
            All
          </TagChip>
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              href={`/blog/tag/${tag.value}`}
              active={activeTag === tag.value}
            >
              {tag.label}
            </TagChip>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-white/15">
          <p className="text-gray-600 dark:text-gray-400">No posts here yet.</p>
          <Link
            href="/blog"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2f8f86] hover:underline dark:text-[#4DB6AC]"
          >
            Browse all posts <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          {featured && <FeaturedCard post={featured} />}
          {gridPosts.length > 0 && (
            <section
              className={cn(
                "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                featured && "mt-6",
              )}
            >
              {gridPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          )}
        </>
      )}

      {!disablePagination && totalPages > 1 && (
        <div className="mt-14 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath || "/blog"}
          />
        </div>
      )}
    </div>
  );
}

function TagChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
        active
          ? "border-black bg-black text-white dark:border-[#4DB6AC] dark:bg-[#4DB6AC] dark:text-black"
          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black dark:border-white/10 dark:text-gray-300 dark:hover:border-white/30 dark:hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  const { author, date } = post.data;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <span>{author || "Rahul Verma"}</span>
      <span aria-hidden>•</span>
      <time dateTime={date}>{formatDate(date)}</time>
    </div>
  );
}

function PostTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[#4DB6AC]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2f8f86] dark:text-[#4DB6AC]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const { title, description, tags = [] } = post.data;
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border border-gray-200 bg-white transition-shadow hover:shadow-xl md:grid-cols-2 dark:border-white/10 dark:bg-neutral-950 dark:hover:shadow-black/50">
      <div className="aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[320px]">
        <PostCover
          title={title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 lg:p-10">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Latest
          </span>
          <PostTags tags={tags} />
        </div>
        <h2 className="text-2xl font-bold leading-tight text-black lg:text-3xl dark:text-white">
          <Link href={post.url} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <PostMeta post={post} />
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-black dark:text-white">
          Read article
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const { title, description, tags = [] } = post.data;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-neutral-950 dark:hover:shadow-black/50">
      <div className="aspect-[16/9] overflow-hidden">
        <PostCover
          title={title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <PostTags tags={tags} />
        <h2 className="text-lg font-semibold leading-snug text-black dark:text-white">
          <Link href={post.url} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h2>
        <p className="line-clamp-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <PostMeta post={post} />
          <ArrowUpRight className="size-4 text-gray-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black dark:group-hover:text-white" />
        </div>
      </div>
    </article>
  );
}
