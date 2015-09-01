Y.namespace('Template').Lazyload = Class.create({

	initialize: function (config) {

		this.el = config.el;
		this.mobile = config.mobile || false;
		this.loadEvent = config.loadEvent || 'throttle';

		if (typeof this.loadEvent == 'string') {
			this.loadEvent = this.loadEvent.toLowerCase();
		}

		if (!this.el) {
			console.error('lazyload.js: You must define an element.');
			return false;
		}

		if (this.mobile === false && Y.UA.mobile) {
			Y.all(this.el).each(function (img) {
				ImageLoader.load(img, {
					load: true
				});
			});
			return false;
		}

		this.bindUI();
	},

	bindUI: function () {
		Y.all('img[data-load="viewport"]').each(function (img) {
			ImageLoader.load(img);
		});

		this.loadImages();

		if (this.loadEvent == 'debounce') {
			this.mitigate = function () {
				if (this.timeout) {
					this.timeout.cancel();
				}
				this.timeout = Y.later(100, this, this.loadImages);
			};
		} else {
			this.mitigate = Y.throttle(this.loadImages, 200, this);
		}

		Y.one(window).on('scroll', this.mitigate, this);
	},

	loadImages: function () {
		Y.all(this.el).each(function (img) {
			if (img.getY() < Y.config.win.innerHeight * 1.5 + Y.config.win.scrollY) {
				ImageLoader.load(img, {
					load: true
				});
			}
		});
	},

	refresh: function () {
		this.loadImages();
	}

});