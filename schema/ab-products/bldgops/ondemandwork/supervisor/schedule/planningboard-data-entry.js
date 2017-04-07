
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
 *  This is the base class for all database record objects.
 * 
 *  All model objects inherit from this base class.
 *  This way classes can use common get and save methods.
 * 
 *  Common handler for saving a record saveRecord require:
 *  <ul>
 * 		<li>tableName</li>
 * 		<li>fieldNames</li>
 * 		<li>fieldValues<li>
 * 		<li>oldFieldValues</li>	
 * 		<li>newRecord</li>
 *  <ul> 
 * 
 *  The common handler getDataRecords can be used ord custom event
 *  handlers. 
 * 
 *  The id is a JSON object containing the primary key for this object.
 * 
 *  Keys in id, fieldValues, oldFieldValues, fieldNames always start with
 *  the tableName (e.g. 'wr.wr_id'). Always include the tableName in the
 *  JSON Object when using a custom event handler.
 * 
 */ 
AFM.planboard.RecordObject = Base.extend({		
	tableName: null,
	fieldNames: null,
	
	id : null, // json object
	fieldValues: null,
	
	oldFieldValues: null,
		
	modified: false, 
	
	isNewRecord: false, // when a new record is created, before saving to the database
			
	constructor: function(id, values, isNewRecord) {
		this.id = id;
		// set values
		if (arguments.length > 1)
			this.initValues(values); 
		else 
			this.initValues(id); 
						
		this.setFieldNames(); // extract the fieldNames from the values
		
		// optional parameter, but required when a new record is created before saving it
		if (isNewRecord !== undefined) {
			this.isNewRecord = isNewRecord; 
		} else {
			this.isNewRecord = false; // default value
		} 
	},	
		 
	setTableName: function(tableName) {
		this.tableName = tableName; // not an instance variable
	},
	
	getTableName: function() {
		return this.tableName;
	},

	setFieldNames: function() {
		if (this.fieldValues != null && this.fieldNames == null) {		
			this.fieldNames = []; // always create new Array	
			for (var key in this.fieldValues) {
				this.fieldNames.push(key);
			}
		}		 
	},
	
	getFieldNames: function() {
		return this.fieldNames;
	},
	
	// this can be overridden, default implementation returns primary key value as string
	getLabel: function() {
		var _label = "";
		for (var key in this.id) {
			_label += this.id[key] + " ";
		}
		return _label;
	},
  
	initValues: function(values) {
		this.fieldValues = {};
		this.oldFieldValues = {};
		
		this.setValues(this.fieldValues, values);
		this.setValues(this.oldFieldValues, values);
		
		this.modified = false;		
		// this.oldFieldValues = values;
		// this.fieldValues = values;
	}, 
		 
	updateValues: function(values) { 
		this.setValues(this.fieldValues, values);
		this.updateData();
		this.updateRenderer();
		this.modified = true;
		// this.changeEvent.fire();
	},
	
	update: function() {
		this.updateId(); // update primary key
		this.updateData(); // update references 
		this.updateRenderer(); // update visual presentation
	},
	
	// update reference data when values are updated
	updateData: function() {
		// to override
	},
	
	updateRenderer: function() {
		// to override, change cell, etc
	},
	
	// update the primary key values to actual field values	
	updateId: function() {
		for (var key in this.id) {
			this.id[key] = this.fieldValues[key];
		}
	},
	
	// update is called after saving to the database, it is like refreshing values from the database
	commit: function() {
		// this.oldFieldValues = this.fieldValues;
		// overwrite the old values
		this.setValues(this.oldFieldValues, this.fieldValues);
		this.updateId();	// maybe the primary key has changed
		
		this.modified = false;	
		this.isNewRecord = false;		
		// after changes from database render		
		this.render(); // to debug		
		  
	},
	
	
	/**
	 * Rollback to old values.
	 * 
	 * Called when save to database fails or whenever validation
	 * fails in javascript before saving.
	 * 
	 * The field values are rolled back, all reference objects should be
	 * should be updated according to the old values. The item renderer
	 * can also be updated and refreshed. 
	 * 
	 * The event for 'rollback' is fired to inform all listeners.
	 *  
	 */
	rollback: function() {  
		// reverse the settings, set fieldValues = oldFieldValues
		
		this.setValues(this.fieldValues, this.oldFieldValues);				 
		this.update(); // update id, references and renderer  
		
		this.isNewRecord = false;		
		this.modified = false;	
	},
	
	getId: function() {
		return this.id; 
	},
 
 	/**
 	 * Web Central doesn't like numbers, all data should be 
 	 * transformed to Strings when using the save record.
 	 */
 	getFieldValuesAsStrings: function() {
 		return this.getValuesAsStrings(this.fieldValues);
 	}, 	
 	
 	getOldFieldValuesAsStrings: function() { 	 
		return this.getValuesAsStrings(this.oldFieldValues);
 	},
 	
 	/**
 	 * always use this function to set values, this makes a safe copy
 	 * @param fieldValues object that gets the new values
 	 * @param values object of new values to copy
 	 */
 	
 	setValues: function(fieldValues, values) {
 		if (fieldValues==null) fieldValues = {}; // create new object
 		for (var key in values) {
 			var value = values[key];
			fieldValues[key] = value;
 		}
 	},
	
	getValues: function() {
		return this.fieldValues;
		// return this.modified ? this.fieldValues : this.oldFieldValues;
	},
	
	getValuesAsStrings: function(fieldValues) {
		var values = {}; // create new Object	
		for (var key in fieldValues) {
			var value = String(fieldValues[key]);
			values[key] = value;
		}
		return values;
	},
	
	getProperty: function(key) {		
		if (key.indexOf('.') <= 0 && this.tableName != null) key = this.tableName+'.'+key;
  		return (this.getValues())[key];
	},
	
	setProperty: function(key, value) {
		if (key.indexOf('.') <= 0 && this.tableName != null) {
			key = this.tableName + '.' + key;
		}
		
		this.fieldValues[key] = value;
		this.modified = true;
		// fire property change event 
	},
	
	compareId: function(id) {
		var found=true;
		for (var key in id) { // compare the new field values !!!!	 
			if (id[key] !== this.id[key] ) found=false;
		}	 	
		return found;
	},
	
	compare: function(recordObject) {
		// return this.compareId(recordObject.getId());
		var found=true;
		for (var key in recordObject.id) { // compare the new field values !!!!	 
			if (recordObject.fieldValues[key] !== this.fieldValues[key] ) found=false;
		}	 	
		return found; 
	},
		
	/**
	 * interface functions to override 
	 */
	
	// to override
	render: function() {
		
	},	 
	
	destroy: function() {
		for (var key in this) {
			delete this[key];
		}
	},
	
	toString: function() {
		return "Record for "+ this.tableName;
	} 
	
});
 
/**
 * Abstract class for Resource Group.
 * 
 * 
 */
AFM.planboard.ResourceGroup = AFM.planboard.RecordObject.extend({
	type: null,
	resources: null, 
	
	constructor: function(id, values, isNewRecord) {
		this.id = id;
		this.initValues(values, isNewRecord); 		
		this.resources = [];
	},
 	
	addResource: function(resource) { 
		this.resources.push(resource); // make sure you don't create doubles !
	},
	
	removeResource: function(resource) { 		 
		for (var i=0; i<this.resources.length; i++) {
			if (resource.compare(this.resources[i])) {	 
				this.resources.splice(i,1); return i; // break and return break;
			}
		}
		return -1;	 
	},
	
	getLabel: function() {
		return "default";
	} 
	
});

/**
 * Implementation of a Resource Group.
 * 
 * 
 */
AFM.planboard.Trade = AFM.planboard.ResourceGroup.extend({
	tableName : 'tr',
	 
	constructor: function(id, values, isNewRecord) {
		this.inherit(id, values, isNewRecord);
	},
	
	getLabel: function() {
		return this.getProperty("tr.tr_id");
	}
	
});

/**
 * Abstract class for a Resource.
 * 
 */
AFM.planboard.Resource = AFM.planboard.RecordObject.extend({	
	type : null, // resource type string
	group : null, // reference to resource group
	entries : null, // this is an Array of entries
 	resourceContainer: null, // reference to AFM.planboard.ResourceContainer
 	
	scheduleView: null,	 
	
	constructor: function(id, values, isNewRecord, scheduleView) {
		this.inherit(id, values, isNewRecord);		
		this.scheduleView = scheduleView;	
		this.entries = [];	 // always create a new array in constructor	
	},
	
	getStandardHours: function() {
		return this.getProperty("cf.std_hours_avail");  
	},
	
	setResourceContainer: function(resourceContainer) {
		this.resourceContainer = resourceContainer;
		this.contentContainer = resourceContainer.contentElement;
	},
	
	getContentContainer: function() {
		return resourceContainer.contentElement;
	},
 	
	setResourceGroup: function(resourceGroup){
		this.group = resourceGroup;
		this.type = resourceGroup.type;
	},
	
	getResourceGroupName: function() {
		if (this.group != null) {
			return this.group.getLabel();
		} else {
			return "default";
		}
	},
		
	// entries should be listed for each resource
	addEntry: function(entry) {
		if (this.entries == null) this.entries = [];
		// if not exists ....		 
		this.entries.push(entry);			
	},
	
	destroy: function() {	 							
		for (var key in this) {
			delete this[key];
		} 
	},
		
	destroyAllEntries: function() {				
		if(this.resourceContainer != null){
		this.resourceContainer.destroyAllEntries();
		}		
		this.removeAllEntries();
	},
	
	removeAllEntries: function() {
		/*
		for (var i=0; i<this.entries.length; i++) {			
			this.entries.splice(i,1);			
		}	*/	
		this.entries = [];
	},
	
	removeEntry: function(entry) {
		if (this.entries == null) return;
		
		for (var i=0; i<this.entries.length; i++) {
			if (this.entries[i].compare(entry)) {
				this.entries.splice(i,1);
			}
		}
 
	}
	
});

/**
 * Model for Craftsperson.
 * 
 * Implementation of a Resource.
 * Table : 'cf'.
 * 
 */
AFM.planboard.Craftsperson = AFM.planboard.Resource.extend({
	tableName : 'cf', 
	type : 'work',
	
	constructor: function(id, values, isNewRecord, scheduleView) {
		this.inherit(id, values, isNewRecord, scheduleView);
	},
	
	getStandardHours: function() {
		return this.getProperty("cf.std_hours_avail");  
	}
	
});

/**
 * Model for a Task.
 * 
 * Table : 'wrtr' 
 * 
 */
AFM.planboard.Task = AFM.planboard.RecordObject.extend({
	tableName : 'wrtr', 
	
	duration : null, // estimated
	scheduledHours: null,
	
	// reference to the work Request
	workRequest : null,
	// reference to a trade
	trade : null,
	
	node: null,	
	nodeId: null, // node id in tree 
	
	standardHours: 8,
	
	constructor: function(id, values, isNewRecord) {
		this.inherit(id, values, isNewRecord);
	},
	
	getEscalationDateResponse: function() {
		return this.workRequest.getEscalationDateResponse();	 
	},
	
	getEscalationDateCompletion: function() {
		return this.workRequest.getEscalationDateCompletion();	 
	},
	
	getEstimatedHours: function() {
		return this.duration;
	},
	
	getScheduledHours: function() {
		return this.scheduledHours == null? 0 : this.scheduledHours;
	},
	
	getRemainingHours: function() {
		return this.duration - this.getScheduledHours();	
	},	
	
	setScheduledHours: function(hours) {
		this.scheduledHours = hours;
		this.setProperty("wrtr.hours_sched", hours);
	},	
	
	init: function(workRequest, trade, duration) {
		this.workRequest = workRequest;
		this.trade = trade;
		this.duration= duration; // estimation
		this.scheduledHours = this.getProperty("wrtr.hours_sched");
	},
	
	/**
	 * try planning a task for a date and resource.
	 * 
	 * When a task is dropped on the planning board, it can be split
	 * in different assignments for each day.
	 * 
	 * Planning only applies on the period shown (<= endDate)
	 * 
	 * For each day, the validate function must be called.	 
	 * The validate function will add a day and call this method again.
	 * 
	 */
	schedule: function(startDate, resource) {
		if (this.getRemainingHours() > 0) {				
			if (startDate > this.workRequest.scheduleView.endDate) return;
			
			if (this.workRequest.scheduleView.debug) 
					Log("New Start "+ startDate);
					
			var serviceWindowHours = this.workRequest.serviceWindow.getAvailableTime(startDate);
			var standardHours = this.resource.getStandardHours() > 0 ? this.resource.getStandardHours() : this.standardHours;	
			
			// the duration is minimum of three 						
			var duration = Math.min(standardHours, serviceWindowHours); 
			var duration = Math.min(duration, this.task.getRemainingHours()); 			
	   		
			var entry = this.workRequest.scheduleView.createEntry(resource, startDate, duration, this.workRequest, this);		
			
			alert("schedule... ...");
			entry.validate(); 	
		}		
	}

});


/**
 * Model for a Work Order.
 * 
 * Table : 'wo'
 */
AFM.planboard.WorkOrder = AFM.planboard.RecordObject.extend({
	tableName : 'wo',	
	workRequests : null,
	
	constructor: function(id, values, isNewRecord) {
		this.inherit(id, values, isNewRecord);			
		this.workRequests = []; // AFM.planboard.WorkRequest
	},	
	
	addWorkRequest: function(workRequest) {
		this.workRequests.push(workRequest);
	}

});

/**
 * abstract class for work request or milestone, ...
 */
AFM.planboard.TaskGroup = AFM.planboard.RecordObject.extend({
	tasks : null, // AFM.planboard.Task
	
	constructor: function(id, values, isNewRecord) {
		this.inherit(id, values, isNewRecord);			
		this.tasks = []; // AFM.planboard.Task				 
	}, 
	
	addTask: function(task) {
		this.tasks.push(task);
	},
	
	// lookup for task
	getTask: function(id) {
		for (var i=0; i<this.tasks.length; i++) { 
			if (this.tasks[i].compareId(id)) return this.tasks[i];
		}
		return null;
	}	
	
});

/**
 * Model for a Work Request.
 * 
 * table : 'wr'
 * 
 */
AFM.planboard.WorkRequest = AFM.planboard.RecordObject.extend({
	tableName : 'wr',
	
	tasks : null, // AFM.planboard.Task
	
	serviceWindow : null, // AFM.planboard.ServiceWindow
	
	scheduleView: null,
		
	constructor: function(id, values, isNewRecord, scheduleView) {
		this.inherit(id, values, isNewRecord);	
		
		this.tasks = []; // AFM.planboard.Task
		// 
		if (scheduleView !== undefined) this.scheduleView = scheduleView; 	  
	}, 
	
	addTask: function(task) {
		this.tasks.push(task);
	},
	
	addAssignment: function(assignment) {
		this.assignments.push(assignment);
	},
	
	setServiceWindow: function(serviceWindow) {
		this.serviceWindow =  serviceWindow;
	},
	
	getEscalationDateResponse: function() {
		var date =  this.getProperty("wr.date_escalation_response");
		var time =  this.getProperty("wr.time_escalation_response");
		
		return AFM.planboard.DateUtil.convertIsoFormatToDate(date, time);
	},
	
	getEscalationDateCompletion: function() {
		var date =  this.getProperty("wr.date_escalation_completion");
		var time =  this.getProperty("wr.time_escalation_completion");
		
		return AFM.planboard.DateUtil.convertIsoFormatToDate(date, time);
	},
	
	/* Check whether we use use Holiday Calendar.
	 * 
	 * If work is allowed on holidays, we don't have to load the Holiday calendar
	 * or take into account holidays.
	 * 
	 */
	useHolidays: function() {
		return this.getProperty("wr.allow_work_on_holidays") == 0; 
	},
	
	// lookup for task
	getTask: function(id) {
		for (var i=0; i<this.tasks.length; i++) { 
			if (this.tasks[i].compareId(id)) return this.tasks[i];
		}
		return null;
	},
	// lookup for assignment
	getAssignment: function(id) {
		for (var i=0; i<this.assignments.length; i++) {
			if (this.assignments[i].compareId(id)) return this.assignments[i];
		}
		return null;
	}
	
});

/**
 * SLA Service Window.
 * 
 * 
 */
AFM.planboard.ServiceWindow = Base.extend({		
	days : [],
	startTime : null,
	endTime : null,
	
	constructor: function(days, startTime, endTime) {
		this.days = days;
		this.startTime = startTime == "" ? "00:00" : AFM.planboard.DateUtil.getTimeValue(startTime); // startTime in "15:00" format 
		this.endTime = endTime == "" ? "23:59" : AFM.planboard.DateUtil.getTimeValue(endTime); 
		if (endTime == "00:00.00.000") // bug in Web Central
			this.endTime = "23:59"; 
	},
	
	getStartTime: function() {	 	
		if (this.startTime.indexOf('.') == 0) return this.startTime;
		var timeParts = this.startTime.split('.');		
		return timeParts[0];
	},
	
	getEndTime: function() {	 	
		if (this.endTime.indexOf('.') == 0) return this.endTime;
		var timeParts = this.endTime.split('.');		
		return timeParts[0];
	},
	
	parseTime: function(time) {
		if (time.indexOf(":") < 1) {			
			return 0.0;
		}		
		var timeParts = time.split(':');		
		return parseInt(timeParts[0], 10) + parseInt(timeParts[1],10)/60;
	},
	
	getTimeValue: function(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		return hours + minutes/60;		
	},
	
	/*
	 * check start and end time
	 */
	
	checkTimes: function(startDate, duration) {
		var weekday = startDate.getDay();		
		if (this.days[weekday] == 0) return false;
		
		var startTime = this.getTimeValue(startDate);		 
		var endTime = startTime + parseInt(duration, 10); // duration may be passed as String
		
		var startValue = this.parseTime(this.startTime);
		var endValue = this.parseTime(this.endTime);
		
		if (startTime < startValue) return false;
		if (endTime > endValue) return false;
		
		return true;
	},
	
	// get the time available according the service window
	// return floating number hours
	getAvailableTime: function(date) {		 
		var weekday = date.getDay();		
		if (this.days[weekday] == 0) return 0.0;
		
		var startHours = date.getHours();		
		var startValue = this.parseTime(this.startTime);
		if (startHours > startValue) startValue = startHours;
		
		var endValue = this.parseTime(this.endTime);
			
		return endValue - startValue == 0 ? 24 : endValue - startValue;	
	} 
	
});	

	
