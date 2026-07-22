import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cleanText } from "@/lib/validation"

export function normalizeDepartmentKey(value: string) {
  return value.replace(/\u00a0/g, " ").trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

export async function findOrCreateDepartment(client: SupabaseClient, input: unknown) {
  const label = cleanText(input, 100)
  if (!label) return { id: null, label: null, error: null }

  const { data: existing, error: lookupError } = await client.from("departments").select("department_id, name")
  if (lookupError) return { id: null, label, error: lookupError.message }

  const match = (existing ?? []).find((item) => normalizeDepartmentKey(item.name ?? "") === normalizeDepartmentKey(label))
  if (match) return { id: match.department_id as number, label: match.name as string, error: null }

  const { data: created, error: insertError } = await client.from("departments").insert({ name: label }).select("department_id, name").single()
  if (insertError) return { id: null, label, error: insertError.message }
  return { id: created.department_id as number, label: created.name as string, error: null }
}
