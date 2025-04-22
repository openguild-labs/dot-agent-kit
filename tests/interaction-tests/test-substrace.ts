import { connect, getBlockNumber, disconnect } from "../../src/tools/substrace";
import { SubstrateConnectorConfig } from "../../src/types/connect";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const config: SubstrateConnectorConfig = {
    name: "westend",
    url: "wss://westend-rpc.polkadot.io",
  };

  console.log("Initializing connection to:", config.url);

  try {
    /** Test connection **/
    console.log("Connecting...");
    const connectResult = await connect(config);
    console.log(
      "Connection result:",
      connectResult ? "✅ Success" : "❌ Failed",
    );

    if (connectResult) {
      /** Test getting block number **/
      console.log("Getting block number...");
      const blockNumber = await getBlockNumber();
      console.log("Current block number:", blockNumber);

      /** Test disconnection **/
      console.log("Disconnecting...");
      await disconnect();
      console.log("Disconnected");

      /** Check after disconnection **/
      console.log("Trying to get block number after disconnect...");
      const blockAfterDisconnect = await getBlockNumber();
      console.log(
        "Result:",
        blockAfterDisconnect === null
          ? "✅ Correct (null)"
          : "❌ Error (still connected)",
      );
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    /** Ensure process exits after test completion **/
    console.log("Exiting process...");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
