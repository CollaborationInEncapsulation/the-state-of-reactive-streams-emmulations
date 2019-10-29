
import { Subscriber as RxSubscriber, from, Observable, Subscribable, InteropObservable, Unsubscribable } from 'rxjs';
import Subscription from './Subscription';
import Publisher from './Publisher';
import Subscriber from './Subscriber';



class ObservablePublisher<T> implements Subscribable<T>, InteropObservable<T>{
    [Symbol.observable]: () => Subscribable<T>;
    _subscription: Subscription;
    _source: Publisher<T>;
    _batchSize: number;
    _buffered: number;

    constructor(delegate: Publisher<T>, batchSize: number = Number.MAX_SAFE_INTEGER) {
        // Symbol logic cloned from observable.ts in rxjs
        const observableSymbol =
            typeof Symbol === 'function' && Symbol.observable
                ? Symbol.observable
                : '@@observable';
        (this as any)[observableSymbol] = () => this;
        this._source = delegate;
        this._batchSize = batchSize;
    }

    subscribe(subscriber?: any): Unsubscribable {
        const unsubscribe = new UnsubscribableSubscription();
        this._source.subscribe(
            new PartialSubscriberAdapter(
                (value: T) => {
                    if (subscriber && subscriber.closed) {
                        unsubscribe.unsubscribe();
                        return;
                    }
                    if (!unsubscribe.isCanceled()) {
                        if (subscriber && subscriber.next) {
                            try {
                                subscriber.next(value);

                                if (subscriber.closed) {
                                    unsubscribe.unsubscribe();
                                    return;
                                }

                                // Only if someone specified a batch size
                                if (this._batchSize < Number.MAX_SAFE_INTEGER) {
                                    this._buffered--;
                                    if (this._buffered <= 0) {
                                        this._buffered = this._batchSize;
                                        this._subscription.request(this._batchSize);
                                    }
                                }
                            } catch (error) {
                                if (subscriber && subscriber.error) {
                                    subscriber.error(error);
                                    unsubscribe.unsubscribe();
                                }
                            }
                        }
                    }
                },
                error => {
                    if (subscriber && subscriber.error) {
                        subscriber.error(error);
                    }
                },
                () => {
                    if (subscriber && subscriber.complete) {
                        subscriber.complete();
                    }
                },
                (subscription: Subscription) => {
                    if (subscription) {
                        this._subscription = subscription;
                        unsubscribe.setCancelHandle(this._subscription.cancel);
                        this._buffered = this._batchSize;
                        this._subscription.request(this._batchSize);
                    }
                },
            ),
        );

        return unsubscribe;
    }
}

class PartialSubscriberAdapter<T> implements Subscriber<T> {

    constructor(
        private _onNext: (e: T) => void,
        private _onError: (e: Error) => void,
        private _onComplete: () => void,
        private _onSubscribe: (s: Subscription) => void,
    ) { }


    onSubscribe(s: Subscription): void {
        this._onSubscribe ? this._onSubscribe(s) : s.request(Number.MAX_SAFE_INTEGER)
    }
    onNext(t: T): void {
        this._onNext && this._onNext(t);
    }
    onError(t: Error): void {
        this._onError && this._onError(t);
    }
    onComplete(): void {
        this._onComplete && this._onComplete();
    }
}

class UnsubscribableSubscription implements Unsubscribable {
    _canceled: boolean;
    _cancel: () => void;

    constructor() {
        this._canceled = false;
    }

    isCanceled(): boolean {
        return this._canceled;
    }

    unsubscribe(): void {
        this._canceled = true;
        if (this._cancel) {
            this._cancel();
        }
    }

    setCancelHandle(cancel: () => void): void {
        this._cancel = cancel;
        if (this._canceled) {
            this._cancel();
        }
    }
}

const toObservable: <T>(source: Publisher<T>, batchSize?: number) => Observable<T> = (source, batchSize) => from(new ObservablePublisher(source, batchSize))

export default {
    toObservable
}