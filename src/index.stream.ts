import * as $ from 'jquery';
import { of, range, race, concat, merge } from 'rxjs'
import { flatMap, take, } from 'rxjs/operators'
import { requestAnimation, server, responseContent, request, startTimer, awaitAnimation, modelAnimation, peekAnimation, filterAnimation, responseAnimation } from './common';




const runnableAction = () => {
  const timerStopper = startTimer();

  concat(
    requestAnimation(request[0]),
    race(
      awaitAnimation(server.toArray()),
      range(0, 50).pipe(
        flatMap(() => {
          const el = $('<div class="stretched el"></div>').appendTo(responseContent)[0];

          return concat(modelAnimation(el), of(el));
        }, 1),
      )
    ).pipe(
      flatMap((el) => concat(responseAnimation(el), of(el)), 25),
      flatMap(el => {
        const shouldFilter = Math.random() >= 0.5;

        if (shouldFilter) {
          return merge(
            peekAnimation(el),
            filterAnimation(el)
          );
        } else {
          return concat(
            peekAnimation(el),
            of(el)
          );
        }
      }, 2),
      take(10),
    ),
  ).subscribe(null, null, timerStopper);
}

export default runnableAction;