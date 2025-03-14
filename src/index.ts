import Bridge from "./structs/Bridge";
const dev = process.env.NODE_ENV !== "production";

process.title = dev ? "Chat Bridge" : "Chat Bridge (dev)";

new Bridge(dev).start();
