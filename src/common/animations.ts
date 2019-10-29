import anime from 'animejs';
import { defer, } from 'rxjs';
import { repeat, ignoreElements, } from 'rxjs/operators';
import { NETWORK_LATENCY, ELEMENT_PROCESSING_TIME, ELEMENT_LOOKUP_TIME } from './constants';

export type AnimeTarget = string | object | HTMLElement | SVGElement | NodeList | null;

export const loop = false;
export const easing = 'linear';
export const direction = 'alternate';

export const requestAnimation = (element: AnimeTarget, n?: number) => {
    return defer(() => {
        if (n && element instanceof HTMLElement) {
            element.innerText = n + "";
        }
        
        return anime.timeline({
                targets: element,
                easing,
                loop,
                direction
            } as any)
            .add({
                opacity: 1,
                duration: 50,
            } as any)
            .add({
                translateX: 470,
                duration: NETWORK_LATENCY - 50 - 1,
            } as any)
            .add({
                opacity: 0,
                translateX: 0,
                duration: 1,
            } as any)
            .finished;
        }).pipe(ignoreElements())
}

export const modelAnimation = (element: AnimeTarget) =>
    defer(() => anime({
        targets: element,
        opacity: 1,
        easing,
        loop,
        direction,
        duration: ELEMENT_LOOKUP_TIME
    }).finished).pipe(ignoreElements())

export const awaitAnimation = (element: AnimeTarget) =>
    defer(() => anime({
        targets: element,
        easing,
        loop,
        direction,
        background: [
            { value: '#573796' },
            { value: '#FB89FB' },
            { value: '#FBF38C' },
            { value: '#18FF92' },
            { value: '#5A87FF' },
            { value: '#FFFFFF' },
        ]
    }).finished).pipe(ignoreElements(), repeat())

export const filterAnimation = (element: AnimeTarget) =>
    defer(() => anime({
        targets: element,
        easing,
        loop,
        direction,
        duration: ELEMENT_PROCESSING_TIME,
        opacity: 0,
    }).finished).pipe(ignoreElements())

export const peekAnimation = (element: AnimeTarget) =>
    defer(() => 
        anime
            .timeline({
                targets: element,
                easing,
                loop,
                direction,
                duration: ELEMENT_PROCESSING_TIME,
            } as any)
            .add({
                scaleX: 5
            } as any)
            .add({
                scaleX: 1
            } as any)
            .finished
    ).pipe(ignoreElements())

export const responseAnimation = (element: AnimeTarget) =>
    defer(() => anime({
        targets: element,
        translateX: -470,
        easing,
        loop,
        direction,
        duration: NETWORK_LATENCY
    }).finished).pipe(ignoreElements())

export const pauseAnimations = () => {
    (anime as any).paused = [...anime.running];
    (anime as any).isPaused = true;
    anime.running.forEach(a => a.pause());
}

export const playAnimations = () => {
    (anime as any).isPaused = false;
    ((anime as any).paused || []).forEach((a: anime.AnimeInstance) => a.play());
    (anime as any).paused = [];
}

export const changeAnimationSpeed = (speed: number) => (anime as any).speed = speed;

