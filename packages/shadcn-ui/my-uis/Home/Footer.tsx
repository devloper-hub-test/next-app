import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="dark:bg-gray-900 dark:text-white py-8">
      <div className="container mx-auto px-4 text-center">
        {/* Footer Heading */}
        <h2 className="text-lg font-bold mb-4">Let&apos;s Connect</h2>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <Link href="https://linkedin.com/in/yourname" target="_blank">
            LinkedIn
          </Link>
          <Link href="https://github.com/yourusername" target="_blank">
            GitHub
          </Link>
          <Link href="https://twitter.com/yourhandle" target="_blank">
            Twitter
          </Link>
          <Link href="https://medium.com/@yourhandle" target="_blank">
            Blog
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <Link href="/">Home</Link>
          <Link href="/about">About Me</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* Copyright Section */}
        <p className="text-sm text-gray-400">
          © 2024 Your Name. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
