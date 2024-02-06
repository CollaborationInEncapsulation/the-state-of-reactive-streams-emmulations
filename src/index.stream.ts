import * as $ from "jquery";
import { concat, defer, merge, of, race, range } from "rxjs";
import { mergeMap, take, tap } from "rxjs/operators";
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
      // Generate Items
      range(0, ELEMENTS_COUNT).pipe(
        mergeMap(() => {
          const el = $('<div class="stretched el"></div>').appendTo(
            responseContent
          )[0];

          // the async item's generation process
          return concat(modelAnimation(el), of(el));
        }, 1)
      )
    ).pipe(
      // network latency simmulation with limited bandwidth
      mergeMap(
        (el) => concat(responseAnimation(el), of(el)),
        NETWORK_THROUGHPUT
      ),
      // Memory Control
      tap((e) => increaseMemoryUsage()),
      // Animated Filtering Process
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
