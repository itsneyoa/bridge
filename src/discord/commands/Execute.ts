import { ApplicationCommandOptionType, inlineCode } from "discord.js";
import type DiscordCommand from "../../structs/DiscordCommand";
import { SimpleEmbed } from "../../utils/Embed";

export const Execute: DiscordCommand = {
	name: "execute",
	description: "Executes the given command as the minecraft bot",
	options: [
		{
			name: "command",
			description: "The command to execute",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	permission: "owner",
	dmPermission: false,

	async execute(interaction, bridge, log) {
		let command = interaction.options.getString("command")?.trim();

		if (!command)
			return interaction.editReply({
				embeds: [SimpleEmbed("failure", "Command argument not found")],
			});

		if (!command.startsWith("/")) command = `/${command}`;

		bridge.minecraft.execute({ command }, log);
		return interaction.editReply({
			embeds: [SimpleEmbed("success", `Running ${inlineCode(command)}`)],
		});
	},
};
