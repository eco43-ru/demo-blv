// Cloudflare Worker — прокси для DaData (скрывает API-ключи от посетителей сайта)
// В настройках Worker добавьте переменные: DADATA_API_KEY и DADATA_SECRET_KEY

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname !== "/dadata") {
      return new Response("Not found", { status: 404 });
    }

    const inn = url.searchParams.get("inn");
    if (!inn) {
      return new Response(JSON.stringify({ error: "Missing inn" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const r = await fetch(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token " + env.DADATA_API_KEY,
          "X-Secret": env.DADATA_SECRET_KEY,
        },
        body: JSON.stringify({ query: inn }),
      }
    );

    const data = await r.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
