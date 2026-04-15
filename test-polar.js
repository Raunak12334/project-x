import { Webhook } from "standardwebhooks";

const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "test-secret";

function createHeaders(payload) {
  const webhookId = "msg_test_polar";
  const timestamp = new Date();
  const timestampSeconds = Math.floor(timestamp.getTime() / 1000).toString();
  const secret = Buffer.from(WEBHOOK_SECRET, "utf-8").toString("base64");
  const signature = new Webhook(secret).sign(webhookId, timestamp, payload);

  return {
    "Content-Type": "application/json",
    "webhook-id": webhookId,
    "webhook-timestamp": timestampSeconds,
    "webhook-signature": signature,
  };
}

async function testWebhook() {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  console.log("Test 1: Missing Polar webhook signature headers");
  try {
    const response = await fetch(`${baseUrl}/api/webhooks/polar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "unknown.event", data: {} }),
    });
    const result = await response.json();
    console.log("Expected rejection:", response.status === 400, result.error);
  } catch (error) {
    console.log("Test failed:", error);
  }

  console.log("\nTest 2: Signed but unsupported Polar event");
  try {
    const payload = JSON.stringify({ type: "unknown.event", data: {} });
    const response = await fetch(`${baseUrl}/api/webhooks/polar`, {
      method: "POST",
      headers: createHeaders(payload),
      body: payload,
    });
    const result = await response.json();
    console.log("Expected rejection:", response.status === 400, result.error);
  } catch (error) {
    console.log("Test failed:", error);
  }

  console.log("\nTest 3: Pricing page accessibility");
  try {
    const response = await fetch(`${baseUrl}/pricing`);
    console.log("Pricing page responded:", response.status);
  } catch (error) {
    console.log("Pricing page failed:", error);
  }

  console.log("\nPolar integration smoke tests completed.");
}

testWebhook().catch(console.error);
