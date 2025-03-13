import { codeBlock } from "discord.js";
import type Event from "../../structs/DiscordEvent";

const DiscordError: Event<"error"> = {
	name: "error",
	once: false,

	async execute(bridge, error) {
		try {
			bridge.log.sendSingleLog(
				"info",
				`${error.name}: ${codeBlock(error.message)}`,
			);
		} finally {
			console.error(error);
		}
	},
};

export default DiscordError;
