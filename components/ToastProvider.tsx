'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            theme="dark"
            closeButton
            toastOptions={{
                style: {
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                },
            }}
        />
    );
}
