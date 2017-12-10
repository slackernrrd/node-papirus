import Jimp from 'jimp';
import gm from 'gm';

export default class PapirusImage {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.image = new Jimp(width, height, 0xffffffff);
	}

	addImage(path) {
		return Jimp.read(path).then((image) => {
			image.contain(this.width, this.height);
			this.image.composite(image, 0, 0);
			return this;
		});
	}

	addText(text, font, x = 0, y = 0) {
		return Jimp.loadFont(font).then((font) => {
			this.image.print(font, x, y, text, this.width);
			return this;
		});
	}

	toBuffer() {
		return new Promise((resolve, reject) => {
			this.image.write('papirus.tmp.bmp', (err) => {
				if (err) { reject(new Error(err)); return; }

				gm('papirus.tmp.bmp')./*dither().*/monochrome().endian('MSB').write('papirus.mono.bmp', (err) => {
					if (err) { reject(new Error(err)); return; }

					Jimp.read('papirus.mono.bmp').then((image) => {
						const buffer = Buffer.alloc((this.width * this.height) / 8);
						let currentByte = 0x00;
						let currentBitPos = 0;
						let byteCount = 0;
						image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
							const red = image.bitmap.data[idx];
							let bit = 1;
							if (red === 0xff) {
								bit = 0;
							}
							currentByte = currentByte | (bit << (currentBitPos));
							currentBitPos++;
							if (currentBitPos > 7) {
								currentBitPos = 0;
								buffer.writeUInt8(currentByte, byteCount++);
								currentByte = 0x00;
							}
						});

						resolve(buffer);
					})
					.catch((err) => {
						reject(new Error(err));
					});
				});
			})
		});
	}

	writeToFile(path) {
		return new Promise((resolve, reject) => {
			this.image.write('papirus.tmp.bmp', (err) => {
				if (err) { reject(new Error(err)); return; }

				gm('papirus.tmp.bmp')./*dither().*/monochrome().endian('MSB').write(path, (err) => {
					if (err) { reject(new Error(err)); return; }

					resolve(this);
				});
			})
		});
	}

	static get FONT_SANS_8_BLACK() { return Jimp.FONT_SANS_8_BLACK; }
	static get FONT_SANS_16_BLACK() { return Jimp.FONT_SANS_16_BLACK; }
	static get FONT_SANS_32_BLACK() { return Jimp.FONT_SANS_32_BLACK; }
	static get FONT_SANS_64_BLACK() { return Jimp.FONT_SANS_64_BLACK; }
	static get FONT_SANS_128_BLACK() { return Jimp.FONT_SANS_128_BLACK; }
};