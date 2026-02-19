import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminSupabase } from '@/lib/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`)
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }

    const supabase = getAdminSupabase()

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            // Fulfill the purchase...
            await supabase.from('subscriptions').upsert({
                user_id: session.metadata!.userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                plan_id: 'pro',
                status: 'active',
                current_period_end: new Date() // Should get correct date, but simplify for now
            })
        }
        else if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription

            await supabase.from('subscriptions').update({
                plan_id: subscription.status === 'active' ? 'pro' : 'free',
                status: subscription.status,
                current_period_end: new Date((subscription as any).current_period_end * 1000)
            }).eq('stripe_subscription_id', subscription.id)
        }
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription

            await supabase.from('subscriptions').update({
                plan_id: 'free',
                status: 'canceled',
            }).eq('stripe_subscription_id', subscription.id)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook handler failed:', error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}
