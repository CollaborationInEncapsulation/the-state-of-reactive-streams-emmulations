import * as $ from 'jquery';
import { Flux, Mono } from 'reactor-core-js/flux';
import { Publisher, Subscription, Subscriber, } from 'reactor-core-js/reactive-streams-spec';
import { requestAnimation, awaitAnimation, modelAnimation, responseAnimation, peekAnimation, filterAnimation, } from './common/animations';
import { startTimer, increaseMemoryUsage, decreaseMemoryUsage, increaseProcessedElementsCount } from './common/statistic';
import { request, server, responseContent } from './common/elements';
import { defer, of, concat, Observable, merge } from 'rxjs';
import { Subscriber as RxSubscriber } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ELEMENTS_TO_FIND, MEMORY_CAPACITY, NETWORK_LATENCY, ELEMENT_PROCESSING_TIME } from './common/constants';

const runnableAction = () => {
  const timerStopper = startTimer();

  Flux.from(new BackendAnimationPublisher())
    .lift(s => new DeliverResponseAnimationSubscriber(s))
    .lift(s => new DeliverRequestAnimationSubscriber(s))
    .doOnNext((e) => {
      increaseMemoryUsage()
    })
    .lift<Object>(s => new PublishOnSubscriber(s, false, MEMORY_CAPACITY, Math.ceil(5 * MEMORY_CAPACITY * (ELEMENT_PROCESSING_TIME / NETWORK_LATENCY))))
    .flatMap(el => {
      const shouldFilter = Math.random() >= 0.5;

      if (shouldFilter) {
        return new ObservableToMonoPublisher(concat(
          merge(
            peekAnimation(el),
            filterAnimation(el),
          ),
          defer(decreaseMemoryUsage),
        ));
      } else {
        return new ObservableToMonoPublisher(concat(
          peekAnimation(el),
          defer(decreaseMemoryUsage),
          of(el),
        ));
      }
    }, false, 1, Infinity)
    .lift((s) => new TakeSubscriber(s, ELEMENTS_TO_FIND))
    .consume(increaseProcessedElementsCount, timerStopper, timerStopper);
};


class BackendAnimationPublisher implements Publisher<Object> {
  subscribe<S extends Object>(s: Subscriber<S>): void {
    s.onSubscribe(new BackendAnimationSubscription(s));
  }
}

class BackendAnimationSubscription extends RxSubscriber<Object> implements Subscription {

  private requested: number = 0;
  private animation = defer(() => {
    const el = $('<div class="stretched el"></div>').appendTo(responseContent)[0];
    return concat(modelAnimation(el), of(el));
  });

  constructor(private actual: Subscriber<Object>) {
    super();
  }

  next(el: Object) {
    this.actual.onNext(el)
  }

  complete() {
    if (!this.isStopped) {
      const { animation, requested } = this;
      this.requested = requested - 1;
      if (requested === 1) {
        return;
      }
      animation.subscribe(this._unsubscribeAndRecycle());
    }
  }

  request(n: number): void {
    if (this.isStopped) {
      return;
    }

    let r = this.requested;

    this.requested = r + n;

    if (r > 0) {
      return;
    }

    this.animation.subscribe(this._unsubscribeAndRecycle());
  }

  cancel(): void {
    this.unsubscribe();
  }
}

class DeliverRequestAnimationSubscriber implements Subscriber<Object>, Subscription {

  private s: Subscription;
  private requests = request.toArray();
  private animation = (n: number) => {
    const el = this.requests.shift();
    return requestAnimation(el, n).pipe(tap(null, null, () => this.requests.unshift(el)));
  };

  constructor(private actual: Subscriber<Object>) { }

  onSubscribe(s: Subscription): void {
    this.s = s;
    this.actual.onSubscribe(this);
  }
  onNext(t: Object): void {
    this.actual.onNext(t);
  }
  onError(t: Error): void {
    this.actual.onError(t);
  }
  onComplete(): void {
    this.actual.onComplete();
  }
  request(n: number): void {
    this.animation(n).subscribe({
      complete: () => this.s.request(n)
    })
  }
  cancel(): void {
    this.s.cancel();
  }
}

class DeliverResponseAnimationSubscriber implements Subscriber<Object>, Subscription {
  private s: Subscription;

  constructor(private actual: Subscriber<Object>) { }

  onSubscribe(s: Subscription): void {
    this.s = s;
    this.actual.onSubscribe(this);
  }
  onNext(t: Object): void {
    responseAnimation(t).subscribe({
      complete: () => this.actual.onNext(t)
    });
  }
  onError(t: Error): void {
    this.actual.onError(t);
  }
  onComplete(): void {
    this.actual.onComplete();
  }
  request(n: number): void {
    this.s.request(n);
  }
  cancel(): void {
    this.s.cancel();
  }
}

class PublishOnSubscriber<T> implements Subscriber<T>, Subscription {
  private limit: number;
  private s: Subscription;
  private buffer: Array<T>;
  private cancelled: boolean;
  private done: boolean;
  private error: Error;
  private wip: number;
  private requested: number;
  private produced: number;

  constructor(private actual: Subscriber<T>, private delayError: boolean, private prefetch: number, lowTide: number) {
    this.requested = 0;
    this.wip = 0;
    this.produced = 0;

    if (lowTide <= 0) {
      this.limit = prefetch;
    }
    else if (lowTide >= prefetch) {
      this.limit = prefetch == Infinity ? Infinity : (prefetch - (prefetch >> 2));
    }
    else {
      this.limit = prefetch == Infinity ? Infinity : lowTide;
    }
  }

  onSubscribe(s: Subscription): void {
    this.s = s;
    this.buffer = new Array();

    this.actual.onSubscribe(this);

    s.request(this.prefetch);
  }
  onNext(t: T): void {
    if (this.done) {
      return;
    }
    this.buffer.push(t);
    this.trySchedule();
  }
  onError(t: Error): void {
    this.error = t;
    this.done = true;
    this.trySchedule();
  }
  onComplete(): void {
    this.done = true;
    this.trySchedule();
  }
  request(n: number): void {
    if (this.requested != Infinity) {
      if (n == Infinity) {
        this.requested = Infinity;
      } else {
        this.requested += n;
      }
    }
    this.trySchedule();
  }
  cancel(): void {
    this.cancelled = true;
    this.s.cancel();
  }
  trySchedule() {
    let w = this.wip;
    this.wip = w + 1;
    if (w != 0) {
      return;
    }
    // setImmediate(() => this.drain());
    this.drain();
  }
  checkTerminated(d: boolean, empty:boolean): boolean {
    const {cancelled, buffer, delayError, error, actual} = this;
    if (cancelled) {
      buffer.length = 0;
      return true;
    }
    if (d) {
      if (delayError) {
        if (empty) {
          if (error) {
            actual.onError(error);
          }
          else {
            actual.onComplete();
          }
          return true;
        }
      }
      else {
        if (error) {
          buffer.length = 0;
          actual.onError(error);
          return true;
        }
        else if (empty) {
          actual.onComplete();
          return true;
        }
      }
    }

    return false;
  }
  drain() {
    const { prefetch, limit, s, buffer, actual } = this;
    let { produced, requested, done, error } = this;
    let missed = 1;

    for (; ;) {
      while (produced != requested) {

        if (this.cancelled) {
          return;
        }

        const v: T = buffer.shift();

        if (this.checkTerminated(this.done, !v)) {
          return;
        }

        if (!v) {
          break;
        }

        actual.onNext(v);

        produced++;
        if (produced == limit) {
          if (requested != Infinity) {
            this.requested -= produced;
            requested = this.requested;
          }
          s.request(produced);
          produced = 0;
        }
      }

      if (this.cancelled) {
        return;
      }

      if (prefetch == requested && done && !buffer.length) {
        if (error != null) {
          actual.onError(error);
          return;
        }
        else {
          actual.onComplete();
          return;
        }
      }

      const w = this.wip;
      if (missed == w) {
        this.produced = produced;
        this.wip = 0;
        return;
      }
      else {
        requested = this.requested;
        done = this.done;
        error = this.error;
        missed = w;
      }
    }
  }
}

class TakeSubscriber<T> implements Subscriber<T>, Subscription {

  private once: boolean;
  private done: boolean;
  private s: Subscription;

  constructor(private actual: Subscriber<T>, private remaining: number) { }

  onSubscribe(s: Subscription) {
    this.s = s;
    this.actual.onSubscribe(this);
  }

  onNext(t: T) {
    if (this.done) {
      return;
    }

    const { actual } = this;
    let { remaining } = this;

    if (remaining == 0) {
      this.done = true;
      this.s.cancel();
      actual.onComplete();
      return;
    }

    this.remaining = --remaining;

    actual.onNext(t);

    if (remaining == 0 && !this.done) {
      this.done = true;
      this.s.cancel();
      actual.onComplete();
      return;
    }
  };

  onError(t: Error) {
    if (this.done) {
      return;
    }
    this.done = true;
    this.actual.onError(t);
  };

  onComplete() {
    if (this.done) {
      return;
    }
    this.done = true;
    this.actual.onComplete();
  };

  request(n: number) {
    if (!this.once) {
      this.once = true;
      if (n >= this.remaining) {
        this.s.request(Infinity);
        return;
      }
    }
    this.s.request(n);
  }

  cancel() {
    this.s.cancel();
  }
}

class ObservableToMonoPublisher<T> extends Mono<T> {
  constructor(private source: Observable<T>) {
    super();
  }
  subscribe(s: Subscriber<T>): void {
    s.onSubscribe(new ObservableToMonoSubscriber(this.source, s));
  }
}

class ObservableToMonoSubscriber<T> extends RxSubscriber<T> implements Subscription {
  private requested: boolean;

  constructor(private source: Observable<T>, private actual: Subscriber<T>) {
    super();
  }

  request(n: number): void {
    if (!this.requested) {
      this.requested = true;
      this.source.subscribe(this);
    }
  }
  cancel(): void {
    this.unsubscribe();
  }
  next(t: T) {
    this.actual.onNext(t);
  }
  complete() {
    this.actual.onComplete();
  }
  error(e: Error) {
    this.actual.onError(e);
  }
}

export default runnableAction;