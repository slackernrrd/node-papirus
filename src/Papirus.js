import AsyncOpQueue from './AsyncOpQueue';
import Epd from './Epd';
import PapirusImage from './PapirusImage';

export default class Papirus {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.queue = new AsyncOpQueue();
		this.epd = new Epd();
		this.image = new PapirusImage(this.width, this.height);
	}

	reset() {
		return this.epd.clear().then(() => {
			return this;
		});
	}

	clear() {
		this.queue.push(() => {
			this.image = new PapirusImage(this.width, this.height);
			return this;
		});
		return this;
	}

	addImage(path) {
		this.queue.push(() => {
			console.log(`Opening image '${path}'...`);
			return this.image.addImage(path)
				.then((image) => {
					console.log('Image opened.');
					return this;
				})
				.catch((err) => {
					console.log('Error opening image: ' + err);
				});
			});
		return this;
	}

	addText(text, font, x = 0, y = 0, id = null) {
		console.log(`Writing "${text}" at (${x},${y})`);
		this.queue.push(() => {
			return this.image.addText(text, font, x, y)
		});
		return this;
	}

	write(partial = false) {
		this.queue.push(() => {
			return this.image
				.toBuffer()
				.then((buffer) => {
					this.epd.display(buffer);
					if (partial) {
						this.epd.partialUpdate();
					}
					else {
						this.epd.update();
					}
				})
				.catch((err) => {
					console.log(err);
				});
		});
		return this.done();
	}

	writeToFile(path) {
		this.queue.push(() => {
			console.log(`Writing image to file ${path}...`);
			return this.image
				.writeToFile(path)
				.then(() => {
					console.log('Image written.');
				})
				.catch((err) => {
					console.log(err);
				});
		});
		return this.done();
	}

	done() {
		return this.queue.execute().then(() => {
			return this;
		});
	}

	static get FONT_SANS_8_BLACK() { return PapirusImage.FONT_SANS_8_BLACK; }
	static get FONT_SANS_16_BLACK() { return PapirusImage.FONT_SANS_16_BLACK; }
	static get FONT_SANS_32_BLACK() { return PapirusImage.FONT_SANS_32_BLACK; }
	static get FONT_SANS_64_BLACK() { return PapirusImage.FONT_SANS_64_BLACK; }
	static get FONT_SANS_128_BLACK() { return PapirusImage.FONT_SANS_128_BLACK; }
};