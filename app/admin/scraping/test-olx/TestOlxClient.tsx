"use client";

import { useState } from "react";

export default function TestOlxClient() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Record<string, unknown> | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailResult, setDetailResult] = useState<Record<string, unknown> | null>(null);
    const [detailAdId, setDetailAdId] = useState("");

    async function testOlxApi(page = 1) {
        setLoading(true);
        setResults(null);
        try {
            const response = await fetch(`/api/test-olx?page=${page}`);
            setResults(await response.json());
        } catch (err) {
            setResults({ success: false, error: String(err) });
        } finally {
            setLoading(false);
        }
    }

    async function testDetail() {
        const id = detailAdId.trim();
        if (!id) return;
        setDetailLoading(true);
        setDetailResult(null);
        try {
            const response = await fetch(`/api/test-olx?adId=${id}`);
            setDetailResult(await response.json());
        } catch (err) {
            setDetailResult({ success: false, error: String(err) });
        } finally {
            setDetailLoading(false);
        }
    }

    const items = results?.success
        ? (results.data as { data?: unknown[] } | undefined)?.data ?? []
        : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <h1 className="text-2xl font-bold">OLX API Debug</h1>

                {/* Search pages */}
                <div className="flex gap-3">
                    {[1, 2, 3].map((p) => (
                        <button key={p} onClick={() => testOlxApi(p)} disabled={loading}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            {loading ? "Loading..." : `Fetch page ${p}`}
                        </button>
                    ))}
                </div>

                {/* Detail API test */}
                <div className="rounded-lg bg-white p-4 shadow border">
                    <h2 className="mb-3 font-bold">Test detail API (find seller)</h2>
                    <div className="flex gap-2">
                        <input value={detailAdId} onChange={(e) => setDetailAdId(e.target.value)}
                            placeholder="Enter ad_id (e.g. 946412900)"
                            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
                        <button onClick={testDetail} disabled={detailLoading || !detailAdId.trim()}
                            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                            {detailLoading ? "..." : "Test"}
                        </button>
                    </div>
                    {detailResult && (
                        <pre className="mt-3 overflow-x-auto rounded bg-slate-50 p-3 text-xs whitespace-pre-wrap">
                            {JSON.stringify(detailResult, null, 2)}
                        </pre>
                    )}
                </div>

                {results && (
                    <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${results.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                            <p className="font-bold">
                                {results.success ? "✓ Success" : "✗ Failed"}
                                {results.totalItems !== undefined ? ` — ${results.totalItems as number} items on page ${results.page as number}` : ""}
                            </p>
                            {results.error ? <p className="mt-1 text-sm text-red-700">{results.error as string}</p> : null}
                            {Array.isArray(results.sampleAdIds) && (
                                <p className="mt-1 text-xs text-gray-500">Sample ad IDs: {(results.sampleAdIds as string[]).join(", ")}</p>
                            )}
                        </div>

                        {Array.isArray(results.sampleRaw) && (
                            <div className="rounded-lg bg-white p-4 shadow border">
                                <h2 className="mb-3 font-bold">Raw structure (first 3 items)</h2>
                                <pre className="overflow-x-auto text-xs text-gray-700 whitespace-pre-wrap">
                                    {JSON.stringify(results.sampleRaw, null, 2)}
                                </pre>
                            </div>
                        )}

                        {Array.isArray(items) && items.length > 0 && (
                            <div className="rounded-lg bg-white p-4 shadow border">
                                <h2 className="mb-3 font-bold">All items</h2>
                                <div className="space-y-1 text-sm">
                                    {(items as Record<string, unknown>[]).map((item, i) => {
                                        const pv = (item.price as Record<string, unknown> | null)?.value;
                                        const priceRaw = (pv as Record<string, unknown> | null)?.raw;
                                        const priceDisplay = (pv as Record<string, unknown> | null)?.display;
                                        return (
                                            <div key={i} className={`flex gap-4 rounded px-2 py-1 ${priceRaw ? "bg-green-50" : "bg-red-50"}`}>
                                                <span className="w-6 shrink-0 text-gray-400">{i + 1}</span>
                                                <span className="w-24 shrink-0 font-mono text-xs text-gray-400">{item.ad_id as string}</span>
                                                <span className="flex-1 truncate font-medium">{item.title as string}</span>
                                                <span className="shrink-0 font-mono text-xs text-green-700">{priceDisplay as string ?? "NO PRICE"}</span>
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
