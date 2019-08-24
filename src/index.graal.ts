
import {RxAdapter} from './reactive-streams'
import { map, tap } from 'rxjs/operators';

type JavaGraal = {
    type: <T>(className: string) => T
};

declare const Java: JavaGraal;

const Flux: any = Java.type('reactor.core.publisher.Flux');
const Duration: any = Java.type('java.time.Duration');
const GraalPublisherAdapter: any = Java.type('reactivestreams.graal.interop.GraalPublisherAdapter');

const observablePublisher = RxAdapter.toObservable(new GraalPublisherAdapter(Flux.interval(Duration.ofSeconds(1)).take(20)), 16);

observablePublisher
.pipe(
    tap(() => {
        
    })
)
.subscribe(
    console.log,
    console.log,
    console.log 
);