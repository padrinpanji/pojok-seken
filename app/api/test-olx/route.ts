import { NextResponse } from "next/server";

const OLX_API_HEADERS = {
    accept: "application/json, text/plain, */*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    origin: "https://www.olx.co.id",
    referer: "https://www.olx.co.id/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

async function fetchOlxJson(url: string) {
    const res = await fetch(url, {
        headers: OLX_API_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    if (!res.ok) return { error: `${res.status}: ${text.slice(0, 200)}`, data: null };
    try { return { error: null, data: JSON.parse(text) }; } catch { return { error: "JSON parse failed", data: null }; }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const adId = searchParams.get("adId"); // optional: test single item detail

    // Test item detail page HTML fetch if adId provided
    if (adId) {
        // Try fetching the detail page HTML directly to find seller name pattern
        const detailUrl = `https://www.olx.co.id/item/test-iid-${adId}`;

        // Try the v2 item API first
        const v2Url = `https://www.olx.co.id/api/relevance/v2/item/${adId}`;
        const { error: v2Error, data: v2Data } = await fetchOlxJson(v2Url);

        // Try the orion API
        const orionUrl = `https://www.olx.co.id/api/orion/v1/item/${adId}`;
        const { error: orionError, data: orionData } = await fetchOlxJson(orionUrl);

        return NextResponse.json({
            success: true,
            adId,
            detailUrl,
            v2: v2Error ? { error: v2Error } : { data: v2Data },
            orion: orionError ? { error: orionError } : {
                sellerName: (orionData as Record<string, unknown> | null)?.seller_name
                    || (orionData as Record<string, unknown> | null)?.store_name
                    || ((orionData as Record<string, unknown> | null)?.user as Record<string, unknown> | null)?.name,
                topLevelKeys: orionData ? Object.keys(orionData as object) : [],
                data: orionData,
            },
        });
    }

    // Search API
    const apiUrl = new URL("https://www.olx.co.id/api/relevance/v4/search");
    apiUrl.searchParams.set("location", "4000018");
    apiUrl.searchParams.set("page", page);
    apiUrl.searchParams.set("query", "barang bekas");

    const { error, data: parsed } = await fetchOlxJson(apiUrl.toString());
    if (error) return NextResponse.json({ success: false, error }, { status: 502 });

    const items = Array.isArray(parsed?.data) ? parsed.data : [];

    return NextResponse.json({
        success: true,
        page: Number(page),
        totalItems: items.length,
        // Show all top-level keys of first item
        firstItemKeys: items[0] ? Object.keys(items[0]) : [],
        sampleRaw: items.slice(0, 3).map((item: Record<string, unknown>) => ({
            ad_id: item.ad_id,
            id: item.id,
            title: item.title,
            price: item.price,
            user_name: item.user_name,
            user: item.user,
            store_name: item.store_name,
            seller: item.seller,
            location: item.location,
        })),
        // First 3 ad_ids so we can test the detail API
        sampleAdIds: items.slice(0, 3).map((i: Record<string, unknown>) => i.ad_id),
        data: parsed,
    });
}
