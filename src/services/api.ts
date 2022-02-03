import axios, { AxiosInstance } from "axios";

export const api = getAxios();

function getAxios(): AxiosInstance {
  console.log(process.env.PROXY_ENABLED);

  return axios.create({
    baseURL: "/api/",
  });
}
