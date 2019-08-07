import anime from 'animejs';
import * as $ from 'jquery';
import { from, defer, } from 'rxjs'
import { repeat, ignoreElements, } from 'rxjs/operators'


export type AnimeTarget = string | object | HTMLElement | SVGElement | NodeList | null;


export const loop = false;
export const easing = 'linear';
export const direction = 'alternate';
export const timerFace = $('.timer>.timer-face')
export const client = $('.client')
export const server = $('.server')
export const container = $('.container');
export const request = $('.request');
export const responseContent = $('.response-content');

export const requestAnimation = (element: AnimeTarget) =>
    from(anime({
        targets: element,
        translateX: 470,
        easing,
        loop,
        direction
    }).finished).pipe(ignoreElements())

export const modelAnimation = (element: AnimeTarget) =>
    from(anime({
        targets: element,
        opacity: 1,
        easing,
        loop,
        direction,
        duration: 40
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
    from(anime({
        targets: element,
        easing,
        loop,
        direction,
        duration: 40,
        opacity: 0,
    }).finished).pipe(ignoreElements())

export const peekAnimation = (element: AnimeTarget) =>
    from(
        anime
            .timeline({
                targets: element,
                easing,
                loop,
                direction,
                duration: 40,
            } as any)
            .add({
                scale: 2
            } as any)
            .add({
                scale: 1
            } as any)
            .finished
    ).pipe(ignoreElements())

export const responseAnimation = (element: AnimeTarget) =>
    from(anime({
        targets: element,
        translateX: -470,
        easing,
        loop,
        direction,
        duration: 1000
    }).finished).pipe(ignoreElements())

export const startTimer = () => {
    let counter = 0;
    const ref = setInterval(() => timerFace.text(++counter), 1000);

    timerFace.text("0");

    return () => {
        anime.running.forEach(v => v.pause());
        clearInterval(ref);
    }
}