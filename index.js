const through = require('through2');
const rework = require('rework');
const split = require('rework-split-media');
const moveMedia = require('rework-move-media');
const stringify = require('css-stringify');
const dirname = require('path').dirname;
const pathJoin = require('path').join;

const defaultBreakpoint = 768;

/**
 * @type {{breakpoint: number}} min-width including this resolution will stay at source file
 */
const defaults = {
	breakpoint: defaultBreakpoint,
};

module.exports = function(options) {
	return through.obj(function(file, encoding, callback) {
		options = Object.assign({}, defaults, options);

		const breakpoint = options.breakpoint;

		if (typeof options.breakpoint !== 'number' || options.breakpoint < 1) {
			throw new Error('breakpoint must be a number bigger than 0');
		}

		const filename = file.relative.replace(/\.css$/, '') + '-above-' + breakpoint;

		const stream = this;
		const reworkData = rework(file.contents.toString()).use(moveMedia());
		const styles = split(reworkData);
		const mediaKeys = Object.keys(styles);

		const mediaQueries = file.clone({
			contents: false,
		});

		const otherRules = file.clone({
			contents: false,
		});

		let otherContents = '';
		let mediaContents = '';
		let contents = '';
		let minwWidthMatch = null;
		let minBreakpoint = 0;

		const addToOthers = function (contents, key) {
			if (key) {
				otherContents += '@media ' + key + '{\n' + contents + '\n}\n\n';

				return;
			}

			otherContents += contents + '\n\n';
		};

		const addToMedia = function (contents, key) {
			mediaContents += '@media ' + key + '{\n' + contents + '\n}\n\n';
		};

		mediaKeys.forEach(function(key) {
			contents = stringify(styles[key]);

			if (!key) {
				addToOthers(contents);

				return;
			}

			minwWidthMatch = key.match(/min-width:(?:\s*?)(\d{2,5}?)(?:\s*?)(?:px|em|%)/);

			if (minwWidthMatch && minwWidthMatch[1]) {

				minBreakpoint = minwWidthMatch && parseInt(minwWidthMatch[1]);

				if (minBreakpoint && minBreakpoint >= breakpoint) {
					addToMedia(contents, key);

					return;
				}
			}

			addToOthers(contents, key);
		});

		otherRules.contents = new Buffer(otherContents);
		otherRules.path = file.path;

		mediaQueries.contents = new Buffer(mediaContents);
		mediaQueries.path = pathJoin(dirname(file.path), filename + '.css');

		stream.push(otherRules);
		stream.push(mediaQueries);

		if (typeof callback !== 'function') {
			return;
		}

		try {
			callback();
		} catch (e) {
			throw new Error('Error in passed callback function', e);
		}
	});
};