import * as $ from 'jquery';
import { of, range, race, concat, merge, defer } from 'rxjs'
import { flatMap, toArray, bufferCount, take, tap, } from 'rxjs/operators'
import { requestAnimation, awaitAnimation, modelAnimation, responseAnimation, peekAnimation, filterAnimation, } from './common/animations';
import { request, server, responseContent } from './common/elements';
import { startTimer, increaseMemoryUsage, decreaseMemoryUsage, increaseProcessedElementsCount } from './common/statistic';
import { ELEMENTS_TO_FIND, ELEMENTS_COUNT, NETWORK_THROUGHPUT } from './common/constants';

const runnableAction = () => {
  const timerStopper = startTimer();

  concat(
    requestAnimation(request[0]),
    race(
      awaitAnimation(server.toArray()),
      range(0, ELEMENTS_COUNT).pipe(
        flatMap(() => {
          const el = $('<div class="stretched el"></div>').appendTo(responseContent)[0];

          return concat(modelAnimation(el), of(el));
        }, 4),
        toArray()
      )
    ).pipe(
      flatMap(array => of(...array)),
      bufferCount(NETWORK_THROUGHPUT),
      flatMap(array => concat(responseAnimation(array), of(...array)), 1),
      tap(increaseMemoryUsage),
      toArray(),
      flatMap(array => of(...array)),
      flatMap(el => {
        const shouldFilter = Math.random() >= 0.5;

        if (shouldFilter) {
          return concat(
            merge(
              peekAnimation(el),
              filterAnimation(el),
            ),
            defer(decreaseMemoryUsage),
          );
        } else {
          return concat(
            peekAnimation(el),
            defer(decreaseMemoryUsage),
            of(el),
          );
        }
      }, 1),
      take(ELEMENTS_TO_FIND),
    ),
  ).subscribe(increaseProcessedElementsCount, timerStopper, timerStopper);
};


export default runnableAction;