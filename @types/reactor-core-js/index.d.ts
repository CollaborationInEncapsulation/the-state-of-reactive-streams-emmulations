declare module 'reactor-core-js/flux' {
    import { Disposable } from "reactor-core-js";
    import { Publisher, Subscriber, Subscription } from "reactor-core-js/reactive-streams-spec";

    export class Flux<T> implements Publisher<T> {
        subscribe<S extends T>(s: Subscriber<S>): void;

        static from<T>(stream: Publisher<T>): Flux<T>;
        static range(start: number, count: number): Flux<number>;

        static never<T>(): Flux<T>;

        static empty<T>(): Flux<T>;

        static just<T>(t: T): Flux<T>;

        static fromCallable<T>(callable: () => T): Flux<T>;

        static defer<T>(supplier: () => Publisher<T>): Flux<T>;

        static merge<T>(sources: Publisher<Publisher<T>>): Flux<T>;
        static merge<T>(sources: Publisher<Publisher<T>>, delayError: boolean): Flux<T>;
        static merge<T>(sources: Publisher<Publisher<T>>, delayError: boolean, maxConcurrency: number): Flux<T>;
        static merge<T>(sources: Publisher<Publisher<T>>, delayError: boolean, maxConcurrency: number, prefetch: number): Flux<T>;
        static merge<T>(sources: Publisher<Publisher<T>>, delayError?: boolean, maxConcurrency?: number, prefetch?: number): Flux<T>;

        static mergeArray<T>(sources: Publisher<T>[]): Flux<T>;
        static mergeArray<T>(sources: Publisher<T>[], delayError: boolean): Flux<T>;
        static mergeArray<T>(sources: Publisher<T>[], delayError: boolean, maxConcurrency: number): Flux<T>;
        static mergeArray<T>(sources: Publisher<T>[], delayError: boolean, maxConcurrency: number, prefetch: number): Flux<T>;
        static mergeArray<T>(sources: Publisher<T>[], delayError?: boolean, maxConcurrency?: number, prefetch?: number): Flux<T>;


        static concat<T>(sources: Publisher<Publisher<T>>): Flux<T>;
        static concat<T>(sources: Publisher<Publisher<T>>, delayError: boolean): Flux<T>;
        static concat<T>(sources: Publisher<Publisher<T>>, delayError: boolean, maxConcurrency: number): Flux<T>;
        static concat<T>(sources: Publisher<Publisher<T>>, delayError: boolean, maxConcurrency: number, prefetch: number): Flux<T>;
        static concat<T>(sources: Publisher<Publisher<T>>, delayError?: boolean, maxConcurrency?: number, prefetch?: number): Flux<T>;

        static concatArray<T>(sources: Publisher<T>[]): Flux<T>;
        static concatArray<T>(sources: Publisher<T>[], delayError: boolean): Flux<T>;
        static concatArray<T>(sources: Publisher<T>[], delayError: boolean, maxConcurrency: number): Flux<T>;
        static concatArray<T>(sources: Publisher<T>[], delayError: boolean, maxConcurrency: number, prefetch: number): Flux<T>;
        static concatArray<T>(sources: Publisher<T>[], delayError?: boolean, maxConcurrency?: number, prefetch?: number): Flux<T>;



        flatMap<R>(mapper: (t: T) => Publisher<R>): Flux<R>;
        flatMap<R>(mapper: (t: T) => Publisher<R>, delayError: boolean): Flux<R>;
        flatMap<R>(mapper: (t: T) => Publisher<R>, delayError: boolean, maxConcurrency: number): Flux<R>;
        flatMap<R>(mapper: (t: T) => Publisher<R>, delayError: boolean, maxConcurrency: number, prefetch: number): Flux<R>;
        flatMap<R>(mapper: (t: T) => Publisher<R>, delayError?: boolean, maxConcurrency?: number, prefetch?: number): Flux<R>;
        map<V>(mapper: (t: T) => V): Flux<V>;
        take(n: number): Flux<T>;
        filter<R>(predicate: (t: T) => boolean): Flux<T>;
        lift<R>(lifter: (s: Subscriber<R>) => Subscriber<T>): Flux<R>;
        doOnNext(callback: (t: T) => void): Flux<T>;



        compose<V>(transformer: (flux: Flux<T>) => Publisher<V>): Flux<V>
        static mergeArray<T>(sources: Flux<T>[]): Flux<T>;
        consume(): Disposable;
        consume(onNextCallback: (t: T) => void): Disposable;
        consume(onNextCallback: (t: T) => void, onErrorCallback: (e: Error) => void): Disposable;
        consume(onNextCallback: (t: T) => void, onErrorCallback: (e: Error) => void, onCompleteCallback: () => void): Disposable;
    }

    export class DirectProcessor<T> extends Flux<T> implements Subscriber<T> {
        onSubscribe(s: Subscription): void;
        onNext(t: T): void;
        onError(t: Error): void;
        onComplete(): void;
    }
    // }

    // declare module 'reactor-core-js/mono' {

    export abstract class Mono<T> implements Publisher<T> {
        abstract subscribe(s: Subscriber<T>): void;
        consume(): Disposable;
    }
}

declare module 'reactor-core-js' {
    export interface Disposable {
        dispose(): void;
    }
}

declare module 'reactor-core-js/reactive-streams-spec' {
    export interface Subscription {
        request(n: number): void;
        cancel(): void;
    }

    export interface Subscriber<T> {
        onSubscribe(s: Subscription): void;
        onNext(t: T): void;
        onError(t: Error): void;
        onComplete(): void;
    }

    export interface Publisher<T> {
        subscribe<S extends T>(s: Subscriber<S>): void;
    }

    export interface Processor<T, R> extends Subscriber<T>, Publisher<R> { }
}