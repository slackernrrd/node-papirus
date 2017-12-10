import nativeFs from 'fs';
import Promise from 'bluebird'

let fs = Promise.promisifyAll(nativeFs);

export default class Epd {
	constructor(endianness) {
		if (endianness === 'LE') {
			this.endianness = 'LE';
		}
		else {
			this.endianness = 'BE';
		}
	}

	version() {
		return this._read('version')
	}

	panel() {
		return this._read('panel');
	}

	current() {
		return this._read(this.endianness + '/current');
	}

	display(data) {
		if (!data) {
			return this._read(this.endianness + '/display');
		}
		return this._write(this.endianness + '/display', data);
	}

	temperature(celsius) {
		if (!celsius) {
			return this._read('temperature');
		}
		return this._write('temperature', celsius);
	}

	stageTime(milliseconds) {
		if (!milliseconds) {
			return this._read('f_stage_time');
		}
		return this._write('f_stage_time', milliseconds);
	}

	clear() {
		return this._command('C');
	}

	update() {
		return this._command('U');
	}

	partialUpdate() {
		return this._command('P');
	}

	partialUpdateWithStageTime() {
		return this._command('F');
	}

	_command(command) {
		return this._write('command', command);
	}

	_read(path) {
		return fs.readFileAsync('/dev/epd/' + path);
	}

	_write(path, data) {
		return fs.writeFileAsync('/dev/epd/' + path, data);
	}
}