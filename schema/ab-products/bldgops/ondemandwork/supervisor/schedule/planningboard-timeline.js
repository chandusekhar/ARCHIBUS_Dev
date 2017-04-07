/***
 * The Timeline module for the planning board contains all 
 * timeline navigation. 
 * 
 * 
 * 
 * 
 */


AFM.namespace('planboard');

var $_ = AFM.planboard.Translate.getMessage;
/**
 * Abstract class for a timeline + navigation bar.
 */

AFM.planboard.AbstractTimeline = Base.extend({		
	title: null,	
	className: "timeline",
		
	element: null, // HTML Element
	width: null,
	delta: null, 
	  	
	scheduleView: null,
	container: null,	
	 
	style: null, // reference to AFM.planboard.STYLES
	
	navElement: null,
	headerElement: null,
	
	handlers: null, // listeners for select, previous, next
	scope: null,
	
	days:["sun","mon","tue","wed","thur","fri","sat"], // lookup in Web Central translation fields
	
	height: 20, // default height in pixels
	
	constructor: function(scheduleView, style, config) {	 
		 
		this.scheduleView = scheduleView;
		
		if (style !== undefined) this.style = style;
		
		if (config !== undefined) {
			if (config.handlers !== undefined) {
				this.handlers = config.handlers;
			}			
		}		 
	},	 
	/**
	 * This is a helper function for getting the translated week day
	 */
	getWeekDay: function(date) {
		var day = this.days[date.getDay()];		 
		return $_(day); 
	},	
	
	/**
	 * This is a helper function for getting the translated month name
	 * The index is the month number starting from 0, as in javascript getMonth()
	 */
	getMonthName: function(index) {
		return arrMonthNames[index];
	},
	
	/**
	 * The title must be overridden by concrete class
	 */
	getTitle: function() {
		return "Title";
	},
	
	/**
	 * Lookup the cell using the date, to be overriden.
	 */
	getCellTitle: function(date) {
		return date.getDate();
	},
	
	/**
	 * Refresh content when the start and end date are changed using the previous and next button
	 */
	refresh: function() {
		var title = Dom.getElementsByClassName("title", "div", this.navElement)[0];		 
		title.innerHTML = ""; 		
		title.appendChild( document.createTextNode(this.getTitle()) );
		
		var date = this.scheduleView.startDate;		
		
		var divs = Dom.getElementsByClassName("date", "div", this.headerElement);
		
		for(var i=0;i<divs.length; i++) {								 
			var span = document.createElement("span");
			// var month = date.getMonth()+1;
			span.appendChild(document.createTextNode( this.getCellTitle(date) ));
			divs[i].innerHTML = "";
			divs[i].appendChild(span); // there is only one child
						
			if (this.scheduleView.isHoliday(date)) {
				Dom.removeClass(divs[i], "weekend");
 				Dom.addClass(divs[i], "holiday");
 			} else if (this.scheduleView.isWeekend(date)) {
 				Dom.removeClass(divs[i], "holiday");
 				Dom.addClass(divs[i], "weekend");		
 			} else {
 				Dom.removeClass(divs[i], "holiday");
				Dom.removeClass(divs[i], "weekend");
 			}
			
			if (this.handlers.onSelect !== undefined && this.handlers.onSelect != null) {
				// remove previous click listener 
				Event.removeListener(divs[i], "click", this.handlers.onSelect);
				// add new listener			
				Event.addListener(divs[i], "click", this.handlers.onSelect, date, this.scheduleView);
			}
			
			// get next date 		
			date = DateMath.add(date, this.style.interval, 1);		
		}	
	},
	/**
	 * Render the navigation row, previous, title and next.
	 * 
	 * Handlers are defined in the scheduleView scope by default.
	 */
	renderNavigation: function() {
		// navigation row		
		this.navElement = this.element.appendChild(document.createElement("div"));
		Dom.addClass(this.navElement, "nav");  
		Dom.setStyle(this.navElement, "width", this.width);
				
		var previous = this.navElement.appendChild(document.createElement("div"));	
		Dom.addClass(previous, "arrow"); 	
		Dom.setStyle(previous, "text-align", "center");
		
		var date = DateMath.clearTime(this.scheduleView.startDate);
		
		previous.appendChild(document.createTextNode( "<< " + $_('navigationPrevious')  )); // 
		
		Event.addListener(previous, "mouseover", function(e) { YAHOO.util.Dom.addClass(this, "active_dark") } );	
		Event.addListener(previous, "mouseout", function(e) { YAHOO.util.Dom.removeClass(this, "active_dark") } );		
			
		Event.addListener(previous, "click", this.handlers.onPrevious, date, this.scheduleView, true);
		
		this.delta = previous.offsetWidth*2;
		
		var title = this.navElement.appendChild(document.createElement("div"));			
		Dom.addClass(title, "title"); 
		Dom.setStyle(title, "text-align", "center"); 
		Dom.setStyle(title, "width", this.width-this.delta-2); 
		 
		title.appendChild( document.createTextNode(this.getTitle()) );
			
		var next = this.navElement.appendChild(document.createElement("div"));				
		next.appendChild(document.createTextNode($_('navigationNext') + " >>"));		
		Dom.addClass(next, "arrow"); 
		Dom.setStyle(next, "text-align", "center");
		Dom.setStyle(next, "float", "right");
		
		Event.addListener(next, "mouseover", function(e) { YAHOO.util.Dom.addClass(this, "active_dark") } );	
		Event.addListener(next, "mouseout", function(e) { YAHOO.util.Dom.removeClass(this, "active_dark") } );		
	
		Event.addListener(next, "click", this.handlers.onNext, date, this.scheduleView, true);	
	
	},
	
	/**
	 * Render the header cells. These can be days or hours.
	 * 
	 * Settings for the headers depend on the style configuration being used.
	 * 
	 * <ul>
	 * 		<li>start</li>
	 * 		<li>end</li>
	 * 		<li>intervals</li>
	 * 		<li>interval: constant used by YUI DateMath</li>
	 * </ul>
	 * 
	 *   
	 */
	renderHeaderCells: function() {
		// render cell or hour elements	
		this.headerElement = this.element.appendChild(document.createElement("div"));
		Dom.setStyle(this.headerElement,"width", this.width);
			
		var width = 100 / this.style.intervals;		
		var date = DateMath.clearTime(this.scheduleView.startDate);
		var div; // create variable here ro use later		
				
		for(var i=0;i<this.style.intervals; i++) {
			div = document.createElement("div");
			this.headerElement.appendChild(div);
			
			Dom.addClass(div, "date");			
			
			if (this.scheduleView.isHoliday(date)) {
 				Dom.addClass(div, "holiday");
 			} else if (this.scheduleView.isWeekend(date)) {
 				Dom.addClass(div, "weekend");		
 			}
			  
			Dom.setStyle(div, "width", width + "%");
			// Dom.setStyle(div, "width", div.offsetWidth-1);
			
			Dom.setStyle(div, "height", this.height);				
			   
			var span = document.createElement("span");			 
			span.appendChild(document.createTextNode( this.getCellTitle(date) ));	
					
			div.appendChild(document.createTextNode( this.getCellTitle(date) ));
			
			// set click listener 
			if (this.handlers.onSelect !== undefined && this.handlers.onSelect != null) {
				Event.addListener(div, "mouseover", function(e) { YAHOO.util.Dom.addClass(this, "active") } );	
				Event.addListener(div, "mouseout", function(e) { YAHOO.util.Dom.removeClass(this, "active") } );		
				Event.addListener(div, "click", this.handlers.onSelect, date, this.scheduleView, true);		
			}	
			// next day or hour, ...
			date = DateMath.add(date, this.style.interval, 1);		
		}				
			// for IE last cell for month prevent overflow
		if (YAHOO.env.ua.ie) {
			// Dom.setStyle(div, "width", "2%");
			Dom.addClass(div, "last");			
		}			
			
	},
	
	render: function(container) {
		if (container !== undefined) this.container = $(container);
		
		this.element = this.container.appendChild(document.createElement("div"));
		Dom.addClass(this.element, "timeline");	
		this.width = this.container.offsetWidth - this.element.offsetLeft;
		// set the width of the timeline container
		Dom.setStyle(this.element,"width", this.width);
		
		this.renderNavigation();			  
		this.renderHeaderCells();		
	},
	
	resize: function() {
		this.width = this.container.offsetWidth - this.element.offsetLeft;
		// set the width of the timeline container
		Dom.setStyle(this.element, "width", this.width);
		Dom.setStyle(this.headerElement,"width", this.width);
		Dom.setStyle(this.navElement,"width", this.width);
		var title = Dom.getElementsByClassName("title", "div", this.navElement)[0];		 
		Dom.setStyle(title, "width", this.width-this.delta);	 		 
	},
	
	destroy: function() {		
		var divs = Dom.getElementsByClassName("arrow", "div", this.navElement);	
		for(var i=0;i<divs.length; i++) {	
			Event.purgeElement(divs[i]);
		}
		
		divs = Dom.getElementsByClassName("date", "div", this.headerElement);	
		for(var i=0;i<divs.length; i++) {	
			Event.purgeElement(divs[i]);
		}				
		this.element.innerHTML = "";
	}
	
});

AFM.planboard.MonthTimeline = AFM.planboard.AbstractTimeline.extend({	
	
	style: AFM.planboard.STYLES.MONTH_31, 
	
	constructor: function(scheduleView, style, config) {	 
		this.inherit(scheduleView, style, config);	
		
		if (this.handlers == null) {
			this.handlers = {
				onSelect: this.scheduleView.onSelectDay,
				onPrevious: this.scheduleView.onPreviousMonth,
				onNext: this.scheduleView.onNextMonth
			};
		}						 
	},	
	
	// to override
	getTitle: function() {
		return this.getMonthName(this.scheduleView.startDate.getMonth()) + " " + this.scheduleView.startDate.getFullYear();
	},
	// to override
	getCellTitle: function(date) {
		return date.getDate();
	}

});

AFM.planboard.DayTimeline = AFM.planboard.AbstractTimeline.extend({	
	 		
	constructor: function( scheduleView, style, config) {	 
		this.inherit( scheduleView, style, config);	
		
		if (this.handlers == null) {
			this.handlers = {
				onSelect: null,
				onPrevious: this.scheduleView.onPreviousDay,
				onNext: this.scheduleView.onNextDay
			};
		}	 
		 
	},		
	 
	getTitle: function() {  
		return this.getWeekDay(this.scheduleView.startDate) + ", " + this.scheduleView.startDate.getDate() + " " + this.getMonthName(this.scheduleView.startDate.getMonth()) + " " + this.scheduleView.startDate.getFullYear()  ;
	},
	 
	getCellTitle: function(i) {
		var hour = parseInt(this.style.start, 10) + i;
		return hour + ":00"; 
	},
	
	// refresh override because the cells are hours, not dates
	refresh: function() {		
		var title = Dom.getElementsByClassName("title", "div", this.navElement)[0];		 
		title.innerHTML = ""; 		
		title.appendChild( document.createTextNode(this.getTitle()) );
		
		var date = this.scheduleView.startDate;		
		date.setHours(this.style.start);
		
		var divs = Dom.getElementsByClassName("date", "div", this.headerElement);
		
		for(var i=0;i<divs.length; i++) {						
			var span = document.createElement("span");
		 
			// var hour = parseInt(this.style.start, 10) + i;
		 	var txtNode = document.createTextNode( this.getCellTitle(i) );
		 	
			span.appendChild(txtNode);
			
			divs[i].innerHTML = "";
			divs[i].appendChild(span); // there is only one child 
			
			date = DateMath.add(date, this.style.interval, 1);		
		}	
		
	},
	
	renderHeaderCells: function() {
		this.headerElement = this.element.appendChild(document.createElement("div"));
		Dom.setStyle(this.headerElement, "width", this.width);		
		
		var width = 100 / (this.style.intervals);	
		for (var i=0; i<this.style.intervals; i++) {
			var div = this.headerElement.appendChild(document.createElement("div")); 
			Dom.addClass(div, "date");
			Dom.setStyle(div, "cursor", "default");
			Dom.setStyle(div, "width", width + "%");				
		}
	},

	render: function(container) { 
		this.inherit.call(this, container);
		this.refresh();		
	} 
	
});

AFM.planboard.WeekTimeline = AFM.planboard.AbstractTimeline.extend({	
	 
	constructor: function( scheduleView, style, config) {	 
		this.inherit( scheduleView, style, config);		
		
		if (this.handlers == null) { // set default handlers
			this.handlers = {
				onSelect: this.scheduleView.onSelectDay,
				onPrevious: this.scheduleView.onPreviousWeek,
				onNext: this.scheduleView.onNextWeek
			};
		}
	},	 	
 
	getTitle: function() {
		return $_('week') +  " " + DateMath.getWeekNumber(this.scheduleView.startDate) ;
	},
	 
	getCellTitle: function(date) {		 		
		var month = date.getMonth()+1;		
		// use the Web Central date pattern format settings, if it starts with day...	 
		if (strDateShortPattern.indexOf('D') == 0)
			return this.getWeekDay(date) + " " + date.getDate()+"/"+month;		 
		else		
			return this.getWeekDay(date) + " " + month +"/" + date.getDate();		 
	}
	
});
