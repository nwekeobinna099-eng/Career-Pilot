'use client'

import { useState } from 'react'

export default function CheckoutButton() {
    const [loading, setLoading] = useState(false)

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else if (data.error === 'Unauthorized') {
                window.location.href = '/signup'
            } else {
                alert('Checkout failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-center shadow-lg shadow-primary/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {loading ? 'Processing...' : 'Start 7-Day Free Trial'}
        </button>
    )
}
