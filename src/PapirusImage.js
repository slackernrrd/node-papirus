import Jimp from 'jimp';
import Dither from 'image-dither';

export default class PapirusImage {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.image = new Jimp(width, height, 0xffffffff);
		this.dither = new Dither({
			matrix: Dither.matrices.floydSteinberg
		});
		this.monochrome = new Dither({
			matrix: Dither.matrices.none
		});
	}

	addImage(path, dither = true) {
		return Jimp.read(path).then((image) => {
			image.contain(this.width, this.height);
			if (dither) {
				image.bitmap.data = this.dither.dither(image.bitmap.data, this.width);
			}
			else {
				image.bitmap.data = this.monochrome.dither(image.bitmap.data, this.width);
			}
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
			const buffer = Buffer.alloc((this.width * this.height) / 8);
			let currentByte = 0x00;
			let currentBitPos = 0;
			let byteCount = 0;
			this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, (x, y, idx) => {
				const red = this.image.bitmap.data[idx];
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
		});
	}

	writeToFile(path) {
		return new Promise((resolve, reject) => {
			this.image.write(path, (err) => {
				if (err) { reject(new Error(err)); return; }
				return resolve(this);
			});
		});
	}

	static get FONT_SANS_8_BLACK() { return Jimp.FONT_SANS_8_BLACK; }
	static get FONT_SANS_16_BLACK() { return Jimp.FONT_SANS_16_BLACK; }
	static get FONT_SANS_32_BLACK() { return Jimp.FONT_SANS_32_BLACK; }
	static get FONT_SANS_64_BLACK() { return Jimp.FONT_SANS_64_BLACK; }
	static get FONT_SANS_128_BLACK() { return Jimp.FONT_SANS_128_BLACK; }
};