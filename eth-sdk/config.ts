import { defineConfig } from '@dethcrypto/eth-sdk';

export default defineConfig({
  outputPath: 'src/eth-sdk-build',
  contracts: {
    mainnet: {
      job: '0x0bD1d668d8E83d14252F2e01D5873df77A6511f0',
    },
  },
});
