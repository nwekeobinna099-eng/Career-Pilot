import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSupabase } from '@/lib/supabaseClient'
import { getAdminSupabase } from '@/lib/admin'

export async function POST(req: Request) {
    const supabase = getServerSupabase(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const adminSupabase = getAdminSupabase()
        const { data: subscription } = await adminSupabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single()

        if (!subscription?.stripe_customer_id) {
            return NextResponse.json({
                error: 'No active subscription profile found. Please upgrade now to access the billing portal.'
            }, { status: 404 })
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/plans`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Billing Portal Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
