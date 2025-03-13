import type { BotEvents } from "mineflayer";
import type Bridge from "./Bridge";

export default interface DiscordEvent<K extends keyof BotEvents> {
	name: K;
	once: boolean;

	execute(bridge: Bridge, ...args: Parameters<BotEvents[K]>): Promise<unknown>;
}
