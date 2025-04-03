import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/agent/index',
    'src/chain/index',
    'src/langchain/index',
    'src/tools/index',
    'src/types/index'
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  externals: [
    '@polkadot-api/descriptors',
    '@polkadot-labs/hdkd',
    '@polkadot-labs/hdkd-helpers',
    '@polkadot/keyring',
    '@polkadot/util',
    '@polkadot/util-crypto',
    '@subsquid/ss58',
    'polkadot-api'
  ]
}) 