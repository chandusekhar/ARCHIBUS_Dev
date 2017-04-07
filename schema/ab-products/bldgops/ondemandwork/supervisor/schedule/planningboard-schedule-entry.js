


AFM.namespace('planboard');


/**
 * Shortcuts or YAHOO modules.
 */
var $ =  YAHOO.util.Dom.get;
var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;

// this is an enhanced version of the Web Central getMessage
var $_ = AFM.planboard.Translate.getMessage;

/**
 * Representation of a cell element.
 * 
 * The entry cell contains entries.
 *  
 */
AFM.planboard.EntryCell = Base.extend({		
	element: null,	
	entries: null, 
	// elements: null, // corresponding dom elements
	pos: null, // absolute screen position
		
	// set start and end date for this cell
	startDate: null, // required
	endDate: null, // can be the same day as startDate
	
	style: null, // overflow, hidden
	
	scheduleView: null,
	container: null,
	
	placement: "bestfit", // or absolute	
	appendEntries: "element", // or container
		
	constructor: function(scheduleView, config) {
		
		// this.container = container;
		this.scheduleView = scheduleView;
		this.entries = [];		
		
		if (config !== undefined) {
			if (config.width !== undefined) {
				this.width = config.width;
			}
			// make sure we make safe copies and create new objects			 
			if (config.startDate !== undefined) {
				 this.startDate = new Date();
				 this.startDate.setTime(config.startDate.getTime());  
			}	
			if (config.endDate !== undefined) {
				 this.endDate = new Date();
				 this.endDate.setTime(config.endDate.getTime());  
			}	
			if (config.placement !== undefined) {
				this.placement = config.placement;
			}
			if (config.appendEntries !== undefined) {
				this.appendEntries = config.appendEntries;
			}
			
		}			
		 
		
	},
	
	removeEntry: function(entry) {
		if (this.entries.length == 0) return; 
		
		for (var i=0; i<this.entries.length; i++) {
			if (entry.compare(this.entries[i])) {
				this.entries.splice(i,1); 		
				break;
			}
		} 
		
		this.refresh();
	},
	
	
	addEntry: function(entry) {
		// we could change this so the order is correct
		this.entries.push(entry);	
		// if (this.appendEntries == "element" && entry.entryRenderer != null)		 
			// this.element.appendChild(entry.entryRenderer.element);		
		
		this.refresh();		
	},	 
	
	sortEntries: function() {
		this.entries.sort(this.compareEntries);
	},
	
	compareEntries: function (a, b) {
		return a.startDate < b.startDate ? -1 : 1;
	},
	
	entryExists: function(entry) {		
		if (entry === undefined || entry == null) return false;
		if (this.entries.length == 0) return false;
		for (var i=0; i<this.entries.length; i++) {
			if (entry.compare(this.entries[i]))
				return true;
		}
		
		return false;
	},
	
	refresh: function(startDate) {		
		if (this.element == null) return;		
		if (startDate !== undefined)  this.startDate = startDate; 
		
		if (this.scheduleView.isHoliday(this.startDate) ) {
			Dom.removeClass(this.element, "work");
			Dom.removeClass(this.element, "weekend");
			Dom.addClass(this.element, "holiday");
		} else if ( this.scheduleView.isWeekend(this.startDate) ) { 
			Dom.removeClass(this.element, "work");
			Dom.removeClass(this.element, "holiday");
			Dom.addClass(this.element, "weekend");
		} else {
			Dom.removeClass(this.element, "holiday");
			Dom.removeClass(this.element, "weekend");
			Dom.addClass(this.element, "work");
		} 		
		
		if (this.entries.length == 0) return;
		this.sortEntries(); // sort entries on start date (date_assigned + time_assigned)
		
		this.maxHeight = this.element.offsetHeight;
		
		var rowLength=0; // total length in pixels
		var row = 0; // start with first row
		
		var start = this.scheduleView.startDate.getHours();
		var end = this.scheduleView.endDate.getHours();
		var intervals = end-start+1;
		
		for (var i=0; i<this.entries.length; i++) {
			if (this.entries[i].entryRenderer == null) continue;	
			 
			// always call render when refreshing the cell
			// this.entries[i].entryRenderer.render();	
			
			if (this.appendEntries == "container")
				this.entries[i].entryRenderer.render(this.container);
			else
				this.entries[i].entryRenderer.render(this.element);		
			
			var el = this.entries[i].entryRenderer.element	
			
			if (this.placement == "absolute") {	
				this.pos = Dom.getXY(this.container);
				this.maxWidth = this.container.offsetWidth;
								 		
				var startHour = this.entries[i].startDate.getHours();
				var duration = this.entries[i].duration;
				var width = this.maxWidth * (duration / intervals);
				Dom.setStyle(el, "width", width+"px");
				
				var x = this.pos[0] + (startHour-start) * this.maxWidth / intervals;				 
				var y = this.pos[1];  
					 
				Dom.setXY(el, [x,y] );	// set absolute screen coordinates	
				// 			
				row++;
				
			} else { // best fit
				this.pos = Dom.getXY(this.element);		 
				this.maxWidth = this.element.offsetWidth;	
					
				if (rowLength > 0 && rowLength + el.offsetWidth > this.maxWidth && row*el.offsetHeight < this.maxHeight) {
					row++; 	rowLength = 0;	// start new row
					// set absolute page position
					var x = this.pos[0];  
					var y = parseInt(this.pos[1], 10) + row * el.offsetHeight;  
					 
					Dom.setXY(el, [x,y] );	// set absolute screen coordinates				
					rowLength += el.offsetWidth;  			
								
				} else { // continue with existing row				
					var x = parseInt(this.pos[0], 10) + rowLength;				
					var y = parseInt(this.pos[1], 10) + row * el.offsetHeight; // 
					 				
					Dom.setXY(el, [x,y] );	// set absolute screen coordinates				
					rowLength += el.offsetWidth;	
				}
			}// end if			
		}
		
		/**
		 * When the entries are rendered in the container element and placed absolute.
		 * We re-arrange the entries for this container
		 */
		if (this.placement == "absolute" && this.appendEntries == "container") {	
			// check overlaps for this container
			var elements = Dom.getElementsByClassName("entry", "div", this.container);    
			var posY = Dom.getY(this.container); // absolute corner position of the container
			var posRight =  Dom.getX(this.container);
			var row=0;
			for (var i=0; i<elements.length; i++) {
				var posX = Dom.getX(elements[i]); // left position of new element				 
				// lookup a row where there is place for this element
				if (posX < posRight) {
					row++; // start a new row
					var posRight = Dom.getX(this.container);
				} else {
					var posRight = Dom.getX(elements[i]) + elements[i].offsetWidth;
				}				 
				Dom.setY(elements[i], posY+row*elements[i].offsetHeight );
			}				
		}
	},
	
	resize: function() {		
		Dom.setStyle(this.element, "width", this.width);	
		// for day view count the hours per day
		if (this.placement == "absolute" && this.appendEntries == "container") {	
			// for each cell one hour !!!!			 
			this.scheduleView.unitWidth = this.element.offsetWidth;  
		} else { // take 8 hours a day
			this.scheduleView.unitWidth = this.element.offsetWidth / 8;  
		}
		
	},
	
	// render the cell element
	render: function(container) {
		if (container !== undefined) this.container = container;	
			
		this.element = this.container.appendChild(document.createElement("div")); 
		Dom.addClass(this.element, "cell");						
		this.resize();
				 
		// render all entries for thi cell
		for (var i=0; i<this.entries.length; i++) {
			if (this.appendEntries == "container"){
					this.entries[i].entryRenderer.render(this.container);
			}else{
					this.entries[i].entryRenderer.render(this.element);	
			}		
		}
	
		
			
		/*
		if (this.startHour != null && this.endHour != null) {			
			var width = 100 / (this.endHour - this.startHour + 1);		
			for (var i=this.startHour; i<=this.endHour; i++) {
				var div = this.element.appendChild(document.createElement("div")); 
				Dom.addClass(div,"cell");
				Dom.setStyle(div, "width", width + "%");				
			}
		}*/
	},
	
	
	destroyAllEntries: function() {
		/*for (var i=0; i<this.entries.length; i++) {
			var entry = this.entries[i];			
			this.entries.splice(i,1); 	
		}*/
		
		for (var i=0; i<this.entries.length; i++) {
			// if (this.entries[i].constructor == AFM.planboard.Assignment)			
				this.entries[i].destroy();	
		}
		
		this.entries = []; // make sure this is empty !
		this.refresh();
	},
	
	destroy: function() {
		// don't destroy entries !!!! This is done by the controller
		/* for (var i=0; i<this.entries.length; i++) {
			this.entries[i].destroy();
		}*/
		
		/* if (this.element.firstChild)
			this.element.removeChild(this.element.firstChild);*/
		
		if (this.element.parentNode)
			this.element.parentNode.removeChild(this.element);
		
		// this.entries = []; // empty the array
		
		for (var key in this) {
			delete this[key];
		}
		
	},
	
	toString: function() {
		return "Cell " + this.startDate;
	}	
	
});



/**
 * Schedule entry renderer class.
 * 
 * Displays element on the planning board representing an entry or assignment to a resource.
 * 
 * When a resource layout is used a reference to 
 * 
 */
AFM.planboard.EntryRenderer = Base.extend({	
		title: "",
		text: "",
		className: null, // default css class
		width: null,
		height: null,	
		container: null, // reference to cell container	
		region: null, // drag and drop region 
		
		// resourceGroupContainer: null, // use this to constraint boundary			
		// entryCell: null,  // reference to the cell renderer
	
		element: null,		// DOM element
		
		scheduleView: null,
		scheduleEntry: null, // reference to the scheduleEntry data object
		
		dd: null,			// drag and drop object
		ddGroup: "default", // override with trade code
		boundary: null, 	// region for boundary
		tickSize: 10, 
		
		standardDuration : 8, // 
		minWidth: 20,
		
		editable: true, // default true, draggable object
		
		constructor: function(scheduleEntry, config) {					
			if (scheduleEntry != null) { 
				this.scheduleEntry = scheduleEntry;
				this.scheduleView = this.scheduleEntry.scheduleView;
		 
			} else {
				alert("no schedule entry in constructor")
			}
				
			if (config !== undefined) {
				if (config.className !== undefined) this.className = config.className;  
				if (config.editable !== undefined) this.editable = config.editable;  
			}
			 
		},	
		
		// set cell container element
		setContainer: function(container) {		
			this.container = container;
				
			if (this.element != null) {
				if (this.element.parentNode)
					this.element.parentNode.removeChild(this.element);	
				this.container.appendChild(this.element);	
				Dom.setXY(this.element, Dom.getXY(this.container) );
			}			
		},
		
		/**
		 * listeners change when the property entry cell is changed
		 * when events are fired the list in entry cell is updated
		 */
		setEntryCell: function(cell) {			
			this.entryCell = cell; 
			
			if (this.entryCell.appendEntries == "container") {
				this.setContainer(cell.container);	
			} else {
				this.setContainer(cell.element);	
			}					 					
		},
		
		/**
		 * Refresh the DOM element after a change event. 
		 * 
		 * The text and tooltip can be changed. The width can change if duration has been changed.		 * 
		 * When placement is absolute, the left position should be updated.
		 */
		refresh: function() {
			
	 		this.element.setAttribute("title",  this.getTitle() );
			this.element.innerHTML = this.getText();			
			 	
			// set the width of element, for daily view this can be more than the cell
			var style = this.scheduleEntry.resource.resourceContainer.style;
			// the container can be the cell element or the resource content container
			var cellWidth = this.container.offsetWidth;
			
			if (style.interval == DateMath.HOUR) {				
				var width = this.scheduleEntry.duration*cellWidth; 
				Dom.setStyle(this.element, "width", width + 'px');				
			} else { // if (style.interval == DateMath.HOUR) {	 
				var unitWidth = cellWidth / this.standardDuration;				
				var width = this.scheduleEntry.duration*unitWidth;				 
				Dom.setStyle(this.element, "width", (width < this.minWidth ? this.minWidth-1 : width-1) + 'px' );	
			}	
		},
		
		// tooltip title tag content
		getTitle: function() {
			var wr = this.scheduleEntry.workRequest; 
			if (wr == null) return "";
			if (this.editable)
				return wr.getProperty("wr.wr_id")+ " - " + wr.getProperty("wr.prob_type")+ " - " + this.scheduleEntry.getProperty("wrcf.scheduled_from_tr_id")+ " - " + wr.getProperty("wr.site_id")+ " - " + wr.getProperty("wr.description").substr(0,40)
			else 
				return wr.getProperty("wr.wr_id");
		},
		
		// inner HTML text
		getText: function() {
			var wr = this.scheduleEntry.workRequest;
			if (wr == null) return "";
			var wr_id = String(wr.getProperty("wr.wr_id"));
			if (wr_id.length > 3)
				wr_id = wr_id.substr(wr_id.length-3, wr_id.length);
			if (this.editable)
		 		return (wr_id + "-" + wr.getProperty("wr.prob_type") );
		 	else 
				return wr_id;
		},
		
		/*
		 * Create the DOM element for this entry.
		 * 
		 * Drag and drop object AFM.planboard.DDEntry is created for each entry.
		 * Both mouse buttons are enabled. The left mouse is captured in the DD for 
		 * displaying the context menu.
		 * 
		 * A drag and drop group can be used when entries are restricted for a certain trade.
		 * Entries cannot be moved to another trade. Default entries can be moved to other trades.
		 *  
		 */
		render: function(container) {		
			if (container !== undefined) this.container = $(container);
			
			if (this.container == null){
				var entryCell = this.scheduleEntry.resource.resourceContainer.getCell(this.scheduleEntry.startDate);
				if (entryCell.appendEntries == "container") {
					this.setContainer(entryCell.container);	
				} else {
					this.setContainer(entryCell.element);	
				}	
			}
			
			// if already rendered
			if (this.element != null) {
				if (this.element.parentNode)
					this.element.parentNode.removeChild(this.element);				
				this.container.appendChild(this.element);
				
			} else {								
									 
				this.element = this.container.appendChild(document.createElement("div"));	 
				
				Dom.addClass(this.element, "entry"); // default css 
				if (this.className != null) {
					Dom.addClass(this.element, this.className); // status css 
				}				
				
				// this means this entry is one of my tasks !
				if (this.editable) {
						Dom.addClass(this.element, "edit");  						
						Event.addListener(this.element, "dblclick", this.displayEditForm, this, true);
						
						var config = {
							primaryButtonOnly: false, // both buttons
							maintainOffset: true,
							scroll: false				
						};
						this.dd = new AFM.planboard.DDEntry(this, this.ddGroup, config);						 
		        		
				} else {
						Dom.addClass(this.element, "readOnly");  					
						if (! this.element.id) this.element.id = Dom.generateId(); 						
						// Event.addListener(this.element, "dblclick", this.showEntryInfo, this, true);		 			
				}
		         							
			} // end if if (this.element == null) {
			
			this.refresh();	 		 	
		},	
		
		/**
		 * The context menu is singleton object.
		 */
		onContextMenuShowClick: function(p_sType, p_aArgs) {
			// alert(p_sType); shows click			 
			var task = p_aArgs[1];
			
			if (task) {				
				switch(task.index) { 
					case 0:
						this.showEntryInfo();	 						 
					break;					 		
				}							
			} // end if			
			
		},		
		
		onContextMenuClick: function(p_sType, p_aArgs) {
			// alert(p_sType); shows click			 
			var task = p_aArgs[1];
			
			if (task) {
				switch(task.index) { 
					case 0:
						this.displayEditForm();	 						 
					break;
					case 1:
						this.scheduleEntry.remove();
					break;
					case 2:
						this.scheduleEntry.split();						
					break;	
					case 3:
						this.showEntryInfo();						
					break;				
				}							
			} // end if			
			
		},			 
		
		displayEditForm: function() {	
						
				var handlers = [ {button: AFM.planboard.EntryRenderer.SAVE_BUTTON, handler: this.saveEntry} ];
				this.entryForm = new AFM.planboard.EntryForm(AFM.planboard.EntryRenderer.EDIT_FORM, AFM.planboard.EntryRenderer.CONTROL_PANEL, handlers, this);
	
				this.entryForm.open(this.scheduleEntry.fieldValues);				
		},	
		
		saveEntry: function(e) {
			this.scheduleView.fireEvent("beforeChangeEntry", this.scheduleEntry); 
			
			var values = this.entryForm.getFieldValues();
					
			this.scheduleEntry.updateValues(this.entryForm.getFieldValues()); // also change data references	
			// this.scheduleEntry.updateId();	
			// add listeners to the events for closing this window					
			this.scheduleView.subscribe("changeEntry", this.entryForm.close, this.entryForm, true);
			this.scheduleView.subscribe("createEntry", this.entryForm.close, this.entryForm, true);
			
			// this.scheduleEntry.subscribe("rollback", this.entryForm.close);				
			this.scheduleEntry.validate();	
			
			// this.scheduleEntry.fireEvent("change", this.scheduleEntry); // save to database			 
			// this.entryForm.close();		
		},
		
		showEntryInfo: function(e) {
			// alert(this.scheduleEntry.startDate);
			// 
			
		}, 			
		
		hide: function() {
			if (this.element != null) {	
				Dom.setStyle(this.element, "display", "none");
			}
		},
					
		remove: function() {
			if (this.element != null) {	
				 // first delete from database
				 this.scheduleView.fireEvent("removeEntry", this.scheduleEntry);	
				 // clean up
				 this.destroy();	 
			} else {
				alert("no element")
			}
		},
		
		destroy: function() {
			// destroy the context menu
			if (this.contextMenu != null)
				this.contextMenu.destroy();				
				
			// clean up drag and drop
			if (this.dd != null)
				this.dd.destroy();
				
			if (this.entryForm != null) {
				this.entryForm.close(); 
			}
			
			if (this.element != null) {
				// remove element listeners
				Event.purgeElement(this.element);	
				// remove innerHTML
				while (this.element.firstChild)
					this.element.removeChild(this.element.firstChild);
						
				// remove dom element from parent node
				if (this.element.parentNode)
					this.element.parentNode.removeChild(this.element);
			}	
			
			// clean up references
			for(var key in this) {
				delete this[key];
			} 		
		},
		
		toString: function() {
			return "Renderer for " + this.scheduleEntry;
		}		
		
	
} , {
	// define constants, use these as id in view file 		
	/*
	 * 			<afmTableGroup type="form" format="editForm" id="edit_form">
	 * 			...
	 * 			<afmAction id="editFormSave" type="javascript" onclick="return false;"  >
					 <title translatable="true">Save</title>
				</afmAction>
	 */
	
	CONTROL_PANEL: "editPanel",
	EDIT_FORM : "edit_form",	
	SAVE_BUTTON : "editPanel_editFormSave_footer"
		
});
 

/**
 * This will display the dialog entry form. 
 * This will use a layer to display the form, not a popup window.
 * <p>
 * The form must be defined in the axvw file and set invisible
 * Buttons get handlers by using scripting, they are not hardcoded in the view file.
 * 
 * @param {String} formName
 * @param {String} controlPanel
 * @param {Array} handlers array of handlers (button: id and handler: event handler function)
 */

AFM.planboard.EntryForm = Base.extend({	
	formName: null,		
	controlPanel: null,	 
	handlers: null,
	scope: null,
	
	constructor: function(formName, controlPanel, handlers, scope) {
		this.formName = formName;	
		this.controlPanel = controlPanel;			
		this.handlers = handlers; // always click event handlers !
		this.scope = scope;
	},
	
	addHandler: function(button, handler) {
		Event.addListener(button, "click", handler, this.scope, true);	
	},
	
	removeHandler: function(button, handler) {
		if (handler !== undefined)
			Event.removeListener(button, "click", handler);
		else
			Event.purgeElement(button);
	},
	
	getFieldValues: function() {
		var frm = View.panels.get(this.controlPanel);	
		return frm.getFieldValues();
	},
	
	/**
	 * Open and display the form.
	 * The fieldValues contain all form fields to be set.
	 * 
	 * @param {Object} fieldValues 
	 * 
	 */
	open: function(fieldValues) {
		
		var panel = View.panels.get(this.controlPanel);	
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('wrcf.wr_id',fieldValues["wrcf.wr_id"],'=');
				
		panel.refresh(restriction);
		panel.show(true);
		
		panel.showInWindow({
			x: 300,
			y: 300, 
			width: 800,
			height: 300,
            closeButton: false
        });
		
		// set again to ensure the valid parameters,especially the record was not
		// saved before.
		for (var name in fieldValues) {
	    	var value = fieldValues[name];
	    	if (panel.containsField(name)) {
				//Guo Jiangtao change to fix KB3027208 according YS's comments
	    		if('wrcf.hours_est' == name){
	    			panel.setFieldValue(name,panel.fields.get(name).fieldDef.formatValue(value+"", true));
	    		}else{
	    			panel.setFieldValue(name,value);
	    		}
	    			 
	    	}
	    }
	    
		// add listeners	
		for (var i=0; i< this.handlers.length; i++) {
			this.addHandler(this.handlers[i].button, this.handlers[i].handler);
		}  								 						 
	},
	
	/**
	 * Close and hide the form window
	 */
	close: function() {
		
		var frm = View.panels.get(this.controlPanel);	
		
		frm.closeWindow();
		// clean up listeners
		for (var i=0; i< this.handlers.length; i++) {
			this.removeHandler(this.handlers[i].button, this.handlers[i].handler);
		}  			 	
	} 
		
}); 



/**
 * The schedule entry is an abstract class for entries on the planning board.
 * 
 * The work request 
 * 
 */
AFM.planboard.ScheduleEntry = AFM.planboard.RecordObject.extend({	
	
	scheduleView : null,
	workRequest: null,
	
	task : null,
	
	resource : null, 
	startDate : null,
	duration : null,	
		
	entryRenderer : null,	
	
	editable: true,
	
	constructor: function(id, values, isNewRecord, scheduleView, workRequest, task, resource, editable) { 		
		this.inherit(id, values, isNewRecord); 
		
		if (scheduleView !== undefined) this.scheduleView = scheduleView; 
		if (task !== undefined) {
			this.task = task;		 
		}	 
		if (workRequest !== undefined) this.workRequest = workRequest;	 
		if (resource !== undefined) this.resource = resource;			
		if (editable !== undefined) this.editable = editable;
 
		
		/**
		 * create entry renderer here
		 * 
		 */
		 
		var config = {
			className: this.getStatus(),
			editable: this.editable
		}; 		
		 
		this.entryRenderer = new AFM.planboard.EntryRenderer(this, config);
	 
	},
	
	/**
	 * The set data should be called after the constructor.
	 * Or when changing values:
	 * 
	 * <ul>
	 * 		<li>Assign it to another resource</li>
	 * 		<li>Changing the start date and time.</li>
	 * 		<li>Changing the duration.</li>
	 * </ul>
	 * 
	 * The field values will also be updated.
	 * 
	 * Before saving it, it must be validated, using the validate() method.	 * 
	 *  
	 */
	setData: function(resource, startDate, duration) {
		this.setResource(resource);
		this.setStartDate(startDate);
		this.setDuration(duration); 
	}, 	 
	
	setTask: function(task) {
		this.task = task;
	}, 
	
	setDuration: function(duration) {
		this.duration = duration;	
	},
	
	getDuration: function() {
		return this.duration;	
	},
	
	getStartDate: function() {
		return this.startDate;
	},	
	
	/**
	 * Get the status of this entry, this is the value of the work request status
	 */
	getStatus: function() {
		if (this.workRequest != null) {
			return this.workRequest.getProperty("wr.status");
		} else {
			return "";
		}
	},
		
	/**
	 * listeners change when the property entry cell is changed
	 * when events are fired the list in entry cell is updated
	 */
	setResource: function(resource) {
		if (resource !== null && resource !== undefined) {
			this.resource = resource; 		
		}		
	},
	
	/**	
	 * set renderer object
	 */
	setRenderer: function(renderer) {
		this.entryRenderer = renderer;
	},
	
		
	/**
	 * When updating the renderer, the entry cell is set
	 */
	updateRenderer: function() { 
		if (this.entryRenderer != null) {
			var cell = this.resource.resourceContainer.getCell(this.startDate) ;	
			if (cell == null) { 
				this.entryRenderer.hide();  // the element is outside the schedule dates
			}		
		} else {
			alert("no renderer");
		}		
	},
	
	 
	destroy: function() {
 
		if (this.entryRenderer != null)	 
			this.entryRenderer.destroy(); 
		
		for (var key in this) {
			delete this[key];
		}  
	},
 
	remove: function() {
		this.scheduleView.fireEvent("removeEntry", this);		 
	},
	
	// default split in half
	split: function() {
		
		this.scheduleView.fireEvent("beforeChangeEntry", this); 		
		var newDuration = this.duration / 2;				
		this.setDuration(newDuration); // change the current duration				
			
		// make safe copies of id and values		
		var id = {};
		for (var key in this.id) {
			id[key] = this.id[key];
		}
		var values = {};
		for (var key in this.fieldValues) {
			values[key] = this.fieldValues[key];
		}
		// make a clone object and new record marked as true !		 
		var newEntry = new this.constructor(id, values, true, this.scheduleView, this.workRequest, this.task);	
				
		// create start date for new entry 
		var newStartDate = new Date(); // make sure we make a safe copy of the date
		newStartDate.setTime(this.startDate.getTime());		 	
		var hours = newStartDate.getHours() + parseInt(newDuration, 10);	
		var minutes = newStartDate.getMinutes() + parseInt( (newDuration-parseInt(newDuration, 10))*60/100  );	
		newStartDate.setHours(hours, minutes);  
		
		// update with reference objects, which will update the values 	
		newEntry.setData(this.resource, newStartDate, newDuration);	
		newEntry.updateId(); // update primary key
		
		var config = {
			className: this.getStatus(),
			editable: true
		}; 
		newEntry.setRenderer(new AFM.planboard.EntryRenderer(newEntry, config));
		
		// fire events 		
		this.scheduleView.fireEvent("changeEntry", this); 
		this.scheduleView.fireEvent("createEntry", newEntry);		
	},
	
	render: function(container) {		
		if (this.entryRenderer != null)
			this.entryRenderer.render();	// render or refresh !!!!
		else 
			alert("no renderer")
	}, 
	
	/**
	 * Validate the schedule entry 
	 * <ul>
	 * 		<li>Check available time for this day</li>
	 * 		
	 * </ul>
	 */
	validate: function() {
		var warnings = [];
		var errors = [];
		
		/**
		 * check for errors first
		 */
	
		
		var entryCell = this.resource.resourceContainer.getCell(this.startDate);	
		if (entryCell != null && entryCell.entryExists(this) ) {				
			return false;
		} 		
					
		// check if this is a service window day and check duration			
		var serviceWindowHours = this.workRequest.serviceWindow.getAvailableTime(this.startDate);
			
		if (serviceWindowHours <= 0) {
			errors.push($_('validateWorkingDay', AFM.planboard.DateUtil.getIsoFormatDate(this.startDate) ));
		} else if (this.duration > serviceWindowHours) { 
			errors.push($_('validateServiceWindowStartEndTime', this.workRequest.serviceWindow.getStartTime(), this.workRequest.serviceWindow.getEndTime() ));			
		} else if (! this.workRequest.serviceWindow.checkTimes(this.startDate, this.duration) ) { // check against service window start and end time 		
			errors.push($_('validateServiceWindowStartEndTime', this.workRequest.serviceWindow.getStartTime(), this.workRequest.serviceWindow.getEndTime() ));			
		} else if (this.duration <= 0) { 
			errors.push($_('validateDuration')); 
		}
			 
		
		// check for warnings
		
		if (entryCell != null && this.resource.getStandardHours() > 0) {
			var entryCellDuration = 0;
			for (var i=0; i<entryCell.entries.length; i++) {
				entryCellDuration += entryCell.entries[i].duration; 
			}   
			if (this.duration + entryCellDuration > this.resource.getStandardHours()) {
				// alert("More than Standard Available Hours for this day, do you want to override?");
				warnings.push( $_('validateStandardHours', this.duration) );
				// return false; // do not make an entry
			}	
		} 		 
		 
		// get the escalation date for this work request. 
		var escalationDate = this.workRequest.getEscalationDateCompletion();		
			
		if (escalationDate != null) {
			var date = new Date();
			// estimate the completion date, this could be replaced by an ajax request.
			date.setTime(this.startDate.getTime() + this.duration*60*60*1000);
			if (date > escalationDate) {
				warnings.push( $_('validateEscalation', AFM.planboard.DateUtil.getIsoFormatDate(escalationDate) ) )
			}				
		}				
	 	
	 	// check if we have to use holidays		
		if (this.workRequest.useHolidays() && this.scheduleView.isHoliday(this.startDate)) {
			warnings.push( $_('validateHoliday') );		 			 
		}		 
		
		if (errors.length == 0 && warnings.length == 0) {
			if (this.scheduleView.debug)
				Log("Fire event for entry save");
			
			if (this.isNewRecord){
				this.scheduleView.fireEvent("createEntry", this); 
				// try planning the rest of the task
				this.doTaskPlanning();
				
			}else{	
				this.scheduleView.fireEvent("changeEntry", this); 
			}			
			return true;
		}	
		
		// we have warnings or errors
		var dialog = new YAHOO.widget.Dialog("confirmDialog", 
			{ 
			  width: "500px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  draggable: false
			 } );
		
		// var dialog = this.scheduleView.confirmDialog;
		// when errors 
		if (errors.length > 0) {				
			// alert(errors.length + " errors")
			dialog.setHeader($_('validateErrors'));
			// set body content
			dialog.setBody(errors.join('<br/>'));
			
			dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_ALARM);	
  		   
	    	dialog.cfg.queueProperty("buttons", [ { text: $_('validateOk'), 
					handler: {fn: this.confirmErrors, obj: dialog, scope: this} } ]);  				
			 
		// when warnings, the user can override	
		} else { 
				
			dialog.setHeader($_('validateWarnings'));		
			dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
			
			// set body content 
			dialog.setBody(warnings.join('<br/>'));				
			dialog.cfg.queueProperty("buttons", [ { text:$_('validateYes'), 
					handler: {fn: this.overrideWarnings, obj: dialog, scope: this},
					isDefault:true },
				  { text:$_('validateNo'), 
				  	handler: {fn: this.confirmWarnings, obj: dialog, scope: this} } ]);  
		}
		
		dialog.render(document.body);		
		dialog.show();
		return false;		 	
	},
	
	// workaround a 'bug' in dialog destroy method 
	destroyDialog: function(dialog) {
		YAHOO.widget.Dialog.superclass.destroy.call(dialog);  
		 
		var panel = $("confirmDialog_c"); 
		if (panel != null ) panel.parentNode.removeChild(panel); 	
		panel = $("confirmDialog_mask"); 
		if (panel != null) panel.parentNode.removeChild(panel); 	
	}, 
	
	confirmErrors: function(e, dialog) {		 
		this.destroyDialog(dialog);  
			
		if (this.isNewRecord) {		// this is created from a task		
			if (this.scheduleView.debug)
				Log("Comfirm errors, fire destroy");
			this.scheduleView.fireEvent("destroyEntry", this);				
			
			// try planning the rest of the task
			this.doTaskPlanning();
		} else {		
			if (this.scheduleView.debug)
				Log("Comfirm errors, fire rollback");	
			this.scheduleView.fireEvent("rollback", this);	
		}		   
		return false;
	},
	
	overrideWarnings: function(e, dialog)	{	 
		this.destroyDialog(dialog);
	 
		if (this.scheduleView.debug)
			Log("Fire event for entry save");
			
		if (this.isNewRecord) { // this is created from a task		
			this.scheduleView.fireEvent("createEntry", this); 	
			
			// try planning the rest of the task 	
			this.doTaskPlanning();
			
		} else { 
			this.scheduleView.fireEvent("changeEntry", this); 	
		}	
		 
	},
	
	confirmWarnings: function(e, dialog)	{
		// dialog.hide(); 	dialog.removeMask();
		this.destroyDialog(dialog);
		
		if (this.scheduleView.debug)
			Log("Comfirm warnings, fire destroy/rollback");
			
		if (this.isNewRecord) {				
			this.scheduleView.fireEvent("destroyEntry", this);	 
			this.doTaskPlanning();
			
		} else {			
			this.scheduleView.fireEvent("rollback", this);	
		}	 
		 
	},
	
	doTaskPlanning: function() {
		if (this.task != null && this.task.getRemainingHours() > 0) {				
			var startDate = DateMath.add(this.startDate, DateMath.DAY, 1); // 
			// only plan to dates displayed in this layout
			if (startDate > this.scheduleView.endDate) return;
			
			if (this.scheduleView.debug) 
					Log("New Start "+ startDate);
					
			var serviceWindowHours = this.workRequest.serviceWindow.getAvailableTime(startDate);
			var standardHours = this.resource.getStandardHours() > 0 ? this.resource.getStandardHours() : 8;	
			
			// the duration is minimum of three 						
			var duration = Math.min(standardHours, serviceWindowHours); 
			var duration = Math.min(duration, this.task.getRemainingHours()); 			
	   		
			var entry = this.scheduleView.createEntry(this.resource, startDate, duration, this.workRequest, this.task);
		
			entry.validate(); 	
		}		
	}
});


/**
 * 
 */
AFM.planboard.Assignment = AFM.planboard.ScheduleEntry.extend({
	tableName : 'wrcf',	
	
	// references to work request adn task
	constructor: function(id, values, isNewRecord, scheduleView, workRequest, task, resource, editable) { 		
		this.inherit(id, values, isNewRecord, scheduleView, workRequest, task, resource, editable);  
	},
	
	setResource: function(resource) {
		if (resource !== null && resource !== undefined) {
			this.inherit.call(this, resource);
			// update the entry with new cf_id
			this.setProperty("wrcf.cf_id", resource.getProperty("cf.cf_id") );			 		
		}		
	},
	
	setDuration: function(duration) {
		if (duration > 0) {			 
			this.inherit.call(this, duration);
			//KB3039792 - set wrcf.hours_est value to 2 decimals to avoid WFR error when remove the assignment with integer value of hour_est
			this.setProperty("wrcf.hours_est", parseFloat(duration).toFixed(2) );
		}		
	},
	
	setStartDate: function(startDate) {
		this.startDate = startDate; 
		// set property values before saving   		 	
		this.setProperty("wrcf.date_assigned", AFM.planboard.DateUtil.getIsoFormatDate(startDate) );	
		this.setProperty("wrcf.time_assigned", AFM.planboard.DateUtil.getIsoFormatTime(startDate) );		
	},
	
	// override updateData
	updateData: function() {
		this.duration = parseFloat(this.getProperty("wrcf.hours_est"));
		var date_assigned = this.getProperty("wrcf.date_assigned");
		
	    this.startDate = AFM.planboard.DateUtil.convertIsoFormatToDate(this.getProperty("wrcf.date_assigned"), this.getProperty("wrcf.time_assigned") ); ;
		// lookup new resource in scheduleView 		 
		this.setResource( this.scheduleView.getResource({"cf.cf_id": this.getProperty("wrcf.cf_id") }) ); 
		
		if (this.scheduleView.debug) {
			Log("Duration " +  this.duration);	
			Log("Start " +  this.startDate + date_assigned);	
		}	
	}	
});

