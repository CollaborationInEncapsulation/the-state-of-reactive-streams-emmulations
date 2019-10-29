
import {RxAdapter} from './reactive-streams'
import { map, tap, take } from 'rxjs/operators';

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
    console.log,
    console.log,
    console.log 
);


setTimeout(() => {}, 999999999);