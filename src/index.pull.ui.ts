import * as $ from 'jquery';

const events: JQuery.Event[] = [];

const runnableAction = () => {
    const box = $('<div class="box"></div>');

    box.appendTo('body');

    init(box);

    const onMouseDown = (e: JQuery.Event) => {
        isDragging = true
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    };
    const onMouseUp = (e: JQuery.Event) => {
        isDragging = false
    };
    const onMouseMove = (e: JQuery.Event) => {
        if (!isDragging) {
            return;
        }

        box.css({
            top: e.clientY - offsetY,
            left: e.clientX - offsetX
        })
    };

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    setInterval(() => {
        for (const event of events) {
            if (event.target == box[0] && event.type == 'mousedown') {
                onMouseDown(event);
            } else if (event.type == 'mousemove') {
                onMouseMove(event);
            } else if (event.type == 'mouseup') {
                onMouseUp(event);
            }
        }

        events.length = 0;
    }, 500);
};

export default runnableAction;




















const init = (box: JQuery<HTMLElement>) => {
    box.mousedown((e) => events.push(e));
    $(window).mouseup((e) => events.push(e));
    $(window).mousemove((e) => events.push(e))
};