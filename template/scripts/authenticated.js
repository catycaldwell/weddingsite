// every tweak event that's available
	// tweak:close
	// tweak:discard
	// tweak:aftershow
	// tweak:afterclose
	// tweak:reset
	// tweak:presetcreated
	// tweak:save
	// tweak:change
	// tweak:afterpreset

Y.use('node', function (Y) {
	Y.namespace('Template').Authenticated = Singleton.create({

		ready: function () {
			this.bindUI();
		},

		bindUI: function () {

			Y.Global.on('tweak:beforeopen', function (f) {
				setTimeout(function () {
					Y.one(window).simulate('resize');
				}, 500);
			});

			Y.Global.on(['tweak:save', 'tweak:discard', 'tweak:beforeopen'], function (f) {
				if (Y.one('.always-use-overlay-nav')) {
	        		Y.one('#mobileNavToggle').set('checked',false).simulate('change');
		    	}
			});

			Y.Global.on('tweak:discard', function (f) {

			});

			Y.Global.on('tweak:close', function (f) {
				setTimeout(function () {
					Y.one(window).simulate('resize');
				}, 500);
				if (Y.one('#header.tweaking')) {
					Y.one('#header.tweaking').removeClass('tweaking');
				}
			});

			Y.Global.on('tweak:aftershow', function (f) {
				Y.Template.noYUI.vCenterTopSectionContent();
				Y.Template.Site.runCenterNav();
			}, this);

			Y.Global.on('tweak:change', function (f) {
				var name = f.getName();
				var value = f.getValue();


				if (typeof value == 'string') {
					value = value.toLowerCase();
					value = value.replace(' ', '-');
				}

				if(name == 'siteTitleContainerWidth' || name == 'logoWidth'){
					Y.one('#header').addClass('tweaking');
					Y.Template.helper.debounce(function () {
						Y.one('#header').removeClass('tweaking');
					},500);
				}

				if ( name == 'design' ) {
					Y.Template.Site.regularHeaderForGridGallery();
				}

				if (Y.one('.always-use-overlay-nav')) {
					if (
					name == 'nav-font' ||
					name == 'navColor' ||
					name == 'navActiveColor' ||
					name == 'expand-homepage-index-links'
					) {
						Y.one('#mobileNavToggle').set('checked',true).simulate('change');
					}
				}

				if ( name == 'always-use-overlay-nav' ) {
					Y.Template.Site.injectScrollNavContent();
					Y.Template.noYUI.vCenterTopSectionContent();
					Y.Template.Site.runCenterNav();
				}

				if (
				name == 'siteTitleContainerWidth' ||
				name == 'logoWidth' ||
				name == 'nav-font' ||
				name == 'expand-homepage-index-links'
				) {
					Y.later(140, this, function() {
						Y.Template.noYUI.vCenterTopSectionContent();
						Y.Template.Site.runCenterNav();
					});
				}

				if(name == 'transparent-header'){
					Y.Template.helper.debounce(function () {
						Y.Template.helper.imgLoad();
					});
				}

			});

		}

	});
});
