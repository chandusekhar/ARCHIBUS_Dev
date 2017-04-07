 

/**
 * Drop container for a resource. There is one drop target for each resource.
 * Entry cells can be defined to hold entries.
 */
AFM.planboard.DDContainer = Base.extend({		
	resource: null,
	resourceContainer: null, // we can gte the resource from this
	scheduleView: null,
	
	constructor: function(resource, scheduleView, element, sGroup, config) {
		this.resource = resource;
		this.scheduleView = scheduleView; // reference to the scheduleView, to find start date
	 
		this.init(element, sGroup, config); // this will register in default group			
	},
	
	destroy: function() {		
		this.unreg();		
		
		for (var key in this) {
			delete this[key];
		}		
	}
	
});

/**
 * to extend from drag and drop we augment the class
 */
YAHOO.augment(AFM.planboard.DDContainer, YAHOO.util.DDTarget);

/**
 * This is the base class for drag and drop elements
 * When drag starts always set on top body
 * On Invalid Drop return to original position and container start node
 */
AFM.planboard.DDBase = Base.extend({	 	
	assigned: false,
	scheduleView: null,
	
	constructor: function(element, sGroup, config) {		 
		this.init(element, sGroup, config);		
	},		
	
	
	startDrag: function(e) {
		 var el = this.getEl(); // div element 	 
		 this.startNode = el.parentNode; // remember the original position
		 
		 el.parentNode.removeChild(el);		 
		 
		 // document.body.insertBefore(el, body.firstChild); // set on top	
		 document.body.appendChild(el); 	
		 
		 this.setDelta(2, 5);
	},	
	 
	onDragDrop: function(e, id) { 	 	 
	    // id refers to the drop container       
	    var dropContainer = YAHOO.util.DragDropMgr.getDDById(id);          
	    this.scheduleView = dropContainer.scheduleView;
	
	    var el = this.getEl(); // div element   
	    
	     // get the location of the click
	    var pos = Event.getXY(e); // mouse coordinates
	    	        
	    // get cell elements from drop container, only working days                                                       
	    var cellElements = Dom.getElementsByClassName("cell", "div", id);    
	    
	    var index=0;  this.assigned = false; 
	    while (index<cellElements.length && ! this.assigned) {
	    	var region = Dom.getRegion(cellElements[index]);      
	    	
	   		if (pos[0] > region.left && pos[0] < region.right && pos[1] > region.top && pos[1] < region.bottom) {     
		this.setNewPosition(el, dropContainer, index); break;
	   		}
	    	
	    	index++;
	    }
	    // when invalid 
	    this.resetLocation(this.assigned);	     
        Event.stopEvent(e);     	        
	},
		
	resetLocation: function(reset) { 			
		this.startNode.appendChild( this.getDragEl() );
		
		Dom.setX(this.getDragEl(), this.startPageX);
		Dom.setY(this.getDragEl(), this.startPageY);
	},

	onInvalidDrop:  function(e) {	 
		this.resetLocation(false);	 
	},		
	
	destroy: function() {		
		this.unreg(); // make sure we destroy the drag and drop
		
		for (var key in this) {
			this[key] =  null;
		}
		
	},
	
	 
	/**
	 * Create Entry. 
	 * 
	*  the task can be NULL for dummy tasks
	*  after creating an entry, the validate function should be called.
	*  When invalid, a destroy event should be fired !
	 * 
	 * This function create a schedule entry from data references.
	 * 
	 * @param resource
	 * @param startDate
	 * @param duration
	 * @param workRequest
	 * @param task 
	 * 
	 */
	createEntry : function(resource, startDate, duration, workRequest, task) {		
		var scheduled_from_tr_id;
		if (task != null) {
			scheduled_from_tr_id = task.getProperty("wrtr.tr_id");
		} else {
			scheduled_from_tr_id = resource.getProperty("cf.tr_id");
		}	
			 			
		var id = {"wrcf.wr_id": workRequest.getProperty("wr.wr_id"), "wrcf.cf_id": resource.getProperty("cf.cf_id"),
		"wrcf.date_assigned": AFM.planboard.DateUtil.getIsoFormatDate(startDate), 
		"wrcf.time_assigned" : AFM.planboard.DateUtil.getIsoFormatTime(startDate) };
		var values = {"wrcf.wr_id": workRequest.getProperty("wr.wr_id"), "wrcf.cf_id": resource.getProperty("cf.cf_id"),
		"wrcf.date_assigned": AFM.planboard.DateUtil.getIsoFormatDate(startDate), 
		"wrcf.time_assigned" : AFM.planboard.DateUtil.getIsoFormatTime(startDate),
		"wrcf.hours_est": duration, "wrcf.scheduled_from_tr_id": scheduled_from_tr_id , "wrcf.work_type" : "W", "wrcf.comments" : ""};	
		
		// this is a new record
		var newEntry = new AFM.planboard.Assignment(id, values, true, this.scheduleView, workRequest, task);							
		newEntry.setData(resource, startDate, duration);	
		newEntry.updateId();  
		
		var config = {
			className: newEntry.getStatus(),
			editable: true
		}; 
		newEntry.setRenderer(new AFM.planboard.EntryRenderer(newEntry, config));
	 		
		return newEntry;  	
	}	
	
});
YAHOO.augment(AFM.planboard.DDBase, YAHOO.util.DD);
 


/**
 * DDTask is a drag object for a task to be planned.
 * The task is an estimation for a specific problem and trade (resource group).
 * 
 * A task can be dropped on all targets or can be restricted to targets belonging
 * to the resource group (craftspersons belonging to a trade).
 * 
 * When a task is dropped on a target and is planned, the style of the task in the 
 * task navigator tree will change, marking this task is planned. 
 * 
 */
// DDProxy element
AFM.planboard.DDTask = AFM.planboard.DDBase.extend({		
	workRequest: null,
	task: null,	 
	standardHours: 8, // standard hours per day
	startWidth: 200,
	minWidth: 32,
	
	constructor: function(workRequest, task, element, sGroup) {
		this.workRequest = workRequest;		
		this.task = task;		
		
		var config = {
			dragElId: "html_x",
			resizeFrame: false,
			scroll: false
		};
		this.inherit(element, sGroup, config);		
	}, 
	
	startDrag: function(e) {
		this.inherit.call(this);
			
		var totalDuration = this.task.getRemainingHours() > 0 ? this.task.getRemainingHours() : this.standardHours; 			
		var width = totalDuration * this.workRequest.scheduleView.unitWidth;
					
		Dom.setStyle(this.getEl(), "width", width + "px" );
	},
 
	// override to modify class
	resetLocation: function(reset) { 	
		if (reset) {
		}		
		Dom.setStyle(this.getDragEl(), "width", this.startWidth +"px")
		this.inherit.call(this); 
	},
	  
	setNewPosition: function(el, dropContainer, index) {
		// get craftsperson from drop container
		var resource = dropContainer.resource;	
				
		// get reference to scheduleView from drop container
		this.scheduleView = dropContainer.scheduleView;		
	  	// calculate date_asigned using scheduleView and index cell, every cell is a day
	 			
	 	var startDate;		
	 			
	 	var style = resource.resourceContainer.style;
		// for hour intervals there is only one date (day view)		
		
		if (style.interval == DateMath.HOUR) {		
			startDate = DateMath.add(this.scheduleView.startDate, DateMath.HOUR, index);	
		} else {
			startDate = DateMath.add(this.scheduleView.startDate, DateMath.DAY, index);	 						
			var startTime = this.workRequest.serviceWindow.startTime; // string format HH:mm.ss.SSS			
			startDate = AFM.planboard.DateUtil.addTimeToDate(startDate, startTime);	
		}		
		
		if (this.task.duration <= 0) {
			this.assigned = false;
			return false;		
		}		
	
		// we should take the remaining task (hours_est-hours_sched)
		var standardHours = resource.getStandardHours() > 0 ? resource.getStandardHours() : this.standardHours;			 
		var totalDuration = this.task.getRemainingHours() > 0 ? this.task.getRemainingHours() : standardHours; 		
						
		do  { 						
			// lookup for a working day in the service window
			var serviceWindowHours = this.workRequest.serviceWindow.getAvailableTime(startDate);
			// the duration is minimum of three 			 
			
			if (serviceWindowHours == null) serviceWindowHours = standardHours;
								
			var duration = Math.min(standardHours, serviceWindowHours); 
			duration = Math.min(duration, totalDuration); 		
							
		   //resorce, startDate, duration, workRequest, task 
		     
		   if (style.interval == DateMath.HOUR) {		
		   		var endTime = this.workRequest.serviceWindow.endTime;     // string value
		    	var endDate = AFM.planboard.DateUtil.addTimeToDate(this.scheduleView.startDate, endTime);	
		 
		    	var hoursDiff = ( endDate.getTime() - startDate.getTime() ) / (1000*60*60);
		    	if (hoursDiff != null && hoursDiff > 0)
		   			duration = Math.min(duration, hoursDiff); 
		    }	
		    
		    if (this.scheduleView.debug) 
					Log("Entry Duration "+ duration);
		 
			var entry = this.scheduleView.createEntry(resource, startDate, duration, this.workRequest, this.task);
			
			if ( entry.validate() ) {				
				totalDuration = totalDuration - duration;
				if (this.scheduleView.debug) 
					Log("Total Duration "+ totalDuration);
				this.assigned = true;		
			} else {
				// showing confirmation or error, destroy fired ? 
				this.assigned = false;		
				return false; // stop the loop 
			} 	
			 
			// go to next day
			startDate = DateMath.add(startDate, DateMath.DAY, 1); // 
			if (this.scheduleView.debug) 
					Log("New Start "+ startDate);	
					
		} while (totalDuration > 0 && startDate < this.scheduleView.endDate);	 			 			
		
		return 	this.assigned;	
	}
	
});
YAHOO.augment(AFM.planboard.DDTask, YAHOO.util.DDProxy);

/**
 * Create dummy task when there is no estimation.
 * 
 * A new task can be dragged and dropped on the planning board.
 * A popup window will show up for entering the hours and start time.
 * 
 * 
 *  
 */
AFM.planboard.DDDummyTask = AFM.planboard.DDBase.extend({	
	workRequest: null,
	standardHours: 8, // standard hours per day
	
	constructor: function(workRequest, element, sGroup) {
		this.workRequest = workRequest;		
		
		var config = {
			dragElId: "html_x", // is there a drag element
			resizeFrame: false,
			scroll: false 
		};
		
		this.inherit(element, sGroup, config);
		 
	},	 
	
	startDrag: function(e) {
		this.inherit.call(this);		 
	},
	  
	/**
	 * After getting the cell index, try scheduling the task.
	 * 
	 * 
	 */
	setNewPosition: function(el, dropContainer, index) {
		// var dropContainer = YAHOO.util.DragDropMgr.getDDById(id); 		 	
		var resource = dropContainer.resource; 		
		this.scheduleView = dropContainer.scheduleView; // save for later
	
		var handlers = [ {button: AFM.planboard.EntryRenderer.SAVE_BUTTON, handler: this.saveEntry} ];
		this.entryForm = new AFM.planboard.EntryForm(AFM.planboard.EntryRenderer.EDIT_FORM, AFM.planboard.EntryRenderer.CONTROL_PANEL, handlers, this);
			
		var startDate;
		var style = resource.resourceContainer.style;
		// for hour intervals there is only one date (day view)
		startDate = DateMath.add(this.scheduleView.startDate, style.interval, index);	
		
		if (style.interval != DateMath.HOUR) {				 
			var startTime = this.workRequest.serviceWindow.startTime; // string format HH:mm	
			startDate = AFM.planboard.DateUtil.addTimeToDate(startDate, startTime);
		} 	
		
		var dayHours = this.workRequest.serviceWindow.getAvailableTime(startDate);	
		
		var standardHours = resource.getStandardHours() > 0 ? resource.getStandardHours() : this.standardHours;	
		dayHours = Math.min(dayHours, standardHours); 				
				
		if (isNaN(dayHours) || dayHours == 0.00) {
				
			var dialog = new YAHOO.widget.Dialog("confirmDialog", 
			{ 
			  width: "500px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  draggable: false
			 } );
			
			dialog.setHeader($_('validateErrors'));
			// set body content
			dialog.setBody($_('validateWorkingDay', AFM.planboard.DateUtil.getIsoFormatDate(startDate) ) );			
			dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_ALARM);	
  		   
	    	dialog.cfg.queueProperty("buttons", [ { text: $_('validateOk'), 
					handler: {fn: function(e, dialog) {
						YAHOO.widget.Dialog.superclass.destroy.call(dialog);  		 
						var panel = $("confirmDialog_c"); 
						if (panel != null ) panel.parentNode.removeChild(panel); 	
						panel = $("confirmDialog_mask"); 
						if (panel != null) panel.parentNode.removeChild(panel); 
						
					}, obj: dialog} } ]);  		
			
			dialog.render(document.body);		
			dialog.show();
			
			return;
		}		
		
		/** default hours is the available service hours **/				
		var fieldValues = {"wrcf.wr_id": this.workRequest.getProperty("wr.wr_id"), 
							"wrcf.cf_id" : resource.getProperty("cf.cf_id"),
							"wrcf.date_assigned": AFM.planboard.DateUtil.getIsoFormatDate(startDate), 
							"wrcf.time_assigned" : AFM.planboard.DateUtil.getIsoFormatTime(startDate),
							"wrcf.comments" : "", "wrcf.hours_est": dayHours
							};		
							
		this.entryForm.open(fieldValues);		
	},
	 
	
	/**
	 * When clicking on the form a new entry is created.
	 * Calls the validate before saving.
	 */
	saveEntry: function() {
		// create and save entry ... 		 		
		var values = this.entryForm.getFieldValues(); // also change data references	
		this.entryForm.close();	
			
		var resource = this.workRequest.scheduleView.getResource({"cf.cf_id": values["wrcf.cf_id"]});	
		var startDate = AFM.planboard.DateUtil.convertIsoFormatToDate(values["wrcf.date_assigned"], values["wrcf.time_assigned"]   ); ;
		var duration = parseFloat(values["wrcf.hours_est"]);	
			
		// task = null for dummy task 
		var entry = this.workRequest.scheduleView.createEntry(resource, startDate, duration, this.workRequest, null);
		if (entry == null) return false;
		
		// KB3024960
		entry.updateValues(this.entryForm.getFieldValues()); 
		
		this.assigned = entry.validate(); 		  	
	},
	
	resetLocation: function(reset) { 	
		this.inherit.call(this);
	} 
});

YAHOO.augment(AFM.planboard.DDDummyTask, YAHOO.util.DDProxy);
 

/**
 * DDEntry is the dragdrop object for a schedule entry.
 * 
 * 
 * 
 */

AFM.planboard.DDEntry = AFM.planboard.DDBase.extend({	
	
	entryRenderer: null, // reference to the renderer object
	scheduleEntry: null, // reference to the model object

	constructor: function(entryRenderer, sGroup, config) {
		this.entryRenderer = entryRenderer; 	
		this.scheduleEntry = entryRenderer.scheduleEntry;	
				
		this.element = entryRenderer.element;
	    if (this.element) {
	        this.inherit(this.element, sGroup, config);
	        this.cellElement = this.element.parentNode;
	    }
	    
	    if (entryRenderer.boundary != null) {
			this.setBoundaryRegion(boundary, entryRenderer.tickSize, entryRenderer.tickSize)
		}
	},	
	 
	/**
	 * A mouse down event can be a before drag event or activate the context menu.
	 * 
	 * The context menu is a singleton for performance. It is defined in the scheduleView
	 * and is dynamically attached and detached on mousedown event. 
	 */
	onMouseDown: function(e) {
		// check for right click button, display context menu		
		if(e.button > 1) {
			if (this.scheduleEntry.editable) {
				try{
					/*		
					var entryEditContextMenu = 
						new YAHOO.widget.ContextMenu("entryEdit-cm", {trigger: this.getEl() ,
																	  lazyload: true } );	
															  	        
					entryEditContextMenu.addItem($_('contextmenuEdit'));
        			entryEditContextMenu.addItem($_('contextmenuRemove'));
        			entryEditContextMenu.addItem($_('contextmenuSplit'));     
        			
        			alert(entryEditContextMenu.removeItem(2));
        			alert(entryEditContextMenu.removeItem(1));
        			alert(entryEditContextMenu.removeItem(0));
        			
        			entryEditContextMenu.addItem($_('contextmenuEdit'));
        			entryEditContextMenu.addItem($_('contextmenuRemove'));
        			entryEditContextMenu.addItem($_('contextmenuSplit'));     
        			
        			entryEditContextMenu.render("scheduleView");
        			entryEditContextMenu.clickEvent.unsubscribe(this.entryRenderer.onContextMenuClick);
        			entryEditContextMenu.clickEvent.subscribe(this.entryRenderer.onContextMenuClick, this.entryRenderer, true);
        			
        				*/
        			  
					var contextMenu = this.scheduleEntry.scheduleView.entryEditContextMenu;
					 
					// remove handlers from context menu
					contextMenu.clickEvent.unsubscribe(this.entryRenderer.onContextMenuClick);
					// add handlers to context menu
					contextMenu.init("entryEdit-cm", {trigger: this.getEl()});
					
					// display context menu
					contextMenu.clickEvent.subscribe(this.entryRenderer.onContextMenuClick, this.entryRenderer, true);
					
				
				}catch(e){
					alert("exception-->" + e);
				}
			} else {
	
				contextMenu = this.scheduleEntry.scheduleView.entryViewContextMenu;
				contextMenu.clickEvent.unsubscribe(this.entryRenderer.onContextMenuShowClick);				
				// add handlers to context menu
				contextMenu.init( "entryView-cm", {trigger: this.getEl() })
				// display context menu
				contextMenu.clickEvent.subscribe(this.entryRenderer.onContextMenuShowClick, this.entryRenderer, true);
		
			}	
			Event.stopEvent(e);
		}		
	},
	
	/**
	 * After mouse down, the startDrag signals the dragging operation.
	 */	
	startDrag: function(e) {
		this.inherit.call(this);		 
	},
 
    /*
     * When dropping, the entry cell is looked up.
     * When found the setNewPosition is called.
     * 
     * When no entry cell is found, the dragged element
     * returns to the start position.
     *  
     */
	onDragDrop: function(e, id) { 	 	 
	        // id refers to the drop container       
	        var dropContainer = YAHOO.util.DragDropMgr.getDDById(id);  	 
	        this.scheduleView = dropContainer.scheduleView;        
	        //          
	        var el = this.getEl(); // div element   
	        
	         // get the location of the click
	        var x1 = Event.getPageX(e), y1 = Event.getPageY(e);
	        
	        this.assigned = false;
	        
	        var index = 0;
	        
	        // get cell elements from drop container, all days !!                                                      
	        var cellElements = Dom.getElementsByClassName("cell", "div", id);    
	        
	        var index=0;
	        while (index<cellElements.length && ! this.assigned) {
	        	var region = Dom.getRegion(cellElements[index]);                	
	        	
				if (x1 > region.left && x1 < region.right && 
					 y1 > region.top && y1 < region.bottom) { 					 	
					 	this.setNewPosition(el, dropContainer, index);
					 	return;
	        	}	        	
	        	index++;
	        }
	         
	        // if dropped outside the container
	       	this.resetLocation();	            	
	        
	        // stopPropagation
	        Event.stopEvent(e);      
	        
	}, 	 

	/**
	 * The setNewPosition is called from the onDragDrop.
	 * 
	 * The drop container has one or more entry cells. 
	 * 
	 * @param el DOM element dropped
	 * @param dropContainer YUI drop element
	 * @param {int} index index of entry cell for the element drop.
	 * 
	 */
	setNewPosition: function(el, dropContainer, index) {
		// get craftsperson from drop container
		var resource = dropContainer.resource;					
		// get reference to scheduleView from drop container
		this.scheduleView = dropContainer.scheduleView;	
		// first fire the event, before changing the date and resource		
		this.scheduleView.fireEvent("beforeChangeEntry", this.scheduleEntry);
		
		// make a clone object 		 
		var startDate = new Date();
		startDate.setTime(this.scheduleEntry.startDate.getTime()); 	 
		// 		
		var style = resource.resourceContainer.style;
		// for hour intervals there is only one date (day view)
		if (style.interval == DateMath.HOUR) {			 
			// when drag and drop minutes and seconds are always cleared
			startDate.setHours(this.scheduleView.startDate.getHours()+index, 0, 0);				
		} else { // other views,  				 		
			var newDate = DateMath.add(this.scheduleView.startDate, DateMath.DAY, index);		 
			startDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
		}		 		
		 
		// set reference data and update values		
		this.scheduleEntry.setData(resource, startDate, this.scheduleEntry.duration);		
		// validate the new values for the entry			
		this.scheduleEntry.validate(); 		
 	
	} 

});

YAHOO.augment(AFM.planboard.DDEntry, YAHOO.util.DD); 


