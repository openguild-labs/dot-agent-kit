
import dotenv from "dotenv";
import { HumanMessage , AIMessage } from "@langchain/core/messages";
import { Connect } from "../src/tools/substrace/substraceConnector"; 
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const userActionSchema = z.object({
  action: z.enum(["swap", "check_balance", "transfer", "mint", "mintVtoken", "staking"]).describe("The type of action to perform."),
  chain: z.enum(["Polkadot", "Kusama", "Local", "Bifrost", "Moonbeam"]).describe("The blockchain to perform the action on."),
  amount: z.number().optional().describe("The token amount (only required for swap and transfer)."),
});

const makeActions = tool(
  async ({ action, chain, amount }) => {
    console.log(`User selected action: ${action} on ${chain} with amount: ${amount || "N/A"}`);

    const blockchain = new Connect(chain).connect();
    
    return "Connect";
  },
  {
    name: "parseUserAction",
    description: "A tool to analyze user requests and perform the corresponding blockchain action.",
    schema: userActionSchema,
  }
);

const llm = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0.7,
});

const llmWithTools = llm.bindTools([makeActions]);

async function runWorkflow() {
  try {

    const messages_workflow1 = [new HumanMessage({ content: "hi, how are you" })];
    const workflow1 = await llmWithTools.invoke(messages_workflow1);
    console.log("Workflow 1 Output:", workflow1);

    const messages_workflow2 = [new HumanMessage({ content: "what is polkadot" })];
    const workflow2 = await llmWithTools.invoke(messages_workflow2);
    console.log("Workflow 2 Output:", workflow2);

    const messages_workflow3 = [new HumanMessage({ content: "Hey Mavis, I want to try swap 10 DOT on Moonbeam" })];
    const workflow3 = await llmWithTools.invoke(messages_workflow3);
    console.log("Workflow 3 Output:", workflow3);
  
  } catch (error) {
    console.error("Error in LLM workflow:", error);
  }
}

runWorkflow();
