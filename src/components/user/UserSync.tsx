'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

/**
 * Makes sure the signed-in user has a row in Supabase's profiles table, once
 * per user per page load. The Clerk webhook normally does this; this covers a
 * webhook that has not arrived yet. Renders nothing.
 */
export default function UserSync() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || syncedFor.current === userId) return
    syncedFor.current = userId

    let retry: ReturnType<typeof setTimeout> | undefined
    const sync = (attempt: number) => {
      fetch('/api/auth/sync-user')
        .then((res) => {
          if (!res.ok) throw new Error(`sync-user answered ${res.status}`)
        })
        .catch((error) => {
          console.error('Could not sync the user profile:', error)
          if (attempt < 3) retry = setTimeout(() => sync(attempt + 1), 5000 * attempt)
        })
    }
    sync(1)

    return () => clearTimeout(retry)
  }, [isLoaded, isSignedIn, userId])

  return null
}
