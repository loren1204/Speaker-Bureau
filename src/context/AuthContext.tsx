"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuthError, User } from "@supabase/supabase-js"
import { supabase } from "../supabaseClient"
import type { TeamProfile } from "@/types/database"

type AuthOperationResult = { error: AuthError | null }

type AuthContextValue = {
  user: User | null
  profile: TeamProfile | null
  loading: boolean
  isStakeholder: boolean
  signIn: (email: string, password: string) => Promise<AuthOperationResult>
  signOut: () => Promise<AuthOperationResult>
  resetPassword: (email: string) => Promise<AuthOperationResult>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isStakeholder: false,
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<TeamProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (currentUser: User) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle()
    const raw = data as Partial<TeamProfile> | null
    setProfile(raw ? {
      id: currentUser.id,
      full_name: raw.full_name ?? currentUser.user_metadata?.full_name ?? null,
      email: raw.email ?? currentUser.email ?? null,
      role: raw.role === "stakeholder" ? "stakeholder" : "guest",
      title: raw.title ?? null,
      avatar_url: raw.avatar_url ?? currentUser.user_metadata?.avatar_url ?? null,
      notifications_enabled: raw.notifications_enabled ?? true,
      created_at: raw.created_at ?? currentUser.created_at,
      updated_at: raw.updated_at ?? null,
    } : null)
  }, [])

  useEffect(() => {
    let active = true
    async function resolveSession() {
      const { data: { user: resolvedUser } } = await supabase.auth.getUser()
      if (!active) return
      setUser(resolvedUser)
      if (resolvedUser) await fetchProfile(resolvedUser)
      if (active) setLoading(false)
    }
    void resolveSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        setLoading(true)
        window.setTimeout(() => {
          void fetchProfile(nextUser).finally(() => active && setLoading(false))
        }, 0)
      }
      else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const isStakeholder = profile?.role === "stakeholder"

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isStakeholder, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
