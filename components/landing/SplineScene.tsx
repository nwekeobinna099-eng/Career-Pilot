'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Spline is heavy and uses browser APIs, so we disable SSR to prevent hydration issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]">
            <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin" />
        </div>
    )
});

export default function SplineScene() {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = (splineApp: any) => {
        // Attempt to hide common UI elements that might be embedded in the scene
        const objectsToHide = ['Text', 'Button', 'logo', 'UI', 'Socials', 'Navbar', 'CTA'];
        objectsToHide.forEach(name => {
            try {
                const obj = splineApp.findObjectByName(name);
                if (obj) obj.visible = false;
            } catch (e) {
                // Ignore errors if object doesn't exist
            }
        });

        setIsLoaded(true);
    };

    return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <Spline
                scene="/scene-clean.splinecode"
                onLoad={handleLoad}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
