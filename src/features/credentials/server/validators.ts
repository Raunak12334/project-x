/**
 * Validates an OpenAI API key by making a test API call
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const { OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });
    await client.models.list();
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Validates an Anthropic API key by making a test API call
 */
export async function validateAnthropicKey(apiKey: string): Promise<boolean> {
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    // Test by creating a messages object (doesn't make an actual call)
    await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "test" }],
    });
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Validates a Gemini API key by making a test API call
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("test");
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Validates a Hugging Face API key by making a test API call
 */
export async function validateHuggingFaceKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/status",
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    );
    return response.ok;
  } catch (_error) {
    return false;
  }
}

/**
 * Generic API key validator (makes a simple HTTP test)
 */
export async function validateGenericKey(apiKey: string): Promise<boolean> {
  // For generic keys, we just check if it's not empty
  return apiKey.trim().length > 0;
}

/**
 * Main credential validation dispatcher
 */
export async function validateCredential(
  type: string,
  value: string,
): Promise<{ isValid: boolean; error?: string }> {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: "API key cannot be empty" };
  }

  try {
    let isValid = false;

    switch (type.toUpperCase()) {
      case "OPENAI":
        isValid = await validateOpenAIKey(value);
        break;
      case "ANTHROPIC":
        isValid = await validateAnthropicKey(value);
        break;
      case "GEMINI":
        isValid = await validateGeminiKey(value);
        break;
      case "HUGGINGFACE":
        isValid = await validateHuggingFaceKey(value);
        break;
      case "GENERIC":
        isValid = await validateGenericKey(value);
        break;
      default:
        return { isValid: false, error: "Unknown credential type" };
    }

    if (!isValid) {
      return {
        isValid: false,
        error: `Invalid ${type} credentials. Please check your API key.`,
      };
    }

    return { isValid: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Validation failed";
    return {
      isValid: false,
      error: `Failed to validate credential: ${message}`,
    };
  }
}
