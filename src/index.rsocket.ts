import { RSocketConnector } from "rsocket-core";
import { WebsocketClientTransport } from "rsocket-websocket-client";

export default () => {
  const client = new RSocketConnector({
    transport: new WebsocketClientTransport({
      url: "ws://localhost:8080",
      wsCreator: (url) => new WebSocket(url) as any,
    }),
    setup: {
      dataMimeType: "text/plain",
      metadataMimeType: "text/plain",
      keepAlive: 5000,
      lifetime: 60000,
    },
  });

  client.connect().then((rsocket) => {
    console.log("Connected");
    (window as any).subscriptionMy = rsocket.requestStream(
      {
        data: Buffer.from("Clients Request", "utf8"),
      },
      1,
      {
        onNext: (p) => console.log("Got response", p),
        onError: (e) => console.error(e),
        onComplete: () => console.log("Done"),
        onExtension: () => {},
      }
    );
  });
};
