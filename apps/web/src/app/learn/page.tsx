import Link from "next/link";
import { Header } from "shadcn-ui";

const SKILLS = [
  {
    href: "/learn/typing",
    emoji: "⌨️",
    title: "KeyQuest: Typing",
    description:
      "Type random words and sentences, score points on every key, build combos and track your speed and accuracy.",
    tag: "Keyboard skills",
  },
];

export default function LearnPage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mx-auto mt-28 max-w-4xl px-4 pb-16">
        <h1 className="text-center text-4xl font-bold">Learn skills</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Small, game-like tools to practise everyday skills. More coming soon.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {SKILLS.map((skill) => (
            <Link
              className="group rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={skill.href}
              key={skill.href}
            >
              <div aria-hidden className="text-4xl">
                {skill.emoji}
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{skill.title}</h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {skill.tag}
              </p>
              <p className="mt-3 text-muted-foreground">{skill.description}</p>
              <span className="mt-4 inline-block font-medium text-primary group-hover:underline">
                Start →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
