import * as $ from 'jquery';
import { of, range, race, concat, merge, defer } from 'rxjs'
import { flatMap, take, bufferCount, toArray, tap, } from 'rxjs/operators'
import { startTimer, increaseMemoryUsage, decreaseMemoryUsage, increaseProcessedElementsCount } from './common/statistic';
import { requestAnimation, awaitAnimation, modelAnimation, responseAnimation, peekAnimation, filterAnimation, } from './common/animations';
import { request, server, responseContent } from './common/elements';
import { ELEMENTS_TO_FIND, MEMORY_CAPACITY, ELEMENTS_COUNT } from './common/constants';

const runnableAction = () => {
  const timerStopper = startTimer();


  range(0, ELEMENTS_COUNT).pipe(
    bufferCount(MEMORY_CAPACITY),
    flatMap((buffered) => concat(
      defer(() => requestAnimation(request[0])),
      race(
        awaitAnimation(server.toArray()),
        of(...buffered).pipe(
          flatMap(() => {
            const el = $('<div class="stretched el"></div>').appendTo(responseContent)[0];

            return concat(modelAnimation(el), of(el));
          }, 4),
          toArray()
        )
      ).pipe(
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
      )
    ), 1),
    take(ELEMENTS_TO_FIND),
  ).subscribe(increaseProcessedElementsCount, timerStopper, timerStopper);
};


export default runnableAction;