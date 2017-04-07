
AFM.namespace('planboard');

/**
 * display DOM element that reference a record object
 */
AFM.planboard.DisplayObject = Base.extend({		
	panel: null,
	x: 0,
	y: 0,
	width: null,
	height: null,
	className: null,
	
	title: null,	
	tooltip: null,
	// reference to the display container
	container: null,
	// reference to a database object
	recordObject: null,
	
	constructor: function(config) {
		if (config !== undefined) { 
			this.width = config.width; 
			this.height = config.height;  
			if (config.x !== undefined) this.x = config.x;  
			if (config.y !== undefined) this.y = config.y;  
		}		 
	},
	
	createDivElement: function(id, className, styles, handlers) {
		var element = document.createElement("div");
		if (id != null) {
			div.setAttribute("id", id);
		} else {
			// create id
		}			
		
		if (className != null)
			Dom.addClass(element, className);
		for (var key in styles) {
			Dom.setStyle(element, key, styles[key]); 
		}
		
		return element;
	},
	
	destroy: function() {
		for (var key in this) {
			this[key] = null;
		}
	},
	
	render: function(container) {
		if (container !== undefined) this.container = $(container); 
				
		this.panel = document.createElement("div");
		if (this.className !== null) Dom.addClass(this.panel, this.className);		
		if (this.height !== null) Dom.setStyle(this.panel, "height", this.height);
		if (this.width !== null) Dom.setStyle(this.panel, "width", this.width);		
		this.container.appendChild(this.panel);  		
	}

});

/**
 * 
 */
AFM.planboard.Container = AFM.planboard.DisplayObject.extend({		
	className : "panel_body",
	width: null,
	height: null,			
	panel: null,	
	container: null,
	
	recordObject: null, // reference to record object 
		
	constructor: function(recordObject, config) {
			
		if (config !== undefined) {
			if (config.title !== undefined) this.title = config.title; 
			if (config.width !== undefined) this.width = config.width; 
			if (config.height !== undefined) this.height = config.height;  
		}
		
		if (recordObject !== undefined) {
			this.recordObject = recordObject;
		}	
		
		// this.container = $(container);  // el
	},
	
	
	getContentContainer: function() {
		return this.panel;
	},
	
	getReferenceObject: function() {
		return this.recordObject;
	},
	
	addContent: function(element) {
		this.panel.appendChild(element);
		return element;
	},	
 	
	render: function(container) {			
		if (container !== undefined) this.container = container;
			
		this.panel = document.createElement("div");
		Dom.addClass(this.panel, this.className);
		Dom.setStyle(this.panel, "width", this.width); 	 
		Dom.setStyle(this.panel, "position", "relative");		
		
		this.container.appendChild(this.panel);		
	},

	destroy: function() {			 
		if (this.panel.parentNode)
			this.panel.parentNode.removeChild(this.panel);
		
		 for (var key in this) {
			delete this[key];
		}
	},
	
	toString: function() {
		return "Container";
	}
		
	
});

AFM.planboard.Panel = Base.extend({		
		title: "",
		className : "panel",
		headerClassName: "panel_header",
		bodyClassName: "panel_body",
		width: null,
		height: null,			
		panel: null,
		hd: null,
		bd: null, 
		
		container: null,	
		
		recordObject: null, // reference to record object 
		
		constructor: function(recordObject, config) {
			
			if (config !== undefined) {
				if (config.title !== undefined) this.title = config.title; 
				if (config.width !== undefined) this.width = config.width; 
				if (config.height !== undefined) this.height = config.height;  
			}
			
			if (recordObject !== undefined) {
				this.recordObject = recordObject;
			}	
			
			// this.container = $(container);  // el
		},
		
		getContentContainer: function() {
			return this.bd;
		},
		
		getReferenceObject: function() {
			return this.recordObject;
		},
		
		addContent: function(element) {
			this.bd.appendChild(element);
			return element;
		},

		render: function(container) {
			if (this.container !== undefined) this.container = container;
			
			this.panel = document.createElement("div");
			Dom.addClass(this.panel, this.className);
			Dom.setStyle(this.panel, "width", this.width);
								
			var txtNode = document.createTextNode(this.title);
			
			this.hd = document.createElement("div");		
			Dom.addClass(this.hd, this.headerClassName);		
			this.hd.appendChild(txtNode);
			
			this.bd = document.createElement("div");				
			Dom.addClass(this.bd, "container");	
			Dom.addClass(this.bd, this.bodyClassName); 		
			
			this.panel.appendChild(this.hd);
			this.panel.appendChild(this.bd);			
			
			this.container.appendChild(this.panel);  
		},
		
		destroy: function() {			 
			if (this.hd.parentNode)
				this.hd.parentNode.removeChild(this.hd);
			if (this.bd.parentNode)
				this.bd.parentNode.removeChild(this.bd);
			 
			if (this.panel.parentNode)
				this.panel.parentNode.removeChild(this.panel);
			
			 for (var key in this) {
				delete this[key];
			}
		},
		
		toString: function() {
			return "Panel";
		}
		
		
});


AFM.planboard.CollapsiblePanel = Base.extend({	
		title: null,
		className : "panel",
		headerClassName: "panel_header",
		bodyClassName: "panel_body",
		width: null,
		// height: null,		
		container: null,	
		panel: null,
		hd: null,
		arrow: null,
		bd: null,
		expanded: true,
		dd: null,
		recordObject: null, // reference to record object 
		
		constructor: function(recordObject, config) {
			if (config !== undefined) {
				this.title = config.title; 
				this.width = config.width; 
				// this.height = config.height;  
			}
			
			if (recordObject !== undefined) {
				this.recordObject = recordObject;
			}			
							
		},
		
		getContentContainer: function() {
			return this.bd;
		},
		
		getReferenceObject: function() {
			return this.recordObject;
		},
		
		render: function(container) {
			if (container !== undefined) this.container = $(container); 
			
			this.panel = document.createElement("div");			
			Dom.addClass(this.panel, this.className);
			// Dom.setStyle(this.panel, "height", this.height);
			Dom.setStyle(this.panel, "width", this.width);
			
			this.arrow = document.createElement("div");
			Dom.addClass(this.arrow, "arrow_down");			
			Event.addListener(this.arrow, "click", this.expand, this, true);					
			var txtNode = document.createTextNode(this.title);
			
			this.hd = document.createElement("div");				
			Dom.addClass(this.hd, this.headerClassName);
			
			this.hd.appendChild(this.arrow);	
			this.hd.appendChild(txtNode);
			
			this.bd = document.createElement("div");	
			Dom.addClass(this.bd, "container");					
			Dom.addClass(this.bd, this.bodyClassName);
			//Dom.setStyle(this.bd, "height", "200px");
			
			this.panel.appendChild(this.hd);
			this.panel.appendChild(this.bd);
		
			this.container.appendChild(this.panel);
			
			// this is no drop container !!!			 
		},
		
		destroy: function() {
			 Event.purgeElement(this.arrow);
			 
			if (this.hd.parentNode)
				this.hd.parentNode.removeChild(this.hd);
			if (this.bd.parentNode)
				this.bd.parentNode.removeChild(this.bd);
			 
			if (this.panel.parentNode)
				this.panel.parentNode.removeChild(this.panel);
			
			 for (var key in this) {
				delete this[key];
			}
		},
		
		toString: function() {
			return "Collapsible panel";
		},
		
		expand: function() {
			if (this.expanded) {	
				this.height = this.bd.offsetHeight+this.hd.offsetHeight;			
				
				new YAHOO.util.Motion( 
	                this.panel, { 
	                   height: { to: this.hd.offsetHeight }  
	                }, 
	                0.4, YAHOO.util.Easing.easeOut 
            	).animate();
						
				this.expanded = false;
			} else {	
				 								
				new YAHOO.util.Motion( 
	                this.panel, { 
	                   height: { to: this.height  }  
	                }, 
	                0.4, YAHOO.util.Easing.easeOut 
            	).animate();	 
								
				this.expanded = true;	
			}
			
		}
});

AFM.planboard.ResourceContainer = Base.extend({	
	scheduleView: null,	
	// container: null, // parent container for this element
	resource: null, // reference object
	labelElement: null,
	contentElement: null,
	cells: null, // array of AFM.planboard.EntryCell 	
	style: null,	
	
	dd: null,
	ddGroup: "default",
	
	constructor: function(resource, scheduleView, style) {		 
		
		this.resource = resource;
		this.scheduleView = scheduleView;
		
		if (style !== undefined) this.style = style;
		
		this.className = "resourceContainer";
		this.cells = []; // create array in constructor		
		// 
		var startDate = new Date(); //new Date();
		startDate.setTime(this.scheduleView.startDate.getTime());	
			
		var width = 100 / this.style.intervals; 		
		
		for (var i=0; i<this.style.intervals; i++) {	 
			var	config = {width: width+"%", 
						  appendEntries: this.style.appendEntries,
						  placement: this.style.placement,
						  startDate: startDate };				
				 
			this.cells.push(new AFM.planboard.EntryCell(this.scheduleView, config)); 						
			// next day or next hour
			startDate = DateMath.add(startDate, this.style.interval, 1); // next day or next hour						 
		}	
						
		
		/**
		 * after creating the cells, we can add the resource entries to the different cells
		 */
		for (var i=0; i < this.resource.entries.length; i++) {
			var entry = this.resource.entries[i];
			var cell = this.getCell(entry.startDate);
			if (cell != null) cell.addEntry(entry);							 
		}
				 	
	},		
	
	getCellIndex: function(date) {
		 return 0; // to override
	},
	
	// to be overriden by day view
	getCell: function(date) {
		if (date === undefined) return;
		
		var dateOnly = new Date();
   		dateOnly.setTime(date.getTime()); 
   		YAHOO.widget.DateMath.clearTime(dateOnly);	 // end date for week has 00 hours, for week and month view
	 
		if (dateOnly < this.scheduleView.startDate 	|| dateOnly  > this.scheduleView.endDate ) return null;	
		 		
		var index = this.getCellIndex(dateOnly);
		return this.cells[index];	 		 
	},
	
	// after reload entries, next week etc ...
	refresh: function() {
		// first check holidays 
		var startDate = new Date();
		startDate.setTime(this.scheduleView.startDate.getTime());
		
		// refresh cell with new startDate and re-arrange entries in cell, format cell style
		for (var i=0; i<this.cells.length; i++) {				
			this.cells[i].refresh(startDate);
			startDate = DateMath.add(startDate, this.style.interval, 1); // next day or next hour	
		} 
	},
	
	
	render: function(container) {	 
				
		if (container !== undefined) this.container = container;
			
		this.panel = this.container.appendChild(document.createElement("div"));		
		Dom.addClass(this.panel, "resourceContainer");
		
		// make the label
		this.labelElement = document.createElement("div");	
		Dom.addClass(this.labelElement, "resourceLabel"); 
		this.labelElement.appendChild(document.createTextNode(this.resource.getLabel()));		
		this.panel.appendChild(this.labelElement);
		
		Event.addListener(this.labelElement, "click", this.scheduleView.onSelectResource, this.resource, this.scheduleView, true);
		
		// make the drop container
		this.contentElement = document.createElement("div");	
		this.resource.contentContainer = this.contentElement;
		Dom.addClass(this.contentElement, "resourceSchedule"); 		
		var width = this.panel.offsetWidth - this.labelElement.offsetWidth;		 
		Dom.setStyle(this.contentElement, "width", width + "px");
		
		this.panel.appendChild(this.contentElement);	
				
		// create the region for drag and drop ?????
		var region = Dom.getRegion(this.container);
		region.left = region.left + this.labelElement.offsetWidth;
	
		 // this.resource.getResourceGroupName()
		// the content part of the resource container is defined as drop container for this trade
		this.dd = new AFM.planboard.DDContainer(this.resource, this.scheduleView, this.contentElement, this.ddGroup);
		
		var width = 100 / this.style.intervals; 
		// 100 results in overflow in IE
		var startDate = new Date();
		startDate.setTime(this.scheduleView.startDate.getTime());	
		
		var appendEntries = this.style.appendEntries !== undefined ? this.style.appendEntries : "element";	
		var placement = this.style.placement !== undefined ? this.style.placement : "bestfit";		
		
		// using a docFragment is faster !
		// var docFragment = document.createDocumentFragment();	
		 
		for (var i=0; i<this.style.intervals; i++) {			 	
			this.cells[i].render(this.contentElement); // container 				 
		}	
			
		// for IE last cell for month prevent overflow	 	
		if (YAHOO.env.ua.ie) {   
			Dom.addClass(this.cells[this.style.intervals-1].element, "last");			
		}		
		 	
		// draw entries
		this.refresh();		
	},
	
	destroyAllEntries: function() {		
		for (var i=0; i<this.cells.length; i++) {
			this.cells[i].destroyAllEntries();
		}
	},
	
	destroyAllCells: function() {
		for (var i=0; i<this.cells.length; i++) {			
			this.cells[i].destroy();
		}
	},
		
	resize: function() {
		var width = this.panel.offsetWidth - this.labelElement.offsetWidth;		 
		Dom.setStyle(this.contentElement, "width", width + "px");
		 
		for (var i=0; i<this.cells.length; i++) {		
			this.cells[i].resize();
		}
	},
	
	destroy: function() {
		for (var i=0; i<this.cells.length; i++) {			
			this.cells[i].destroy();
		}
		// destroy drop container
		this.dd.destroy();
		
		if (this.labelElement.parentNode)
			this.labelElement.parentNode.removeChild(this.labelElement);
		if (this.contentElement.parentNode)
			this.contentElement.parentNode.removeChild(this.contentElement);
		if (this.panel.parentNode)
			this.panel.parentNode.removeChild(this.panel);
			
		this.resource.resourceContainer = null;	
		
		for (var key in this) {
			this[key] = null;
		}
		
		// this.cells = []; //  
	},
	
	toString: function() {
		return "Resource container ";
	}	

});

AFM.planboard.ResourceWorkWeekContainer = AFM.planboard.ResourceContainer.extend({	
	
	style: AFM.planboard.STYLES.EU_5_DAYS, // default 5 days EU style (start on Monday)
	
	constructor: function(resource, scheduleView, style) {
		this.inherit(resource, scheduleView, style);
	},		 
	
	getCellIndex: function(date) {
		var day = date.getDay(); // number between 0 and 6, 0 = Sunday	
		// sunday = 0 			 
		return (day==0) ? 6 : day-1; // return Monday = 0, ...	 		 
	}
	
});

AFM.planboard.ResourceWeekContainer = AFM.planboard.ResourceContainer.extend({	
	
	style: AFM.planboard.STYLES.EU_7_DAYS, // default 7 days EU style (start on Monday)
	
	constructor: function(resource, scheduleView, style) {
		this.inherit(resource, scheduleView, style);
	},		 
	
	getCellIndex: function(date) {
		var day = date.getDay(); // number between 0 and 6, 0 = Sunday	
		// make sunday last day of the week	
		if (this.style == AFM.planboard.STYLES.EU_7_DAYS)
			return (day==0) ? 6 : day-1; // return Monday = 0, ...	 
		else 
			return day
	}
	
});

AFM.planboard.ResourceDayContainer = AFM.planboard.ResourceContainer.extend({	
	// default style
	style: AFM.planboard.STYLES.DAY_7H_18H, // start at 7.00 and end at 18.00
	
	constructor: function(resource, scheduleView, style) {
		this.inherit(resource, scheduleView, style);
	},
		
	getCellIndex: function(date) {
		//return 0;
		var hours = parseInt(date.getHours()); 
		if (hours > this.style.end) return this.style.end - this.style.start; // take the last cell
		if (hours < this.style.start) return 0; // take the first cell
		return hours - parseInt(this.style.start); 
	},
	
	getCell: function(date) {
		if (date === undefined) alert("hier");
		 
		if (date < this.scheduleView.startDate 	|| date  > this.scheduleView.endDate ) return null;	
		 		
		var index = this.getCellIndex(date);
		return this.cells[index];	 		 
	}
		
});


AFM.planboard.ResourceMonthContainer = AFM.planboard.ResourceContainer.extend({	
	// default style
	style: AFM.planboard.STYLES.MONTH_31, 
	
	constructor: function(resource, scheduleView, style) {
		this.inherit(resource, scheduleView, style);
	},
		
	getCellIndex: function(date) {
		return date.getDate()-1; // month starts at 1, cell 0			 
	}	
		
});


AFM.planboard.ResourceSelectContainer  = AFM.planboard.ResourceContainer.extend({	
	
	style: AFM.planboard.STYLES.EU_7_DAYS, // default 7 days EU style (start on Monday)
	headerCells: null,
	
	constructor: function(resource, scheduleView, style) {
		this.inherit(resource, scheduleView, style);
		this.headerCells = [];
	},		 
	
	getCellIndex: function(date) {
		var day = date.getDate(); 	
		return day-1;
	},	
	
	createWeekRow: function() {		
		var width = this.contentElement.offsetWidth / 7;
	
		var headerContainer = this.contentElement.appendChild(document.createElement("div")); 
		Dom.addClass(headerContainer,"container");
		for (var i=0; i<7; i++) {
			var div = headerContainer.appendChild(document.createElement("div")); 
			Dom.addClass(div, "date"); 
			Dom.setStyle(div, "width", width+"px");			
			// create an entry cell			 
			this.headerCells.push(div); // append		
		}
		var cellContainer = this.contentElement.appendChild(document.createElement("div")); 
		Dom.addClass(cellContainer,"container");
		for (var i=0; i<7; i++) {
			var div = cellContainer.appendChild(document.createElement("div")); 
			Dom.addClass(div, "cell"); 
			Dom.setStyle(div, "width", width+"px");			
			// create an entry cell			 
			this.cells.push(new AFM.planboard.EntryCell(div)); // append		
		}
	},
	
	refresh: function() {
	},
	
	render: function(container) {
		this.inherit.call(this, container); // create the container panel, position relative
				
		Dom.setStyle(this.panel, "height", "250px");
		Dom.setStyle(this.labelElement, "height", "250px");
		Dom.setStyle(this.contentElement, "height", "250px");
			 
		for (var i=0; i<5; i++) {
			this.createWeekRow();		 
		}		
		
		this.refresh();		 
	}	      	
	
});
	

