import { take, tap } from "rxjs/operators";
import { RxAdapter } from "./reactive-streams";

type JavaGraal = {
  type: <T>(className: string) => T;
};

declare const Java: JavaGraal;

const ReactiveService: any = Java.type("com.example.demo.DemoApplication");
const GraalPublisherAdapter: any = Java.type(
  "reactivestreams.graal.interop.GraalPublisherAdapter"
);

const observablePublisher = RxAdapter.toObservable(
  new GraalPublisherAdapter(new ReactiveService().doWork()),
  16
);

observablePublisher
  .pipe(
    tap(() => {}),
    take(10)
  )
  .subscribe({
    next: (element) =>
      console.log("I got element in node from Java :" + element),
    error: console.log,
    complete: console.log,
  });

setTimeout(() => {}, 999999999);
