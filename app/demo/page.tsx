'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Studio from '@/components/Studio/Studio';

function DemoContent() {
    const searchParams = useSearchParams();
    const autoStart = searchParams.get('autostart') === 'true';

    return <Studio isDemo={true} autoStart={autoStart} />;
}

export default function DemoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DemoContent />
        </Suspense>
    );
}
