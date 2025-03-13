import type Event from "../../structs/MinecraftEvent";

const MinecraftError: Event<"error"> = {
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

export default MinecraftError;
