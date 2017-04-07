var projGanttChartController = View.createController('projGanttChart', {

	ganttControl : null,
	from_date : '', // in ISO format
	to_date : '', // in ISO format
	displayLevels : '0',
	panel_title : '',
	view_type : 'baseline',
	project_from_date_field : 'project.date_start',
	project_to_date_field : 'project.date_end',
	workpkg_from_date_field : 'work_pkgs.date_est_start',
	workpkg_to_date_field : 'work_pkgs.date_est_end',
	activity_from_date_field : '',
	activity_to_date_field : '',
	activity_duration_field : '',
	calcEndDatesWFRName : '',
	is_mc : false,
	is_stat : false,
	/*
	 * when is called from enterprise asset management project planning
	 * message is defined in openr view
	 */ 
	is_eam_project: false,
	projectRestriction : '',
	workpkgRestriction : '',
	activityRestriction : '',
	restrictions : null,
	projectId : '', // for work package restriction
	selected_project_id : '', // for console filter
	projectStatus: null,
	
	afterViewLoad: function() {
		this.projGanttChartPanel.setContentPanel(Ext.get('gantt'));
		var ganttControl = new Ab.flash.Gantt("gantt","projGanttChartDsProjects", "ab-proj-gantt-chart.axvw", true, true);
	},
	
	afterInitialDataFetch: function() {
		/**
		 * IOAN 2015-04-03 Moved this initialization from after view load
		 */
		this.from_date = dateAddDays(new Date(), -360);
		this.to_date = dateAddDays(new Date(), 360);
		this.displayLevels = '3';
		if (getMessage('panel_title') != 'panel_title') this.panel_title = getMessage('panel_title');
		
		if (getMessage('view_type') != 'view_type') this.view_type = getMessage('view_type');
		if (this.view_type == 'baseline') {
			this.activity_from_date_field = 'activity_log.date_planned_for';
			this.activity_to_date_field = 'activity_log.date_planned_end';
			this.activity_duration_field = 'activity_log.duration_est_baseline';
			this.calcEndDatesWFRName = 'AbCommonResources-ActionService-calcActivityLogDatePlannedEndForProject';
		}
		else {
			this.activity_from_date_field = 'activity_log.date_scheduled';
			this.activity_to_date_field = 'activity_log.date_scheduled_end';
			this.activity_duration_field = 'activity_log.duration';
			this.calcEndDatesWFRName = 'AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject';
		}
		
		if (getMessage('is_mc') == 'true') this.is_mc = true;
		if (getMessage('is_stat') == 'true') this.is_stat = true;
		
		if (valueExists(View.restriction)) {
			var clause = View.restriction.findClause('is_from_eam');
			this.is_eam_project = valueExists(clause) && clause.value;
			if(this.is_eam_project){
				this.is_stat = false;
				this.is_mc = false;
				var projectIdClause = View.restriction.findClause('project.project_id');
				if(projectIdClause){
					this.projectId = projectIdClause.value;
					//this.selected_project_id = this.projectId.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}
				var projectStatusClause = View.restriction.findClause('project.status');
				if(projectStatusClause){
					this.projectStatus = projectStatusClause.value;
				}
			}
		}
		
		
		if (this.is_mc) {
			this.setMcRestrictions();
			this.setMaxMinProjectActionsDates(this.projectId);
		} else if (this.is_eam_project){
			this.setEamProjectRestrictions();
			this.setMaxMinProjectActionsDates(this.projectId);
		} else if (this.is_stat) {
			this.setStatRestrictions();
			this.setMaxMinProjectActionsDates(this.projectId);
		} else {
			var projecttype = "";
			if (View.taskInfo.activityId == 'AbProjCommissioning') {
				projecttype = " AND project.project_type = 'COMMISSIONING'";
			}
			if (this.view_type == 'baseline') {
				this.projectRestriction = "project.status IN ('Requested')" + projecttype;
				this.workpkgRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Requested')" + projecttype + ")";
				this.activityRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = activity_log.project_id AND project.status IN ('Requested')" + projecttype + ")";
			} else if (this.view_type == 'design') {
				this.projectRestriction = "project.status IN ('Approved', 'Approved-In Design')" + projecttype;
				this.workpkgRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Approved', 'Approved-In Design')" + projecttype + ")";
				this.activityRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = activity_log.project_id AND project.status IN ('Approved', 'Approved-In Design')" + projecttype + ")";
			} else {
				this.projectRestriction = "project.status IN ('Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending', 'Completed-Not Ver')" + projecttype;
				this.workpkgRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending','Completed-Not Ver')" + projecttype + ")";
				this.activityRestriction = "EXISTS(SELECT * FROM project WHERE project.project_id = activity_log.project_id AND project.status IN ('Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending','Completed-Not Ver')" + projecttype + ")";
			}
			this.setGanttRestrictions();
		}
		
		if (this.is_mc || this.is_stat || this.is_eam_project) 
			this.onCalcEndDatesForProject(this.projectId);
		else 
			this.onCalcEndDatesForProject('');
		cascadeAllTaskDependencies();
		/**
		 * IOAN 2015-04-03 END
		 */

		this.activityId = View.taskInfo.activityId;
    	if (this.activityId == 'AbProjectManagement') {
			if($('projGanttChartSelectDisplay')){
				var option = new Option(getMessage("optionWorkpkg"), "1");
				$('projGanttChartSelectDisplay').options.add(option);
				option = new Option(getMessage("optionProjectWorkpkg"), "0;1");
				$('projGanttChartSelectDisplay').options.add(option);
			}
		} else if (this.activityId == 'AbCapitalBudgeting') {
			this.projGanttChartConsole.enableField('activity_log.work_pkg_id', false);
		}
    	if (this.is_mc || this.is_stat) {
    		this.projGanttChartConsole.showField('activity_log.bl_id', false);
    		this.projGanttChartConsole.showField('project.site_id', false);
    		this.projGanttChartConsole.showField('project.proj_mgr', false);
    	}
		this.projGanttChartConsole_onClear();
    },
    
    projGanttChartPanel_onAddTask : function() {
    	View.openDialog('ab-proj-gantt-chart-add-action.axvw', null, true);
    },
    
    /** Console */
    
    projGanttChartConsole_statRefresh: function(project_id) {
    	if (this.is_stat) {
    		this.projectId = project_id;
    		this.projGanttChartConsole_onClear();
			this.setStatRestrictions();
			this.onCalcEndDatesForProject(this.projectId);
			this.setMaxMinProjectActionsDates(this.projectId);
    	}
    },
    
    projGanttChartConsole_onClear : function() {
    	this.projGanttChartConsole.clear();
    	if (this.is_mc || this.is_stat || this.is_eam_project) {
    		this.projGanttChartConsole.setFieldValue("activity_log.project_id", (Ext.isArray(this.projectId)? this.projectId.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) : this.projectId));
    		this.projGanttChartConsole.enableField("activity_log.project_id", false);
    		this.setMaxMinProjectActionsDates(this.projectId);
    		this.projGanttChartConsole.setFieldValue("activity_log.date_planned_for", reformatDate(this.from_date, 'YYYY-MM-DD', strDateShortPattern));
    		this.projGanttChartConsole.setFieldValue("activity_log.date_planned_end", reformatDate(this.to_date, 'YYYY-MM-DD', strDateShortPattern));
    	}
    	else {
    		this.from_date = dateAddDays(new Date(), -360);
    		this.to_date = dateAddDays(new Date(), 360);
    		this.projGanttChartConsole.setFieldValue("activity_log.date_planned_for", "");
    		this.projGanttChartConsole.setFieldValue("activity_log.date_planned_end", "");
    	}
    	$('projGanttChartSelectDisplay').value = 3;
    	afterSelectDisplay();
    },
	
    projGanttChartConsole_onShow: function() {
    	var from_date = this.projGanttChartConsole.getFieldValue("activity_log.date_planned_for");
    	var to_date = this.projGanttChartConsole.getFieldValue("activity_log.date_planned_end");
 
		if (from_date && to_date) {
			if (from_date > to_date) {
				View.showMessage(getMessage('error_date_range'));
				return;
			}
			this.from_date = from_date;
			this.to_date = to_date;
		} 
		else if (from_date && !to_date) {
			this.from_date = from_date;
			this.to_date = dateAddDays(getDateObject(from_date), 360);
		}
		else if (to_date && !from_date) {
			this.to_date = to_date;
			this.from_date = dateAddDays(getDateObject(to_date), -360);
		}

    	this.displayLevels = $('projGanttChartSelectDisplay').value;
    	this.projectId = this.projGanttChartConsole.getFieldValue('activity_log.project_id');
    	this.refreshGanttFromConsole();
    },
	
	/** Gantt Chart */
	  
	setMcRestrictions : function() {
		var mcController = View.getOpenerView().controllers.get('projManageConsole');
		this.projectId = mcController.project_id;
		
		this.projectRestriction = "project.project_id = '" + getValidValue(this.projectId) + "'";
		this.workpkgRestriction = "work_pkgs.project_id = '" + getValidValue(this.projectId) + "'";
		this.activityRestriction = "activity_log.project_id = '" + getValidValue(this.projectId) + "'";
		this.setGanttRestrictions();
	},
	
	setStatRestrictions : function() {
		this.projectId = View.getOpenerView().controllers.get('projMng').project_id;
		
		this.projectRestriction = "project.project_id = '" + getValidValue(this.projectId) + "'";
		this.workpkgRestriction = "work_pkgs.project_id = '" + getValidValue(this.projectId) + "'";
		this.activityRestriction = "activity_log.project_id = '" + getValidValue(this.projectId) + "'";
		this.setGanttRestrictions();
	},
	
	setEamProjectRestrictions: function(){
		this.projectId = View.getOpenerView().controllers.get('abEamCptProjConsoleCtrl').projectIds;
		
		this.projectRestriction = "project.project_id IN ('" + makeSafeSqlValue(this.projectId).join("','") + "') AND project.status IN ('" + makeSafeSqlValue(this.projectStatus).join("','") + "')";
		this.workpkgRestriction = "work_pkgs.project_id IN ('" + makeSafeSqlValue(this.projectId).join("','") + "')";
		this.activityRestriction = "activity_log.project_id IN ('" + makeSafeSqlValue(this.projectId).join("','") + "')";
		this.setGanttRestrictions();
	},
	
	setGanttRestrictions : function() {
		this.restrictions = new Array();
		this.restrictions.push({'level' : 0, 'restriction' : this.projectRestriction});
    	this.restrictions.push({'level' : 1, 'restriction' : this.workpkgRestriction});
    	this.restrictions.push({'level' : 2, 'restriction' : this.activityRestriction});
	},
    
    refreshGanttFromConsole: function() {
		var ganttControl = Ab.view.View.getControl('', 'gantt');    	
    	this.restrictions = new Array();
    	this.restrictions.push({'level' : 0, 'restriction' : this.projectRestriction + " AND " + getRestrictionFromConsole(0)});
    	this.restrictions.push({'level' : 1, 'restriction' : this.workpkgRestriction + " AND " + getRestrictionFromConsole(1)});
    	this.restrictions.push({'level' : 2, 'restriction' : this.activityRestriction + " AND " + getRestrictionFromConsole(2)});
    	
    	this.refreshProjGanttChartPanel();
    	ganttControl.zoom(this.from_date, this.to_date);
    },
    
    refreshProjGanttChartPanel: function() {
    	var ganttControl = Ab.view.View.getControl('', 'gantt');
    	ganttControl.addConstraintsDataSource(
    			"projGanttChartDsActivityLogItems",		//dataSourceId
    			"activity_log.predecessors",			//fromIdField
    			"activity_log.activity_log_id",			//toIdField
    			null);									//typeOfConstraintField)
    	if (this.displayLevels != '3') ganttControl.refresh(this.restrictions, this.displayLevels.split(";"));
    	else ganttControl.refresh(this.restrictions);
    	ganttControl.expandAll();
    },
    
    onCalcEndDatesForProject : function(project_id) {
    	var parameters = {'project_id' : toJSON(project_id), 'isMultiple': false};
    	var result = Workflow.callMethodWithParameters(this.calcEndDatesWFRName, parameters);
    	if (result.code == 'executed') {
    		return true;		
    	} else {
    		View.showMessage(result.code + " :: " + result.message);
    		return false;
    	}	
    },
     
	setMaxMinProjectActionsDates : function(projectId) {		
		var minDate = this.getMinProjectActionsDate(projectId);
		var maxDate = this.getMaxProjectActionsDate(projectId);
		if (minDate) this.from_date = dateAddDays(minDate, -30);
		if (maxDate) this.to_date = dateAddDays(maxDate, 30);
	},
	
	getMinProjectActionsDate : function(projectId, workPkgId) {
		var restriction = this.activity_from_date_field + " = (SELECT MIN(" + this.activity_from_date_field + ") FROM activity_log WHERE project_id='" + projectId + "'";
		if (Ext.isArray(this.projectId)) {
			restriction = this.activity_from_date_field + " = (SELECT MIN(" + this.activity_from_date_field + ") FROM activity_log WHERE project_id IN ('" + makeSafeSqlValue(this.projectId).join("','") + "')";
		}
		
		restriction += workPkgId? " AND work_pkg_id='" + workPkgId + "')" : ")";
		var minRecord = this.projGanttChartDsActivityLogItems.getRecord(restriction);
		var minDate = null;
		if (minRecord) minDate = minRecord.getValue(this.activity_from_date_field);
		return minDate;
	},
	
	getMaxProjectActionsDate : function(projectId, workPkgId) {
		var restriction = this.activity_to_date_field + " = (SELECT MAX(" + this.activity_to_date_field + ") FROM activity_log WHERE project_id='" + projectId + "'";
		if (Ext.isArray(this.projectId)) {
			restriction = this.activity_to_date_field + " = (SELECT MAX(" + this.activity_to_date_field + ") FROM activity_log WHERE project_id IN ('" + makeSafeSqlValue(this.projectId).join("','") + "')";
		}
		restriction += workPkgId? " AND work_pkg_id='" + workPkgId + "')" : ")";
		var maxRecord = this.projGanttChartDsActivityLogItems.getRecord(restriction);
		var maxDate = null;
		if (maxRecord)  maxDate = maxRecord.getValue(this.activity_to_date_field);
		return maxDate;
	},
	
	hasMultipleWorkpkgRecords : function(workPkgId) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.work_pkg_id', workPkgId);
		var records = this.projGanttChartDsWorkPackages.getRecords(restriction);
		if (records.length > 1 ) return true;
		else return false;
	},
	
	  //DOCX report
	projGanttChartPanel_onExportDOCX:function(){
    	ganttControl.callDOCXReportJob();
   },
   //PDF report
   projGanttChartPanel_onExportPDF:function(){
   	ganttControl.callDOCXReportJob({'outputType': 'pdf'});
  },
  
  //PPT report
  projGanttChartPanel_onExportPPT:function() {
  	 var slides = [];
  	 var image = ganttControl.getImageBytes();
		 slides.push({'title': getMessage('pptExportTitle') + " " +  this.projectId, 'type':'flash', 'images':[image]});
		 
		 var jobId =  Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
		 View.openJobProgressBar(getMessage('generatePPTMessage'), jobId, null, function(status) {
	   		var url  = status.jobFile.url;
			window.location = url;
	   	 });
  },
  
  /**
   * IOAN this is main panel and is refreshed when tab is selected in EAM
   */
  projGanttChartHidden_afterRefresh: function(){
	  this.afterInitialDataFetch();
	  // KB 3049177   Need to review this
	  if(this.is_eam_project && !mozillaFireFoxBrowser){
		this.refreshProjGanttChartPanel();
//		var ganttControl = Ab.view.View.getControl('', 'gantt'); 
//		ganttControl.zoom(this.from_date, this.to_date);
	  }
  }
});

function getConfirmMessage_JS(level,itemId,startDate,endDate){
	var message = ""; 
	var startDateISO = reformatDate(startDate, 'YYYY/MM/DD', 'YYYY-MM-DD');
	var endDateISO = reformatDate(endDate, 'YYYY/MM/DD', 'YYYY-MM-DD');
	if (level == 0) {
		message = String.format(getMessage('assignProjectDates'), itemId, startDateISO, endDateISO);
	} else if(level == 1){
		message = String.format(getMessage('assignWorkpkgDates'), itemId, startDateISO, endDateISO);
	} else if(level == 2){
		var days_per_week = getDaysPerWeek(itemId, View.controllers.get('projGanttChart'));
		startDateISO = adjustStartDateByDaysPerWeek(startDateISO, days_per_week);
		endDateISO = truncateEndDateByDaysPerWeek(endDateISO, days_per_week);
		var duration = getActivityDuration(startDateISO, endDateISO, days_per_week);
		message = String.format(getMessage('assignTaskDates'), itemId, startDateISO, endDateISO, duration);
	}
	return message;
}

function itemResized_JS(level, id, startDate, endDate, changeArea, dependentTasks){
	var thisController = View.controllers.get('projGanttChart');
	
	var startDateISO = reformatDate(startDate, 'YYYY/MM/DD', 'YYYY-MM-DD');
	var endDateISO = reformatDate(endDate, 'YYYY/MM/DD', 'YYYY-MM-DD');
	
	if (level == 0) {
		var restriction = {'project.project_id': id };
	    var projectRecord = thisController.projGanttChartDsProjects.getRecord(restriction);
		projectRecord.setValue(thisController.project_from_date_field, startDateISO);
        projectRecord.setValue(thisController.project_to_date_field, endDateISO);
        thisController.projGanttChartDsProjects.saveRecord(projectRecord);
	}
	else if (level == 1) {
		if (thisController.projectId == "") {
			if (thisController.hasMultipleWorkpkgRecords(id)) {
				thisController.refreshProjGanttChartPanel();
				View.showMessage(getMessage('specifyProjectWorkPackage'));
				return;
			}
			else restriction = {'work_pkgs.work_pkg_id': id };
		}
		else restriction = {'work_pkgs.project_id': thisController.projectId, 'work_pkgs.work_pkg_id': id };

	    var workpkgRecord = thisController.projGanttChartDsWorkPackages.getRecord(restriction);
	    workpkgRecord.setValue(thisController.workpkg_from_date_field, startDateISO);
	    workpkgRecord.setValue(thisController.workpkg_to_date_field, endDateISO);
	    thisController.projGanttChartDsWorkPackages.saveRecord(workpkgRecord);
	}
	else if (level == 2) {
		var days_per_week = getDaysPerWeek(id, thisController);
		startDateISO = adjustStartDateByDaysPerWeek(startDateISO, days_per_week);
		endDateISO = truncateEndDateByDaysPerWeek(endDateISO, days_per_week);
		var duration = getActivityDuration(startDateISO, endDateISO, days_per_week);
				
    	var restriction = {'activity_log.activity_log_id' : id};
        var activityRecord = thisController.projGanttChartDsActivityLogItems.getRecord(restriction);
        activityRecord.setValue(thisController.activity_from_date_field, startDateISO);
        activityRecord.setValue(thisController.activity_to_date_field, endDateISO);
        activityRecord.setValue(thisController.activity_duration_field, duration);
        thisController.projGanttChartDsActivityLogItems.saveRecord(activityRecord);
        cascadeTaskDependencies(activityRecord);
        thisController.refreshProjGanttChartPanel();
	}
}

function itemClicked_JS(level, id){
	var thisController = View.controllers.get('projGanttChart');
	var restriction = '';
	
	if (level == 0) {
		restriction = {'project.project_id': id};
		Ab.view.View.openDialog('ab-proj-gantt-chart-project-dialog.axvw', restriction);
	}
	else if (level == 1) {
		if (thisController.projectId == "") {
			if (thisController.hasMultipleWorkpkgRecords(id)) {
				View.showMessage(getMessage('specifyProjectWorkPackage'));
				return;
			}
			else restriction = {'work_pkgs.work_pkg_id': id };
		}
		else restriction = {'work_pkgs.project_id': thisController.projectId, 'work_pkgs.work_pkg_id': id };

		Ab.view.View.openDialog('ab-proj-gantt-chart-workpkg-dialog.axvw', restriction);			
	}
	else if (level == 2) {
		restriction = {'activity_log.activity_log_id': id };  
		Ab.view.View.openDialog('ab-proj-gantt-chart-activity-dialog.axvw', restriction);
	}
}

function loadComplete_JS(panelId) {
	var controller = View.controllers.get('projGanttChart');
	var displayLevelsArray = controller.displayLevels.split(";");
	var lastLevel = displayLevelsArray[displayLevelsArray.length-1];
	
	var ganttControl = Ab.view.View.getControl('', panelId);
	ganttControl.levels = [];

	if (lastLevel >= '0') {
		ganttControl.addLevelofData(0, 			//hierarchyLevel
		 	"projGanttChartDsProjects", 		//dataSourceId
		 	"project.project_id", 				//taskIdField
		 	"project.project_name",				//summaryField
			controller.project_from_date_field,	//startDateField
			controller.project_to_date_field,	//endDateField
			null,								//restrictionStartDate
			null,								//restrictionEndDate
			"project.project_id",				//restrictionFieldForChildren
			null,								//restrictionFieldFromParent
			controller.projectRestriction); 	//restrictionFromConsole
	}
	if (lastLevel >= '1') {
		ganttControl.addLevelofData(1,			//hierarchyLevel
			"projGanttChartDsWorkPackages",		//dataSourceId
		 	"work_pkgs.work_pkg_id",			//taskIdField
		 	"work_pkgs.work_pkg_id",			//summaryField		
		 	controller.workpkg_from_date_field,	//startDateField
		 	controller.workpkg_to_date_field,	//endDateField
			null,								//restrictionStartDate
			null,								//restrictionEndDate
			"work_pkgs.work_pkg_id",			//restrictionFieldForChildren
			"work_pkgs.project_id",				//restrictionFieldFromParent
			controller.workpkgRestriction);		//restrictionFromConsole
	}
	if (lastLevel >= '2') {
		ganttControl.addLevelofData(2,			//hierarchyLevel
			"projGanttChartDsActivityLogItems", //dataSourceId
		 	"activity_log.activity_log_id",		//taskIdField
		 	"activity_log.wbs_title",			//summaryField
			controller.activity_from_date_field,//startDateField
			controller.activity_to_date_field,	//endDateField
			null,								//restrictionStartDate
			null,								//restrictionEndDate
			null,								//restrictionFieldForChildren
			"activity_log.project_id;activity_log.work_pkg_id;",//restrictionFieldFromParent
			controller.activityRestriction);	//restrictionFromConsole
	}
			
	ganttControl.addConstraintsDataSource(
		"projGanttChartDsActivityLogItems",		//dataSourceId
		"activity_log.predecessors",			//fromIdField
		"activity_log.activity_log_id",			//toIdField
		null);									//typeOfConstraintField)
	ganttControl.showData();		
	ganttControl.zoom(controller.from_date, controller.to_date);
	ganttControl.expandAll();
	
	if (controller.panel_title != '') View.panels.get('projGanttChartPanel').appendTitle(controller.panel_title);
	var restriction = {'project.project_id': controller.projectId };
    var projectRecord = controller.projGanttChartDsProjects.getRecord(restriction);
	var name = projectRecord.getValue('project.project_name');
	View.panels.get('projGanttChartPanel').appendTitle(controller.projectId + ' - ' + name);
}

//set first task as predecessor of the second
function setAsPredecessor_JS(taskId1, taskId2) {
	if (isNaN(taskId1) || isNaN(taskId2)) return; // return if selecting work packages or projects
	var controller = View.controllers.get('projGanttChart');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', taskId2);
	var task2Record = controller.projGanttChartDsActivityLogItems.getRecord(restriction);
	restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', taskId1);
	var task1Record = controller.projGanttChartDsActivityLogItems.getRecord(restriction);
	if (task1Record.getValue('activity_log.activity_log_id') == undefined) return; // return if selecting work packages or projects
	if (task2Record.getValue('activity_log.activity_log_id') == undefined) return; // return if selecting work packages or projects
	
	var task1Title = task1Record.getValue('activity_log.action_title');
	var task2Title = task2Record.getValue('activity_log.action_title');
	
	var message = String.format(getMessage('confirmPredecessorForAction'), taskId1 + ": " + task1Title, taskId2 + ": " + task2Title);
	View.confirm(message, function(button) {
        if (button == 'yes') {
			var pred = task2Record.getValue('activity_log.predecessors');
			if (pred) pred += "," + taskId1;
			else pred = taskId1;
			task2Record.setValue('activity_log.predecessors', pred);
			controller.projGanttChartDsActivityLogItems.saveRecord(task2Record);
			cascadeTaskDependencies(task2Record);
			controller.refreshProjGanttChartPanel();
        }
	});
}