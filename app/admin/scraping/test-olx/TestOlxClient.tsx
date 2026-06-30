"use client";

import { useState } from "react";

export default function TestOlxClient() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Record<string, unknown> | null>(null);

    async function testOlxApi(page = 1) {
        setLoading(true);
        setResults(null);

        try {
            const response = await fetch(`/api/test-olx?page=${page}`);
            const result = await response.json();
            setResults(result);
        } catch (err) {
            setResults({ success: false, error: String(err) });
        } finally {
            setLoading(false);
        }
    }

    const items = results?.success
        ? (results.data as { data?: unknown[] } | undefined)?.data ?? []
        : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-6 text-2xl font-bold">OLX API Debug</h1>

                <div className="mb-4 flex gap-3">
                    {[1, 2, 3].map((p) => (
                        <button
                            key={p}
                            onClick={() => testOlxApi(p)}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Loading..." : `Fetch page ${p}`}
                        </button>
                    ))}
                </div>

                {results && (
                    <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${results.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                            <p className="font-bold">
                                {results.success ? "✓ Success" : "✗ Failed"}
                                {results.totalItems !== undefined ? ` — ${results.totalItems as number} items on page ${results.page as number}` : ""}
                            </p>
                            {results.error ? <p className="mt-1 text-sm text-red-700">{results.error as string}</p> : null}
                        </div>

                        {/* Raw price structure of first 3 items */}
                        {Array.isArray(results.sampleRaw) && results.sampleRaw.length > 0 && (
                            <div className="rounded-lg bg-white p-4 shadow border">
                                <h2 className="mb-3 font-bold">Raw price structure (first 3 items)</h2>
                                <pre className="overflow-x-auto text-xs text-gray-700 whitespace-pre-wrap">
                                    {JSON.stringify(results.sampleRaw, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* Summary of all items: title + price */}
                        {Array.isArray(items) && items.length > 0 && (
                            <div className="rounded-lg bg-white p-4 shadow border">
                                <h2 className="mb-3 font-bold">All items — title & price</h2>
                                <div className="space-y-1 text-sm">
                                    {(items as Record<string, unknown>[]).map((item, i) => {
                                        const priceValue = (item.price as Record<string, unknown> | null)?.value;
                                        const priceRaw = (priceValue as Record<string, unknown> | null)?.raw;
                                        const priceDisplay = (priceValue as Record<string, unknown> | null)?.display;
                                        const hasPrice = priceRaw != null || priceDisplay;

                                        return (
                                            <div key={i} className={`flex gap-4 rounded px-2 py-1 ${hasPrice ? "bg-green-50" : "bg-red-50"}`}>
                                                <span className="w-6 shrink-0 text-gray-400">{i + 1}</span>
                                                <span className="flex-1 truncate font-medium">{item.title as string}</span>
                                                <span className={`shrink-0 font-mono text-xs ${hasPrice ? "text-green-700" : "text-red-600"}`}>
                                                    {hasPrice ? `${priceDisplay ?? ""} (${priceRaw ?? "no raw"})` : "NO PRICE"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
