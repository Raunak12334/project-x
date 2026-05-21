import { Composio } from "@composio/core";
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../.env") });

async function testComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    console.error("COMPOSIO_API_KEY is not set");
    return;
  }

  try {
    const composio = new Composio({ apiKey });
    console.log("Composio client initialized");
    
    // Test creating a session (using a dummy organization ID)
    const session = await composio.create("test-org-id");
    console.log("Session created");
    
    const response = await session.toolkits({ limit: 10 });
    console.log("Toolkits response:", JSON.stringify(response, null, 2));
    
    if (response && response.items) {
      console.log(`Found ${response.items.length} toolkits`);
    } else {
      console.log("No toolkits found in response items");
    }
  } catch (error) {
    console.error("Error testing Composio:", error);
  }
}

testComposio();
