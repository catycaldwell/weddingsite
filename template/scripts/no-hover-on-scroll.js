(function () {
	var css = '.disable-hover:not(.sqs-layout-editing) #siteWrapper, .disable-hover:not(.sqs-layout-editing) #siteWrapper * {' +
		'pointer-events: none !important;' +
	'}';
	var head = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	var body = document.body;
	var timer;

	style.type = 'text/css';

	if (style.styleSheet){
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}

	head.appendChild(style);

	window.addEventListener('scroll', function() {
		clearTimeout(timer);
		if(!body.classList.contains('disable-hover')) {
			body.classList.add('disable-hover');
		}

		timer = setTimeout(function(){
			body.classList.remove('disable-hover');
		},200);
	}, false);
})();
