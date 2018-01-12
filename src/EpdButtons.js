import Onoff from 'onoff';

let Gpio = Onoff.Gpio;

export default class EpdButtons {
	constructor(piZero) {
		this.callbacks = [];

		let buttonConfig = {
			activeLow: false
		};
		let buttonGpios = (piZero ? [21, 16, 20, 19, 26] : [16, 26, 20, 21]);
		let buttons = [];
		buttonGpios.forEach((gpio, index) => {
			let button = new Gpio(gpio, 'in', 'falling', buttonConfig);
			button.watch(((button) => {return (err, value) => {
				if (err) {
					throw err;
				}
				if (!this.callbacks[button]) {
					return;
				}
				this.callbacks[button].forEach((cb) => {
					cb(button);
				});
			}})(index));
			buttons.push(button);
		});
		process.on('SIGINT', () => {
			buttons.forEach((button) => {
				button.unexport();
			});
			process.exit(128 + 2);
		});
	}

	listen(buttonIndex, cb) {
		if (!this.callbacks[buttonIndex]) {
			this.callbacks[buttonIndex] = [];
		}
		this.callbacks[buttonIndex].push(cb);
	}
}