import * as $ from "jquery";
import { concat, defer, merge, of, race, range } from "rxjs";
import { bufferCount, mergeMap, take, tap, toArray } from "rxjs/operators";
import {
  awaitAnimation,
  filterAnimation,
  modelAnimation,
  peekAnimation,
  requestAnimation,
  responseAnimation,
} from "./common/animations";
import {
  ELEMENTS_COUNT,
  ELEMENTS_TO_FIND,
  NETWORK_THROUGHPUT,
} from "./common/constants";
import { request, responseContent, server } from "./common/elements";
import {
  decreaseMemoryUsage,
  increaseMemoryUsage,
  increaseProcessedElementsCount,
  startTimer,
} from "./common/statistic";

const runnableAction = () => {
  const timerStopper = startTimer();

  concat(
    requestAnimation(request[0]),
    race(
      awaitAnimation(server.toArray()),
      range(0, ELEMENTS_COUNT).pipe(
        mergeMap(() => {
          const el = $('<div class="stretched el"></div>').appendTo(
            responseContent
          )[0];

          return concat(modelAnimation(el), of(el));
        }, 4),
        toArray()
      )
    ).pipe(
      mergeMap((array) => of(...array)),
      bufferCount(NETWORK_THROUGHPUT),
      mergeMap((array) => concat(responseAnimation(array), of(...array)), 1),
      tap(increaseMemoryUsage),
      toArray(),
      mergeMap((array) => of(...array)),
      mergeMap((el) => {
        const shouldFilter = Math.random() >= 0.5;

        if (shouldFilter) {
          return concat(
            merge(peekAnimation(el), filterAnimation(el)),
            defer(decreaseMemoryUsage)
          );
        } else {
          return concat(peekAnimation(el), defer(decreaseMemoryUsage), of(el));
        }
      }, 1),
      take(ELEMENTS_TO_FIND)
    )
  ).subscribe({
    next: increaseProcessedElementsCount,
    error: timerStopper,
    complete: timerStopper,
  });
};

export default runnableAction;
