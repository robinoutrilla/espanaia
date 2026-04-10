import { contextBridge } from "electron";

const apiArgumentPrefix = "--espanaia-api-url=";
const apiArgument = process.argv.find((argument) => argument.startsWith(apiArgumentPrefix));
const apiUrl = apiArgument ? apiArgument.slice(apiArgumentPrefix.length) : "http://127.0.0.1:4310";

contextBridge.exposeInMainWorld("espanaiaDesktop", {
  apiUrl,
  platform: process.platform,
  packaged: process.env.APP_ENV === "production",
});
