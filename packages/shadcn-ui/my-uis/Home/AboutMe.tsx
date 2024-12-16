import TypingAnimation from "../../components/ui/typing-animation";
import { Card, CardContent } from "../../components/ui/card";
import React from "react";

export default function AboutMe() {
  return (
    <div>
      <h4 className="text-center text-5xl">About Me</h4>
      <div className="grid grid-cols-2 flex-wrap gap-x-14 gap-y-10 my-14">
        <div className="col-span-2">
          <TypingAnimation
            duration={5}
            className=" text-black dark:text-white capitalize italic text-2xl font-normal"
            text="Hello! I'm Rahul Verma, a passionate and results-driven Full Stack Web Developer with 2+ years of experience building web applications."
          />
        </div>
        <Card>
          <CardContent className="px-8 py-6">
            <h5 className="text-xl font-semibold">What I Do Best</h5>
            <div className="flex flex-col gap-x-4 mt-4">
              <div>
                <span className="font-bold pr-2">Frontend Development:</span>
                <span className="text-sm">
                  Building seamless and visually appealing user experiences
                  using React, Next.js, and Tailwind CSS.
                </span>
              </div>
              <div>
                <span className="font-bold pr-2">Backend Development:</span>
                <span className="text-sm">
                  Creating RESTful APIs, microservices, and secure server-side
                  solutions with Node.js and Express.
                </span>
              </div>
              <div>
                <span className="font-bold pr-2">Database Management:</span>
                <span className="text-sm">
                  Designing efficient database schemas and handling data
                  operations with MongoDB and SQL databases.
                </span>
              </div>
              <div>
                <span className="font-bold pr-2"> Deployment & DevOps:</span>
                <span className="text-sm">
                  Deploying scalable web applications using cloud platforms like
                  AWS, Vercel, and Netlify.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-8 py-6">
            <h6 className="text-xl font-semibold">Why Me?</h6>
            <div className="flex flex-col gap-4 mt-4">
              I thrive on solving complex problems and turning ideas into
              reality with clean, maintainable code. I stay updated with the
              latest trends in technology to ensure the applications I build are
              future-ready. Whether it’s a single-page app or a full-fledged
              enterprise solution, I bring dedication, creativity, and attention
              to detail to every project.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
