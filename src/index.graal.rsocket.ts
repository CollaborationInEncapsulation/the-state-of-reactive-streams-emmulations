
import { RSocketServer, Utf8Encoders } from 'rsocket-core';
import RSocketWebSocketServer from 'rsocket-websocket-server';
import { Flowable } from 'rsocket-flowable';

type JavaGraal = {
    type: <T>(className: string) => T
};

declare const Java: JavaGraal;

const ReactiveService: any = Java.type('com.example.demo.DemoApplication');
const GraalPublisherAdapter: any = Java.type('reactivestreams.graal.interop.GraalPublisherAdapter');

const server = new RSocketServer({
    getRequestHandler: socket => {
        return {
            requestStream: (payload) => {
                console.log("Got request + " + payload);
                return new Flowable(s => new GraalPublisherAdapter(new ReactiveService().doSimpleWork()).subscribe(s))
                    .map(d => ({
                        data: "Hello : " + d,
                        metadata: ""
                    }));
            }
        };
    },
    transport: new RSocketWebSocketServer({
        host: "localhost",
        port: 8085
    }, Utf8Encoders)
});
server.start();


setTimeout(() => {}, 999999999);