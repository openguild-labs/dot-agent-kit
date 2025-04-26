import { beforeEach, describe, expect, it, vi, afterEach } from "vitest"
import {
  Api,
  Chain,
  KnowChainId,
  disconnect,
  getAllSupportedChains,
  getChainByName,
  isSupportedChain,
  SmoldotClient
} from "@dot-agent-kit/common"
import { start } from "polkadot-api/smoldot"
import { getApi, getChainSpec, AgentConfig } from "@dot-agent-kit/common"
import { PolkadotAgentKit } from "./api"
import { PolkadotApi } from "@dot-agent-kit/core"
import { DynamicStructuredTool } from "@langchain/core/tools"
import { PolkadotAgentApi } from "@dot-agent-kit/llm"

describe("PolkadotApi", () => {
  let polkadotApi: PolkadotApi
  const mockSmoldotClient = {
    terminate: vi.fn().mockResolvedValue(undefined)
  } as unknown as SmoldotClient

  const mockApi = {
    disconnect: vi.fn().mockResolvedValue(undefined)
  } as unknown as Api<KnowChainId>

  beforeEach(() => {
    vi.mock("polkadot-api/smoldot", () => ({
      start: () => mockSmoldotClient
    }))

    vi.mock("@dot-agent-kit/common", () => ({
      getAllSupportedChains: () => [
        { id: "polkadot" },
        { id: "west" },
        { id: "polkadot_asset_hub" },
        { id: "west_asset_hub" }
      ],
      getApi: vi.fn().mockResolvedValue(mockApi),
      getChainSpec: vi.fn().mockReturnValue("mock-chain-spec"),
      disconnect: vi.fn().mockResolvedValue(undefined)
    }))

    polkadotApi = new PolkadotApi()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("initializeApi", () => {
    it("should initialize APIs for all supported chains", async () => {
      await polkadotApi.initializeApi()

      expect(polkadotApi["initialized"]).toBe(true)
      expect(polkadotApi["_apis"].size).toBe(4)
      expect(polkadotApi["_apis"].has("polkadot")).toBe(true)
      expect(polkadotApi["_apis"].has("west")).toBe(true)
      expect(polkadotApi["_apis"].has("polkadot_asset_hub")).toBe(true)
      expect(polkadotApi["_apis"].has("west_asset_hub")).toBe(true)
    })

    it("should not reinitialize if already initialized", async () => {
      await polkadotApi.initializeApi()
      const getApiMock = vi.spyOn(require("@dot-agent-kit/common"), "getApi")

      await polkadotApi.initializeApi()

      expect(getApiMock).toHaveBeenCalledTimes(4)
    })

    it("should handle initialization errors", async () => {
      const error = new Error("Initialization failed")
      vi.spyOn(require("@dot-agent-kit/common"), "getApi").mockRejectedValue(error)

      await expect(polkadotApi.initializeApi()).rejects.toThrow(
        "Failed to initialize APIs: Initialization failed"
      )
    })
  })

  describe("disconnect", () => {
    it("should disconnect all chain APIs and terminate smoldot client", async () => {
      // Setup APIs
      await polkadotApi.initializeApi()

      await polkadotApi.disconnect()

      expect(polkadotApi["initialized"]).toBe(false)
      expect(polkadotApi["_apis"].size).toBe(0)
      expect(mockSmoldotClient.terminate).toHaveBeenCalled()
    })

    it("should handle disconnect errors", async () => {
      const error = new Error("Disconnect failed")
      vi.spyOn(require("@dot-agent-kit/common"), "disconnect").mockRejectedValue(error)

      await polkadotApi.initializeApi()
      await expect(polkadotApi.disconnect()).rejects.toThrow(
        "Failed to disconnect: Disconnect failed"
      )
    })
  })

  describe("getApi", () => {
    it("should return the API for a specific chain", async () => {
      await polkadotApi.initializeApi()
      const api = polkadotApi.getApi("polkadot")
      expect(api).toBeDefined()
    })

    it("should return the correct API for different chains", async () => {
      await polkadotApi.initializeApi()
      const dotApi = polkadotApi.getApi("polkadot")
      const westApi = polkadotApi.getApi("west")

      expect(dotApi).toBeDefined()
      expect(westApi).toBeDefined()
      expect(dotApi).not.toBe(westApi)
    })
  })

  describe("setApi", () => {
    it("should set API for a specific chain", () => {
      const mockChainApi = {} as Api<KnowChainId>
      polkadotApi.setApi("polkadot", mockChainApi)

      expect(polkadotApi["_apis"].get("polkadot")).toBe(mockChainApi)
    })

    it("should not set API when api parameter is undefined", () => {
      polkadotApi.setApi("polkadot", undefined)

      expect(polkadotApi["_apis"].has("polkadot")).toBe(false)
    })
  })

  describe("getNativeBalanceTool", () => {
    const mockDotBalanceTool = {
      name: "polkadotBalance",
      description: "Get Polkadot native balance",
      execute: vi.fn()
    } as unknown as DynamicStructuredTool

    const mockWestBalanceTool = {
      name: "westBalance",
      description: "Get Westend native balance",
      execute: vi.fn()
    } as unknown as DynamicStructuredTool
    let mockAgentPolkadotApi: PolkadotAgentApi
    let mockAgentWestApi: PolkadotAgentApi

    beforeEach(() => {
      // Ensure APIs are initialized
      polkadotApi["_apis"].set("polkadot", {} as Api<KnowChainId>)
      polkadotApi["_apis"].set("west", {} as Api<KnowChainId>)
      mockAgentPolkadotApi = {
        api: polkadotApi["_apis"].get("polkadot") as any,
        getNativeBalanceTool: vi.fn().mockReturnValue(mockDotBalanceTool)
      } as unknown as import("@dot-agent-kit/llm").PolkadotAgentApi

      mockAgentWestApi = {
        api: polkadotApi["_apis"].get("west") as any,
        getNativeBalanceTool: vi.fn().mockReturnValue(mockWestBalanceTool)
      } as unknown as import("@dot-agent-kit/llm").PolkadotAgentApi

      vi.spyOn(mockAgentPolkadotApi, "getNativeBalanceTool").mockReturnValue(mockDotBalanceTool)

      vi.spyOn(mockAgentWestApi, "getNativeBalanceTool").mockReturnValue(mockWestBalanceTool)
    })

    it("should return the correct tool for a specific chain", () => {
      const tool = mockAgentPolkadotApi.getNativeBalanceTool(
        "polkadot",
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      )

      expect(tool).toBeDefined()
      expect(tool).toBe(mockDotBalanceTool)
      expect(tool.name).toBe("polkadotBalance")
    })

    it("should return the correct tool for different chains", () => {
      const dotTool = mockAgentPolkadotApi.getNativeBalanceTool(
        "polkadot",
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      )
      const westTool = mockAgentWestApi.getNativeBalanceTool(
        "west",
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      )

      expect(dotTool).toBeDefined()
      expect(westTool).toBeDefined()
      expect(dotTool).toBe(mockDotBalanceTool)
      expect(westTool).toBe(mockWestBalanceTool)
      expect(dotTool).not.toBe(westTool)
    })

    it("should throw error if chain API is not initialized", () => {
      polkadotApi["_apis"].clear()

      expect(() =>
        mockAgentPolkadotApi.getNativeBalanceTool(
          "polkadot",
          "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        )
      ).toThrow("API for chain polkadot is not initialized")
    })

    it("should throw error if chain is not supported", () => {
      // @ts-expect-error - Testing invalid chain
      expect(() => mockAgentPolkadotApi.getNativeBalanceTool("unsupported")).toThrow(
        "Chain unsupported is not supported"
      )
    })
  })
})
