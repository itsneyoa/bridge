# Hypixel Chat Bridge

> ⚠️ Hypixel has historically banned accounts running bot software as Mineflayer is not a regular client. Use at your own risk!

[![CodeFactor](https://img.shields.io/codefactor/grade/github/itsneyoa/bridge/main?style=for-the-badge)](https://www.codefactor.io/repository/github/itsneyoa/bridge)
[![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-green?logo=creativecommons&style=for-the-badge)](https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1)

## Installation

### Requirements

- Node.js >= 16.9.0
- Git
- Yarn (Installed with Node.js, run `corepack enable`)
- A Minecraft account
- A Discord bot with permissions "Manage Webhooks", "View Channels", "Add Reactions" and "Send Mesaages", and scope "bot" and "applications.commands"

### Setup

1. Clone the repository and change directory into the folder
2. Install dependencies with yarn
3. Create and populate the config file
4. Run the bridge!

```sh
    git clone https://github.com/itsneyoa/bridge.git # Clone the repo
    cd bridge # Change directory to the project folder
    yarn install # Install dependencies
    cp .env.example .env # Create the config file
    nano .env # Populate the config values
    yarn start # Start the bridge
```

---

## Contributing

### Dev environment setup

1. [Add extra values to config file](#extra-env-keys-for-development)
2. Add a Minecraft Server jar to `server/`, setting `offline-mode` to true in `server.properties` (Currently the bridge runs on 1.8.8)
3. Start the server with `yarn server`
4. Run the bridge with `yarn dev` rather than `yarn start`

### To do

- Colourise the terminal logging output for console
- Clean up the logger
- Write setup and contributing instructions
- Add one click deploy to DigitalOcean and dockerise
- Cache the guild list for autocomplete in slash commands and staff joins/leaves sent to officer chat
- Support for replying to (e.g. `/oc neyoa ➜ 23456789: <message>`)
- More events and commands:
  - /guild log
  - /guild motd
  - /guild slow
  - /guild quest
  - /guild list
  - Weekly guild quest completed

## Extra .env keys for development

```env
# The server to use as the dev environment
DEV_SERVER_ID=
```
