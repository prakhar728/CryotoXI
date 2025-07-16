import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 })
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Email: email,
          },
        }),
      }
    )

    if (!airtableRes.ok) {
      const err = await airtableRes.json()
      console.error("Airtable error:", err)
      return NextResponse.json({ message: "Airtable error", details: err }, { status: 500 })
    }

    const data = await airtableRes.json()
    return NextResponse.json({ message: "Success", data }, { status: 200 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
