import { readdirSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { inlineCode } from "discord.js";
import Fuse from "fuse.js";
import { type Bot, createBot as mineflayerCreateBot } from "mineflayer";
import type Bridge from "../structs/Bridge";
import { FullEmbed } from "../utils/Embed";
import * as events from "./events";

export default class Minecraft {
	public readonly bridge: Bridge;
	private readonly queue: Array<CommandToRun> = [];
	private looping = false;
	private bot?: Bot;
	public lastStatusMessage: "logout" | "login" = "logout";
	public relogAttempts = 0;
	public loggedIn = false;
	public chatLengthLimit = 256;

	constructor(bridge: Bridge) {
		this.bridge = bridge;
	}

	public start() {
		this.bot = this.createBot();
	}

	public get username() {
		return this.bot?.username;
	}

	public get version() {
		return this.bot?.version;
	}

	private createBot() {
		const auth = this.bridge.config.devServerId ? "offline" : "microsoft";

		this.bridge.log.sendSingleLog(
			"info",
			`Connecting to ${this.bridge.config.serverIp} with ${auth} auth`,
		);
		const bot = mineflayerCreateBot({
			viewDistance: "tiny",
			chatLengthLimit: this.chatLengthLimit,
			version: "1.18.2",
			auth,
			username: "Bridge",
			defaultChatPatterns: false,
			host: this.bridge.config.serverIp,
			profilesFolder: "./.minecraft/profiles",
			onMsaCode: ({
				user_code: code,
				verification_uri: link,
				expires_in,
				message,
			}) => {
				this.bridge.discord.sendAuthCode({
					code,
					link,
					expiresAt: Math.floor(Date.now() / 1000 + expires_in),
				});
				this.bridge.log.sendSingleLog("info", message);
			},
		});

		for (const event of Object.values(events)) {
			bot[event.once ? "once" : "on"](event.name, (...args: never[]) =>
				event.execute(this.bridge, ...args),
			);
		}

		return bot;
	}

	public refreshBot() {
		const delay = this.relogAttempts < 24 ? ++this.relogAttempts * 5 : 24;

		this.bridge.log.sendSingleLog(
			"info",
			`Minecraft bot disconnected from the server! Relogging in ${inlineCode(delay.toString())} seconds.`,
		);

		if (this.lastStatusMessage === "login") {
			this.lastStatusMessage = "logout";
			this.bridge.discord.sendEmbed(
				FullEmbed("failure", {
					author: {
						name: "Minecraft Bot has been Disconnected",
					},
					description: [
						"I have been kicked from the server, attempting to reconnect",
					].join("\n"),
				}),
				"both",
			);
		}

		setTimeout(() => {
			this.bot = this.createBot();
		}, delay * 1000);
	}

	public execute(
		fullCommand: CommandToRun,
		log?: ReturnType<typeof this.bridge.log.create>,
		priority = false,
	) {
		let command = fullCommand.command.trim();
		if (!command.startsWith("/")) command = `/${command}`;

		if (command.length > 256) {
			const warningMessage = `Command ${command} length is greater than 256, truncating`;
			log?.add("error", warningMessage) ??
				this.bridge.log.sendErrorLog(Error(warningMessage));
			command = command.slice(0, 256);
		}

		this.queue[priority ? "unshift" : "push"](fullCommand);
		const logMessage = `${inlineCode(command)} added to command queue - current position: ${inlineCode(priority ? this.queue.length.toString() : "1")}`;
		log?.add("command", logMessage) ??
			this.bridge.log.sendSingleLog("command", logMessage);

		this.loop();
	}

	public unsafeExecute(command: string, priority = false) {
		this.queue[priority ? "unshift" : "push"]({ command });
		const logMessage = `${inlineCode(command)} added to command queue - current position: ${inlineCode(priority ? this.queue.length.toString() : "1")}`;
		this.bridge.log.sendSingleLog("command", logMessage);

		this.loop();
	}

	public async loop(): Promise<unknown> {
		if (this.looping) return;
		if (!this.queue.length || !this.loggedIn) {
			this.looping = false;
			return;
		}

		if (!this.bot) throw new Error("Bot is undefined");

		try {
			this.looping = true;

			const currentCommand = this.queue.shift();

			if (!currentCommand) return;

			const { command, regex, noResponse } = currentCommand;

			this.bridge.log.sendSingleLog(
				"command",
				`Running ${inlineCode(command)}`,
			);
			this.bot.chat(command);

			const response = await Promise.race([
				this.bot.awaitMessage(
					...(regex
						? regex.map(({ exp }) => exp)
						: [unknownCommand, commandDisabled]),
					tooFast,
				),
				sleep(10 * 1000),
			]);

			if (response) {
				if (response.match(unknownCommand))
					this.bridge.log.sendSingleLog(
						"error",
						`Command ${inlineCode(command)} not found`,
					);
				if (response.match(commandDisabled))
					this.bridge.log.sendSingleLog(
						"error",
						`Command ${inlineCode(command)} disabled`,
					);

				if (response.match(tooFast)) {
					await sleep(0.5 * 1000); // Half a second
					return this.execute(currentCommand, undefined, true);
				}

				if (regex) {
					for (const { exp, exec } of regex) {
						const match = response.match(exp);

						if (!match) continue;

						return exec(match);
					}
				}
			} else {
				if (noResponse) return noResponse();
			}
		} finally {
			// await sleep(500)
			this.looping = false;
			this.loop();
		}
	}

	private guildMembersSet = new Set<string>();
	public guildMembers = {
		fuse: new Fuse([...this.guildMembersSet]),
		add: (...names: string[]) => {
			for (const name of names) {
				if (name === this.username || this.guildMembersSet.has(name)) continue;
				this.guildMembersSet.add(name);
				this.guildMembers.fuse.add(name);
			}
		},
		remove: (...names: string[]) => {
			for (const name of names) {
				this.guildMembersSet.delete(name);
				this.guildMembers.fuse.remove((item) => {
					return item === name;
				});
			}
		},
		get: () => this.guildMembersSet,
	};
}

interface CommandToRun {
	command: string;
	regex?: Array<ChatTrigger>;
	noResponse?: () => unknown;
}

export type ChatTrigger = {
	exp: RegExp;
	exec: (reason: RegExpMatchArray) => unknown;
};

export const unknownCommand = /^Unknown command. Type "\/help" for help.$/;
export const tooFast = /^You are sending commands too fast! Please slow down.$/;
export const commandDisabled = /^This command is currently disabled.$/;
