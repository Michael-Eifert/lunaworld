const FOUNDRY_URL = "https://foundry.lunaworld.net/";

async function checkFoundryStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(FOUNDRY_URL, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "lunaworld-status-check",
      },
    });

    return {
      active: response.status < 500,
      status: response.status,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      active: false,
      status: null,
      error: error.name === "AbortError" ? "timeout" : "unreachable",
      checkedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/foundry-status") {
      const status = await checkFoundryStatus();

      return Response.json(status, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
