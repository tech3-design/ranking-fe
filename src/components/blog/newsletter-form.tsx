"use client";

import { ArrowRight, Mail } from "lucide-react";
import { BLOG_NEWSLETTER } from "@/lib/landing-blog-content";

export function BlogNewsletterForm() {
  return (
    <form
      className="flex w-full items-center gap-2 rounded-sm border border-[#b45309]/30 bg-white p-1.5 shadow-sm lg:col-span-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <Mail className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
      <input
        type="email"
        placeholder="you@domain.com"
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-sm bg-[#b45309] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
      >
        {BLOG_NEWSLETTER.cta}
        <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
      </button>
    </form>
  );
}
