const { Composio } = require("@composio/core");

async function main() {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
        console.log("No API key");
        return;
    }
    const composio = new Composio({ apiKey });
    const session = await composio.create("test-org");
    
    // Testing toolkits and categories
    try {
        const toolkits = await session.toolkits({ limit: 5 });
        console.log("Toolkit keys:", Object.keys(toolkits.items[0] || {}));
        console.log("Categories test:", typeof session.toolkits.listCategories);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
