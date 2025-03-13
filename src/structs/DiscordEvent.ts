import type { ClientEvents } from "discord.js";
import type Bridge from "./Bridge";

export default interface DiscordEvent<K extends keyof ClientEvents> {
	name: K;
	once: boolean;

	execute(bridge: Bridge, ...args: ClientEvents[K]): Promise<unknown>;
}
