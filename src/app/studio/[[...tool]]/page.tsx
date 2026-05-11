/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import { sanityConfigured, sanityConfigError } from '../../../sanity/env'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main style={{ padding: 48, fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Sanity Studio is not configured
        </h1>
        <p style={{ marginBottom: 8, color: '#475569' }}>{sanityConfigError}</p>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Set the env vars in Vercel project settings and redeploy without build cache.
        </p>
      </main>
    )
  }
  return <NextStudio config={config} />
}
