import { of, range, race, concat, merge } from 'rxjs'
import { flatMap, toArray, bufferCount, take, } from 'rxjs/operators'
import * as $ from 'jquery';
import { request, startTimer, requestAnimation, awaitAnimation, server, responseContent, modelAnimation, responseAnimation, peekAnimation, filterAnimation, } from './common';



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
        }, 4),
        toArray()
      )
    ).pipe(
      flatMap(array => of(...array)),
      bufferCount(25),
      flatMap(array => concat(responseAnimation(array), of(...array)), 1),
      toArray(),
      flatMap(array => of(...array)),
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
};


export default runnableAction;