Ab.namespace('flash');

var ganttControl = null;

// To be called by ActionScript.
// Get localized string.
function getLocalizedString_gantt_JS(input) {
	try {
		return ganttControl.getLocalizedString_gantt(input);
	}
	catch (e) {
		return input;
	}
};

function getLocalizedDayNamesArray_JS(){
	return [View.getLocalizedString(ganttControl.z_MESSAGE_SUNDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_MONDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_TUESDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_WEDNESDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_THURSDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_FRIDAY).charAt(0),
		View.getLocalizedString(ganttControl.z_MESSAGE_SATURDAY).charAt(0)
	];
};

function getLocalizedMonthArray_JS() {
	return [View.getLocalizedString(ganttControl.z_MESSAGE_JANUARY),
		View.getLocalizedString(ganttControl.z_MESSAGE_FEBRUARY),
		View.getLocalizedString(ganttControl.z_MESSAGE_MARCH),
		View.getLocalizedString(ganttControl.z_MESSAGE_APRIL),
		View.getLocalizedString(ganttControl.z_MESSAGE_MAY),
		View.getLocalizedString(ganttControl.z_MESSAGE_JUNE),
		View.getLocalizedString(ganttControl.z_MESSAGE_JULY),
		View.getLocalizedString(ganttControl.z_MESSAGE_AUGUST),
		View.getLocalizedString(ganttControl.z_MESSAGE_SEPTEMBER),
		View.getLocalizedString(ganttControl.z_MESSAGE_OCTOBER),
		View.getLocalizedString(ganttControl.z_MESSAGE_NOVEMBER),
		View.getLocalizedString(ganttControl.z_MESSAGE_DECEMBER)
	];
};

function refreshData(){
	ganttControl.showData(ganttControl.levelToShow);
};

function getFullDateString(isoDate){
	var dateArray = isoDate.split("/");
	return FormattingDate(dateArray[2], dateArray[1], dateArray[0], strDateLongPattern);
}

//To be called by ActionScript
//set earlist task as predecessor from the other
function setAsPredecessor_JS(taskId1, taskId2){
	alert(taskId1 + " " + taskId2);
}

Ab.flash.Gantt = Ab.flash.FlashControl.extend({

	// @begin_translatable
    z_MESSAGE_TODAY: 'Today',
    z_MESSAGE_ZOOMIN: 'Zoom In',
    z_MESSAGE_ZOOMOUT: 'Zoom Out',
    z_MESSAGE_TASK: 'Action Item',
    z_MESSAGE_START: 'Start',
    z_MESSAGE_END: 'End',
    z_MESSAGE_EXPANDALL: 'Expand All',
    z_MESSAGE_COLLAPSEALL: 'Collapse All',
	z_MESSAGE_SETPREDECESSOR: 'Set as Predecessor',
	z_TITLE_CONFIRM: 'Confirm',
	z_MESSAGE_CONFIRM: 'Do you want to save these changes?',
	z_MESSAGE_TITLE: 'Title',
	z_MESSAGE_SETPREDECESSOR_TOOLTIP: 'To set a Predecessor Action Item, hold down the <Ctrl> key while selecting two action items in the Gantt Chart.  The item selected first will become the predecessor of the second.  Then select Set as Predecessor.',
	z_MESSAGE_START: 'Start',
	z_MESSAGE_END: 'End',
	z_MESSAGE_HALFYEARLABEL: 'H',
	z_MESSAGE_QUARTERLABEL: 'Q',
	z_MESSAGE_WEEKLABEL: 'W',
	z_MESSAGE_SUNDAY: 'Sunday',
    z_MESSAGE_MONDAY: 'Monday',
    z_MESSAGE_TUESDAY: 'Tuesday',
    z_MESSAGE_WEDNESDAY: 'Wednesday',
    z_MESSAGE_THURSDAY: 'Thursday',
    z_MESSAGE_FRIDAY: 'Friday',
    z_MESSAGE_SATURDAY: 'Saturday',
    z_MESSAGE_JANUARY: 'January',
    z_MESSAGE_FEBRUARY: 'February',
    z_MESSAGE_MARCH: 'March',
    z_MESSAGE_APRIL: 'April',
    z_MESSAGE_MAY: 'May',
    z_MESSAGE_JUNE: 'June',
    z_MESSAGE_JULY: 'July',
    z_MESSAGE_AUGUST: 'August',
    z_MESSAGE_SEPTEMBER: 'September',
    z_MESSAGE_OCTOBER: 'October',
    z_MESSAGE_NOVEMBER: 'November',
    z_MESSAGE_DECEMBER: 'December',
    z_MESSAGE_OKLABEL: 'OK',
    z_MESSAGE_CANCELLABEL: 'Cancel',
    z_MESSAGE_INITIALIZING: 'Initializing',
	// @end_translatable

	levels:[],
	viewName: "",
	constraints:[],
	recordLimit: 0,
	restrictions:[],
	confirmItemChange: false,
	showTitleColumn: false,
	levelsToShow:"",
	
	constructor:function(controlId,dataSourceId,viewName,confirmItemChange,showTitleColumn){
		ganttControl = this;
		var swfParam = '?panelId=' + controlId;
		
		if(confirmItemChange != undefined && confirmItemChange != null){
    		this.confirmItemChange = confirmItemChange;
    	}
    	swfParam += '&confirmItemChange='+this.confirmItemChange;
    	
    	if(showTitleColumn != undefined && showTitleColumn != null){
    		this.showTitleColumn = showTitleColumn;
    	}
    	swfParam += '&showTitleColumn='+this.showTitleColumn;
    	
		this.viewName = viewName;
		
		//get locale of current user to set correct first day of week
		var locale = View.user.locale;
		if(locale != 'en_US'){
			swfParam += '&firstDayOfWeek='+1;
		}
		this.inherit(controlId, dataSourceId, "gantt/AbFlashGantt", swfParam);
	},
	
	addLevelofData:function(hierarchyLevel, dataSourceId, taskIdField, summaryField,startDateField,
		endDateField,restrictionStartDate,restrictionEndDate,restrictionFieldForChildren,
		restrictionFieldFromParent,restrictionFromConsole){
		
		var temp = {};
		temp.hierarchyLevel = hierarchyLevel;
		temp.dataSourceId = dataSourceId;
		temp.taskIdField =  taskIdField;
		temp.summaryField = summaryField;
		temp.startDateField = startDateField;
		temp.endDateField = endDateField;
		temp.restrictionFieldForChildren = restrictionFieldForChildren;
		temp.restrictionFieldFromParent = restrictionFieldFromParent;
		if(valueExistsNotEmpty(restrictionFromConsole)){
			temp.restrictionFromConsole = restrictionFromConsole;
		} else {
			temp.restrictionFromConsole = "0=0";
		}
		this.levels.push(temp);		
	},
	
	addConstraintsDataSource:function(dataSourceId,fromIdField,toIdField,typeOfConstraintField){
		var ds = View.dataSources.get(dataSourceId);
		if (ds==null) return;
		
		var records = ds.getRecords(fromIdField +" IS NOT NULL AND " + toIdField + " IS NOT NULL");
		this.constraints = [];
		for (var i=0; i<records.length; i++) {
			var record = records[i];
			
			var temp = {};			
			temp.fromId = record.getValue(fromIdField);
			if (temp.fromId=="") continue;
			temp.toId = record.getValue(toIdField);
			if (temp.toId=="") continue;
			if(typeOfConstraintField != null){
				temp.kind = record.getValue(typeOfConstraintField);
				if(temp.kind == ""){
					temp.kind = "endToStart";
				}
			} else {
				temp.kind = "endToStart";
			}
			this.constraints.push(temp);
		}
	
	},	
	/*
	* Refresh the gantt chart according to the given restrictions
	* @param restrictions: array of objects with level and restriction property
	*/
	refresh: function(restrictions,levelsToShow) {
		this.levelsToShow = levelsToShow;
		
		//first empty the restrictions for all levels
		for(var i=0;i<this.levels.length;i++){		
			this.levels[i].restrictionFromConsole = "0=0";			
		}		

		if(restrictions.constructor == Array){
			for(var j=0;j<restrictions.length;j++){
				var restriction = restrictions[j];
				var lvl = restriction.level;
				var temp = this.levels[lvl];
				var rest = temp.restrictionFromConsole;
				this.levels[lvl].restrictionFromConsole = rest + " AND "+ restriction.restriction;				
			}
		} else {
			var rest = this.levels[0].restrictionFromConsole;
			this.levels[0].restrictionFromConsole = rest + " AND " + restrictions;			
		}
		if(valueExistsNotEmpty(levelsToShow)){
	 		this.showData(levelsToShow);
	 	} else {
	 		this.showData();
	 	}
	},
	showData: function(levelsToShow){
		try {
			var showLevels = this.levels;
			
			if(valueExistsNotEmpty(levelsToShow)){
				showLevels = [];
				for(var i=0;i<levelsToShow.length;i++){
					showLevels.push(this.levels[levelsToShow[i]]);
				}
			}			
			var result = Workflow.callMethod("AbCommonResources-GanttService-queryGanttJSONData", this.viewName, showLevels,this.recordLimit);
			var data = result.message;
			var obj = this.getSWFControl();
			if(obj != null){
			 	obj.showData(data);
			 	obj.showConstraints(toJSON(this.constraints));
			 	obj.expandAll();
			 }
		} catch (e){
			this.handleError(e);
		}
	},
	getLocalizedString_gantt:function(input){
		var result = View.getLocalizedString(this[input]); 
		return result;
	},
	zoom:function(start,end){
		var obj = this.getSWFControl();
		if(obj != null){
		 	obj.zoomGantt(start,end);
		 }
	},
	expandAll:function(){
		var obj = this.getSWFControl();
		if(obj != null){
		 	obj.expandAll();
		 }
	},
	collapseAll:function(){
		var obj = this.getSWFControl();
		if(obj != null){
		 	obj.collapseAll();
		 }
	},
	setRecordLimit:function(limit){
		this.recordLimit=limit;
	},
	getVisibleTimeRangeStart:function(){
		var obj = this.getSWFControl();
		if(obj != null){
		 	return obj.getVisibleTimeRangeStart();
		} else {
			return "";
		}
	},
	getVisibleTimeRangeEnd:function(){
		var obj = this.getSWFControl();
		if(obj != null){
		 	return obj.getVisibleTimeRangeEnd();
		} else {
			return "";
		}
	},
	 // ----------------------- export report selection --------------------------------------------------
   
    /**
	 * It's called by applications.
	 * parameters: Map parameters.
	 * title: report title.
	 */
	callDOCXReportJob: function(parameters,title){
		if(!valueExists(parameters)){
			parameters = {version: Ab.view.View.version};
		}
		if(!valueExists(parameters.orientation)){
			parameters.orientation = 'landscape';
		}
		
		if(!valueExists(title)){
			title = Ab.view.View.title;
		}
		
		if(!valueExists(parameters.outputType)){
			parameters.outputType = 'docx';
		}
		
		var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromChart', this.viewName, this.getImageBytes(), title,  parameters);
   	    if(jobId != null){
   	    	var command = new Ab.command.exportPanel({});
   	    	command.displayReport(jobId, parameters.outputType);
		}
	},

	 /**
	  * get chart's image bytes as array
	  */
	 getImageBytes:function(){
		var obj = this.getSWFControl();
		if(obj && obj.getImageBytes){
			return obj.getImageBytes();
		}

		return [];
	 },
	 
	 updateItem: function(id,start,end,title){
		 var obj = this.getSWFControl();
		obj.updateTaskItem(id,start,end,title);
	 }
});