import * as $ from "jquery";
import { concat, defer, merge, of, race, range } from "rxjs";
import { mergeMap, take } from "rxjs/operators";
import {
  awaitAnimation,
  filterAnimation,
  modelAnimation,
  peekAnimation,
  requestAnimation,
  responseAnimation,
} from "./common/animations";
import { ELEMENTS_COUNT, ELEMENTS_TO_FIND } from "./common/constants";
import { request, responseContent, server } from "./common/elements";
import {
  decreaseMemoryUsage,
  increaseMemoryUsage,
  increaseProcessedElementsCount,
  startTimer,
} from "./common/statistic";

const runnableAction = () => {
  const timerStopper = startTimer();

  range(0, ELEMENTS_COUNT)
    .pipe(
      mergeMap(() => {
        const el = $('<div class="stretched el"></div>').appendTo(
          responseContent
        )[0];

        return concat(
          requestAnimation(request[0]),
          race(awaitAnimation(server.toArray()), modelAnimation(el)),
          responseAnimation(el),
          defer(increaseMemoryUsage),
          defer(() => {
            const shouldFilter = Math.random() >= 0.5;

            if (shouldFilter) {
              return concat(
                merge(peekAnimation(el), filterAnimation(el)),
                defer(decreaseMemoryUsage)
              );
            } else {
              return concat(
                peekAnimation(el),
                defer(decreaseMemoryUsage),
                of(el)
              );
            }
          })
        );
      }, 1),
      take(ELEMENTS_TO_FIND)
    )
    .subscribe({
      next: increaseProcessedElementsCount,
      error: timerStopper,
      complete: timerStopper,
    });
};

export default runnableAction;
