import { inlineCode } from "discord.js";
import type Event from "../../structs/MinecraftEvent";
import { FullEmbed } from "../../utils/Embed";

export const Spawn: Event<"spawn"> = {
	name: "spawn",
	once: false,

	async execute(bridge) {
		bridge.minecraft.loggedIn = true;
		bridge.minecraft.relogAttempts = 0;

		if (bridge.minecraft.lastStatusMessage === "logout") {
			bridge.minecraft.lastStatusMessage = "login";
			bridge.discord.sendEmbed(
				FullEmbed("success", {
					author: {
						name: "Minecraft Bot is Connected",
					},
					description: `Connected as ${inlineCode(bridge.minecraft.username ?? "Unknown")} on version ${inlineCode(bridge.minecraft.version ?? "Unknown")}`,
				}),
				"both",
			);
		}

		bridge.minecraft.execute({ command: "/locraw" }, undefined, true);
		bridge.minecraft.loop();
	},
};

export default Spawn;
