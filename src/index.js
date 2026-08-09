const FOUNDRY_URL = "https://foundry.lunaworld.net/";
const MYSTICS_ADVENTURE_URL = "https://mystics-adventure.lunaworld.net/";

async function checkServiceStatus(serviceUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(serviceUrl, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "lunaworld-status-check",
      },
      cache: "no-store",
    });

    return {
      active: response.status >= 200 && response.status < 400,
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
      const status = await checkServiceStatus(FOUNDRY_URL);

      return Response.json(status, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    if (url.pathname === "/api/mystics-adventure-status") {
      const status = await checkServiceStatus(MYSTICS_ADVENTURE_URL);

      return Response.json(status, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
