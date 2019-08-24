import anime from 'animejs';
import { timerFace, memoryTracker, elementsCounter } from './elements';
import { MEMORY_CAPACITY, ELEMENTS_TO_FIND } from './constants';

export const startTimer = () => {
    let counter = 0;
    const ref = setInterval(() => {
        if (!(anime as any).isPaused) {
            counter += anime.speed * 0.1
            timerFace.text(Math.floor(counter))
        }
    }, 100);

    timerFace.text("0");

    return () => {
        anime.running.forEach(v => v.pause());
        clearInterval(ref);
    }
}

export const increaseMemoryUsage = () => {
    if (memoryTracker.children().length > MEMORY_CAPACITY) {
        console.error("Out Of Memory");

        memoryTracker.children().remove("*");
        memoryTracker.html("<span style='display: flex;width: 100%;text-align:center;line-height: 100%;height: 100%;align-content: center;flex-direction: column;justify-content: center;'>Out Of Memory</span>")

        throw new Error("Out Of Memory");
    }

    memoryTracker.append('<div class="memory-indicator"></div>');
}

export const decreaseMemoryUsage = () => {
    if (memoryTracker.children().length) {
        memoryTracker.children().last().remove();
    }
}

let processed = 0;
elementsCounter.text(`${processed} / ${ELEMENTS_TO_FIND}`);
export const increaseProcessedElementsCount = () => {
    elementsCounter.text(`${++processed} / ${ELEMENTS_TO_FIND}`);
}