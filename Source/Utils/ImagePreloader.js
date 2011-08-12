/*
---

name: "Utils.ImagePreloader"

description: "Provides images preloader"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.ImagePreloader

...
*/

var ImagePreloader = LibCanvas.Utils.ImagePreloader = Class({
	Implements: Class.Events,
	processed : 0,
	number: 0,
	initialize: function (images) {
		this.count = {
			errors : 0,
			aborts : 0,
			loaded : 0
		};

		if (Array.isArray(images)) images = Object.map(images[1], function (src) {
			return images[0] + src;
		});
		this.usrImages = images;
		this.domImages = this.createDomImages(images);
		this.images    = {};
	},
	cutImages: function () {
		var i, parts, img;
		for (i in this.usrImages) {
			parts = this.splitUrl( this.usrImages[i] );
			img   = this.domImages[ parts.url ];
			if (parts.coords) img = img.sprite(Rectangle( parts.coords ));
			this.images[i] = img;
		}
		return this;
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.cutImages().readyEvent('ready', [this]);
		return this;
	},
	get info () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getInfo : function () {
		return this.info
	},
	get progress () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	getProgress : function () {
		return this.progress;
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createDomImage : function (src) {
		this.number++;
		return atom.dom
			.create('img', { src : src })
			.bind({
				load : this.onProcessed.bind(this, 'loaded'),
				error: this.onProcessed.bind(this, 'errors'),
				abort: this.onProcessed.bind(this, 'aborts')
			})
			.first;
	},
	splitUrl: function (str) {
		var url = str, coords = str.match(/ \[[\d\.:]+\]$/);
		if (coords) {
			coords = coords[0];
			url    = str.substr(0, str.lastIndexOf(coords));
		}
		return { url: url,
			coords: coords ? Array.from( coords.match(/[\d\.]+/g) ) : null
		};
	},
	createDomImages: function (images) {
		var i, result = {}, url;
		for (i in images) {
			url = this.splitUrl( images[i] ).url;
			if (!result[url]) result[url] = this.createDomImage( url );
		}
		return result;
	},
	ready : function (fn) {
		this.addEvent('ready', fn);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ImagePreloader]')
});