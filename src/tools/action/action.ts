import { TxCallData } from "polkadot-api"
import { ApiPromise } from "../substrace/substraceConnector"
import { MultiAddress } from "@polkadot-api/descriptors"
import { createProxy, removeProxy, callAsProxy, transferKeepAlive } from "../pallet-proxy/call"

type Action = "addProxy" | "removeProxy" | "callAsProxy" | "transferKeepAlive"

interface ActionParams {
	api: ApiPromise
	delegate?: MultiAddress
	address?: MultiAddress
	call?: TxCallData
	to?: MultiAddress
	amount?: bigint
}

export async function executeAction(action: Action, params: ActionParams): Promise<string | TxCallData> {
	switch (action) {
		case "addProxy":
			if (!params.delegate) throw new Error("Delegate address is required for addProxy")
			return await createProxy(params.api, params.delegate)

		case "removeProxy":
			if (!params.delegate) throw new Error("Delegate address is required for removeProxy")
			return await removeProxy(params.api, params.delegate)

		case "callAsProxy":
			if (!params.address || !params.call) throw new Error("Address and call data are required for callAsProxy")
			return await callAsProxy(params.api, { address: params.address, call: params.call })

		case "transferKeepAlive":
			if (!params.to || !params.amount) throw new Error("Destination address and amount are required for transferKeepAlive")
			return await transferKeepAlive(params.api, params.to, params.amount)

		default:
			throw new Error("Invalid action")
	}
}