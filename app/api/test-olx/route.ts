import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TEST MODE: Return mock data to verify API route works
    // Once confirmed working, replace this with actual OLX fetch
    return NextResponse.json({
      success: true,
      message: "API route is working - returning test data",
      test: true,
      data: {
        data: [
          {
            id: "test-123",
            ad_id: "test-123",
            title: "Test Product - API Route Working",
            description:
              "This is test data to verify the API route is accessible",
            price: {
              value: {
                raw: 100000,
                display: "Rp 100.000",
              },
            },
            images: [
              {
                url: "https://via.placeholder.com/300",
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error("[OLX Proxy] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
