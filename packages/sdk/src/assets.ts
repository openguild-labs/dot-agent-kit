import { createApiCall } from "./utils";
import { checkBalanceTool } from "@dot-agent-kit/llm";





/**
 * Retrieves the native balance for a given account on a specified node.
 *
 * @returns llm tool for get balance
 */
export const getBalanceNativeTool = checkBalanceTool(createApiCall());


