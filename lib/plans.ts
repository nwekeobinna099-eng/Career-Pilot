import { SupabaseClient } from '@supabase/supabase-js'

export type PlanType = 'free' | 'pro' | 'enterprise'

export const PLANS: Record<PlanType, {
    name: string
    price: number
    limits: {
        scrape: number    // per day
        tailor: number    // per day
    }
}> = {
    free: {
        name: 'Navigator',
        price: 0,
        limits: {
            scrape: 5,
            tailor: 3
        }
    },
    pro: {
        name: 'Commander',
        price: 19,
        limits: {
            scrape: Infinity,
            tailor: Infinity
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 0, // Custom
        limits: {
            scrape: Infinity,
            tailor: Infinity
        }
    }
}

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<PlanType> {
    const { data } = await supabase
        .from('subscriptions')
        .select('plan_id, status, current_period_end')
        .eq('user_id', userId)
        .single()

    if (!data) return 'free'

    // Check if subscription is active
    if (data.status === 'active' || data.status === 'trialing') {
        return data.plan_id as PlanType
    }

    return 'free'
}

export async function checkUsage(
    supabase: SupabaseClient,
    userId: string,
    feature: 'scrape' | 'tailor'
): Promise<{ allowed: boolean; limit: number; used: number; plan: PlanType }> {
    const plan = await getUserPlan(supabase, userId)
    const limit = PLANS[plan].limits[feature]

    if (limit === Infinity) {
        return { allowed: true, limit, used: 0, plan }
    }

    // Count usage for today (UTC)
    const startOfDay = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'

    const { count, error } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature', feature)
        .gte('created_at', startOfDay)

    if (error) {
        console.error('Usage check error:', error)
        return { allowed: false, limit, used: 0, plan } // Fail safe or fail closed? Fail closed for now
    }

    const used = count || 0
    return { allowed: used < limit, limit, used, plan }
}

import { getAdminSupabase } from './admin'

export async function incrementUsage(
    userId: string,
    feature: 'scrape' | 'tailor'
) {
    const supabase = getAdminSupabase()
    const { error } = await supabase.from('usage_logs').insert({
        user_id: userId,
        feature,
        count: 1
    })

    if (error) console.error('Failed to log usage:', error)
}
