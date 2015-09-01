Y.namespace('Template').Gallery = Class.create({
  initialize: function (config) {
    this.slides = config.slides;
    this.wrapper = config.wrapper;

    if (!this.slides) {
      console.error('index-gallery.js: You have to define the slides selector.');
      return false;
    }

    if (!this.wrapper) {
      console.error('index-gallery.js: You have to define the wrapper selector.');
      return false;
    }

    if (!Y.one(this.wrapper) || !Y.one(this.slides)) {
      return false;
    }

    this.getTweaks();
    this.bindUI();
    this.syncUI();
  },


  bindUI: function () {
    if (this.tweak.design == 'grid') {
      this.loadGridImages();
      this.lightboxSet = [];

      Y.one(this.wrapper).all(this.slides).each(function (slide) {
        var isVideo = slide.one('.sqs-video-wrapper');
        var content = isVideo ? slide.one('.sqs-video-wrapper') : slide.one('img');
        var meta = isVideo ? null : slide.one('.slide-meta-content') && slide.one('.slide-meta-content').getHTML();

        this.lightboxSet.push({
          content: content,
          meta: meta
        });

        slide.on('click', function (e) {
          e.halt();

          if (slide.one('.clickthrough-link')) {
            e.stopPropagation();
            window.location = slide.one('.clickthrough-link').getAttribute('href');
          } else {
            if (this.gallery) {
              this.gallery.destroy();
            }

            this.gallery = new Y.Squarespace.Lightbox2({
              controls: {
                previous: true,
                next: true
              },
              currentSetIndex: Y.one(this.wrapper).all(this.slides).indexOf(slide),
              set: this.lightboxSet
            });

            this.gallery.render();
          }
        }, this);
      }, this);

    } else {
      var autoHeight = false;
      if (this.tweak.aspect == 'auto') {
        autoHeight = true;
      }

      var autoPlay = false;
      if (this.tweak.autoplay === true) {
        autoPlay = true;
      }

      if (this.tweak.aspect == 'fullscreen' && this.tweak.design == 'slideshow') {
        this.fullscreen();
      }

      this.wrapper.generateID();
      this.nodeID = '#' + this.wrapper.get('id');
      this.galleryManager = [];
      this.gallery = new Y.Squarespace.Gallery2({
        container: this.wrapper,
        design: 'stacked',
        autoplay: autoPlay,
        designOptions: {
          autoHeight: autoHeight,
          clickBehavior: 'auto',
          transition: this.tweak.transition
        },
        elements: {
          controls: this.nodeID + ' ~ .circles',
          next:     this.nodeID + ' ~ .next-slide',
          previous: this.nodeID + ' ~ .previous-slide'
        },
        historyHash: false,
        keyboard: false,
        lazyLoad: true,
        loaderOptions: {
          mode: 'fill'
        },
        loop: 'true',
        refreshOnResize: true,
        slides: this.slides
      });

      Y.one(this.wrapper).delegate('click', function (e) {
        e.halt();
        e.currentTarget.ancestor(this.slides).toggleClass('hide-meta');
      }, '.hide-meta-toggle');

      this.galleryManager.push(this.gallery);
      this.keyboardControls();

    }

  },


  syncUI: function () {
    Y.Template.helper.on('resizeend', function () {
      if (this.tweak.design == 'grid') {
        this.loadGridImages();
      }

      if (this.tweak.aspect == 'fullscreen' && this.tweak.design == 'slideshow') {
        this.fullscreen();
      }
    }, this);

    Y.Global.on('tweak:reset', this.refresh, this);
    Y.Global.on('tweak:change', function (e) {
      var name = e.getName();

      if (
        name == 'grid-aspect-ratio' ||
        name == 'slideshow-aspect-ratio' ||
        name == 'design' ||
        name == 'gallery-controls' ||
        name == 'slideshow-transition' ||
        name == 'slideshow-autoplay'
      ) {
        this.refresh();
      }

      if (
        name == 'grid-aspect-ratio' ||
        name == 'slideshow-aspect-ratio' ||
        name == 'design' ||
        name == 'grid-max-columns'
      ) {
        Y.one(window).simulate('resize');
      }

    }, this);

  },


  getTweaks: function () {
    this.tweak = {
      aspect:       this.getTweakValue('slideshow-aspect-ratio'),
      design:       this.getTweakValue('design'),
      nav:          this.getTweakValue('gallery-controls'),
      transition:   this.getTweakValue('slideshow-transition'),
      autoplay:     this.getTweakValue('slideshow-autoplay')
    };
  },


  getTweakValue: function (name) {
    var value = Y.Squarespace.Template.getTweakValue(name);

    if (Y.Lang.isString(value)) {
      value = value.toLowerCase();
    }

    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    return value;
  },


  keyboardControls: function () {
    Y.one(window).on('keyup', function (e) {

      Y.all(this.wrapper).each(function (gallery, i) {
        if (
          gallery.inViewportRegion() &&
          (e.keyCode == 37 || e.keyCode == 39)
        ) {
          var direction = 1;

          if (e.keyCode == 37) {
            direction = -1;
          }

          this.galleryManager[i].set(
            'currentIndex',
            this.galleryManager[i].get('currentIndex') + direction
          );
        }
      }, this);
    }, this);
  },


  fullscreen: function () {
    if (Y.one('#header .mobile-nav-toggle-label').getComputedStyle('display') == 'none') {
      this.mobileNavShowing = false;
    } else {
      this.mobileNavShowing = true;
    }

    Y.all(this.wrapper).each(function (gallery) {
      if (this.mobileNavShowing) {
        gallery.setStyle('height', Y.config.win.innerHeight);
      } else if (Y.one('#siteWrapper #content .index-section.gallery:first-child') && Y.one('#showOnScrollWrapper #mainNavWrapper') ) {
        gallery.setStyle('height', Y.config.win.innerHeight - Y.one('#showOnScrollWrapper #mainNavWrapper').get('clientHeight'));
        Y.one('#siteWrapper #content .index-section.gallery:first-child .gallery-wrapper').setStyle('height', Y.config.win.innerHeight);
      } else if (Y.one('#showOnScrollWrapper #mainNavWrapper')) {
        gallery.setStyle('height', Y.config.win.innerHeight - Y.one('#showOnScrollWrapper #mainNavWrapper').get('clientHeight'));
      } else {
        gallery.setStyle('height', Y.config.win.innerHeight);
      }
    }, this);
  },


  loadGridImages: function () {
    Y.one(this.wrapper).all(this.slides).each(function (slide) {
      if (slide.one('.sqs-video-wrapper')) {
        slide.one('.sqs-video-wrapper').plug(Y.Squarespace.VideoLoader, {
          mode: 'fill'
        });
      } else {
        ImageLoader.load(slide.one('img'), {
          load: true,
          mode: 'fill'
        });
      }
    }, this);
  },


  destroy: function () {
    Y.all(this.wrapper).each(function (wrapper) {
      wrapper.detachAll();
      wrapper.removeAttribute('style');
    }, this);

    Y.all(this.slides).each(function (slide) {
      slide.detachAll();
      slide.removeAttribute('style');
    }, this);

    if (this.gallery) {
      this.gallery.destroy();
    }
  },

  refresh: function () {
    this.destroy();
    this.getTweaks();
    this.bindUI();
  }

});
