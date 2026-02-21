'use client';

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function SplineScene() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]">
                    <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin" />
                </div>
            )}
            <Spline
                scene="/scene-clean.splinecode"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full object-cover opacity-100"
            />
        </div>
    );
}
