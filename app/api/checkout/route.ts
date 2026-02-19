import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSupabase } from '@/lib/supabaseClient'
import { getAdminSupabase } from '@/lib/admin'

const PRO_PRICE_ID = 'price_1Q...' // Placeholder - User must replace

export async function POST(req: Request) {
    const supabase = getServerSupabase(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get or create customer in DB
        const adminSupabase = getAdminSupabase()
        let { data: subscription } = await adminSupabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single()

        let customerId = subscription?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabaseUUID: user.id
                }
            })
            customerId = customer.id

            await adminSupabase.from('subscriptions').upsert({
                user_id: user.id,
                stripe_customer_id: customerId,
                plan_id: 'free' // Default
            })
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID || PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
            metadata: {
                userId: user.id
            }
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
