"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="shell empty-state"><h1>Something went wrong</h1><p>The workspace could not be displayed. No internal details have been exposed.</p><Button onClick={reset}>Try again</Button></div>; }
