import { Job, JobWorkableGroup, makeid, prelog } from '@keep3r-network/cli-utils';
import { getMainnetSdk } from '../eth-sdk-build';
import metadata from './metadata.json';

const getWorkableTxs: Job['getWorkableTxs'] = async (args) => {
  // setup logs
  const logMetadata = {
    job: metadata.name,
    block: args.advancedBlock,
    logId: makeid(5),
  };
  const logConsole = prelog(logMetadata);

  logConsole.log(`Trying to work`);

  // setup job
  const signer = args.fork.ethersProvider.getSigner(args.keeperAddress);
  const { job } = getMainnetSdk(signer);

  // get vaults
  const vaults: string[] = args.retryId ? [args.retryId] : await job.getVaults();
  logConsole.log(args.retryId ? `Retrying vault` : `Simulating ${vaults.length} vaults`);

  try {
    for (const [index, vault] of vaults.entries()) {
      const vaultLogId = `${logMetadata.logId}-${makeid(5)}`;
      const vaultConsole = prelog({ ...logMetadata, logId: vaultLogId, vault });

      // skip vault if already in progress
      if (args.skipIds.includes(vault)) {
        vaultConsole.info('Skipping vault');
        continue;
      }

      // check if vault is workable
      const earnable = await job.callStatic.earnable(vault, { blockTag: args.advancedBlock });
      vaultConsole.log(`Vault #${index} ${earnable ? 'is' : 'is not'} earnable`, { vault });
      if (!earnable) continue;

      // create work tx
      const tx = await job.connect(args.keeperAddress).populateTransaction.earn(vault, {
        nonce: args.keeperNonce,
        gasLimit: 2_500_000,
        type: 2,
      });

      // create a workable group every bundle burst
      const workableGroups: JobWorkableGroup[] = new Array(args.bundleBurst).fill(null).map((_, index) => ({
        targetBlock: args.targetBlock + index,
        txs: [tx],
        logId: `${vaultLogId}-${makeid(5)}`,
      }));

      // submit all bundles
      args.subject.next({
        workableGroups,
        correlationId: vault,
      });
    }
  } catch (err: unknown) {
    logConsole.warn('Unexpected error', { message: (err as Error).message });
  }

  // finish job process
  args.subject.complete();
};

module.exports = {
  getWorkableTxs,
} as Job;
