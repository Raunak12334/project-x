import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function listDiscordActions() {
  const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
  try {
    const apps = ["discord", "discordbot"];
    
    for (const app of apps) {
      console.log(`\nActions for ${app}:`);
      // Since we don't have the exact method documented, let's try calling an API or we might not need this
      const actions = await composio.actions.get({ app: app });
      console.log(actions.map(a => a.name).join(", "));
    }
  } catch (err) {
    console.error("Error fetching actions:", err);
  }
}

listDiscordActions();
