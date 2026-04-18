import { Composio } from "@composio/core";
import dotenv from "dotenv";
dotenv.config();

async function testSearch() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }

  const composio = new Composio({ apiKey });
  // We don't need a session to check toolkit list? 
  // Actually, in the router we create a session.
  
  try {
      // Direct toolkits call
      const response = await composio.toolkits.getSpecs({ 
          // query: "slack" // Check if this exists
      });
      console.log("Keys in response.items[0]:", Object.keys(response[0]));
      
      // The router uses session.toolkits
      // But composio.toolkits is also available
  } catch (e) {
      console.error(e);
  }
}

testSearch();
