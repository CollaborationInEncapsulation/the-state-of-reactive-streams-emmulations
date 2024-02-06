import {
    OnExtensionSubscriber,
    OnNextSubscriber,
    OnTerminalSubscriber,
    Payload,
    RSocketServer,
} from "rsocket-core";
import { WebsocketServerTransport } from "rsocket-websocket-server";
import { Subscription } from "./reactive-streams";

type JavaGraal = {
  type: <T>(className: string) => T;
};

declare const Java: JavaGraal;

const ReactiveService: any = Java.type("com.example.demo.DemoApplication");
const GraalPublisherAdapter: any = Java.type(
  "reactivestreams.graal.interop.GraalPublisherAdapter"
);
const server = new RSocketServer({
  transport: new WebsocketServerTransport({
    port: 8080
  }),
  acceptor: {
    accept: async () => {
      return {
        requestStream: (
          payload: Payload,
          initialRequestN,
          responderStream: OnTerminalSubscriber &
            OnNextSubscriber &
            OnExtensionSubscriber
        ) => {
          console.log("Got request + " + payload);

          let cancelled = false;
          let subscription: Subscription = null;

          new GraalPublisherAdapter(
            new ReactiveService().doSimpleWork()
          ).subscribe({
            onNext: responderStream.onNext,
            onError: responderStream.onError,
            onComplete: responderStream.onComplete,
            onSubscriber: (s: Subscription) => {
              if (cancelled) {
                s.cancel();
                return;
              }

              subscription = s;

              s.request(initialRequestN);
            },
          });
          return {
            cancel() {
              cancelled = true;
              if (subscription) {
                subscription.cancel();
              }
            },
            request(n) {
              if (subscription) {
                subscription.request(n);
                return;
              }

              initialRequestN += n;
            },
            onExtension: () => {},
          };
        },
      };
    },
  },
});

server.bind();

setTimeout(() => {}, 999999999);
