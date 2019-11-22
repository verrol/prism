import { CommandModule } from 'yargs';
import { CreateMockServerOptions, createMultiProcessPrism, createSingleProcessPrism } from '../util/createServer';
import sharedOptions from './sharedOptions';
import { runPrismAndSetupWatcher } from '../util/runner';
import { RangeOrNumber } from '@stoplight/prism-core';

const mockCommand: CommandModule = {
  describe: 'Start a mock server with the given document file',
  command: 'mock <document>',
  builder: yargs =>
    yargs
      .positional('document', {
        description: 'Path to a document file. Can be both a file or a fetchable resource on the web.',
        type: 'string',
      })
      .options({
        ...sharedOptions,
        dynamic: {
          alias: 'd',
          description: 'Dynamically generate examples.',
          boolean: true,
          default: false,
        },
        ['callback-delay']: {
          description: 'Number of seconds to wait before executing callbacks',
          default: '0',
          string: true,
          coerce: (input: string) => toMillis(coerceRange(input)),
        },
        ['callback-count']: {
          description: 'How many times a callback should be executed',
          default: '1',
          string: true,
          coerce: coerceRange,
        },
      }),
  handler: parsedArgs => {
    const {
      multiprocess,
      dynamic,
      port,
      host,
      cors,
      document,
      errors,
      callbackDelay,
      callbackCount,
    } = (parsedArgs as unknown) as CreateMockServerOptions;

    const createPrism = multiprocess ? createMultiProcessPrism : createSingleProcessPrism;
    const options = { cors, dynamic, port, host, document, multiprocess, errors, callbackDelay, callbackCount };

    return runPrismAndSetupWatcher(createPrism, options);
  },
};

function coerceRange(input: string): RangeOrNumber {
  const matches = /^([0-9]+)(-([0-9]+))?$/.exec(input);
  if (!matches) {
    throw new Error(`Cannot parse range: ${input}`);
  }

  return matches[3]
    ? ([parseInt(matches[1], 10), parseInt(matches[3], 10)].sort() as [number, number])
    : parseInt(matches[1], 10);
}

function toMillis(input: RangeOrNumber) {
  return typeof input === 'number' ? input * 1000 : input.map(r => r * 1000);
}

export default mockCommand;
