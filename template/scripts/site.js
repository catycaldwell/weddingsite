Y.use('node', function (Y) {

	Y.namespace('Template').Site = Singleton.create({

		ready: function () {
			this.regularHeaderForGridGallery();

			Y.on('domready', function () {
				this.init();
			}, this);
		},

		init: function() {
			this.cartState();
			this._touch = Y.one('.touch-styles');

			if (Y.one('.index-section .index-section-image')) {
				this.fadeInFirstIndexSectionImageOnLoad();
			}


			this.transparentHeaderPadding();

			this.textShrink('#siteTitle a','#siteTitle');
			this.textShrink('.index-gallery .slide-meta-content .title','.index-gallery .slide-meta-content');
			this.textShrink('.index-section-wrapper.has-main-image .sqs-block-content h1','.index-section-wrapper.has-main-image .sqs-block-content');
			this.textShrink('.banner-thumbnail-wrapper .desc-wrapper h1','.banner-thumbnail-wrapper .desc-wrapper');
			this.textShrink('.quote-block figure','.sqs-block.quote-block');
			this.textShrink('.page-description p','.page-description');


			this.getVariables();

			// Inject the content for the show on scroll script.
			this.wrapper = Y.Node.create('<div class="show-on-scroll-wrapper" id="showOnScrollWrapper"></div>');
			this.injectScrollNavContent();

			this.syncUI();
			this.bindUI();

			if (this._touch || Y.one('.always-use-overlay-nav') || Y.config.win.innerWidth <= 768) {
				Y.Template.helper.radioCheckboxes('#mainNavigation');
				Y.Template.helper.radioCheckboxes('#mobileNavigation');
			} else {
				Y.Template.helper.folderRedirect('#headerNav .folder-toggle-label');
				Y.Template.helper.folderRedirect('#footer .folder-toggle-label');
			}

		},

		fadeInFirstIndexSectionImageOnLoad: function () {
			Y.one('.index-section-image img').on('load', function(e){
				e.currentTarget.addClass('loaded');
			});
		},

		/**
		 * Sets up an instance of MutationObserver, a DOM API that allows you to react to changes in the DOM.
		 * If MutationObserver is not supported, the callback will pass null arguments and a fallback can be
		 * specified in the callback.
		 *
		 * @method mutationObserver
		 * @param  {Node} 		target 		The node on which to observe DOM mutations
		 * @param  {Object}		options 	Specifies which DOM mutations should be reported
		 * @param  {Function} 	callback	The function which will be called on each DOM mutation. The observer will
		 *                              	call this function with two arguments: (1) an array of objects, each of
		 *                              	type MutationRecord, and (2) the MutationObserver instance.
		 */
		mutationObserver: function (target, options, callback) {

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

			if (MutationObserver) {

				var observer = new MutationObserver(callback);
				observer.observe(target, options);

				// Stop observing after a while... ?
				var timer = Y.later(15000, this, function(){
					observer.disconnect();
					timer.cancel();
				});

			} else {

				// Fallback ( < IE10 )
				callback(null, null);
			}

		},

		bindUI: function () {
			this.mutationObserver(Y.one('#siteWrapper').getDOMNode(),
				{childList: true, subtree: true}, this.mutationCallback);

			Y.one(window).on('resize', function(){
				this.getVariables();
				this.syncUI();
				Y.Template.noYUI.vCenterTopSectionContent();
			}, this);

			Y.Squarespace.Singletons.ShoppingCart.on('change', Y.Template.Site.cartState);

			this.disableScroll();

			Y.Template.helper.on('resizeend', function () {
				Y.all('.map-block[data-block-json]').each(function (map) {
					Y.Template.helper.centerMapPin(
				map.one('.page-map'), JSON.parse(map.getData('block-json'))
				);
				});
			});

			if (Y.one('.collection-type-index')) {
				Y.all('.index-gallery').each(function (gallery) {
					new Y.Template.Gallery({
						wrapper: gallery.one('.gallery-wrapper'),
						slides: '.slide-wrapper'
					});
				});

				if (Y.one('.collection-type-index.homepage')) {
					// Initiate the sticky header.
					new Y.Template.RevealOnScroll({
						el: '#showOnScrollWrapper',
						offsetEl: '.index-section-wrapper',
						behavior: 'bottom'
					});

				}

			}

			if (
				Y.one('.index-section-image img') &&
				Y.all('.index-section-image img').length >= 2
			) {
				if (!this.lazyload) {
					this.lazyload = new Y.Template.Lazyload({
						el: '.index-section-image img',
						mobile: false,
						loadEvent: 'throttle'
					});
				} else {
					this.lazyload.refresh();
				}
			} else {
				Y.all('.index-section-image img').each(function (img) {
					ImageLoader.load(img.removeAttribute('data-load'));
				});
			}

			this.scrollNav();
			this.altSections(Y.all('.index-section.no-main-image'));
				Y.Template.helper.scrollAnchors();

		},

		syncUI: function () {

			this.runCenterNav();
			this.overlayNavPadding();
			this.folderEdgeDetection();

			Y.Template.helper.on('resizeend', this.scrollNav, this);
			Y.Template.helper.on('resizeend', this.injectScrollNavContent(), this);

			if (Y.one('.collection-type-index.homepage')) {
				/*
					Make the Index Links in the Nav Scroll Smoothly.
				*/

				this.scrollNavHeight = Y.one('#showOnScrollWrapper #mainNavWrapper') ? Y.one('#showOnScrollWrapper #mainNavWrapper').get('clientHeight') : 0;

				Y.all(this.navLinks).each(function (a) {

					a.on('click', function (e) {
						window.location.hash && history.pushState('', document.title, window.location.pathname);
						e.halt();

						var hash = a.getAttribute('href');
						var scrollPoint;

						if (hash.charAt(0) === '/') {
							hash = hash.substr(1);
						}

						if (!Y.one(hash)) {
							return;
						}

						if (this.mobileNav) {
							scrollPoint = Y.one(hash).getY() + 1;
						} else {
							scrollPoint = Y.one(hash).getY() - this.scrollNavHeight + 1;
						}

						if (this.mobileNav) {
							Y.one('#mobileNavToggle').set('checked',false).simulate('change');

							Y.later(400, this, function() {
								Y.Template.helper.smoothScrollTo(scrollPoint);
							});

						} else {
							Y.Template.helper.smoothScrollTo(scrollPoint);
						}
					}, this);
				}, this);

			} else if (this.mobileNav) {

				Y.all(this.navLinks).each(function (a) {

					a.on('click', function (e) {

						Y.one('#mobileNavToggle')
							.set('checked',false)
							.simulate('change');

					}, this);

				}, this);

			}

		},

		/**
		 * A MutationObserver callback that allows us to make any necessary adjustments if nodes are dynamically loaded into the DOM.
		 *
		 * @method mutationCallback
		 * @param  {Array}				mutations 	An array of MutationRecord objects
		 * @param  {MutationObserver} 	observer 	Our instance of the observer
		 */
		mutationCallback: function (mutations, observer) {
			if (mutations) {
				for (var i = 0; i < mutations.length; i++) {
					if (mutations[i].addedNodes.length) {
						for (var j = 0; j < mutations[i].addedNodes.length; j++) {
							// Refire ImageLoader on index section background images
							var newNode = Y.Node(mutations[i].addedNodes[j]);
							if (newNode.ancestor('.index-section-wrapper.has-main-image')) {
								ImageLoader.load(newNode.ancestor('.index-section-wrapper').one('.index-section-image img'));
							}

							// Adjust scroll position
							if(window.location.hash) {
								var hash = window.location.hash;

								if (hash.charAt(0) === '/') {
									hash = hash.substr(1);
								}

								if (Y.one(hash)) {
									Y.one(window).set('scrollTop', Y.one(hash).getY() + 1);
								}
							}
						}
					}
				}

			} else {
				// Fallback ( < IE10 )
				// Refire ImageLoader on index section background images 1200ms after an io:end event.
				Y.on('io:end', function(e){
					var timer = Y.later(1200, this, function(){
						Y.all('.index-section-image img').each(function(img){
							ImageLoader.load(img);
						});
						timer.cancel();
					});
				});
			}
		},

		getVariables: function () {
			this.headerHeight = Y.one('#header').get('offsetHeight');

			this.mobileNav = this._touch || Y.one('.always-use-overlay-nav') || Y.config.win.innerWidth <= 768;
			this.navLinks = '.nav-wrapper .index.home a';

			if (Y.one('#header .mobile-nav-toggle-label').getComputedStyle('display') == 'none') {
				this.mobileNavShowing = false;
			} else {
				this.mobileNavShowing = true;
			}
		},

		scrollNav: function () {

			if (Y.one('.collection-type-index.homepage') && Y.one('#header #mainNavWrapper') && Y.one('.index.home')) {

				var indexSection = Y.all('.index-section:not(.gallery)');
				var indexNavItems = this.mobileNavShowing ? Y.all('#mobileNavWrapper .index.home') : Y.all('#showOnScrollWrapper #mainNavigation .index.home');
				var current = 0;
				var last = 0;
				var offset = this.mobileNavShowing ? 0 : Y.one('#showOnScrollWrapper #mainNavWrapper').get('clientHeight') + 1;

				var throttle = Y.throttle(Y.bind(function () {

					indexSection.each(function (section, i) {
						i = i++;
						if (section.getY() < Y.config.win.scrollY + offset) {
							current = i;
						}
					}, this);

					if (
						Y.config.win.scrollY + Y.config.win.innerHeight >=
						Y.one('body').get('clientHeight')
					) {
						indexNavItems.item(indexNavItems.size() - 1).addClass('active');
						current = indexNavItems.size() - 1;
					} else {
						indexNavItems.item(current).addClass('active');
					}

					if (current != last) {
						indexNavItems.item(last).removeClass('active');
						last = current;
					}
				}, this), 200);

				Y.one(window).on('scroll', throttle);

				Y.Template.helper.on('scrollend', throttle);

			}

		},

		cartState: function() {

			var quant = Y.Squarespace.Singletons.ShoppingCart.get('totalQuantity');
			var cart = Y.one('.custom-cart');

			if (cart){
				if (quant && quant > 0){
					cart.removeClass('empty');
				}else{
					if(!cart.hasClass('empty')){
						cart.addClass('empty');
					}
				}
			}

		},

		disableScroll: function () {

			var toggle = Y.one('#mobileNavToggle');

			toggle.on('change', function () {
				if (toggle.get('checked') === true) {
					Y.one('body').addClass('disable-scroll');
				} else {
					Y.one('body').removeClass('disable-scroll');
				}
			});

			Y.Template.helper.disableScroll('disable-scroll');

		},

		textShrink: function(element, ancestor) {
			if(Y.one(element) && Y.one(element).ancestor(ancestor)){
				Y.all(element).each(function(item){
					item.plug(Y.Squarespace.TextShrink, {
						parentEl: item.ancestor(ancestor)
					});
				});
			}
		},

		regularHeaderForGridGallery: function () {
			if (Y.one('.collection-type-index.design-grid.has-banner-image') && Y.one('#page #content .index-section:first-child .index-section-wrapper .gallery-content')) {
				Y.one('body').removeClass('has-banner-image');
			} else if (Y.one('.collection-type-index.design-slideshow:not(.has-banner-image)') && Y.one('#page #content .index-section:first-child .index-section-wrapper .gallery-content')) {
				Y.one('body').addClass('has-banner-image');
			}
		},

		fadeIn: function (el) {
			if (Y.one(el) && Y.one(el).hasClass('tmpl-loading')) {
				Y.all(el).each(function(e) {
					e.removeClass('tmpl-loading').addClass('tmpl-loaded');
				});
			}
		},

		runCenterNav: function () {
			if (Y.one('body:not(.always-use-overlay-nav)')) {
				var navSelector = '#header #mainNavigation > div';
				if(Y.one('.index.home')){
					navSelector = '#header #mainNavigation > div:not(.home)';
					if(Y.one('.expand-homepage-index-links')){
						navSelector = '#header #mainNavigation > div:not(.base)';
					}
				}
				new Y.Template.CenterNav({
					navItems: navSelector,
					centerEl: '#header .title-logo-wrapper h1',
					wrapper: '#header',
					innerWrapper: '#header #headerNav'
				});
			}
		},

		overlayNavPadding: function () {

			if (Y.config.win.innerWidth > 640 && Y.one('#overlayNav #mainNavWrapper')) {
				Y.one('#overlayNav #mobileNavWrapper').setStyles({
					paddingTop: this.headerHeight,
					paddingBottom: this.headerHeight
				});
			}

		},

		folderEdgeDetection: function () {

			Y.all('.subnav').each(function (current) {
				var winWidth = Y.config.win.innerWidth;
				if ( (winWidth - current.getX()) <= current.get('offsetWidth') ) {
					current.addClass('right-align');
				}
			});

		},

		transparentHeaderPadding: function () {

			var headerPosition = Y.one('#header').getComputedStyle('position');
			var extraPadding = ( Y.one('#header .header-inner h1').get('offsetHeight')
													+ parseInt(Y.one('#header .header-inner').getComputedStyle('paddingTop'), 10) ) / 2;

			if (headerPosition == 'absolute' && Y.one('.main-content .index-section:first-child .index-section-wrapper.has-main-image')) {

				// re-wrote this in vanilla javascript in no-yui.js so it executes immediately

			} else if (headerPosition == 'absolute' && Y.one('body.has-banner-image')) {
				Y.one('.banner-thumbnail-wrapper .desc-wrapper') && Y.one('.banner-thumbnail-wrapper .desc-wrapper').setStyle('paddingTop', extraPadding);
				Y.all('.banner-thumbnail-wrapper img[data-load="false"]').each(function (img) {
					ImageLoader.load(img.removeAttribute('data-load'));
				});
			} else {
				Y.all('.banner-thumbnail-wrapper img[data-load="false"]').each(function (img) {
					ImageLoader.load(img.removeAttribute('data-load'));
				});
			}

		},

		injectScrollNavContent: function () {

			if (Y.one('.collection-type-index.homepage') && Y.one('#header #mainNavWrapper')) {

				Y.one('#showOnScrollWrapper') && Y.one('#showOnScrollWrapper').empty();

				this.fixedEl = this.mobileNav ? '.show-on-scroll-mobile' : '.show-on-scroll';

				Y.one('#mobileNavToggle').insert(this.wrapper.setHTML(Y.one(this.fixedEl).get('outerHTML')), 'after');

				if (this.fixedEl == '.show-on-scroll') {
					Y.all('#showOnScrollWrapper #mainNavWrapper nav div').removeAttribute('style');
				}

			}

		},

		altSections: function (el) {
			el.each(function(section){
				if(section.get('nextElementSibling')) {
					if(section.get('nextElementSibling').hasClass('index-section.no-main-image') && !(section.hasClass('alt-section')) ) {
						section.get('nextElementSibling').addClass('alt-section');
					}
				}
			});

		}

	});

});
