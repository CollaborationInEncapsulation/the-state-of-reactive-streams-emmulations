import { RSocketClient, Utf8Encoders } from "rsocket-core";
import RSocketWebSocketClient from "rsocket-websocket-client";


export default () => {
    const client = new RSocketClient({
        transport: new RSocketWebSocketClient(
            {
                url: 'ws://localhost:8085',
            },
            Utf8Encoders,
        ),
        setup: {
            dataMimeType:"text/plain",
            metadataMimeType:"text/plain",
            keepAlive: 5000,
            lifetime: 60000,
        }
    });

    client.connect()
        .then(rsocket => {
            console.log("Connected");

            rsocket.requestStream({
                data: "Clients Request",
                metadata: ""
            })
            .subscribe({
                onSubscribe: s => s.request(10),
                onNext: (p) => console.log("Got response", p),
                onError: (e) => console.error(e),
                onComplete: () => console.log("Done")
            });
        });
}