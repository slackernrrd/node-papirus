import Pigpio from 'pigpio';

let Gpio = Pigpio.Gpio;

export default class EpdButtons {
	constructor(piZero) {
		let buttonConfig = {
			mode: Gpio.INPUT,
			pullUpDown: Gpio.PUD_DOWN,
			edge: Gpio.EITHER_EDGE
		};
		let buttonGpios = (piZero ? [21, 16, 20, 19, 26] : [16, 26, 20, 21]);
		buttonGpios.forEach((gpio, index) => {
			let button = new Gpio(gpio, buttonConfig);
			button.on('interrupt', ((button) => {return (level) => {
				console.log(`Button ${button} pressed`);
			}})(index))
		});
	}

	addCallback(buttonIndex, cb) {

	}
}