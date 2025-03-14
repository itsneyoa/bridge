import type Event from "../../structs/MinecraftEvent";

export const End: Event<"end"> = {
	name: "end",
	once: false,

	async execute(bridge, reason) {
		bridge.log.sendSingleLog(
			"error",
			`Disconnected from Minecraft server: ${reason}`,
		);
		bridge.minecraft.loggedIn = false;
		bridge.minecraft.refreshBot();
	},
};
