import { GuildMemberRoleManager, inlineCode } from "discord.js";
import type Event from "../../structs/DiscordEvent";
import { SimpleEmbed } from "../../utils/Embed";

export const InteractionCreate: Event<"interactionCreate"> = {
	name: "interactionCreate",
	once: false,

	async execute(bridge, interaction) {
		if (interaction.isAutocomplete()) {
			const command = bridge.discord.commands.get(interaction.commandName);
			if (!command) return;

			const focusedValue = interaction.options.getFocused();
			const choices = bridge.minecraft.guildMembers.fuse.search(focusedValue, {
				limit: 25,
			});

			await interaction.respond(
				choices.length > 0
					? choices.map(({ item }) => ({ name: item, value: item }))
					: [...bridge.minecraft.guildMembers.get()]
							.slice(0, 25)
							.map((item) => ({ name: item, value: item })),
			);
		}

		if (interaction.isChatInputCommand()) {
			const message = `${inlineCode(interaction.user.tag)} ran ${inlineCode(interaction.commandName)}`;
			const log = interaction.options.data.length
				? bridge.log.create("command", message, {
						name: "Arguments",
						value: interaction.options.data
							.map(
								({ name, value }) =>
									`${inlineCode(name)}: ${inlineCode(String(value))}`,
							)
							.join("\n"),
						inline: true,
					})
				: bridge.log.create("command", message);

			try {
				const command = bridge.discord.commands.get(interaction.commandName);

				if (!command) {
					log.add(
						"error",
						`Command ${interaction.commandName} called but implementation not found`,
					);
					return interaction.reply({
						embeds: [
							SimpleEmbed(
								"failure",
								`Command ${inlineCode(interaction.commandName)} could not be found`,
							),
						],
						ephemeral: true,
					});
				}

				switch (command.permission) {
					case "staff":
						if (
							!(interaction.member?.roles instanceof GuildMemberRoleManager
								? interaction.member?.roles.cache.has(bridge.config.staffRole)
								: interaction.member?.roles.includes(bridge.config.staffRole))
						) {
							return interaction.reply({
								embeds: [
									SimpleEmbed(
										"failure",
										[
											`You don't have permission to do that.`,
											`Required permission: <@&${bridge.config.staffRole}>`,
										].join("\n"),
									),
								],
								ephemeral: true,
							});
						}
						break;
					case "owner":
						if (interaction.user.id !== bridge.config.ownerId) {
							return interaction.reply({
								embeds: [
									SimpleEmbed(
										"failure",
										[
											`You don't have permission to do that.`,
											`Required permission: <@!${bridge.config.ownerId}>`,
										].join("\n"),
									),
								],
								ephemeral: true,
							});
						}
						break;
				}

				await interaction.deferReply();

				try {
					return await command.execute(interaction, bridge, log);
				} catch (error) {
					if (error instanceof Error) {
						log.add("error", [error.name, error.stack].join("\n"));
					} else {
						log.add("error", String(error));
					}
					return interaction.reply({
						embeds: [
							SimpleEmbed(
								"failure",
								"Something went wrong while trying to run that",
							),
						],
						ephemeral: true,
					});
				}
			} finally {
				log.send();
			}
		}
	},
};
