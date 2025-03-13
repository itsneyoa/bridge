import type Chat from "../structs/Chat";

export default class Config {
	public readonly token: string;
	public readonly serverIp: string;
	public readonly ownerId: string;
	public readonly channels: {
		[key in Chat]: string;
	};
	public readonly staffRole: string;
	public readonly logChannel?: string;

	public readonly devServerId?: string;

	constructor(dev: boolean) {
		this.token = this.resolveEnv("DISCORD_TOKEN");
		this.serverIp = this.resolveEnv("SERVER_IP", true) ?? "mc.hypixel.net";
		this.ownerId = this.resolveEnv("OWNER_ID");
		this.channels = {
			guild: this.resolveEnv("GUILD_CHANNEL_ID"),
			officer: this.resolveEnv("OFFICER_CHANNEL_ID"),
		};
		this.staffRole = this.resolveEnv("STAFF_ROLE_ID");

		this.logChannel = this.resolveEnv("LOG_CHANNEL_ID", true);

		this.devServerId = this.resolveEnv("DEV_SERVER_ID", !dev);
	}

	private resolveEnv<Optional extends boolean = false>(
		name: string,
		optional?: Optional,
	): Optional extends true ? string | undefined : string {
		const env = process.env[name];
		if (!env && !optional) throw `Env ${name} missing from config.`;
		return env as Optional extends true ? string | undefined : string;
	}
}
