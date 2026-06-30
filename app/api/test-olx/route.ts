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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";

    const apiUrl = new URL("https://www.olx.co.id/api/relevance/v4/search");
    apiUrl.searchParams.set("location", "4000018");
    apiUrl.searchParams.set("page", page);
    apiUrl.searchParams.set("query", "barang bekas");

    try {
        const response = await fetch(apiUrl.toString(), {
            headers: OLX_API_HEADERS,
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
        });

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `OLX API returned ${response.status}: ${text.slice(0, 200)}` },
                { status: 502 },
            );
        }

        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed?.data) ? parsed.data : [];

        // Return sample of raw item structure for debugging
        return NextResponse.json({
            success: true,
            page: Number(page),
            totalItems: items.length,
            // Full raw structure of first 3 items for debugging
            sampleRaw: items.slice(0, 3).map((item: Record<string, unknown>) => ({
                ad_id: item.ad_id,
                id: item.id,
                title: item.title,
                price: item.price,
                images: Array.isArray(item.images)
                    ? (item.images as unknown[]).slice(0, 1)
                    : [],
            })),
            data: parsed,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
