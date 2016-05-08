Scrolling = function() {

}

Scrolling.prototype.prefix = "scrolling-";
Scrolling.prototype.isMobile = /(iPhone|iPod|iPad|Android|BlackBerry)/i.test(
	navigator.userAgent);

Scrolling.prototype.initialize = function(elem) {
	if (typeof elem === 'object') {
		// Array-like
		if (elem.length === 0 || (elem.length > 0 &&
			(elem.length - 1) in elem)) {
			for (var i = elem.length; i --; ) {
				Scrolling.initialize(elem[i]);
			}
		} else if (elem instanceof Element) { // Element
			if (elem.getAttribute(Scrolling.prefix + "initialized")) return;
			var overflowX = elem.getAttribute(Scrolling.prefix + "overflow-x");
			var overflowY = elem.getAttribute(Scrolling.prefix + "overflow-y");
			if (Scrolling.isMobile) {
				if (overflowX) elem.style.overflowX = overflowX;
				if (overflowY) elem.style.overflowY = overflowY;
			} else {
				elem.style.overflowX = "hidden";
				elem.style.overflowY = "hidden";
				// Positioning the tracks / bars
				elem.addEventListener("scroll", function() {
					Scrolling.onscroll(this);
				});
				// Scrolling w/ wheel
				elem.addEventListener("wheel", function(event) {
					var xVisible = elem.scrollTrackX.getAttribute("data-visible");
					var yVisible = elem.scrollTrackY.getAttribute("data-visible");
					if (xVisible == "true") elem.scrollLeft += event.deltaX;
					if (yVisible == "true") elem.scrollTop += event.deltaY;
				});
				// Scrollbar track
				var trackX = elem.scrollTrackX = document.createElement("div");
				trackX.className = Scrolling.prefix + "component " +
					Scrolling.prefix + "track-x";
				elem.appendChild(trackX);
				var trackY = elem.scrollTrackY = document.createElement("div");
				trackY.className = Scrolling.prefix + "component " +
					Scrolling.prefix + "track-y";
				elem.appendChild(trackY);
				// Scrollbar
				var barX = elem.scrollBarX = document.createElement("div");
				barX.className = Scrolling.prefix + "component " +
					Scrolling.prefix + "bar-x";
				trackX.appendChild(barX);
				var barY = elem.scrollBarY = document.createElement("div");
				barY.className = Scrolling.prefix + "component " +
					Scrolling.prefix + "bar-y";
				trackY.appendChild(barY);
				Scrolling.update(elem);
				// Scrolling with mouse buttons/movement
				elem.addEventListener("mousedown", function(event) {
					var target = event.target;
					if (target.className.indexOf(Scrolling.prefix +
						"component ") === -1) {
						return;
					}
					console.log(target);
					var which = target.className[target.className.length - 1];
					if (/bar-[xy]$/.test(target.className)) {
						// Bar
						if (which === "x") {
							target.startScrollX = elem.scrollLeft;
							target.startMouseX = event.clientX;
						} else {
							target.startScrollY = elem.scrollTop;
							target.startMouseY = event.clientY;
						}
					} else if (/track-[xy]$/.test(target.className)) {
						// TODO: Track stuff
					}
					target.setAttribute(Scrolling.prefix + "held", true);
				});
			}
			elem.setAttribute(Scrolling.prefix + "initialized", true);
		}
	} else {
		var elems = document.querySelectorAll(elem ? elem :
			"." + Scrolling.prefix + "element");
		for (var i = elems.length; i --; ) {
			Scrolling.initialize(elems[i]);
		}
	}
}

Scrolling.prototype.update = function(elem) {
	if (Scrolling.isMobile) return;
	if (typeof elem === 'object') {
		// Array-like
		if (elem.length === 0 || (elem.length > 0 &&
			(elem.length - 1) in elem)) {
			for (var i = elem.length; i --; ) {
				Scrolling.update(elem[i]);
			}
		} else if (elem instanceof Element) { // Element
			var overflowX = elem.getAttribute(Scrolling.prefix + "overflow-x");
			var overflowY = elem.getAttribute(Scrolling.prefix + "overflow-y");
			var scrollXVisible = (overflowX == "scroll");
			var scrollYVisible = (overflowY == "scroll");
			// Set track style
			elem.scrollTrackX.setAttribute("data-visible", scrollXVisible);
			elem.scrollTrackY.setAttribute("data-visible", scrollYVisible);
			if (scrollXVisible && scrollYVisible) {
				elem.scrollTrackX.setAttribute("data-both", true);
				elem.scrollTrackY.setAttribute("data-both", true);
			} else {
				elem.scrollTrackX.removeAttribute("data-both");
				elem.scrollTrackY.removeAttribute("data-both");
			}
			// Set bar style
			var box = elem.getBoundingClientRect();
			elem.scrollingWidth = box.width;
			elem.scrollingHeight = box.height;
			// if (scrollXVisible && scrollYVisible) {
			// 	elem.scrollBarX.style.width = "calc(" + (100 * box.width /
			// 		elem.scrollWidth) + "% - 10px)";
			// 	elem.scrollBarY.style.height = "calc(" + (100 * box.height /
			// 		elem.scrollHeight) + "% - 10px)";
			// } else {
				elem.scrollBarX.style.width = (100 * box.width /
					elem.scrollWidth) + "%";
				elem.scrollBarY.style.height = (100 * box.height /
					elem.scrollHeight) + "%";
			// }
		}
	} else {
		var elems = document.querySelectorAll(elem ? elem :
			"." + Scrolling.prefix + "element");
		for (var i = elems.length; i --; ) {
			Scrolling.update(elems[i]);
		}
	}
}

Scrolling.prototype.onscroll = function(elem) {
	// Update track positions
	elem.scrollTrackX.style.left = elem.scrollLeft + "px";
	elem.scrollTrackY.style.right = (-elem.scrollLeft) + "px";
	elem.scrollTrackY.style.top = elem.scrollTop + "px";
	elem.scrollTrackX.style.bottom = (-elem.scrollTop) + "px";
	// Update bar positions
	elem.scrollBarX.style.left = (100 * elem.scrollLeft / (
		elem.scrollWidth)) + "%";
	elem.scrollBarY.style.top = (100 * elem.scrollTop / (
		elem.scrollHeight)) + "%";
}

Scrolling = new Scrolling();

document.addEventListener("DOMContentLoaded", function() {
	// Set up elements
	Scrolling.initialize();
	// Don't use Scrolling on Android/iOS/BlackBerry
	if (Scrolling.isMobile) {
		return;
	}
	window.addEventListener("mousemove", function(event) {
		var held = document.querySelector("[" + Scrolling.prefix + "held]");
		// No Scrolling components held
		if (!held) return;
		event.preventDefault();
		var which = held.className[held.className.length - 1];
		if (/bar-[xy]$/.test(held.className)) {
			// Bar
			var elem = held.parentElement.parentElement;
			if (which === "x") {
				elem.scrollLeft = held.startScrollX +
					(elem.scrollWidth / elem.scrollingWidth) *
					(event.clientX - held.startMouseX);
			} else {
				elem.scrollTop = held.startScrollY +
					(elem.scrollHeight / elem.scrollingHeight) *
					(event.clientY - held.startMouseY);
			}
		} else if (/track-[xy]$/.test(held.className)) {
			
		}
	});
	// End Scroll
	var endScroll = function() {
		var elems = document.querySelectorAll("[" + Scrolling.prefix + "held]");
		for (var i = elems.length; i --; ) {
			elems[i].removeAttribute(Scrolling.prefix + "held");
		}
	};
	window.addEventListener("mouseup", endScroll, true);
	window.addEventListener("blur", endScroll);
});