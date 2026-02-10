import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  'Bankura': { lat: 23.2324, lon: 87.0697 },
  'Bardhaman': { lat: 23.2550, lon: 87.8550 },
  'Purulia': { lat: 23.3322, lon: 86.3644 },
  'Paschim Medinipur': { lat: 22.4292, lon: 87.3200 },
  'Jhargram': { lat: 22.4525, lon: 86.9880 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { district, latitude, longitude } = await req.json();

    const coords = (latitude && longitude)
      ? { lat: latitude, lon: longitude }
      : DISTRICT_COORDS[district];

    if (!coords) {
      return new Response(
        JSON.stringify({ error: "District not found" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia/Kolkata`;

    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
