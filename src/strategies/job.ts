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

  // get strategies
  const strategies: string[] = args.retryId ? [args.retryId] : await job.getStrategies();
  logConsole.log(args.retryId ? `Retrying strategy` : `Simulating ${strategies.length} strategies`);

  try {
    for (const [index, strategy] of strategies.entries()) {
      const strategyLogId = `${logMetadata.logId}-${makeid(5)}`;
      const strategyConsole = prelog({ ...logMetadata, logId: strategyLogId, strategy });

      // skip strategy if already in progress
      if (args.skipIds.includes(strategy)) {
        strategyConsole.info('Skipping strategy');
        continue;
      }

      // check if strategy is workable
      const workable = await job.callStatic.harvestable(strategy, { blockTag: args.advancedBlock });
      strategyConsole.log(`Strategy #${index} ${workable ? 'is' : 'is not'} workable`, { strategy });
      if (!workable) continue;

      // create work tx
      const tx = await job.connect(args.keeperAddress).populateTransaction.harvest(strategy, {
        nonce: args.keeperNonce,
        gasLimit: 2_500_000,
        type: 2,
      });

      // create a workable group every bundle burst
      const workableGroups: JobWorkableGroup[] = new Array(args.bundleBurst).fill(null).map((_, index) => ({
        targetBlock: args.targetBlock + index,
        txs: [tx],
        logId: `${strategyLogId}-${makeid(5)}`,
      }));

      // submit all bundles
      args.subject.next({
        workableGroups,
        correlationId: strategy,
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
