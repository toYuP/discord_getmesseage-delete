import fetch from "node-fetch";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_IDS = process.env.CHANNEL_ID.split(",");

const headers = {
  Authorization: `Bot ${TOKEN}`  // ← ここはバッククォートで囲む
};

async function processChannel(channelId) {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
    { headers }
  );

  const messages = await res.json();

  for (const msg of messages) {
    if (msg.reactions && msg.reactions.length > 0) {
      console.log(`Delete: ${msg.id} from channel ${channelId}`);
      await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages/${msg.id}`,
        { method: "DELETE", headers }
      );
    }
  }
}

async function main() {
  for (const channelId of CHANNEL_IDS) {
    await processChannel(channelId.trim());
  }
}

main().catch(console.error);
