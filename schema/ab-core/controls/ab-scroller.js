/**
 * jsScrollbar v0.9.1
 * Copyright (c) 2009-2010 Nathan Faubion
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * Adapted by Dave Wallace to:
 *  1. Fade out all scrollbars once document is loaded.
 *	2. Fade in x and/or y scrollbars on single panel mouseover.
 * 	3. Fade out panel scrollbars on mouseout.
 *	4. Fix IE9 Standards mode bug not allowing scroll handle drag.
 *	5. Fix IE9 Standards mode bug adding 1px to the scrollWidth value.
 *	6. Test inclusion of header elements above scrolling. Likely will need to be changed in WC contexts.
 *  7. Test post-load resizing of window...WC already has this listener. Use the function recalcScrollbars(1);
 *  8. March 2014: Resolved plugin issue of mouseup event not firing when occurring in another document via an iframe viewport.
 *	9. March 2014: Resolved plugin issue of mouseenter event firing before initial fadeout completed.
 *	10. March 2014: Set disableTweening parameter to true to enable "paged" scrolling when clicking the scroller track.
 */

Ab.namespace('view');

Ab.view.Scroller = Base.extend({

    // scrollable jQuery element to which the scroller is attached
    el: null,

    // x and y scrollbar objects
    scrollbars: [],

    /**
     * Attaches the scroller to specified element.
     * @param dom The DOM element.
     */
    constructor: function(dom, config) {
        this.el = jQuery(dom);
        this.el.addClass('jssb-content');

        // add the scrollbar DOM to the scrollable element's parent
        var prefs = {
            tweenDuration: 500,
            tweenFn: function (pos) {
                return -Math.cos(pos*Math.PI) / 2 + 0.5;
            }
        };
        jQuery.extend(prefs, config);
        this.scrollbars = jsScrollbar(this.el.parent(), prefs);

        // check if previous sibling elements exist (headers) within the container and
        // adjust scrolling properties accordingly
        var parentEl = jQuery(this.el.parent());
        if (!parentEl.children().first().hasClass('jssb-content')) {
            var topOffset = parentEl.children().first().innerHeight() + 3;
            parentEl.find('.jssb-content').css({'margin-top' : topOffset + 'px'});
            parentEl.find('.jssb-y').css({'top' : topOffset + 'px'});
        }

        var fadeIn = function(parentEl) {
            var hoverEl = jQuery(parentEl);
            if (hoverEl.hasClass("jssb-scrolly")) {
                hoverEl.find(".jssb-y").fadeIn(500);
            }
            if (hoverEl.hasClass("jssb-scrollx")) {
                hoverEl.find(".jssb-x").fadeIn(500);
            }
        };

        var fadeOut = function(parentEl) {
            var hoverEl = jQuery(parentEl);
            if (hoverEl.hasClass("jssb-scrolly")) {
                hoverEl.find(".jssb-y").fadeOut(500);
            }
            if (hoverEl.hasClass("jssb-scrollx")) {
                hoverEl.find(".jssb-x").fadeOut(500);
            }
        };

        //- Display the associated scrollbar for the hovered panel
        parentEl.hover(
            function() {
                fadeIn(this);
            },
            function() {
                fadeOut(this);
            }
        ).mousemove(
        	function() {
        		fadeIn(this);
        	}
        )

        fadeOut.defer(1000, this, [parentEl]);
    },

    update: function() {
        var scroller = this;
        setTimeout(function () {
            if (scroller.scrollbars) {
                if (valueExists(scroller.scrollbars.length)) {
                    for (var a = 0; a < scroller.scrollbars.length; a++) {
                        scroller.scrollbars[a].recalc();
                    }
                } else {
                    scroller.scrollbars.recalc();
                }
            }
        }, 100);
    },

    detach: function() {
        var parentEl = jQuery(this.el.parent());
        parentEl.off();
    },

    setOnVerticalScroll: function(callback) {
        if (this.scrollbars) {
            this.scrollbars.onVerticalScroll = callback;
        }
    },

    setOnHorizontalScroll: function(callback) {
        if (this.scrollbars) {
            this.scrollbars.onHorizontalScroll = callback;
        }
    }
});

(function () {

this.jsScrollbar = function (el, prefs) {
	var sbs = [], i, ids;

	if (typeof prefs === 'undefined')
		prefs = null;

	if (typeof el === 'string') {
		ids = el.replace(/\s/g, '').replace(/,$/, '').replace(/#/g, '').split(',');

		for (i = 0; i < ids.length; i++) {
			if (verify(find(ids[i])))
				sbs.push(new jsScrollbar.init(find(ids[i]), prefs));
		}
	}

	else if (el.nodeType && el.nodeType == 1) {
		if (verify(el))
			sbs.push(new jsScrollbar.init(el, prefs));
	}

	else if (el.length && el.length > 0) {
		for (i = 0; i < el.length; i++) {
			if (verify(el[i]))
				sbs.push(new jsScrollbar.init(el[i], prefs));
		}
	}

	if (sbs.length == 0)
		return null;

	else if (sbs.length == 1)
		return sbs[0];

	else
		return sbs;
};

jsScrollbar.scrollbars = [];

/**
 * Default settings for new jsScrollbars. This is not declared as part of the
 * prototype because changing the defaults should not possibly change already
 * instanciated jsScrollbars.
 */
jsScrollbar.defaults = {
	scrollSpeed: 30,
	scrollDistance: 10,
	wheelDistance: 40,
	tweenFn: function (pos) { return -Math.cos(pos*Math.PI) / 2 + 0.5; },
	tweenDuration: 500,
	disableTweening: true,
	horizontalScrolling: true,
	verticalScrolling: true,
	fixedThumb: false,
	template:
	'<div class="jssb">'+
		'<div class="jssb-track">'+
			'<div class="jssb-track-mid"></div>'+
			'<div class="jssb-track-end"></div>'+
			'<div class="jssb-thumb">'+
				'<div class="jssb-thumb-mid"></div>'+
				'<div class="jssb-thumb-end"></div>'+
			'</div>'+
		'</div>'+
	'</div>'
};

/**
 * These properties store closure references that are deleted on unload. This
 * goofy workaround has to be used to prevent memory leaks in IE.
 */
this.jsScrollbar._closures = {
	objs: [],
	fns: []
};
addEvent(window, 'unload', function () {
	this.jsScrollbar._closures.objs = null;
	this.jsScrollbar._closures.fns = null;
	this.jsScrollbar._closures = null;
	this.jsScrollbar.scrollbars = null;
});

/**
 * jsScrollbar Prototype
 */
jsScrollbar.init = function () {
	jsScrollbar.scrollbars.push(this);
	this.parent  = arguments[0];
	this._prefs  = extend(jsScrollbar.defaults, arguments[1]);
	this._init();
};

jsScrollbar.init.prototype = {
	_enabled: true,
	_doScrollX: false,
	_doScrollY: false,
	_isAnimating: false,
	_hasFocus: false,
	_temp: null,

	_scrollX: null,
	_scrollY: null,
	_prefs: null,

	content: null,
	parent: null,

    // vertical scroll callback
    onVerticalScroll: null,

    // horizontal scroll callback
    onHorizontalScroll: null,

/**
 * This initializes the jsScrollbar, but is also called by 'recalc' to reset
 * the Thumb dimensions and relocate the components in case someone changes
 * the innerHTML of the parent.
 */
	_init: function () {
		//Shorter references
		var pa = this.parent, co = this.content, prefs = this._prefs;

		if (!this._temp) this._temp = {};

		addClass(pa, 'jssb-applied');

		//Add jssb-x elements if required and requested
        var scrollX = null;
		if (prefs.horizontalScrolling) {
            scrollX = find('jssb-x', pa);
            if (!scrollX && (!this._scrollX || !this._scrollX.el)) {
                var html = prefs.template
                                     .replace(/jssb/g, 'jssb-x')
                                     .replace(/-up/g, '-left')
                                     .replace(/-down/g, '-right');
                jQuery(pa).append(html);
            } else if (scrollX) {
                scrollX.style.display = 'block';
            }
        }

		//Add jssb-y elements if required and requested
        var scrollY = null;
        if (prefs.verticalScrolling) {
            scrollY = find('jssb-y', pa);
            if (!scrollY && (!this._scrollY || !this._scrollY.el)) {
                var html = prefs.template.replace(/jssb/g, 'jssb-y');
                jQuery(pa).append(html);
            } else if (scrollY) {
                scrollY.style.display = 'block';
            }
        }

		if (!co || (co && !co.parentNode)) {
			co = this.content = find('jssb-content', pa);
		}

		//Is scrolling necessary?
		this._doScrollX = (prefs.horizontalScrolling && co &&
		                   co.scrollWidth - co.clientWidth > 1) ? true: false;
		this._doScrollY = (prefs.verticalScrolling && co &&
		                   co.scrollHeight - co.clientHeight > 1) ? true: false;

        if (this._doScrollX) {
			//Add hook for horizontal scrolling
			addClass(pa, 'jssb-scrollx');

			//Does a possible shrunk viewport introduce vertical scrolling now?
			if (prefs.verticalScrolling && co.scrollHeight > co.clientHeight)
				this._doScrollY = true;

		} else {
			removeClass(pa, 'jssb-scrollx');
		}

		if (this._doScrollY) {
			//Add hook for vertical scrolling
			addClass(pa, 'jssb-scrolly');

			//Does a possible shrunk viewport introduce horizontal scrolling now?
			if (!this._doScrollX && prefs.horizontalScrolling &&
			    co.scrollWidth > co.clientWidth) {
				this._doScrollX = true;
				addClass(pa, 'jssb-scrollx');
			}
		} else {
			removeClass(pa, 'jssb-scrolly');
		}

		if (prefs.horizontalScrolling) {
			if (this._scrollX === null)
				this._scrollX = new jsScrollbarComponent(find('jssb-x', pa), 'x');

			this._prepComponent(this._scrollX, this._doScrollX);

            var el = jQuery(this._scrollX.el);
            if (this._doScrollX) {
                el.fadeIn(500);
            } else {
                el.hide();
                if(scrollX)
                    scrollX.style.display = 'none';
            }
		}

		if (prefs.verticalScrolling) {
			if (this._scrollY === null)
				this._scrollY = new jsScrollbarComponent(find('jssb-y', pa), 'y');

			this._prepComponent(this._scrollY, this._doScrollY);

            var el = jQuery(this._scrollY.el);
            if (this._doScrollY) {
                el.fadeIn(500);
            } else {
                el.hide();
                if(scrollY)
                    scrollY.style.display = 'none';
            }
		}

        if (prefs.verticalScrolling) {
		    addEvent(pa, 'mousewheel', bind(this._mouseWheel, this));
		    addEvent(pa, 'DOMMouseScroll', bind(this._mouseWheel, this));
        }

		// Apply events that simulate focus and blur
		addEvent(pa, 'mousedown', bind(this._focus, this));
		addEvent(document, 'mousedown', bind(this._blur, this));
		addEvent(co, 'mousedown', bind(this._selectStart, this));

		addEvent(co, 'scroll', bind(this._keepUp, this));
	},

/**
 * This resizes the component's thumb, determines the scroll ratio, and applies events
 */
	_prepComponent: function (cmp, doScroll) {
		//Reinitialize component if reference is lost by editing innerHTML
		if (cmp.el && !cmp.el.parentNode) {
			removeEvent(cmp.el, 'mousedown', bind(this._mouseDown, this));
			cmp = new jsScrollbarComponent(find('jssb-'+ cmp.axis, this.parent), cmp.axis, cmp.minThumb);
		}

		if (doScroll) {
			var co = this.content,
				trackDim  = cmp.track.relevantDim(),
				thumbDim  = cmp.thumb.relevantDim(),
				clientDim = cmp.axis == 'x' ? co.clientWidth : co.clientHeight,
				scrollDim = cmp.axis == 'x' ? co.scrollWidth : co.scrollHeight;

			//Resize the thumb
			if (!this._prefs.fixedThumb) {
				thumbDim = cmp.thumb.relevantDim( Math.round(
				           trackDim * clientDim / scrollDim >= cmp.minThumb?
				           trackDim * clientDim / scrollDim : cmp.minThumb));
			}

			//How many content pixels are equal to one scrollbar pixel
			cmp.ratio = (scrollDim - clientDim) / (trackDim - thumbDim);

            if (cmp.ratio <= 0) {
                cmp.ratio = 1;
            }

			removeEvent(cmp.el, 'mousedown', bind(this._mouseDown, this));
			addEvent(cmp.el, 'mousedown', bind(this._mouseDown, this));
		}
	},

/**
 * This handles the mousedown event for the scrollbar. The listener is applied
 * to the scrollbar parent. It checks what the user clicked on based on the
 * className of the target.
 */
	_mouseDown: function (e) {
		e = fixEvent(e);

		var prefs = this._prefs, co = this.content, temp  = this._temp,
			axis = hasClass(e.target, 'jssb-x', true) ? 'x' : 'y',
			cmp  = axis == 'x' ? this._scrollX : this. _scrollY,
			trackPos, newPos;

		//Clicked on the Thumb
		if (hasClass(e.target, 'jssb-'+ axis +'-thumb', true)) {
			addClass(cmp.thumb.el,' jssb-'+ axis +'-thumb-click');

			//Add component to temp object for mouseup
			temp.clicked = cmp.thumb.el;

			//Track position relative to document, so we don't have to calculate onmousemove
			temp.trackPos = (axis == 'x') ?
			                findOffsetLeft(cmp.track.el):
			                findOffsetTop(cmp.track.el);

			//The point on the thumb where it was clicked
			temp.grabPoint = (axis == 'x') ?
			                 e.pageX - findOffsetLeft(cmp.thumb.el):
			                 e.pageY - findOffsetTop(cmp.thumb.el);

			temp.axis = axis;

			//Remove scroll listener, we'll do it manually 'cause it's smoother
			removeEvent(this.content, 'scroll', bind(this._keepUp, this));

			//Mousemove event for dragging the thumb
			addEvent(document, 'mousemove', bind(this._drag, this));
		}

		//Clicked on the Track
		else if (hasClass(e.target, 'jssb-'+ axis +'-track', true)) {
			addClass(cmp.track.el, ' jssb-'+ axis +'-track-click');

			//Add component to temp object for mouseup
			temp.clicked = cmp.track.el;

			//Get the position of the track
			trackPos = (axis == 'x') ?
					   findOffsetLeft(cmp.track.el):
					   findOffsetTop(cmp.track.el);

			//Jump to position
			if (prefs.disableTweening) {
				temp.newPos = (e['page'+ axis.toUpperCase()] - trackPos) * cmp.ratio;

				if (axis == 'x')
					this._startScroll(temp.newPos < co.scrollLeft ? -co.clientWidth : co.clientWidth, 0);
				else
					this._startScroll(0, temp.newPos < co.scrollTop ? -co.clientHeight : co.clientHeight);

			} else {
				//Position to jump to
				newPos = (e['page'+ axis.toUpperCase()] - trackPos - cmp.thumb.relevantDim() / 2) * cmp.ratio;

				if (axis == 'x')
					this.tweenTo(newPos, null);
				else
					this.tweenTo(null, newPos);
			}
		}

		//Directional Buttons
		else if (hasClass(e.target, 'jssb-y-up', true)) {
			addClass(cmp.prev.el, 'jssb-y-up-click');
			temp.clicked = cmp.prev.el;
			this._startScroll(0, -prefs.scrollDistance);
		}

		else if (hasClass(e.target, 'jssb-y-down', true)) {
			addClass(cmp.next.el, 'jssb-y-down-click');
			temp.clicked = cmp.next.el;
			this._startScroll(0, prefs.scrollDistance);
		}

		else if (hasClass(e.target, 'jssb-x-left', true)) {
			addClass(cmp.prev.el, 'jssb-x-left-click');
			temp.clicked = cmp.prev.el;
			this._startScroll(-prefs.scrollDistance, 0);
		}

		else if (hasClass(e.target, 'jssb-x-right', true)) {
			addClass(cmp.next.el, 'jssb-x-right-click');
			temp.clicked = cmp.next.el;
			this._startScroll(prefs.scrollDistance, 0);
		}

		addEvent(window.parent.document, 'mouseup', bind(this._mouseUp, this));
		addEvent(document, 'mouseup', bind(this._mouseUp, this));

		//- To facilitate dragging between documents defined by iframe viewports
		var frames = document.getElementsByTagName('iframe');
		if (frames.length) {
			for (var i = 0; i < frames.length; ++i)	{
				//- Get the iframe position and dimensions
				var maskdim = window.parent.jQuery(frames[i]),
					maskdim_pos = maskdim.offset(),
					l = maskdim_pos.left,
					t = maskdim_pos.top,
					w = maskdim.width(),
					h = maskdim.height();
				jQuery('body').append('<div class="iframe-mask" style="position:absolute;top:'+t+'px;left:'+l+'px;width:'+w+'px;height:'+h+'px;background:none">&nbsp;</div>')
			}
		}

		//Prevent text selection
		addEvent(document, 'selectstart', cancelEvent);
		if (e.preventDefault)
			e.preventDefault();
	},

/**
 * This is called when the user mouseups on the document after clicking
 * on the jsScrollbar.
 */
	_mouseUp: function (e) {

		//- Clear any iframe masks created by the _mouseDown function
		if (frames.length) { jQuery('.iframe-mask').remove(); }

		var temp = this._temp;
		removeClass(temp.clicked, /jssb-[x|y]-[a-z]*-click/g);

		if (temp.scrollTimer) {
			window.clearInterval(temp.scrollTimer);
			temp.scrollTimer = null;
		}

		if (typeof temp.newPos == 'number')
			temp.newPos = null;

		removeEvent(document, 'mousemove', bind(this._drag, this));
		removeEvent(document, 'mouseup', bind(this._mouseUp, this));
		removeEvent(document, 'selectstart', cancelEvent);

		addEvent(this.content, 'scroll', bind(this._keepUp, this));
	},

/**
 * This is called when the user drags the scrollbar thumb.
 */
	_drag: function (e) {
		e = fixEvent(e);
		var temp = this._temp, axis = temp.axis,
		    cmp  = axis == 'x' ? this._scrollX : this._scrollY,
			relToTrack = e['page'+ axis.toUpperCase()] - temp.trackPos,
			newPos = relToTrack - temp.grabPoint;

		if (axis == 'x')
			this._scroll(newPos*cmp.ratio, null);
		else
			this._scroll(null, newPos*cmp.ratio);

		this._keepUp();
	},

/**
 * This is called when the user user the mouse wheel to scroll.
 */
	_mouseWheel: function (e) {
		e = e ? e : event;
		var dir = 0, co = this.content;

		if (typeof e.wheelDelta == 'undefined') {
			if (e.detail > 0) dir = 1;
			if (e.detail < 0) dir = -1;
		} else {
			if (e.wheelDelta >= 120) dir = -1;
			if (e.wheelDelta <= -120) dir = 1;
		}

		if (this._prefs.verticalScrolling === false)
			this.scrollBy(dir * this._prefs.wheelDistance, null);
		else
			this.scrollBy(null, dir * this._prefs.wheelDistance);

		//Prevent document from scrolling
		if (co.scrollTop > 0 &&
		    co.scrollTop < co.scrollHeight - co.clientHeight)
			return cancelEvent(e);
	},

/**
 * This is called when the user clicks on the content area to bring focus, which
 * then enables keyboard navigation.
 */
	_focus: function (e) {
		e = fixEvent(e);
		
		this._focusFlag = true;

		if (this._hasFocus)
			return;

		this._hasFocus  = true;
		addClass(this.parent, 'jssb-focus');

		//add key events for Keyboard scrolling
		addEvent(document, 'keydown', bind(this._keyDown, this));
	},

/**
 * This is called when the user clicks outside of the content area, after having
 * brought focus to it.
 */
	_blur: function () {
		if (!this._focusFlag && this._hasFocus) {
			this._hasFocus = false;
			removeClass(this.parent, 'jssb-focus');

			//remove key events for Keyboard scrolling
			removeEvent(document, 'keydown', bind(this._keyDown, this));
		}
		this._focusFlag = false;
	},

/**
 * This is called when the user brings focus to the content area and then uses
 * the keyboard to scroll.
 */
	_keyDown: function (e) {
		e = fixEvent(e);

		var co = this.content, prefs = this._prefs,
		    tag = e.target.tagName.toLowerCase(),
			toFunc = prefs.disableTweening ? this.scrollTo : this.tweenTo,
			byFunc = prefs.disableTweening ? this.scrollBy : this.tweenBy;

		//Typing in form elements should not affect scrolling
		if (tag === 'input' || tag === 'select' || tag === 'textarea')
			return;

		switch (e.keyCode) {
			//PageUp, Space/PageDown, End, Home
			case 33: byFunc.call(this, 0, -co.clientHeight); break;
			case 32: case 34: byFunc.call(this, 0, co.clientHeight); break;
			case 35: toFunc.call(this, co.scrollLeft, co.scrollHeight); break;
			case 36: toFunc.call(this, co.scrollLeft, 0); break;

			//Left, Up, Right, Down
			case 37: this.scrollBy(-prefs.scrollDistance, 0); break;
			case 38: this.scrollBy(0, -prefs.scrollDistance); break;
			case 39: this.scrollBy(prefs.scrollDistance, 0); break;
			case 40: this.scrollBy(0, prefs.scrollDistance); break;
		}

		return (e.keyCode >= 32 && e.keyCode <= 40) ?
			cancelEvent(e):
			true;
	},

/**
 * This makes sure the scrollbar Thumb stays with the scrolling content.
 */
	_keepUp: function () {
		var sx = this._scrollX,
		    sy = this._scrollY;

		if (this._doScrollX && sx.ratio !== 0)
			sx.thumb.x(Math.round(this.content.scrollLeft/sx.ratio));

		if (this._doScrollY && sy.ratio !== 0)
			sy.thumb.y(Math.round(this.content.scrollTop/sy.ratio));
	},

/**
 * This changes the scroll values of the content area.
 */
	_scroll: function (x, y) {
		if (x !== null && typeof x !== 'undefined') {
			this.content.scrollLeft = x;

            if (this.onHorizontalScroll) {
                this.onHorizontalScroll(x);
            }
        }

		if (y !== null && typeof y !== 'undefined') {
			this.content.scrollTop = y;

            if (this.onVerticalScroll) {
                this.onVerticalScroll(y);
            }
        }
	},

/**
 * This is used when scrolling with the buttons, it causes the slight delay
 * when first clicking on the button.
 */
	_startScroll: function (x, y) {
		//Initial Scroll
		this.scrollBy(x, y);

		//Delayed continuation
		this._temp.scrollByX = x;
		this._temp.scrollByY = y;
		this._temp.scrollTimer = setTimeout(bind(this._startScrollDelay, this), 300);
	},
	_startScrollDelay: function () {
		this._temp.scrollTimer = setInterval(bind(this._startScrollInterval, this),
		                                     this._prefs.scrollSpeed);
	},
	_startScrollInterval: function () {
		var co = this.content, temp = this._temp,
		    x = temp.scrollByX, y = temp.scrollByY;

		if (typeof temp.newPos == 'number') {
			if ((x && temp.newPos >= co.scrollLeft && temp.newPos <= co.scrollLeft + co.clientWidth) ||
			    (y && temp.newPos >= co.scrollTop && temp.newPos <= co.scrollTop + co.clientHeight)) {
				clearTimeout(temp.scrollTimer);
				temp.scrollByX = 0;
				temp.scrollByY = 0;
				return;
			}
		}

		this.scrollBy(x, y);
	},

/**
 * This set of functions scrolls the content when the user is selecting and moves
 * the cursor past the edges.
 */
	_selectStart: function () {
		this._temp.coTop  = findOffsetTop(this.content);
		this._temp.coLeft = findOffsetLeft(this.content);

		addEvent(document, 'mousemove', bind(this._select, this));
		addEvent(document, 'mouseup', bind(this._selectStop, this));
	},
	_select: function (e) {
		e = fixEvent(e);

		var co = this.content, temp = this._temp, prefs = this._prefs,
			scrollX = 0, scrollY = 0;

		if (prefs.horizontalScrolling) {
			if (e.pageX < temp.coLeft)
				scrollX = -prefs.scrollDistance;

			else if (e.pageX > temp.coLeft && e.pageX < temp.coLeft + co.clientWidth)
				scrollX = 0;

			else if (e.pageX > temp.coLeft + co.clientWidth)
				scrollX = prefs.scrollDistance;
		}

		if (prefs.verticalScrolling) {
			if (e.pageY < temp.coTop)
				scrollY = -prefs.scrollDistance;

			else if (e.pageY > temp.coTop && e.pageY < temp.coTop + co.clientHeight)
				scrollY = 0;

			else if (e.pageY > temp.coTop + co.clientHeight)
				scrollY = prefs.scrollDistance;
		}

		if (!temp.isScrolling && (scrollX !== 0 || scrollY !== 0)) {
			this._startScroll(scrollX, scrollY);
			temp.isScrolling = true;
		}

		else if (temp.isScrolling && scrollX === 0 && scrollY === 0) {
			clearInterval(temp.scrollTimer);
			temp.isScrolling = false;
		}

		else {
			temp.scrollByX = scrollX;
			temp.scrollByY = scrollY;
		}
	},
	_selectStop: function (e) {
		clearInterval(this._temp.scrollTimer);
		removeEvent(document, 'mousemove', bind(this._select, this));
		removeEvent(document, 'mouseup', bind(this._selectStop, this));
	},

/**
* Scrolls to a specific point. If horizontalScrolling or verticalScrolling is set
* to false, only on argument is required.
*/
	scrollTo: function (a, b) {
		if (typeof b == 'undefined') {
			if (this._prefs.horizontalScrolling === false) {
				this._scroll(null, a);
			} else {
				this._scroll(a, null);
			}
		} else {
			this._scroll(a, b);
		}
	},

/**
 * Scrolls by a relative amount. If horizontalScrolling or verticalScrolling is set
 * to false, only on argument is required.
 */
	scrollBy: function (a, b) {
		if (typeof b == 'undefined') {
			if (this._prefs.horizontalScrolling === false) {
				this._scroll(null, this.content.scrollTop + a);
			} else {
				this._scroll(this.content.scrollLeft + a, null);
			}
		} else {
			this._scroll(this.content.scrollLeft + a, this.content.scrollTop + b);
		}
	},

/**
 * This is the same as scrollTo, but with an animation.
 */
	tweenTo: function (a, b) {
		if (this._isAnimating)
			return;

		var co = this.content, prefs = this._prefs, temp = this._temp,
		    startX = co.scrollLeft, startY = co.scrollTop,
			x, y, distX, distY, start = +new Date;

		if (typeof b == 'undefined') {
			if (prefs.horizontalScrolling === false) {
				x = null;
				y = a;
			} else {
				x = a;
				y = null;
			}
		} else {
			x = a;
			y = b;
		}

		if (x !== null && x != co.scrollLeft) {
			if (x < 0) x = 0;
			if (x > co.scrollWidth - co.clientWidth)
				x = co.scrollWidth - co.clientWidth;
			distX = x - startX;
		}

		if (y !== null && y != co.scrollTop) {
			if (y < 0) y = 0;
			if (y > co.scrollHeight - co.clientHeight)
				y = co.scrollHeight - co.clientHeight;
			distY = y - startY;
		}

		this._isAnimating = true;

		temp.tweenData = {
			start: start,
			fin: start + prefs.tweenDuration,
			sx: startX, sy: startY,
			dx: distX, dy: distY,
			x: x, y: y
		};

		temp.tweenTimer = setInterval(bind(this._tweenToFn, this), 10);
	},

	_tweenToFn: function () {
		var tw = this._temp.tweenData, prefs = this._prefs;

		var time = +new Date,
		    pos  = time > tw.fin ? 1 : (time - tw.start) / prefs.tweenDuration;

		if (prefs.tweenFn)
			pos = prefs.tweenFn(pos);

		this.scrollTo(
			tw.x === null ? null : (tw.sx + tw.dx * pos),
			tw.y === null ? null : (tw.sy + tw.dy * pos)
		);

		if (time > tw.fin) {
			clearInterval(this._temp.tweenTimer);
			this._isAnimating = false;
		}
	},

/**
 * This is the same as scrollBy, but with an animation
 */
	tweenBy: function (a, b) {
		if (typeof b == 'undefined') {
			if (this._prefs.horizontalScrolling === false) {
				this.tweenTo(null, this.content.scrollTop + a);
			} else {
				this.tweenTo(this.content.scrollLeft + a, null);
			}
		} else {
			this.tweenTo(this.content.scrollLeft + a, this.content.scrollTop + b);
		}
	},

/**
 * This recalculates the scrollbar. Use this after changing the content, or when
 * resizing the parent.
 */
	recalc: function () {
		if (!this._enabled) return;

		var pa = this.parent, co = this.content;

		removeEvent(pa, 'mousewheel', bind(this._mouseWheel, this));
		removeEvent(pa, 'DOMMouseScroll', bind(this._mouseWheel, this));
		removeEvent(pa, 'mousedown', bind(this._focus, this));
		removeEvent(document, 'mousedown', bind(this._blur, this));
		removeEvent(co, 'mousedown', bind(this._selectStart, this));
		removeEvent(co, 'scroll', bind(this._keepUp, this));

		this._init();
		this._keepUp();

		//Sometimes content can get cut off when resizing
		if (co && co.scrollWidth - co.clientWidth - co.scrollLeft < 0)
			this._scroll(co.scrollWidth - co.clientWidth, null);
		if (co && co.scrollHeight - co.clientHeight - co.scrollTop < 0)
			this._scroll(null, co.scrollHeight - co.clientHeight);
	},

/**
 * This removes the class hooks on the parent, but does not remove the scrollbar
 * elements from the DOM.
 */
	disable: function () {
		if (!this._enabled)
			return;

		var co = this.content, pa = this.parent;

		this._enabled = false;
		this._blur();

		removeClass(pa, 'jssb-applied');
		removeClass(pa, 'jssb-scrolly');
		removeClass(pa, 'jssb-scrollx');

		removeEvent(co, 'mousedown', bind(this._selectStart, this));
		removeEvent(co, 'scroll', bind(this._keepUp, this));
		removeEvent(pa, 'mousedown', bind(this._focus, this));
		removeEvent(document, 'mousedown', bind(this._blur, this));
	},

/**
 * This reinits the scrollbar after being disabled
 */
	enable: function () {
		if (this._enabled)
			return;

		this._enabled = true;
		this.recalc();
	},

/**
 * This will either return a preference, or will set a preference depending on how
 * it's called.
 *   - prefs('preference') gets a value
 *   - prefs('preference', value) sets a preference
 *   - prefs({ preference1: value1, preference2: value2 }) sets multiple preferences
 */
	prefs: function (pref, value) {
		if (value || typeof pref == 'object') {
			if (typeof pref == 'string')
				this._prefs[pref] = value;
			else if (typeof pref == 'object')
				this._prefs = extend(pref, this._prefs);
			return true;
		}

		return this._prefs[pref];
	}
};

function jsScrollbarComponent (el, axis, minThumb) {
	this.el    = el;
	this.axis  = axis;
	this.track = new jsScrollbarComponentItem(find('jssb-'+ axis +'-track', el), axis);
	this.thumb = new jsScrollbarComponentItem(find('jssb-'+ axis +'-thumb', this.track.el), axis);
	this.minThumb = typeof minThumb == 'undefined' ? this.thumb.relevantDim() : minThumb;
}

jsScrollbarComponent.prototype = {
	track: null, thumb: null, prev: null, next: null,
	minThumb: 0,
	ratio: 0
};

function jsScrollbarComponentItem (el, axis) {
	this.el = el;
	this.axis = axis;
}

jsScrollbarComponentItem.prototype = {
	width: function (w) {
		if (typeof w != 'undefined') this.el.style.width = w +'px';

		if (!this.el.style.width)
			return this.el.offsetWidth

		return parseFloat(this.el.style.width);
	},

	height: function (h) {
		if (typeof h != 'undefined') this.el.style.height = h +'px';

		if (!this.el.style.height)
			return this.el.offsetHeight

		return parseFloat(this.el.style.height);
	},

	x: function (x) {
		if ((typeof x != 'undefined') && !isNaN(x)) this.el.style.left = x +'px';
		return parseFloat(this.el.style.left);
	},

	y: function (y) {
		if ((typeof y != 'undefined') && !isNaN(y)) this.el.style.top = y +'px';
		return parseFloat(this.el.style.top);
	},

	relevantDim: function (v) {
		return this.axis == 'x' ? this.width(v) : this.height(v);
	},

	relevantPos: function (v) {
		return this.axis == 'x' ? this.x(v) : this.y(v);
	}
};

function extend (a, b) {
	var c = {}, i;
	if (typeof a != undefined && a != null)
		for (i in a)
			c[i] = a[i];
	for (i in b)
		c[i] = b[i];
	return c;
}

function verify (o) {
	if (!o)
		return false;

	if (hasClass(o, 'jssb-applied'))
		return false;

	var s, p, co = find('jssb-content', o);

	if (!co)
		return false;

	addClass(o, 'jssb-applied');

    s = jQuery(co).css('overflow');
    p = jQuery(o).css('position');

	removeClass(o, 'jssb-applied');

	if (s == 'hidden') {
		if (p == 'static')
			o.style.position = 'relative';
		return true;
	}

	return false;
}

function addEvent (obj, type, fn) {
	if (obj && obj.addEventListener)
		obj.addEventListener(type, fn, false);
	else if (obj)
		obj.attachEvent( 'on'+type, fn );
}

function removeEvent (obj, type, fn) {
	if (obj && obj.removeEventListener)
		obj.removeEventListener(type, fn, false);
	else if (obj)
		obj.detachEvent('on'+type, fn);
}

function cancelEvent (e) {
	if (!e) e = window.event;
	if (e.stopPropagation) e.stopPropagation();
	if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	e.cancel = true;
	e.returnValue = false;
	return false;
}

function fixEvent (e) {
	e = e ? e : window.event;   
	if (typeof e.target == 'undefined') e.target = e.srcElement;
	if (typeof e.pageX == 'undefined')  e.pageX  = e.clientX + document.body.scrollLeft;
	if (typeof e.pageY == 'undefined')  e.pageY  = e.clientY + document.body.scrollTop;

	return e;
}

function find (c, o) {
	if (o && typeof o != 'undefined') {
		var kids = o.getElementsByTagName('*', o), i, j;
		for (i = 0, j = kids.length; i < j; i++) {
			if (kids[i].className && hasClass(kids[i], c))
				return kids[i];
		}
		return null;
	} else {
		return document.getElementById(c);
	}
}

function addClass (o, c) {
	if (!hasClass (o, c)) {
		if (o.className.length == 0)
			o.className = c;
		else
			o.className += ' '+ c;
	}
}

function removeClass (o, c) {
	var i, classes = o.className.split(' ');
	for (i = 0; i < classes.length; i++) {
		if (typeof c == 'string') {
			if (classes[i] == c)
				classes[i] = '';
		} else {
			if (classes[i].match(c))
				classes[i] = '';
		}
	}

	o.className = classes.join(' ');
}

function hasClass (o, c, p) {
	if (typeof p == 'undefined' && o.className.split) {
		var i, classes = o.className.split(' ');
		for (i = 0; i < classes.length; i++) {
			if (classes[i] == c)
				return true;
		}
	}

	//Partial className: 'jssb-track' matches jssb-track-mid
	else {
		if (o.className.indexOf && o.className.indexOf(c) > -1)
			return true;
	}

	return false;
}

function findOffsetTop (o) {
	var t = 0;
    // KB 3043614: for IE8 test the offsetParent property access and handle exception before calculating the offset.
    try {
        var testOffset = o.offsetParent;
    } catch (e) {
    }
    try {
        if (o.offsetParent) {
            while (o.offsetParent) {
                t += o.offsetTop;
                o = o.offsetParent;
            }
        }
    } catch (e) {
    }
	return t;
}

function findOffsetLeft (o) {
	var t = 0;
    // KB 3043614: for IE8 test the offsetParent property access and handle exception before calculating the offset.
    try {
        var testOffset = o.offsetParent;
    } catch (e) {
    }
    if (o.offsetParent) {
        while (o.offsetParent) {
            t += o.offsetLeft;
            o = o.offsetParent;
        }
    }
	return t;
}

// Laurens van den Oever's Leak Free Closures
// http://laurens.vd.oever.nl/weblog/items2005/closures/
function bind (fn, obj) {
	var objs  = window.jsScrollbar._closures.objs,
	    fns   = window.jsScrollbar._closures.fns,
		objId = obj.__objId,
		fnId  = fn.__fnId;

	if (!objId)
		objs[objId = obj.__objId = objs.length] = obj;

	if (!fnId)
		fns[fnId = fn.__fnId = fns.length] = fn;

	if (!obj.__closures)
		obj.__closures = [];

	if (obj.__closures[fnId])
		return obj.__closures[fnId];

	obj = fn = objs = fns = null;

	return window.jsScrollbar._closures.objs[objId].__closures[fnId] = function () {
		return window.jsScrollbar._closures.fns[fnId].apply(window.jsScrollbar._closures.objs[objId], arguments);
	};
}

})();

