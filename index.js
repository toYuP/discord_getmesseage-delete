import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error("Error: DISCORD_TOKEN is not set in Secrets");
  process.exit(1);
}

// Discord.js クライアント
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // 参加しているすべてのサーバー
  for (const [guildId, guild] of client.guilds.cache) {
    console.log(`Server: ${guild.name} (${guildId})`);

    // テキストチャンネルのみ取得
    const channels = guild.channels.cache.filter(c => c.isTextBased());

    for (const [channelId, channel] of channels) {
      try {
        // 直近50件のメッセージを取得
        const res = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
          { headers: { Authorization: `Bot ${TOKEN}` } }
        );

        const messages = await res.json();

        for (const msg of messages) {
          if (msg.reactions && msg.reactions.length > 0) {
            console.log(`Delete: ${msg.id} from ${channel.name} (${channelId})`);
            await fetch(
              `https://discord.com/api/v10/channels/${channelId}/messages/${msg.id}`,
              { method: "DELETE", headers: { Authorization: `Bot ${TOKEN}` } }
            );
          }
        }
      } catch (e) {
        console.error(`Error processing channel ${channel.name} (${channelId}):`, e.message);
      }
    }
  }

  console.log("Cleanup finished.");
  process.exit(0); // GitHub Actions用に終了
});

client.login(TOKEN);
