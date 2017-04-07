function itemResized_JS(level,id,startTime,endTime,changeArea,dependentTasks){
	alert("level: " + level + " id: " + id + " start: " + startTime + " end: " + endTime+ " changeArea:" + changeArea +
	" dependentTasks: " + dependentTasks);
}

function itemClicked_JS(level,id){
	if(level == 0){
		var restriction = {'project.project_id': id};
		Ab.view.View.openDialog('ab-ex-calendar-project-dialog.axvw', restriction, false, 20, 40, 800, 600);
	}
	if(level == 1){
		var restriction = {'work_pkgs.work_pkg_id': id};
		Ab.view.View.openDialog('ab-ex-calendar-wrkpkg-dialog.axvw', restriction, false, 20, 40, 800, 600);  	
	}
	if(level == 2){
		var restriction = { 'activity_log.activity_log_id': id };
		Ab.view.View.openDialog('ab-ex-gantt-activity-dialog.axvw', restriction, false, 20, 40, 800, 600);  	
	}
	
}

function loadComplete_JS(panelId){
	var ganttControl = Ab.view.View.getControl('', panelId);
	
	ganttControl.addLevelofData(0, //hierarchyLevel
	 	"abGanttActivityDsProjects", //dataSourceId
	 	"project.project_id", //taskIdField
	 	"project.description",//summaryField
		"project.date_start",//startDateField
		"project.date_end",//endDateField
		null,//restrictionStartDate
		null,//restrictionEndDate
		"project.project_id",//restrictionFieldForChildren
		null,//restrictionFieldFromParent
		null); //restrictionFromConsole
	ganttControl.addLevelofData(1,//hierarchyLevel
		"abGanttActivityDsWorkPackages",//dataSourceId
	 	"work_pkgs.work_pkg_id",//taskIdField
	 	"work_pkgs.description",//summaryField		
		"work_pkgs.date_est_start",//startDateField
		"work_pkgs.date_est_end",//endDateField
		null,//restrictionStartDate
		null,//restrictionEndDate
		"work_pkgs.work_pkg_id",//restrictionFieldForChildren
		"work_pkgs.project_id",//restrictionFieldFromParent
		null);//restrictionFromConsole
	ganttControl.addLevelofData(2,//hierarchyLevel
		"abGanttActivityDsActivityLogItems", //dataSourceId
	 	"activity_log.activity_log_id",//taskIdField
	 	"activity_log.action_title",//summaryField
		"activity_log.date_scheduled",//startDateField
		"activity_log.date_scheduled_end",//endDateField
		null,//restrictionStartDate
		null,//restrictionEndDate
		null,//restrictionFieldForChildren
		"activity_log.project_id;activity_log.work_pkg_id;",//restrictionFieldFromParent
		null);//restrictionFromConsole
	ganttControl.addConstraintsDataSource(
		"abGanttActivityDsActivityLogItems",//dataSourceId
		"activity_log.predecessors",//fromIdField
		"activity_log.activity_log_id",//,toIdField
		null);//typeOfConstraintField)
	ganttControl.showData();
	ganttControl.zoom("2012/01/01","2013/12/31");	
}

View.createController('showCalendarActivity', {

	ganttControl:null,
	
	afterViewLoad: function(){
        var ganttControl = new Ab.flash.Gantt('gantt',"abGanttActivityDsProjects",
        	"ab-ex-gantt-activity.axvw",true,false);
        this.panelHtml.setContentPanel(Ext.get('gantt'));
    },
    
    consolePanel_onFilter: function(){	
		var console = View.panels.get('consolePanel');
		var ganttControl = Ab.view.View.getControl('', 'gantt');
		
		var restrictions = [];
		
		var dateScheduledFrom = console.getFieldElement("activity_log.date_scheduled.from").value;
		var dateScheduledTo = console.getFieldElement("activity_log.date_scheduled.to").value;
		
		 // validate the date range 
		if (dateScheduledFrom!='' && dateScheduledTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (!compareLocalizedDates(dateScheduledFrom,dateScheduledTo)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		var projectRest = "0=0";
		var activityLogRest = "0=0";
		var workpkgRest = "0=0";
		
		var isoDateScheduledTo = "";
		var isoDateScheduledFrom = "";
		
		var project_id = console.getFieldValue('activity_log.project_id');
   		if (project_id!="") {
			projectRest += " AND (project.project_id LIKE '" + project_id +"' )";
			workpkgRest += " AND (work_pkgs.project_id LIKE '"+ project_id+"')";
			activityLogRest +=" AND (activity_log.project_id LIKE '"+ project_id+"')";
   		} 
		if(dateScheduledFrom == "" && dateScheduledTo == ""){
			if(valueExistsNotEmpty(document.getElementById("showLevels").value)){
	   			var levels = document.getElementById("showLevels").value.split(";");
	   			ganttControl.refresh(projectRest,levels);
	   		} else {
	   			ganttControl.refresh(projectRest);
	   		}
			
		} else {
		
			if (dateScheduledTo != '') {
				isoDateScheduledTo = getDateWithISOFormat(dateScheduledTo);
				projectRest += " AND project.date_start < #Date%" + isoDateScheduledTo+"%";
				workpkgRest += " AND work_pkgs.date_est_start < #Date%" + isoDateScheduledTo+"%";
				activityLogRest +=" AND activity_log.date_scheduled < #Date%"+isoDateScheduledTo+"%";			
			}
			
			if (dateScheduledFrom != '') {
				isoDateScheduledFrom = getDateWithISOFormat(dateScheduledFrom);
			
				projectRest += " AND project.date_start > #Date%" + isoDateScheduledFrom+"%";
				workpkgRest += " AND work_pkgs.date_est_start > #Date%" + isoDateScheduledFrom+"%";
				activityLogRest +=" AND activity_log.date_scheduled > #Date%"+isoDateScheduledFrom+"%";			
			}
			
			restrictions.push({'level':0,'restriction':projectRest});
			restrictions.push({'level':1,'restriction':workpkgRest});
			restrictions.push({'level':2,'restriction':activityLogRest});
	   		
	   		if(valueExistsNotEmpty(document.getElementById("showLevels").value)){
	   			var levels = document.getElementById("showLevels").value.split(";");
	   			ganttControl.refresh(restrictions,levels);
	   		} else {
	   			ganttControl.refresh(restrictions);
	   		}
			if(isoDateScheduledFrom != "" && isoDateScheduledTo != ""){
				ganttControl.zoom(isoDateScheduledFrom,isoDateScheduledTo);
			}
		}
    },
    
    consolePanel_onClear:function(){
    	var console = View.panels.get('consolePanel');
    	console.setFieldValue('activity_log.project_id',"");
    	console.setFieldValue('activity_log.date_scheduled.from',"");
    	console.setFieldValue('activity_log.date_scheduled.to',"");
    	
    	var ganttControl = Ab.view.View.getControl('', 'gantt');
    	document.getElementById("showLevels").value="";
    	ganttControl.refresh([]);
    },
   
    //DOCX report
    panelHtml_onExportDOCX:function(){
    	ganttControl.callDOCXReportJob();
    },
    
    //PDF report
    panelHtml_onExportPDF:function(){
    	ganttControl.callDOCXReportJob({'outputType': 'pdf'});
    },
    
    //PPT report
    panelHtml_onExportPPT:function(){
    	 var slides = [];
    	 var image = ganttControl.getImageBytes();
 		 slides.push({'title': Ab.view.View.title, 'type':'flash', 'images':[image]});
 		 
 		 var jobId =  Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
 		 View.openJobProgressBar("Please wait...", jobId, null, function(status) {
  	   		var url  = status.jobFile.url;
 			window.location = url;
  	   	 });
    },
    
    updateGanttItem: function(id,start,end,title){
  	  ganttControl.updateItem(id,start,end,title);
    }
    
});