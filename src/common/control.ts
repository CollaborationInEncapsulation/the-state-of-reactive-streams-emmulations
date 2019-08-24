
import { controlButton, controlButtonPlay, controlButtonPause, speedometer, speedometerLabel } from './elements';
import { playAnimations, pauseAnimations, changeAnimationSpeed } from './animations';

controlButton.on('click', () => {
    if (controlButton.attr('state') == 'pause') {
        (controlButtonPause[0] as any).beginElement();
        controlButton.attr('state', 'play');
        playAnimations();
    } else {
        (controlButtonPlay[0] as any).beginElement();
        controlButton.attr('state', 'pause')
        pauseAnimations();
    }
});

speedometerLabel.text(`Скорость: ${speedometer.val()}`)
speedometer.on('change', () => {
    const speed = parseFloat(speedometer.val() as string);
    speedometerLabel.text(`Скорость: ${speed}`)
    changeAnimationSpeed(speed)
})