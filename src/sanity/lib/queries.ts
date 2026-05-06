import { groq } from 'next-sanity'
import type { BlogPost } from '@/lib/landing-blog-content'

// `body` is a Sanity Portable Text array; typed as unknown[] to avoid
// requiring @portabletext/types as a direct dependency.
export type SanityBlogPost = BlogPost & {
  body?: unknown[];
  coverImage?: { url: string | null; alt?: string };
}

export const ALL_POSTS_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    excerpt,
    category,
    readingMinutes,
    publishedAt,
    author,
    authorRole
  }
`

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug] [0] {
    "slug": slug.current,
    title,
    excerpt,
    category,
    readingMinutes,
    publishedAt,
    author,
    authorRole,
    "coverImage": {
      "url": coverImage.asset->url,
      "alt": coverImage.alt
    },
    body
  }
`

export const ALL_POST_SLUGS_QUERY = groq`
  *[_type == "post"] { "slug": slug.current }
`
