if (!Y) {
  Y = {};
}

if (!Y.Template) {
  Y.Template = {};
}

/**
 * Run these vanilla Javascript functions as soon as browser-ly possible.
 */
Y.Template.noYUI = {
  init: function() {
    this.setIndexFullscreenGalleryHeights();
    this.scrollYPolyfill();
    this.vCenterTopSectionContent();
  },

  /**
   * Fills in the scrollY offset when browsers don't support that property.
   * @method scrollYPolyfill
   */
  scrollYPolyfill: function() {
    if (!window.scrollY) {
      window.scrollY = window.pageYOffset || document.documentElement.scrollTop;

      window.addEventListener( 'scroll', function () {
        window.scrollY = window.pageYOffset || document.documentElement.scrollTop;
      });
    }
  },

  /**
   * In indexes, especially when the gallery is the first page, there is some
   * layout jank as the gallery is invoked and the height is calculated. This
   * method pre sets the gallery height so visually there is no jankiness. This
   * method should only be called once. After this, it's better to let the
   * gallery script handle the height calculations.
   */
  setIndexFullscreenGalleryHeights: function() {
    if (!document.querySelectorAll) {
      return;
    }

    if (document.body.className.indexOf(' design-grid') > -1) {
      return;
    }

    var galleries = document.querySelectorAll(
      'body.collection-type-index.slideshow-aspect-ratio-fullscreen ' +
      '.gallery-wrapper');

    if (galleries.length === 0) {
      return;
    }

    var viewportHeight = window.innerHeight;
    for (var i = 0; i < galleries.length; i++) {
      galleries[i].style.height = viewportHeight + 'px';
    }
  },

  /**
   * The "Transparent Header" tweak option absolutely positions the header
   * (logo + nav) atop the first index section. If the first index section has
   * a background image, we need to add some extra top-padding to the section's
   * content to vertically center it between the bottom of the header and the
   * top of the next index section.
   * @method vCenterTopSectionContent
   */
  vCenterTopSectionContent: function() {
    var headerPosition = window.getComputedStyle(document.getElementById('header'), null)
      .getPropertyValue('position');
    var $topSection = document.querySelector('.main-content .index-section:first-child');

    if ($topSection) {
      var isTopSectionWithMainImage = $topSection.querySelectorAll('.has-main-image').length > 0;
      var isTopSectionWithGallery = $topSection.querySelectorAll('.index-gallery').length > 0;

      if (headerPosition == 'absolute' && isTopSectionWithMainImage && !isTopSectionWithGallery) {
        var $header = document.querySelector('#header .header-inner');
        var $headerImage = header.querySelector('.title-logo-wrapper');
        var $nav = document.querySelector('#mainNavigation');
        var headerPaddingTop = parseInt(window.getComputedStyle($header, null).paddingTop, 10);

        // by default, the nav wraps around the left/right side of the logo image.
        // if there's not enough room, it drops below the logo image. in order to
        // figure out which state it's in...
        if($nav){
          // temporarily force the nav into one line and add the width of the
          // logo image and spacing around it and store the value. this is its
          // width as if we never let it drop below the logo image.
          $nav.style.whiteSpace='nowrap';
          $nav.style.display='inline';
          var tempNavWidth = $nav.offsetWidth + ($headerImage.offsetWidth*2 - 18);

          // change it back
          $nav.style.whiteSpace='normal';
          $nav.style.display='block';

          // compare the header width to the tempNavWidth to see if it would be
          // too big to fit inside the header. if so, we can safely assume that
          // it's dropped below the logo image, so we need to add the nav's height
          // to the extra padding value.
          var extraPadding = 0;
          var headerImageHeight = $headerImage.offsetHeight;

          if ($header.offsetWidth < tempNavWidth) {
            extraPadding = ((headerImageHeight + headerPaddingTop) / 2) + $nav.offsetHeight;
          } else {
            extraPadding = ((headerImageHeight + headerPaddingTop) / 2);
          }
          $topSection.querySelector('.content-inner').style.paddingTop = extraPadding + 'px';

          // setting an interval to check if the height has change (i.e., the logo
          // image has leoaded) and then reset the padding. This gets around setting
          // wrong padding if the logo hasn't loaded yet.
          var checkHeight = function() {
            return headerImageHeight === $headerImage.offsetHeight;
          };

          var logoHeightInterval = function() {
            nIntervId = setInterval(function() {
              if (checkHeight() === false) {
                if ($header.offsetWidth < tempNavWidth) {
                  extraPadding = (($headerImage.offsetHeight + headerPaddingTop) / 2) + $nav.offsetHeight;
                } else {
                  extraPadding = (($headerImage.offsetHeight + headerPaddingTop) / 2);
                }
                $topSection.querySelector('.content-inner').style.paddingTop = extraPadding + 'px';
                clearInterval(nIntervId);
              }
            }, 10);

            setTimeout(function() {
              clearInterval(nIntervId);
            }, 1000);
          };

          logoHeightInterval();
        }
      }
    }
  }
};

// Invoke the init method before domready.
Y.Template.noYUI.init();
