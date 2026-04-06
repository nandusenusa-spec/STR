import type { SupabaseClient } from '@supabase/supabase-js'

export type UserProfileRow = {
  id: string
  full_name: string
  avatar_url: string | null
  favorite_discipline: string | null
  level: string | null
}

/** Shape expected by existing UI (ChatMessage, feed cards, forums). */
export type EnrichedUser = {
  id: string
  email: string | null
  user_profile: {
    full_name: string
    avatar_url: string | null
    discipline: string | null
    level: string | null
  } | null
}

export async function fetchProfilesByIds(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, UserProfileRow>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return new Map()

  const { data } = await supabase
    .from('user_profiles')
    .select('id, full_name, avatar_url, favorite_discipline, level')
    .in('id', unique)

  const map = new Map<string, UserProfileRow>()
  for (const row of data || []) {
    map.set(row.id, row as UserProfileRow)
  }
  return map
}

function toEnrichedUser(userId: string, p: UserProfileRow | undefined): EnrichedUser {
  return {
    id: userId,
    email: null,
    user_profile: p
      ? {
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          discipline: p.favorite_discipline,
          level: p.level,
        }
      : null,
  }
}

/** Attach nested `user` for rows with `user_id` (chat, social, forum). */
export function enrichRowsWithUsers<
  T extends { user_id: string },
>(rows: T[], profileMap: Map<string, UserProfileRow>): (T & { user: EnrichedUser })[] {
  return rows.map((row) => ({
    ...row,
    user: toEnrichedUser(row.user_id, profileMap.get(row.user_id)),
  }))
}
