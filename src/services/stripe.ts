import Stripe from "stripe";
import { version } from "../../package.json";
import ProxyAgent from "https-proxy-agent";

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  //httpAgent: process.env.http_proxy ? new ProxyAgent(process.env.http_proxy): null,
  appInfo: {
    name: "Ignews",
    version,
  },
});
