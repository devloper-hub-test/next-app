import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Pagination } from "./Pagination";
import { PostListProps, BlogPost } from "../../types/notion";

export function PostList({
  posts,
  currentPage,
  totalPages,
  heading = "Blog Posts",
  description = "Discover the latest insights and tutorials about modern web development, UI design, and component-driven architecture.",
  basePath = "/blog",
  disablePagination = false,
  configuration = {},
}: PostListProps) {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <section className="mb-12 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 capitalize">
          {heading}
        </h2>
        {description && (
          <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto capitalize font-serif">
            {description}
          </p>
        )}
      </section>

      <section className="space-y-12">
        {posts.map((post) =>
          post ? <PostCard key={post.id} post={post} /> : null
        )}
      </section>

      {!disablePagination && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
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

function PostCard({ post }: { post: BlogPost }) {
  console.log(post.data);
  const { title, description, author, date, tags = [] } = post.data;
  console.log(post.url);

  return (
    <article className="group">
      <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
        <div className="sm:col-span-5">
          <div className="mb-4 md:mb-6">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6 italic">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <h3 className="text-base font-semibold md:text-xl lg:text-3xl text-left">
            <Link
              href={post.url}
              className="hover:underline cursor-pointer capitalize"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-4 text-muted-foreground md:mt-5 text-left font-mono italic tracking-tight text-xs md:text-base">
            {description}
          </p>
          <div className="mt-3 sm:mt-6 flex items-center space-x-4 text-xs md:text-sm md:mt-8">
            <span className="text-muted-foreground capitalize font-mono">
              {author || "Rahul Verma"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {new Date(date).toDateString()}
            </span>
          </div>
          <div className="mt-3 sm:mt-6 flex items-center space-x-2 md:mt-8">
            <Link
              href={post.url}
              className="inline-flex items-center font-semibold hover:underline text-sm md:text-base"
            >
              <span>Read more</span>
              <ArrowRight className="ml-2 size-4 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="order-first sm:order-last sm:col-span-5">
          <Link href={post.url} className="block">
            <div className="aspect-[16/8] overflow-clip rounded-lg border border-border">
              <img
                src={`https://picsum.photos/400/225?grayscale&&title=${title}`}
                alt={title}
                className="h-full w-full object-cover transition-opacity fade-in hover:opacity-70"
              />
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}

// Pagination component is now imported from ./pagination
