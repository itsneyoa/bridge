import type Event from "../../structs/MinecraftEvent";

export const MinecraftError: Event<"error"> = {
	name: "error",
	once: false,

	async execute(bridge, error) {
		try {
			bridge.log.sendErrorLog(error);
		} finally {
			console.error(error);
		}
	},
};
