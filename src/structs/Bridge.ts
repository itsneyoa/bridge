import Discord from "../discord";
import Minecraft from "../minecraft";
import Config from "../utils/Config";
import createLogger from "./Logger";

export default class Bridge {
	readonly discord: Discord;
	readonly minecraft: Minecraft;
	readonly config: Config;
	readonly log: ReturnType<typeof createLogger>;

	constructor(dev = false) {
		this.config = new Config(dev);

		this.discord = new Discord(this);
		this.minecraft = new Minecraft(this);
		this.log = createLogger(this);
	}

	public async start() {
		this.discord.init();
	}
}
