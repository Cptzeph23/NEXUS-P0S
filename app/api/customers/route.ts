import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, tenantId } = await request.json();

    if (!name || !tenantId) {
      return NextResponse.json(
        { error: "Name and tenant ID are required" },
        { status: 400 }
      );
    }

    const customer = {
      id: uuid(),
      tenant_id: tenantId,
      name,
      email: email || null,
      phone: phone || null,
      loyalty_points: 0,
      total_spent: 0,
      total_visits: 0,
    };

    const { data, error } = await supabaseAdmin
      .from("customers")
      .insert(customer)
      .select()
      .single();

    if (error) {
      console.error("Customer create error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        loyaltyPoints: data.loyalty_points,
        totalSpent: parseFloat(data.total_spent),
        totalVisits: data.total_visits,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
    console.error("Customer API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Customer search error:", error);
      throw error;
    }

    const customers = data.map((c: any) => ({
      id: c.id,
      tenantId: c.tenant_id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      loyaltyPoints: c.loyalty_points,
      totalSpent: parseFloat(c.total_spent),
      totalVisits: c.total_visits,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error("Customer search API error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}