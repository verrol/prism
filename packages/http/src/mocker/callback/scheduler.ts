import { IHttpCallbackOperation, IHttpOperationRequest } from '@stoplight/types';
import { IHttpOperationConfig, IHttpRequest, IHttpResponse } from '../../types';
import withLogger from '../../withLogger';
import { runCallback } from './runner';
import { RangeOrNumber } from '@stoplight/prism-core';
import { pipe } from 'fp-ts/lib/pipeable';
import * as Option from 'fp-ts/lib/Option';

export function scheduleCallback({
                                   callback,
                                   request,
                                   response,
                                   config,
                                 }: {
  callback: IHttpCallbackOperation;
  request: IHttpRequest;
  response: IHttpResponse;
  config: Pick<IHttpOperationConfig, 'callbackDelay' | 'callbackCount'>
}) {
  return withLogger(logger => {
    let executionsLeft = reduceRange(config.callbackCount || 1);

    const execute = () => {
      if (executionsLeft > 0) {
        setTimeout(() => {
          executionsLeft--;

          runCallback({ callback, request, response })(logger)()
            .finally(execute);
        }, reduceRange(config.callbackDelay || 0));
      }
    };

    execute();
  });
}

function reduceRange(rangeOrNumber: RangeOrNumber): number {
  return pipe(
    rangeOrNumber,
    Option.fromPredicate(Array.isArray),
    Option.map(range => range[0] + Math.round(Math.random() * (range[1] - range[0]))),
    Option.getOrElse(() => rangeOrNumber as number),
  );
}
