import type {
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	CommandInteraction,
} from "discord.js";
import { SimpleEmbed } from "../utils/Embed";
import type Bridge from "./Bridge";

export default interface DiscordCommand
	extends ChatInputApplicationCommandData {
	permission: "all" | "staff" | "owner";
	execute: (
		command: ChatInputCommandInteraction,
		bridge: Bridge,
		log: ReturnType<typeof bridge.log.create>,
	) => Promise<unknown>;
}

export function noResponse(interaction: CommandInteraction) {
	return async () =>
		await interaction.editReply({
			embeds: [SimpleEmbed("failure", "Response not found")],
		});
}
