import * as $ from 'jquery';

const runnableAction = () => {
    const box = $('<div class="box"></div>');

    box.appendTo('body');

    const onMouseDown = (e: JQuery.Event) => {
        isDragging = true
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    }    
    const onMouseUp = (e: JQuery.Event) => {
        isDragging = false
    }
    const onMouseMove = (e: JQuery.Event) => {
        if (!isDragging) {
            return;
        }

        box.css({
            top: e.clientY - offsetY,
            left: e.clientX - offsetX
        })
    }

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;


    box.mousedown(onMouseDown);
    $(window).mouseup(onMouseUp);
    $(window).mousemove(onMouseMove)
}

export default runnableAction;























