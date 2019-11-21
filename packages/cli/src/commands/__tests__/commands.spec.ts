import * as prismHttp from '@stoplight/prism-http';
import * as yargs from 'yargs';
import { createMultiProcessPrism, createSingleProcessPrism } from '../../util/createServer';
import mockCommand from '../mock';
import proxyCommand from '../proxy';

const parser = yargs.command(mockCommand).command(proxyCommand);

jest.mock('../../util/createServer', () => ({
  createMultiProcessPrism: jest.fn().mockResolvedValue([]),
  createSingleProcessPrism: jest.fn().mockResolvedValue([]),
}));

jest.spyOn(prismHttp, 'getHttpOperationsFromResource').mockResolvedValue([]);

describe.each<{ 0: string; 1: string; 2: unknown }>([
  ['mock', '', { dynamic: false }],
  ['proxy', 'http://github.com', { upstream: new URL('http://github.com/') }],
])('%s command', (command, upstream) => {
  beforeEach(() => {
    (createSingleProcessPrism as jest.Mock).mockClear();
    (createMultiProcessPrism as jest.Mock).mockClear();
  });

  test(`starts ${command} server`, () => {
    parser.parse(`${command} /path/to ${upstream}`);

    expect(createMultiProcessPrism).not.toHaveBeenCalled();
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(
      expect.objectContaining({
        document: '/path/to',
        multiprocess: false,
        errors: false,
      })
    );
  });

  test(`starts ${command} server on custom port`, () => {
    parser.parse(`${command} /path/to -p 666 ${upstream}`);

    expect(createMultiProcessPrism).not.toHaveBeenCalled();
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ port: 666 }));
  });

  test(`starts ${command} server on custom host`, () => {
    parser.parse(`${command} /path/to -h 0.0.0.0 ${upstream}`);

    expect(createMultiProcessPrism).not.toHaveBeenCalled();
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ host: '0.0.0.0' }));
  });

  test(`starts ${command} server on custom host and port`, () => {
    parser.parse(`${command} /path/to -p 666 -h 0.0.0.0 ${upstream}`);

    expect(createMultiProcessPrism).not.toHaveBeenCalled();
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ port: 666, host: '0.0.0.0' }));
  });

  test(`starts ${command} server with multiprocess option `, () => {
    parser.parse(`${command} /path/to -m -h 0.0.0.0 ${upstream}`);

    expect(createSingleProcessPrism).not.toHaveBeenCalled();
    expect(createMultiProcessPrism).toHaveBeenLastCalledWith(
      expect.objectContaining({ multiprocess: true, host: '0.0.0.0' })
    );
  });

  test(`starts ${command} server with error violations option on `, () => {
    parser.parse(`${command} /path/to -m -h 0.0.0.0 --errors ${upstream}`);

    expect(createMultiProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ errors: true }));
  });
});

describe('callback configuration', () => {
  test(`starts mock server with callback defaults`, () => {
    parser.parse(`mock /path/to`);
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ callbackDelay: 0, callbackCount: 1 }));
  });

  test(`starts mock server with callback delay`, () => {
    parser.parse(`mock --callback-delay=1 /path/to`);
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ callbackDelay: 1 }));
  });

  test(`starts mock server with callback delay range`, () => {
    parser.parse(`mock --callback-delay=1-5 /path/to`);
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ callbackDelay: [1, 5] }));
  });

  test(`starts mock server with callback count`, () => {
    parser.parse(`mock --callback-count=10 /path/to`);
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ callbackCount: 10 }));
  });

  test(`starts mock server with callback count range`, () => {
    parser.parse(`mock --callback-count=1-10 /path/to`);
    expect(createSingleProcessPrism).toHaveBeenLastCalledWith(expect.objectContaining({ callbackCount: [1, 10] }));
  });
});
