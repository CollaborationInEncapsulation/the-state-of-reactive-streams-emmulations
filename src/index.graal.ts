
import {RxAdapter} from './reactive-streams'
import { map, tap, take } from 'rxjs/operators';
import { RSocketServer, Utf8Encoders } from 'rsocket-core';
import { Flowable } from 'rsocket-flowable';
import RSocketWebSocketServer from 'rsocket-websocket-server';

type JavaGraal = {
    type: <T>(className: string) => T
};

declare const Java: JavaGraal;

const ReactiveService: any = Java.type('com.example.demo.DemoApplication');
const GraalPublisherAdapter: any = Java.type('reactivestreams.graal.interop.GraalPublisherAdapter');

const observablePublisher = RxAdapter.toObservable(new GraalPublisherAdapter(new ReactiveService().doWork()), 16);

observablePublisher
.pipe(
    tap(() => {
    }),
    take(10)
)
.subscribe(
    (element) => console.log("I got element in node from Java :" + element),
    console.log,
    console.log 
);

setTimeout(() => {}, 999999999);