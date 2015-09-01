Y.namespace('Template').RevealOnScroll = Class.create({

	initialize: function (config) {

		this.el = config.el;
		this.offsetEl = config.offsetEl;
		this.behavior = config.behavior || 'top';

		if (typeof this.behavior == 'string') {
			this.behavior = this.behavior.toLowerCase();
		}

		if (!this.el) {
			console.error('sticky.js: You must specify an element.');
			return false;
		}

		if (!Y.one(this.el)) {
			return false;
		}

		this.bindUI();

	},

	bindUI: function () {

		this.getVariables();

		Y.one(window).on('resize', function () {
			this.getVariables();
			this.showOrHide();
		}, this);

		this.throttle = Y.throttle(Y.bind(function () {
			this.showOrHide();
		}, this), 200);

		this.debounce = function () {
			if (this.timeout) {
				this.timeout.cancel();
			}
			this.timeout = Y.later(100, this, this.showOrHide);
		};

		Y.one(window).on('scroll', function () {
			this.throttle();
			this.debounce();
		}, this);

		Y.one(window).on('hashchange', this.debounce, this);

		this.showOrHide();

	},

	getVariables: function () {

		if (Y.one(this.offsetEl)) {
			if (this.behavior == 'bottom') {
				this.y = Y.one(this.offsetEl).getY() +
					Y.one(this.offsetEl).get('clientHeight') -
					Y.one(this.el).get('clientHeight');
			} else {
				this.y = Y.one(this.offsetEl).getY() -
					Y.one(this.el).get('clientHeight');
			}
		}

	},

	showOrHide: function () {

		var scrollValue = Y.config.win.scrollY;

		if (scrollValue >= this.y) {
			Y.one(this.el).addClass('show');
		} else {
			Y.one(this.el).removeClass('show');
		}

	}

});
