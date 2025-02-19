import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Keyring } from "@polkadot/api";
import { addProxy, checkProxy, removeProxy } from "./substrate";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
});

const prompt = new PromptTemplate({
  template: `
    You are an AI managing proxies on the Polkadot blockchain. Here are the available commands:
    - "add proxy <proxy_address>"
    - "check proxy <owner_address> <proxy_address>"
    - "remove proxy <proxy_address>"

    User input: "{input}
    Respond in JSON format:: {{ "action": "addProxy" / "checkProxy" / "removeProxy", "data": { ... } }}
  `,
  inputVariables: ["input"],
});

export async function handlePrompt(input: string): Promise<string> {
  const chain = new LLMChain({ llm: model, prompt });
  const response = await chain.call({ input });

  try {
    const parsedResponse = JSON.parse(response.text);
    const { action, data } = parsedResponse;

    const keyring = new Keyring({ type: "sr25519" });
    const sender = keyring.addFromUri(process.env.PRIVATE_KEY || "");

    if (action === "addProxy") {
      return await addProxy(sender, data.proxyAddress);
    } else if (action === "checkProxy") {
      const isProxy = await checkProxy(data.owner, data.proxy);
      return isProxy ? "✅ Proxy exists!" : "❌ Proxy not found.";
    } else if (action === "removeProxy") {
      return await removeProxy(sender, data.proxyAddress);
    } else {
      return "⚠️ Invalid action!";
    }
  } catch (error) {
    console.error("Error processing prompt:", error);
    return "❌ Failed to process request.";
  }
}
