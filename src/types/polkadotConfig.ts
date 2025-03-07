
type ChainConfig = {
    wss: string;
    client: any;
};

export type PolkadotConfig = {
    [chain: string]: ChainConfig;
};