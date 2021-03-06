Scrolling = function() {}

Scrolling.prototype.prefix = "scrolling-";
Scrolling.prototype.isMobile = /(iPhone|iPod|iPad|Android|BlackBerry)/i.test(
	navigator.userAgent);
Scrolling.prototype.mouseX = 0;
Scrolling.prototype.mouseY = 0;

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
			if (!overflowX) {
				overflowX = "auto";
				elem.setAttribute(Scrolling.prefix + "overflow-x", overflowX);
			}
			var overflowY = elem.getAttribute(Scrolling.prefix + "overflow-y");
			if (!overflowY) {
				overflowY = "auto";
				elem.setAttribute(Scrolling.prefix + "overflow-y", overflowY);
			}
			if (Scrolling.isMobile) {
				if (overflowX) elem.style.overflowX = overflowX;
				if (overflowY) elem.style.overflowY = overflowY;
			} else {
				elem.style.overflowX = overflowX === "visible" ?
					"visible" : "hidden";
				elem.style.overflowY = overflowY === "visible" ?
					"visible" : "hidden";
				// Positioning the tracks / bars
				elem.addEventListener("scroll", function(event) {
					event.preventDefault();
					Scrolling.onscroll(this);
				});
				// Scrolling w/ wheel
				elem.addEventListener("wheel", function(event) {
					var xVisible = elem.scrollTrackX.getAttribute("data-visible");
					var yVisible = elem.scrollTrackY.getAttribute("data-visible");
					var dX = event.deltaX;
					var dY = event.deltaY;
					if (dX != 0 && Math.abs(dX) <= 3) dX = dX / Math.abs(dX) * 120;
					if (dY != 0 && Math.abs(dY) <= 3) dY = dY / Math.abs(dY) * 120;
					if (xVisible == "true") elem.scrollLeft += dX;
					if (yVisible == "true") elem.scrollTop += dY;
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
					// If this is not an HTML Element, stop here
					if (typeof target.className !== 'string') return;
					if (target.className.indexOf(Scrolling.prefix +
						"component ") !== 0) {
						return;
					}
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
					elem.setAttribute(Scrolling.prefix + "part-held", true);
				});
			}
			// The element is initialized
			elem.setAttribute(Scrolling.prefix + "initialized", true);
			// Add a mutation observer to automatically update
			// when this element changes
			var observer = new MutationObserver(function(mutations) {
				var nonScrollingMutation = false;
				for (var i = mutations.length; i --; ) {
					if (!mutations[i].target.className ||
						(mutations[i].target.className.indexOf(Scrolling.prefix +
						"component ") !== 0 && mutations[i].attributeName &&
						mutations[i].attributeName.indexOf(
							Scrolling.prefix) !== 0)) {
						nonScrollingMutation = true;
						break;
					}
				}
				if (!nonScrollingMutation) return;
				Scrolling.update(elem);
			});
			observer.observe(elem, {
				childList: true,
				attributes: true,
				characterData: true,
				subtree: true
			});
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
			if (overflowX == "auto" || overflowY == "auto") {
				box = elem.getBoundingClientRect();
				if (overflowX == "auto" && box.width < elem.scrollWidth) {
					scrollXVisible = true;
				}
				if (overflowY == "auto" && box.height < elem.scrollHeight) {
					scrollYVisible = true;
				}
			}
			elem.setAttribute(Scrolling.prefix + "x-visible", scrollXVisible);
			elem.setAttribute(Scrolling.prefix + "y-visible", scrollYVisible);
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
			elem.scrollTrackX.style.display = "none";
			elem.scrollTrackY.style.display = "none";
			var box = elem.getBoundingClientRect();
			elem.scrollTrackX.style.display = "";
			elem.scrollTrackY.style.display = "";
			elem.scrollingWidth = box.width;
			elem.scrollingHeight = box.height;
			var p_offset = 12 * (elem.getAttribute(
				Scrolling.prefix + "persistent") == "false");
			elem.scrollBarX.style.width = (100 * (box.width + p_offset) /
				elem.scrollWidth) + "%";
			elem.scrollBarY.style.height = (100 * (box.height + p_offset) /
				elem.scrollHeight) + "%";
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
	if (Scrolling.isMobile) return;
	if (typeof elem === 'object') {
		// Array-like
		if (elem.length === 0 || (elem.length > 0 &&
			(elem.length - 1) in elem)) {
			for (var i = elem.length; i --; ) {
				Scrolling.onscroll(elem[i]);
			}
		} else if (elem instanceof Element) { // Element
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
	} else {
		var elems = document.querySelectorAll(elem ? elem :
			"." + Scrolling.prefix + "element");
		for (var i = elems.length; i --; ) {
			Scrolling.onscroll(elems[i]);
		}
	}
}

Scrolling = new Scrolling();

document.addEventListener("DOMContentLoaded", function() {
	// Set up elements
	Scrolling.initialize();
	// Don't use Scrolling on Android/iOS/BlackBerry
	if (Scrolling.isMobile) {
		return;
	}
	window.addEventListener("wheel", function(event) {
		// Make sure the user isn't scrolling on a different scrollable element
		var elems = document.querySelectorAll(
			"." + Scrolling.prefix + "element");
		var mx = Scrolling.mouseX;
		var my = Scrolling.mouseY;
		for (var i = elems.length; i --; ) {
			var elem = elems[i];
			// If this element isn't currently scrollable, skip it
			if (elem.getAttribute(Scrolling.prefix + "x-visible") !== "true" &&
				elem.getAttribute(Scrolling.prefix + "y-visible") !== "true") {
				continue;
			}
			// Check if the cursor is over this element
			var box = elem.getBoundingClientRect();
			if (mx >= box.left && mx <= box.left + box.width &&
				my >= box.top && my <= box.top + box.height) {
				event.preventDefault();
				break;
			}
		}
	});
	window.addEventListener("mousemove", function(event) {
		Scrolling.mouseX = event.clientX;
		Scrolling.mouseY = event.clientY;
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
	// Make sure this works with media queries
	window.addEventListener("resize", function() {
		Scrolling.update();
		Scrolling.onscroll();
		Scrolling.update();
	});
	// End Scroll
	var endScroll = function() {
		var elems = document.querySelectorAll("[" + Scrolling.prefix + "held],[" +
			Scrolling.prefix + "part-held]");
		for (var i = elems.length; i --; ) {
			elems[i].removeAttribute(Scrolling.prefix + "held");
			elems[i].removeAttribute(Scrolling.prefix + "part-held");
		}
	};
	window.addEventListener("mouseup", endScroll, true);
	window.addEventListener("blur", endScroll);
});