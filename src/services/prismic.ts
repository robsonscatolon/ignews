import { Client } from "@prismicio/client";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";

export function getPrismicClient(): Client {
  const prismic = new Client(process.env.PRISMIC_API, {
    accessToken: process.env.PRISMIC_ACESS_TOKEN,

    fetch: async (url, options) => {
      return fetch(url, {
        agent: process.env.http_proxy
          ? new HttpsProxyAgent(process.env.http_proxy)
          : null,
      })
    },
  });

  return prismic;
}
