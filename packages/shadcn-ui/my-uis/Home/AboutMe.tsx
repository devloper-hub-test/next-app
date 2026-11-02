import TypingAnimation from "../../components/ui/typing-animation";
import { Card, CardContent } from "../../components/ui/card";
import React from "react";
import SectionHeading from "./SectionHeading";

const SKILLS = [
  {
    title: "Frontend Development",
    description:
      "Building seamless and visually appealing user experiences using React, Next.js, and Tailwind CSS.",
  },
  {
    title: "Backend Development",
    description:
      "Creating RESTful APIs, microservices, and secure server-side solutions with Node.js and Express.",
  },
  {
    title: "Database Management",
    description:
      "Designing efficient database schemas and handling data operations with MongoDB and SQL databases.",
  },
  {
    title: "Deployment & DevOps",
    description:
      "Deploying scalable web applications using cloud platforms like AWS, Vercel, and Netlify.",
  },
];

export default function AboutMe() {
  return (
    <div>
      <SectionHeading>About Me</SectionHeading>
      <div className="mb-8 lg:mb-12 min-h-[4rem] lg:min-h-[5rem]">
        <TypingAnimation
          duration={5}
          className="text-center text-base font-normal italic text-black dark:text-white lg:text-2xl"
          text="Hello! I'm Rahul Verma, a passionate and results-driven Full Stack Web Developer with 2+ years of experience building web applications."
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        <Card className="rounded-2xl transition-shadow hover:shadow-lg dark:bg-gray-900">
          <CardContent className="px-5 py-6 lg:px-8 lg:py-8">
            <h3 className="text-lg font-semibold lg:text-xl">What I Do Best</h3>
            <ul className="mt-5 space-y-4">
              {SKILLS.map((skill) => (
                <li key={skill.title} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4DB6AC]" />
                  <div>
                    <p className="text-sm font-semibold lg:text-base">
                      {skill.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {skill.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="rounded-2xl transition-shadow hover:shadow-lg dark:bg-gray-900">
          <CardContent className="px-5 py-6 lg:px-8 lg:py-8">
            <h3 className="text-lg font-semibold lg:text-xl">Why Me?</h3>
            <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400 lg:text-base">
              I thrive on solving complex problems and turning ideas into
              reality with clean, maintainable code. I stay updated with the
              latest trends in technology to ensure the applications I build are
              future-ready. Whether it’s a single-page app or a full-fledged
              enterprise solution, I bring dedication, creativity, and attention
              to detail to every project.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
