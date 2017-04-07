////////////////////////////////////////////////////////////////
//XXX: projects are expanded or not in chart
var expandAll = false;
//XXX: enable drill-down to detail report or not
var drillDownReport = true;
//overwrite Ab.chart.ChartControl so that it can handle project gantt chart
Ab.chart.ChartControl.prototype.getSwfPath = function(){
	return View.contextPath + "/schema/ab-core/controls/chart/" + this.swfPath;
}
Ab.chart.ChartControl.prototype.initialDataFetch = function(){
	this.swfPath = "ganttchart";
	this.swfPath += '?panelId=' + this.id+'&expandAll='+expandAll;	
	if(this.showOnLoad){
	   this.getDataFromDataSources(this.restriction);
	}
	this.loadChartSWFIntoFlash();
} 
Ab.chart.ChartControl.prototype.getDataFromDataSources = function(restriction){
	var parameters = this.getParameters('ganttchart_projects_ds',restriction);
	var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
	ganttChart.tasksData = [];
	//TO DO: all info coming from AXVW
	for(var i=0; i<result.data.records.length; i++){
			var record = result.data.records[i];
			var task_temp = {};
			task_temp.id = record['project.project_id'];
			task_temp.name = record['project.project_id'];
			var startTime  = record['project.date_commence_work'];			
			task_temp.startTime = startTime;
			var endTime  = record['project.date_target_end'];
			task_temp.endTime = endTime;			
			task_temp.duration = ganttChart.getDuration(endTime, startTime);
			task_temp.type="project";
			task_temp.actions = [];
			var rest = new Ab.view.Restriction();
			rest.addClause('activity_log.project_id', record['project.project_id'], '=');
			parameters = this.getParameters('ganttchart_actions_ds',rest);
			var result2 = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
			for(var j=0; j<result2.data.records.length; j++){
				record = result2.data.records[j];
				var actions_temp = {};
				actions_temp.id = record['activity_log.activity_log_id'];
				actions_temp.name = record['activity_log.action_title'];
				actions_temp.type="action";
				var startTime  = record['activity_log.date_scheduled'];		
				actions_temp.startTime = startTime;
				var endTime  = record['activity_log.date_scheduled_end'];
				actions_temp.endTime = endTime;
				actions_temp.duration = ganttChart.getDuration(endTime, startTime);
				actions_temp.project_id = record['activity_log.project_id'];
				task_temp.actions.push(actions_temp);
			}
			ganttChart.tasksData.push(task_temp);
	}
}
Ab.chart.ChartControl.prototype.refresh = function(restriction){
	this.getDataFromDataSources(restriction);
	var chartControl = this.getSWFControl();	
	if(chartControl != null){
		try{
			chartControl.refreshData(ganttChart.tasksData);
		}catch(e){}
	}
}
Ab.chart.ChartControl.prototype.getParameters = function(dataSourceId, restriction){
	var viewDef = new Ab.view.ViewDef(this.configObj.getConfigParameter('viewDef'), this.configObj.getConfigParameter('groupIndex'), null, null, this.configObj.getConfigParameter('dataSourceId'));
	var parameters = {
           viewName:    viewDef.viewName,
		   groupIndex:  viewDef.tableGroupIndex,
           controlId:   this.id,
           version:     Ab.view.View.version
       };
       if (valueExists(restriction)) {
           parameters.restriction = toJSON(restriction);       
       }
	   parameters.dataSourceId = dataSourceId;	   

       Ext.apply(parameters, this.parameters);
       return parameters;
};
///////////////////////////////////////////////////////////////////////
//class ganttChart to provide data and methods for communicating with SWF Gantt Chart
function ganttChart(){};
ganttChart.tasksData=[];
//XXX: drill-down to detail report
ganttChart.onclick = function(id, type){
    if(drillDownReport){
		var panel = null;
		var rest = new Ab.view.Restriction();
		if(type=='project'){	
			panel = View.panels.get('gantt_chart_projects_report');		
			rest.addClause('project.project_id', id, '=');
		}else{
			panel = View.panels.get('gantt_chart_projects_action_report');		
			rest.addClause('activity_log.activity_log_id', id, '=');
		}
		panel.refresh(rest);
		panel.showInWindow({
	            width: 400, 
	            height: 380
	     });
	     var image_name="";
	     var alt = "";
	     var image_object = null;
	     
	     if(type=='project'){  
	       //XXX: project.doc_image
	       image_name = panel.getFieldValue("project.doc_image");
	       alt = panel.getFieldValue("project.project_id");
	       image_object = $('project_image');
	     }else{
	       //XXX: activity_log.doc_file1
	       image_name = panel.getFieldValue("activity_log.doc_file1");
	       alt = panel.getFieldValue("activity_log.action_title");
	       image_object = $('activity_image');
	     }
	     if(image_name==""){
	       image_name="archibus-logo.gif";
	     }
	     if(image_object){
	       image_object.innerHTML="<img align='middle' style='cursor:hand;' border='0' hspace='1' alt='"+alt+"' title='"+alt+"' src='"+View.contextPath + "/schema/ab-system/graphics/"+image_name+"'/>";
	     }
     }
}
//XXX: private 
ganttChart.getMinVisibleTime=function(){
	var year = 2000;
	if(ganttChart.tasksData.length != 0){
		var minYear = new Date(ganttChart.tasksData[0].startTime);
		for(var i=1;i<ganttChart.tasksData.length; i++){
			var tempYear = new Date(ganttChart.tasksData[i].startTime);
			if(!DateMath.before(minYear,tempYear)){
				minYear = tempYear;
			}
		}
		year = minYear.getFullYear();
	}
	return year;
}
//XXX: private
ganttChart.getMaxVisibleTime=function(){
	var year = 2010;
	if(ganttChart.tasksData.length != 0){
		var maxYear = new Date(ganttChart.tasksData[0].endTime);
		for(var i=1;i<ganttChart.tasksData.length; i++){
			var tempYear = new Date(ganttChart.tasksData[i].endTime);
			if(DateMath.before(maxYear,tempYear)){
				maxYear = tempYear;
			}
		}
		ganttChart.maxDate = maxYear;
	}
	
	return year;
}
//XXX: private
ganttChart.getDuration=function(endDate, startDate){
	var duration = 0;
	var difDate = new Date(endDate).getTime()  - new Date(startDate).getTime();
	duration = Math.round(difDate / (24*60*60*1000));
	if(duration==0)
		duration = 1;
	if(duration<0)
		duration = 0;
	return duration;
}
//XXX: private
ganttChart.tasks = function(){
	return ganttChart.tasksData;
};
