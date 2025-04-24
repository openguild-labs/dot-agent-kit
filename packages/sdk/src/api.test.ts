import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  Api,
  Chain,
  KnowChainId,
  disconnect,
  getAllSupportedChains,
  getChainByName,
  isSupportedChain
} from "@dot-agent-kit/common"
import { start } from "polkadot-api/smoldot"
import { getApi, getChainSpec, AgentConfig } from "@dot-agent-kit/common"
import { PolkadotAgentKit } from "./api"
import { PolkadotApi } from "@dot-agent-kit/core"
import { DynamicStructuredTool } from "@langchain/core/tools"

vi.mock("polkadot-api/smoldot", () => ({
  start: vi.fn().mockReturnValue({
    addChain: vi.fn(),
    terminate: vi.fn()
  })
}))

vi.mock("@dot-agent-kit/common", () => ({
  getApi: vi.fn(),
  getChainSpec: vi.fn(),
  disconnect: vi.fn(),
  getAllSupportedChains: vi.fn(),
  isSupportedChain: vi.fn(),
  getChainByName: vi.fn()
}))

describe("API", () => {
  let polkadotAgentApi: PolkadotAgentKit
  let mockChain: Chain
  let mockApi: Api<KnowChainId>
  let alicePrivateKey: string
  const aliceSS58Polkadot = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5"
  beforeEach(async () => {
    // this is dev account
    alicePrivateKey = "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
    polkadotAgentApi = new PolkadotAgentKit("relayChain", alicePrivateKey, {
      keyType: "Sr25519"
    })

    mockChain = {
      id: "testChain",
      name: "relayChain",
      type: "relay"
    } as Chain

    mockApi = {
      query: {},
      tx: {},
      client: {
        disconnect: vi.fn(),
        bestBlocks$: { complete: vi.fn() }
      }
    } as unknown as Api<KnowChainId>

    vi.mocked(getApi).mockResolvedValue(mockApi)
    vi.mocked(getChainSpec).mockReturnValue("mock-chain-spec")
    vi.mocked(disconnect).mockResolvedValue(undefined)
    vi.mocked(getAllSupportedChains).mockReturnValue([mockChain])
    vi.mocked(isSupportedChain).mockReturnValue(true)
    vi.mocked(getChainByName).mockReturnValue(mockChain)
  })

  describe("constructor", () => {
    it("should initialize with valid parameters", () => {
      const api = new PolkadotAgentKit("relayChain", alicePrivateKey, {
        keyType: "Sr25519"
      })

      expect(api.chainId).toBe("relayChain")
      expect(api["polkadotApi"]).toBeDefined()
      expect(api["agentApi"]).toBeDefined()
    })

    it("should properly normalize hex private key", () => {
      const api = new PolkadotAgentKit("relayChain", "0x1234567890abcdef", {
        keyType: "Sr25519"
      })

      expect(api.wallet).toBeInstanceOf(Uint8Array)
      expect(Array.from(api.wallet)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef])
    })

    it("should properly normalize non-hex private key", () => {
      const api = new PolkadotAgentKit("relayChain", "1234567890abcdef", {
        keyType: "Sr25519"
      })

      expect(api.wallet).toBeInstanceOf(Uint8Array)
      expect(Array.from(api.wallet)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef])
    })

    it("should initialize internal APIs", () => {
      const api = new PolkadotAgentKit("relayChain", alicePrivateKey, {
        keyType: "Sr25519"
      })

      expect(api["polkadotApi"]).toBeInstanceOf(PolkadotApi)
      expect(api["agentApi"]).toBeDefined()
    })
  })

  describe("initializeApi", () => {
    it("should initialize API if not already initialized", async () => {
      await polkadotAgentApi.initializeApi()

      expect(getApi).toHaveBeenCalledWith(
        mockChain.id,
        [mockChain],
        true,
        expect.objectContaining({
          enable: true,
          smoldot: expect.any(Object),
          chainSpecs: expect.any(Object)
        })
      )
    })

    it("should not reinitialize if already initialized", async () => {
      await polkadotAgentApi.initializeApi()
      const firstCallCount = vi.mocked(getApi).mock.calls.length

      await polkadotAgentApi.initializeApi()
      const secondCallCount = vi.mocked(getApi).mock.calls.length

      expect(secondCallCount).toBe(firstCallCount)
    })

    it("should use correct chain spec", async () => {
      await polkadotAgentApi.initializeApi()

      expect(getChainSpec).toHaveBeenCalledWith(mockChain.id)
    })

    it("should handle initialization errors", async () => {
      const error = new Error("Initialization failed")
      vi.mocked(getApi).mockRejectedValueOnce(error)

      await expect(polkadotAgentApi.initializeApi()).rejects.toThrow("Initialization failed")
    })
  })

  describe("disconnect", () => {
    let mockPolkadotApi: PolkadotApi

    beforeEach(() => {
      mockPolkadotApi = {
        disconnect: vi.fn(),
        initializeApi: vi.fn(),
        setApi: vi.fn()
      } as unknown as PolkadotApi

      polkadotAgentApi["polkadotApi"] = mockPolkadotApi
    })

    it("should disconnect successfully", async () => {
      vi.mocked(mockPolkadotApi.disconnect).mockResolvedValue()

      await polkadotAgentApi.disconnect()

      expect(mockPolkadotApi.disconnect).toHaveBeenCalled()
    })

    it("should handle disconnect errors", async () => {
      vi.mocked(mockPolkadotApi.disconnect).mockRejectedValueOnce(new Error("Disconnect failed"))

      await expect(polkadotAgentApi.disconnect()).rejects.toThrow("Disconnect failed")
    })

    it("should handle disconnect when API is not initialized", async () => {
      // Setup
      vi.mocked(mockPolkadotApi.disconnect).mockResolvedValue()

      // Act
      await polkadotAgentApi.disconnect()

      // Assert
      expect(mockPolkadotApi.disconnect).toHaveBeenCalled()
    })
  })

  describe("getNativeBalanceTool", () => {
    const mockAddress = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    const mockBalanceTool = {
      name: "getBalance",
      description: "Get native balance"
    } as DynamicStructuredTool

    beforeEach(() => {
      const mockAgentApi = {
        api: mockApi,
        getNativeBalanceTool: vi.fn().mockReturnValue(mockBalanceTool)
      } as unknown as import("@dot-agent-kit/llm").PolkadotAgentApi

      polkadotAgentApi["agentApi"] = mockAgentApi
    })

    it("should return balance tool for valid address", () => {
      const result = polkadotAgentApi.getNativeBalanceTool(mockAddress)

      expect(polkadotAgentApi["agentApi"].getNativeBalanceTool).toHaveBeenCalledWith(mockAddress)
      expect(result).toBe(mockBalanceTool)
    })

    it("should pass through the exact address to agent API", () => {
      polkadotAgentApi.getNativeBalanceTool(mockAddress)

      expect(polkadotAgentApi["agentApi"].getNativeBalanceTool).toHaveBeenCalledWith(
        expect.stringMatching(mockAddress)
      )
    })

    it("should handle empty address", () => {
      polkadotAgentApi.getNativeBalanceTool("")

      expect(polkadotAgentApi["agentApi"].getNativeBalanceTool).toHaveBeenCalledWith("")
    })

    it("should delegate tool creation to agent API", () => {
      const customTool = {
        name: "customBalance",
        description: "Custom balance tool"
      } as DynamicStructuredTool

      vi.mocked(polkadotAgentApi["agentApi"].getNativeBalanceTool).mockReturnValueOnce(customTool)

      const result = polkadotAgentApi.getNativeBalanceTool(mockAddress)

      expect(result).toBe(customTool)
    })
  })

  describe("getAddress", () => {
    it("should return the address for the agent account", () => {
      const agent = new PolkadotAgentKit("polkadot", alicePrivateKey, {
        keyType: "Sr25519"
      })
      const address = agent.getAddress()
      expect(address).toBe(aliceSS58Polkadot)
    })
  })
})
