import { westendChain } from "@dot-agent-kit/common"
import { PolkadotApi } from "./api"




export const createApiCall = () => {

    const api = new PolkadotApi()
    api.initializeApi(westendChain)
    return api
}