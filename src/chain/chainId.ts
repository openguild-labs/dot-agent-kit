const PARACHAIN_IDS: { [key: string]: number } = {
    westend2_asset_hub: 1000,
};

export const getParachainId = (chainName: string): number => {
    return PARACHAIN_IDS[chainName] || 0;
};