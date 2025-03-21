import { type Message, inlineCode } from "discord.js";
import { unknownCommand } from "../../minecraft";
import type Bridge from "../../structs/Bridge";
import type Chat from "../../structs/Chat";
import type Event from "../../structs/DiscordEvent";
import cleanContent from "../../utils/CleanDiscordContent";
import { Warnings } from "../../utils/Styles";
import { cleanString } from "../../utils/ValidMinecraftCharacters";

export const MessageCreate: Event<"messageCreate"> = {
	name: "messageCreate",
	once: false,

	async execute(bridge, message) {
		if (
			message.author.id === bridge.discord.user.id ||
			message.author.system ||
			message.webhookId ||
			message.author.bot
		)
			return;

		switch (message.channelId) {
			case bridge.config.channels.guild:
				return handleMessage(bridge, message, "guild");

			case bridge.config.channels.officer:
				return handleMessage(bridge, message, "officer");
		}
	},
};

async function handleMessage(bridge: Bridge, message: Message, chat: Chat) {
	const [prefix, invalidPrefix] = cleanString(
		(await fetchPrefix(message)) ?? "Unknown",
	);
	const [content, invalidContent] = cleanString(
		cleanContent(fetchContent(message), message.channel).replace(/\n+/g, " ⤶ "),
	);

	for (const attach of message.attachments.values()) {
		console.log(attach);
		attach.url;
	}

	const log = bridge.log.create(
		"chat",
		`${inlineCode(prefix)}: ${inlineCode(content)}`,
	);

	try {
		if (!content) {
			log.add("chat", "Message had no content after clearning");
			return message.react(Warnings.emptyMessage.emoji);
		}

		if (invalidContent || invalidPrefix)
			message.react(Warnings.invalidMessage.emoji);

		let command = `${commands[chat]} ${prefix}: ${content}`;
		if (command.length > bridge.minecraft.chatLengthLimit) {
			log.add(
				"chat",
				`Message is ${command.length} characters (${command.length - bridge.minecraft.chatLengthLimit} over the limit), trimming end`,
			);
			command = command.slice(0, bridge.minecraft.chatLengthLimit);
			message.react(Warnings.invalidMessage.emoji);
		}

		return bridge.minecraft.execute(
			{
				command,
				regex: [
					{
						exp: RegExp(
							`^(?:Guild|Officer) > (?:\\[.+?\\] )?${bridge.minecraft.username}(?: \\[.+?\\])?: ${prefix}: .*`,
						),
						exec: () => undefined,
					},
					{
						exp: /^You cannot say the same message twice!$/,
						exec: () => message.react(Warnings.repeatMessage.emoji),
					},
					{
						exp: /^We blocked your comment ".+"/,
						exec: () => message.react(Warnings.blocked.emoji),
					},
					{
						exp: /^Advertising is against the rules. You will receive a punishment on the server if you attempt to advertise.$/,
						exec: () => message.react(Warnings.blocked.emoji),
					},
					{
						exp: /^Blocked message containing lobby command.$/,
						exec: () => message.react(Warnings.blocked.emoji),
					},
					{
						exp: unknownCommand,
						exec: () => message.react(Warnings.unknownCommand.emoji),
					},
				],
				noResponse: () => message.react(Warnings.timedOut.emoji),
			},
			log,
		);
	} finally {
		log.send();
	}
}

async function fetchPrefix(message: Message): Promise<string> {
	let prefix = message.member?.nickname ?? message.author.username;

	if (message.reference?.messageId) {
		const { author, member } = await message.channel.messages.fetch(
			message.reference.messageId,
		);
		if (member || author) prefix += ` ➜ ${member?.nickname ?? author.username}`;
	}

	return prefix;
}

function fetchContent(message: Message): string {
	return [
		message.content,
		...message.attachments.map((attachment) => attachment.url),
	].join(" ");
}

const commands: { [key in Chat]: `/${string}` } = {
	guild: "/gc",
	officer: "/oc",
};
