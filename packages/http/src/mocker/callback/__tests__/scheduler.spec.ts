import { runCallback } from '../runner';
import { scheduleCallback } from '../scheduler';

jest.mock('../runner', () => ({ runCallback: jest.fn(() => () => async () => ({})) }));
jest.useFakeTimers();

describe('scheduleCallback()', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('neither delay nor count is specified', () => {
    it('runs callback immediately', () => {
      scheduleCallback({
        config: {},
        response: {} as any,
        request: {} as any,
        callback: {} as any,
      } )({} as any);

      expect(runCallback).not.toHaveBeenCalled();
      jest.advanceTimersToNextTimer();
      expect(runCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('1 second delay is specified', () => {
    it('runs callback after 1 second', () => {
      scheduleCallback({
        config: { callbackDelay: 1000 },
        response: {} as any,
        request: {} as any,
        callback: {} as any,
      } )({} as any);

      expect(runCallback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(runCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('delay range is specified', () => {
    it('runs callback within given delay', () => {
      scheduleCallback({
        config: { callbackDelay: [1000, 10000] },
        response: {} as any,
        request: {} as any,
        callback: {} as any,
      } )({} as any);

      expect(runCallback).not.toHaveBeenCalled();
      jest.advanceTimersByTime(10000);
      expect(runCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('count of 3 calls is specified', () => {
    it('runs callback given count of times', async () => {
      scheduleCallback({
        config: { callbackCount: 3 },
        response: {} as any,
        request: {} as any,
        callback: {} as any,
      } )({} as any);

      expect(runCallback).not.toHaveBeenCalled();

      jest.advanceTimersToNextTimer();
      await Promise.resolve();

      jest.advanceTimersToNextTimer();
      await Promise.resolve();

      jest.advanceTimersToNextTimer();
      await Promise.resolve();

      expect(runCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('count range and delay range is specified', () => {
    it('runs callback both within given ranges of count and delay', async () => {
      scheduleCallback({
        config: { callbackCount: [3, 3], callbackDelay: [1000, 10000] },
        response: {} as any,
        request: {} as any,
        callback: {} as any,
      } )({} as any);

      expect(runCallback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      // I don't have idea how to make jest expect number of calls being a range
      expect(runCallback).toHaveBeenCalledTimes(3)
    });
  });
});
