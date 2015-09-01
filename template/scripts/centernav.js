Y.namespace('Template').CenterNav = Class.create({

	initialize: function (config) {

		// the selector for the individual nav items.
		this.navItems = config.navItems;
		// the element you want to center around. usually the logo/site title.
		this.centerEl = config.centerEl;
		// the wrapper that contains the nav and the element you want to center around.
		this.wrapper = config.wrapper;
		// the wrapper around the nav that you want to pull up and over into place.
		this.innerWrapper = config.innerWrapper;

		if (!this.navItems) {
			console.error('centernav.js: You must specify the nav items selector.');
			return false;
		} else if (!this.centerEl) {
			console.error('centernav.js: You must specify an element to center around.');
			return false;
		} else if (!this.wrapper) {
			console.error('centernav.js: You must specify an outer wrapper that contains the nav items and nav wrapper.');
			return false;
		} else if (!this.innerWrapper) {
			console.error('centernav.js: You must specify an inner nav wrapper.');
			return false;
		}

		this.bindUI();

	},

	bindUI: function () {

		if (Y.all(this.navItems).size() > 1) {

			// the amount of space on either side of the element you're centering around.
			this.CENTER_SPACING = 30;

			this.getVariables();

			this.navSpace = (this.wrapperWidth - this.centerElWidth) / 2;

			// if they have a shop, save room for the cart tag
			if (Y.one('.custom-cart')) {
				this.navSpace = ( 
					((this.wrapperWidth - this.centerElWidth) / 2) 
					- (Y.one('.custom-cart').get('offsetWidth') 
					+ parseInt( Y.Squarespace.Template.getTweakValue('headerPadding'), 10 )) 
				);
			}

			this.navItemsSplitPoint = Math.round(Y.all(this.navItems).size() / 2);
			this.splitPointWidth = Y.all(this.navItems).item(this.navItemsSplitPoint - 1).get('offsetWidth');
			this.navItemsLeft = Y.all(this.navItems).slice(0, this.navItemsSplitPoint);
			this.navItemsRight = Y.all(this.navItems).slice(this.navItemsSplitPoint);

			// look for odd number of links, then decide where the extra (middle) one goes.
			if (Y.all(this.navItems).size() % 2 !== 0) {
				if ( 
					this.navItemsLeft.get('offsetWidth').reduce(this.sum, 0) 
					- this.splitPointWidth 
					> this.navItemsRight.get('offsetWidth').reduce(this.sum, 0) 
				) {
					this.navItemsSplitPoint = this. navItemsSplitPoint - 1;
					this.navItemsLeft = Y.all(this.navItems).slice(0, this.navItemsSplitPoint);
					this.navItemsRight = Y.all(this.navItems).slice(this.navItemsSplitPoint);
				}
			}

			this.calculateWidthDiff();

			// the links immediately to the left and right of the split point
			this.leftOfLogo = Y.all(this.navItems).item(this.navItemsSplitPoint - 1);
			this.rightOfLogo = Y.all(this.navItems).item(this.navItemsSplitPoint);

			// if either side of the nav is bigger than the space available for it, move it below
			if ( 
				this.navItemsLeft.get('offsetWidth').reduce(this.sum, 0) > (this.navSpace - 12) || 
				this.navItemsRight.get('offsetWidth').reduce(this.sum, 0) > (this.navSpace - 12) 
			) {

				this.destroy();

				Y.one(this.innerWrapper).setStyles({
					marginLeft: 0,
					marginTop: '10px',
					marginBottom: 0
				});

			} else {

				this.destroy();
				Y.one(this.leftOfLogo).setStyle('marginRight', this.centerElWidth / 2);
				Y.one(this.rightOfLogo).setStyle('marginLeft', this.centerElWidth / 2);

				var navHeight = parseInt(Y.one(this.innerWrapper).getComputedStyle('height'), 10);
				Y.one(this.innerWrapper).setStyles({
					// pulls it to the left or right based on the difference between the 2 sides
					marginLeft: this.widthDiff,
					// and up to vertically align it with the logo/site title
					marginTop: Math.ceil( -1 * ((this.centerElHeight / 2) + (navHeight / 2)) ),
					// this is to cancel out the negative top margin and keep the wrapper the correct height
					marginBottom: Math.ceil( ((this.centerElHeight / 2) + (navHeight / 2)) - navHeight )
				});
				
			}

		}

		Y.one(this.innerWrapper).addClass('positioned');

	},

	destroy: function () {
		Y.all(this.navItems).removeAttribute('style');
	},

	getVariables: function () {
		this.wrapperWidth = Y.one(this.wrapper).get('offsetWidth') - (2 * parseInt(Y.Squarespace.Template.getTweakValue('headerPadding'), 10));
		this.centerElWidth = Y.one(this.centerEl).get('offsetWidth') + (2 * this.CENTER_SPACING);
		this.centerElHeight = Y.one(this.centerEl).get('offsetHeight');
	},

	calculateWidthDiff: function () {
		this.widthDiff = 
		this.navItemsRight.get('offsetWidth').reduce(this.sum, 0) 
		- this.navItemsLeft.get('offsetWidth').reduce(this.sum, 0);
	},

	sum: function (el1, el2) {
		if (typeof el1 == 'number' && typeof el2 == 'number') {
			return el1 + el2;
		} else {
			console.warn("centernav.js sum function: can't add non-numbers.");
			return false;
		}
	}

});
