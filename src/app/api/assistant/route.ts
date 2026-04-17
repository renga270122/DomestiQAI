import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantRequest = {
  messages?: ChatMessage[];
  householdContext?: string;
};

type Provider = "openai" | "github-models" | "azure-openai";

type ProviderConfig = {
  provider: Provider;
  model?: string;
  url: string;
  headers: Record<string, string>;
};

type UpstreamJsonResponse = {
  error?: {
    message?: string;
    code?: string;
  };
  choices?: Array<{
    message?: { content?: string | null };
    delta?: { content?: string | null };
  }>;
};

const SYSTEM_PROMPT = `You are DomestiQ AI, a home cleaning assistant inside a mobile app.
Give concise, practical cleaning guidance.
Prioritize fast, actionable steps over long explanations.
When helpful, structure advice as a short ordered plan.
Use the supplied household context when it is relevant.
Assume the user wants home-cleaning help, reminders, sequencing, or prioritization.
Avoid mentioning that you are an AI model unless directly asked.`;

function getProviderConfig(): ProviderConfig | null {
  const provider = (process.env.LLM_PROVIDER ?? "openai") as Provider;

  if (provider === "github-models") {
    const apiKey = process.env.GITHUB_MODELS_TOKEN;
    const model = process.env.GITHUB_MODELS_MODEL ?? "microsoft/phi-4-reasoning";
    const baseUrl = process.env.GITHUB_MODELS_BASE_URL;

    if (!apiKey) {
      return null;
    }

    // Use the official GitHub Models API endpoint
    const url = baseUrl
      ? `${baseUrl}/v1/models/${model}/chat/completions`
      : `https://api.github.com/v1/models/${model}/chat/completions`;

    return {
      provider,
      model,
      url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    };
  }

  if (provider === "azure-openai") {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

    if (!apiKey || !endpoint || !deployment) {
      return null;
    }

    const normalizedEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;

    return {
      provider,
      url: `${normalizedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    provider: "openai",
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    url: `${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };
}

function buildProviderErrorMessage(provider: Provider) {
  if (provider === "github-models") {
    return "Missing GitHub Models configuration. Set GITHUB_MODELS_TOKEN and optionally GITHUB_MODELS_MODEL.";
  }

  if (provider === "azure-openai") {
    return "Missing Azure OpenAI configuration. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT.";
  }

  return "Missing OpenAI configuration. Set OPENAI_API_KEY and optionally OPENAI_MODEL.";
}

function buildUpstreamBody(
  config: ProviderConfig,
  messages: ChatMessage[],
  householdContext?: string,
) {
  const promptMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (householdContext) {
    promptMessages.push({
      role: "system",
      content: `Household context: ${householdContext}`,
    });
  }

  promptMessages.push(...messages);

  const baseBody = {
    temperature: 0.4,
    stream: true,
    messages: promptMessages,
  };

  if (config.provider === "azure-openai") {
    return baseBody;
  }

  return {
    ...baseBody,
    model: config.model,
  };
}

function extractContentFromSseLine(line: string): string {
  if (!line.startsWith("data:")) {
    return "";
  }

  const payload = line.slice(5).trim();

  if (!payload || payload === "[DONE]") {
    return "";
  }

  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{
        delta?: { content?: string | null };
        message?: { content?: string | null };
      }>;
    };

    return parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

function extractContentFromJsonPayload(payload: UpstreamJsonResponse): string {
  return payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.delta?.content ?? "";
}

function normalizeUpstreamError(status: number, errorText: string) {
  const trimmed = errorText.slice(0, 500);

  if (status === 401) {
    return "The assistant provider rejected the API credentials. Update the active provider token or API key.";
  }

  if ((status === 401 || status === 403) && /models:read|`models` permission|models permission|permission|forbidden/i.test(trimmed)) {
    return "The GitHub Models token is missing the required models permission. Create a token with GitHub Models access and update GITHUB_MODELS_TOKEN.";
  }

  if (status === 404 && /deployment|model/i.test(trimmed)) {
    return "The configured AI model or deployment could not be found. Check the selected model name and deployment settings.";
  }

  if (status === 429 || /quota|insufficient_quota|rate limit/i.test(trimmed)) {
    return "The connected AI provider has hit a quota or rate limit.";
  }

  return "The assistant request failed.";
}

function createStreamFromUpstream(upstream: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body?.getReader();

      if (!reader) {
        controller.error(new Error("Missing upstream response body."));
        return;
      }

      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const content = extractContentFromSseLine(part);

            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        }

        const remainingLines = buffer.split(/\r?\n/);

        for (const line of remainingLines) {
          const content = extractContentFromSseLine(line);

          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function POST(request: Request) {
  const provider = (process.env.LLM_PROVIDER ?? "openai") as Provider;
  const config = getProviderConfig();

  if (!config) {
    return NextResponse.json({ error: buildProviderErrorMessage(provider) }, { status: 503 });
  }

  let body: AssistantRequest;

  try {
    body = (await request.json()) as AssistantRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter((message) => message && typeof message.content === "string")
        .slice(-12)
    : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "At least one message is required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(config.url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(buildUpstreamBody(config, messages, body.householdContext)),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();

      console.error("Assistant upstream request failed", {
        provider: config.provider,
        status: upstream.status,
        details: errorText.slice(0, 500),
      });

      return NextResponse.json(
        {
          error: normalizeUpstreamError(upstream.status, errorText),
          details: errorText.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = (await upstream.json()) as UpstreamJsonResponse;
      const content = extractContentFromJsonPayload(json);

      if (!content.trim()) {
        return NextResponse.json(
          {
            error: "The assistant returned an empty response.",
            details: json.error?.message ?? "Upstream JSON response did not contain assistant content.",
          },
          { status: 502 },
        );
      }

      return new Response(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(createStreamFromUpstream(upstream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Assistant provider request threw", {
      provider: config.provider,
      error,
    });

    return NextResponse.json(
      { error: "Unable to reach the assistant provider right now." },
      { status: 502 },
    );
  }
}
