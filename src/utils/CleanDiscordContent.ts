import type { Channel } from "discord.js";

export default function cleanContent(str: string, channel: Channel) {
	return str.replace(
		/<(@[!&]?|#|a?:\w+?:)(\d{17,19})>/g,
		(match: string, type: string, id: string) => {
			switch (type) {
				case "@":
				case "@!": {
					if (!channel.isDMBased()) {
						const member = channel.guild?.members.cache.get(id);
						if (member) {
							return `@${member.displayName}`;
						}
					}

					const user = channel.client.users.cache.get(id);
					return user ? `@${user.username}` : match;
				}
				case "@&": {
					if (channel.isDMBased()) return match;
					const role = channel.guild.roles.cache.get(id);
					return role ? `@${role.name}` : match;
				}
				case "#": {
					if (channel.isDMBased()) return match;
					const mentionedChannel = channel.client.channels.cache.get(id);
					return mentionedChannel && !mentionedChannel.isDMBased()
						? `#${mentionedChannel.name}`
						: match;
				}
				default: {
					if (type.match(/^:\w+?:$/)) return type;
					if (type.match(/^a:\w+?:$/)) return type.slice(1);
					return match;
				}
			}
		},
	);
}
