Y.use('node', 'event-custom', function () {
	Y.namespace('Template').helper = Singleton.create({

		ready: function() {

			Y.on('domready', function() {
				this.bindUI();
			}, this);

			// This is for registering custom event handlers.
			Y.augment(this, Y.EventTarget, true, null, {
				emitFacade: true
			});

		},


		bindUI: function() {

			this.dataToggleBody();
			this.dataToggleEl();
			this.dataLightbox();

			/*
				Below: Event handlers for debounced resize and scroll.

        Y.Template.helper.on('resizeend', function (e) {
          // Callback here.
        });
			*/

			Y.one(window).on('resize', function () {
				this._resize && this._resize.cancel();
				this._resize = Y.later(150, this, function () {
					this.fire('resizeend');
				});

				this.syncUI();
			}, this);


      /*
        Y.Template.helper.on('scrollend', function (e) {
          // Callback here.
        });
      */

			Y.one(window).on('scroll', function () {
				this._scroll && this._scroll.cancel();
				this._scroll = Y.later(150, this, function () {
					this.fire('scrollend');
				});
			}, this);

		},


		syncUI: function () {

			if (Y.one('.touch-styles')) {
				Y.one(window).on('orientationchange', function () {
					this.imgLoad();
				}, this);
			} else {
				Y.Template.helper.on('resizeend', function () {
					this.imgLoad();
				});
			}

		},


		radioCheckboxes: function (wrapper, checkbox, label) {

			/*
				Makes a group of checkboxes behave more
				like radios.

				Only the wrapper param is required.
				Checkbox and label default to the most
				generic selectors possible, but you can
				make them more specific.

				helper.radioCheckboxes('#nav', '.folder-checkbox', '.folder-label');
			*/

			if (!wrapper) {
				console.warn('radioCheckboxes: Must define a wrapper.');
				return;
			}

			if (!Y.one(wrapper)) {
				console.warn('radioCheckboxes: No wrapper found on page.');
				return;
			}

			checkbox = checkbox || '[type="checkbox"]';
			label = label || 'label[for]';

			if (Y.one(wrapper).all(checkbox).size() > 1) {
				Y.one(wrapper).delegate('click', function (e) {
					e.preventDefault();
					var currentCheck = Y.one('#' + e.currentTarget.getAttribute('for'));
					if (currentCheck.get('checked') === false) {
						Y.one(wrapper).all(checkbox).each(function (current) {
							current.set('checked', false);
						});
						currentCheck.set('checked', true);
					} else {
						currentCheck.set('checked', false);
					}
				}, label);
			}

		},


		folderRedirect: function (folder, wrapper) {

			/*
				Redirects the main folder link to the first
				page in the folder. Relies on a data attribute
				in the markup.

				<label for="{id}" data-href="{urlId}">Folder</label>
			*/

			folder = folder || 'label[for]';
			wrapper = wrapper || 'body';

			if (Y.one(folder)) {
				Y.one(wrapper).delegate('click', function (e) {
					e.preventDefault();
					var link = e.currentTarget.getData('href');
					if (link) {
						window.location = link;
					} else {
						console.warn('folderRedirect: You must add a data-href attribute to the label.')
					}
				}, folder);
			}

		},


		dataLightbox: function() {

			/*
				Creates a lightbox when you click on any image/video.
				To initialize, add a data attribute to any img or video tag

				<img data-lightbox="set-name"/>
			*/

			var lightboxSets = {};

			Y.all('[data-lightbox]').each(function(elem) {
				var name = elem.getAttribute('data-lightbox');
				lightboxSets[name] = lightboxSets[name] || new Array();

				lightboxSets[name].push({
					content: elem,
					meta: elem.getAttribute('alt')
				});

				elem.on('click', function(e) {
					e.halt();

					new Y.Squarespace.Lightbox2({
						set: lightboxSets[name],
						currentSetIndex: Y.all('[data-lightbox]').indexOf(elem),
						controls: { previous: true, next: true }
					}).render();
				});
			});

		},


		dataToggleBody: function() {

			/*
				Toggles a class on the body when you click an
				element. To initialize, add a data attribute to
				any element, like so.

				<div class="shibe" data-toggle-body="doge"></div>
			*/

			Y.one('body').delegate('click', function(e) {
				Y.one('body').toggleClass(e.currentTarget.getData('toggle-body'));
			}, '[data-toggle-body]');

		},


		dataToggleEl: function() {

			/*
				Toggles a class on any element when you click on
				it. To initialize, add a data attribute to any
				element, like so.

				<div class="shibe" data-toggle="doge"></div>
			*/

			Y.one('body').delegate('click', function(e) {
				var current = e.currentTarget;
				current.toggleClass(current.getData('toggle'));
			}, '[data-toggle]');

		},


		debounce: function(callback, timer, context) {

			/*
				This function takes an event that executes
				continuously - like scroll or resize - and
				fires only one event when the continuous
				events are finished.

				helpers.debounce(function () {
					// do stuff here.
				});
			*/

			timer = timer || 100;
			context = context || Y.Template.Site;

			if (callback) {
				this._timeout && this._timeout.cancel();
				this._timeout = Y.later(timer, context, callback);
			}

		},


		imgLoad: function (el) {

			/*
				Pass an image selector to this function and
				Squarespace will load up the proper image
				size.

				ex: this.imgLoad('img[data-src]');
			*/

			el = el || 'img[data-src]';

			Y.all(el).each(function (img) {
				ImageLoader.load(img);
			});

		},


		scrollAnchors: function (el) {

			/*
				Makes anchor links scroll smoothly instead of jumping
				down the page. The "el" argument is optional. By
				default, invoking this function will create the smooth
				scrolling behavior on every hash link.

				Y.Template.helper.scrollAnchors();
			*/

			if (!history.pushState) {
				return false;
			}

			if (el) {
				if (typeof el != 'string') {
					console.warn('helpers.js: scrollAnchors argument must be a string.');
					return false;
				} else {
					Y.all(el).each(function (a) {
						if (!a.hasAttribute('href')) {
							console.warn('helpers.js: scrollAnchors must have href attributes.');
							return false;
						} else {
							if (!a.getAttribute('href').substring(0, 1) == '#') {
								console.warn('helpers.js: scrollAnchors links must start with a hash.');
							}
						}
					});
				}
			}

			var anchors = el || 'a[href^="#"]';

			Y.one('body').delegate('click', function (e) {
				e.halt();

				var hash = e.target.getAttribute('href');
				Y.one(hash) && this.smoothScrollTo(Y.one(hash).getY());
				history.pushState({}, hash, hash);
			}, anchors, this);

		},


		smoothScrollTo: function (point) {

			/*
				Scrolls to some point on the Y axis of a page.
				Accepts a number as an argument.
			*/

			if (parseInt(point) == NaN) {
				console.warn('helpers.js: smoothScrollTo must have a scroll point passed to it.')
				return false;
			}

			if (!Y.Lang.isNumber(point)) {
				try {
					point = parseInt(point);
				} catch (e) {
					console.warn('helpers.js: scrollTo was passed an invalid argument.');
					return false;
				}
			}

			if (Y.UA.mobile) {
				window.scroll(0, point);
			} else {
				var a = new Y.Anim({
					node: Y.one(Y.UA.gecko || Y.UA.ie || !!navigator.userAgent.match(/Trident.*rv.11\./) ? 'html' : 'body'),
					to: {
						scrollTop : point
					},
					duration: 0.4,
					easing: 'easeOut'
				});

				a.run();

				a.on('end', function () {
					a.destroy();
				});
			}

		},


		disableScroll: function (bodyClass) {

			if (!Y.Lang.isString(bodyClass)) {
				console.warn('helpers.js: disableScroll arg must be a string.');
				return false;
			}

			var lastScroll = Y.config.win.scrollY;

			Y.one(window).on('scroll', function () {
				if (Y.one('body').hasClass(bodyClass)) {
					window.scrollTo(0, lastScroll);
				} else {
					lastScroll = Y.config.win.scrollY;
				}
			}, this);

		},


		centerMapPin: function (mapEl, locationData) {

			/*
				Pass the Y node and location JSON
				to this method. Ex:

				Y.all('.sqs-block-map').each(function (map) {
					Y.Template.helper.centerMapPin(
						map,
						map.getData('block-json')
					);
				});
			*/

	    var map = mapEl._node.__map;

			if (!map) {
				console.error('helpers.js: Invalid argument passed to centerMapPin method.');
				return false;
			}

	    var center = map.getCenter();

	    center.d = locationData.location.mapLat;
	    center.e = locationData.location.mapLng;

	    google.maps.event.trigger(map, 'resize');
	    map.setCenter(center);

		}


	});
});
