"use client";

import { useState } from "react";

export default function TestOlxClient() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function testOlxApi() {
    setLoading(true);
    setError(null);
    setResults(null);

    const logs: string[] = [];

    try {
      logs.push("1. Fetching OLX API via proxy...");
      const apiUrl = "/api/test-olx";

      const response = await fetch(apiUrl);

      logs.push(`2. Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      logs.push(`3. Proxy response received`);

      if (!result.success) {
        throw new Error(result.error || "Proxy returned error");
      }

      const parsed = result.data;
      logs.push(`4. JSON parsed successfully`);

      const items = Array.isArray(parsed?.data) ? parsed.data : [];
      logs.push(`5. Found ${items.length} items`);

      const drafts: any[] = [];

      for (const item of items) {
        const adId = String(item.ad_id || item.id || "");
        const title = String(item.title || "").trim();
        const description = String(item.description || "").trim();
        const detailUrl = adId ? `https://www.olx.co.id/item/${adId}.html` : "";

        const priceRaw =
          typeof item.price?.value?.raw === "number"
            ? item.price.value.raw
            : null;
        const priceDisplay = String(item.price?.value?.display || "");

        const images = Array.isArray(item.images) ? item.images : [];
        const firstImage = images[0];
        const imageUrl =
          typeof firstImage?.url === "string" ? firstImage.url : "";

        if (title && detailUrl && title.length >= 6) {
          drafts.push({
            adId,
            title: title.substring(0, 100),
            description: description.substring(0, 100),
            detailUrl,
            price: priceRaw,
            priceText: priceDisplay,
            imageUrl,
          });
        }
      }

      logs.push(`6. Extracted ${drafts.length} valid drafts`);

      setResults({
        success: true,
        logs,
        totalItems: items.length,
        validDrafts: drafts.length,
        drafts: drafts.slice(0, 5), // Show first 5
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logs.push(`ERROR: ${errorMsg}`);
      setError(errorMsg);
      setResults({
        success: false,
        logs,
        error: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OLX API Test</h1>
          <p className="mt-2 text-gray-600">
            Test OLX scraping directly in the browser to see what&apos;s
            happening
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={testOlxApi}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Test OLX API"}
          </button>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Status */}
            <div
              className={`rounded-lg p-4 ${results.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <h2 className="font-bold text-lg mb-2">
                {results.success ? "✓ Success" : "✗ Failed"}
              </h2>
              {results.totalItems !== undefined && (
                <p className="text-sm">
                  Total items: {results.totalItems} | Valid drafts:{" "}
                  {results.validDrafts}
                </p>
              )}
            </div>

            {/* Logs */}
            <div className="rounded-lg bg-white p-4 shadow border">
              <h3 className="font-bold mb-3">Execution Log</h3>
              <div className="space-y-1 font-mono text-sm">
                {results.logs?.map((log: string, i: number) => (
                  <div
                    key={i}
                    className={
                      log.startsWith("ERROR") ? "text-red-600" : "text-gray-700"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Drafts */}
            {results.drafts && results.drafts.length > 0 && (
              <div className="rounded-lg bg-white p-4 shadow border">
                <h3 className="font-bold mb-3">Sample Drafts (First 5)</h3>
                <div className="space-y-4">
                  {results.drafts.map((draft: any, i: number) => (
                    <div
                      key={i}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="font-semibold text-gray-900">
                        {draft.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Price: {draft.priceText || "N/A"} (
                        {draft.price || "null"})
                      </div>
                      <div className="text-sm text-gray-600">
                        Image: {draft.imageUrl ? "✓ Yes" : "✗ No"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 break-all">
                        URL: {draft.detailUrl}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <h3 className="font-bold text-red-900 mb-2">Error Details</h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
