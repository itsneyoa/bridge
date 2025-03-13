import { ApplicationCommandOptionType, inlineCode } from "discord.js";
import type DiscordCommand from "../../structs/DiscordCommand";
import { noResponse } from "../../structs/DiscordCommand";
import { guildDefaults } from "../../utils/CommonRegex";
import { SimpleEmbed } from "../../utils/Embed";

const Demote: DiscordCommand = {
	name: "demote",
	description: "Demotes the given user by one guild rank",
	options: [
		{
			name: "username",
			description: "The user to demote",
			type: ApplicationCommandOptionType.String,
			minLength: 1,
			maxLength: 16,
			required: true,
			autocomplete: true,
		},
	],
	permission: "staff",
	dmPermission: false,

	async execute(interaction, bridge, log) {
		const user = interaction.options.getString("username")?.trim();

		if (!user)
			return interaction.editReply({
				embeds: [SimpleEmbed("failure", "User argument not found")],
			});
		if (user.match(/\s/g))
			return interaction.editReply({
				embeds: [SimpleEmbed("failure", "User argument cannot contain spaces")],
			});

		const command = `/g demote ${user}`;

		return bridge.minecraft.execute(
			{
				command,
				regex: [
					{
						exp: RegExp(
							`^(?:\\[.+?\\] )?(${user}) was demoted from (.+) to (.+)$`,
							"i",
						),
						exec: ([, username, from, to]) =>
							interaction.editReply({
								embeds: [
									SimpleEmbed(
										"success",
										`${inlineCode(username)} has been demoted from ${inlineCode(from)} to ${inlineCode(to)}`,
									),
								],
							}),
					},
					{
						exp: RegExp(
							`^(?:\\[.+?\\] )?(${user}) is already the lowest rank you've created!-*$`,
							"i",
						),
						exec: ([, username]) =>
							interaction.editReply({
								embeds: [
									SimpleEmbed(
										"failure",
										`${inlineCode(username)} is already the lowest guild rank`,
									),
								],
							}),
					},
					{
						exp: /^(?:You can only demote up to your own rank!|(?:\[.+?\] )?(\w+) is the guild master so can't be demoted!)-*$/,
						exec: () =>
							interaction.editReply({
								embeds: [
									SimpleEmbed("failure", `I don't have permission to do that`),
								],
							}),
					},
					...guildDefaults(interaction, user),
				],
				noResponse: noResponse(interaction),
			},
			log,
		);
	},
};

export default Demote;
