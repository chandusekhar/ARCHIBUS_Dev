var projFcpmWipGanttController = View.createController('projFcpmWipGantt', {
	ganttControl:null,
	restrictions:null,
	pkgRestriction:'1=1',
	
	afterViewLoad: function() {
        this.projFcpmWipGantt_panelHtml.setContentPanel(Ext.get('gantt'));
        this.ganttControl = new Ab.flash.Gantt('gantt', 'projFcpmWipGanttDs1', 'ab-proj-fcpm-wip-gantt.axvw', false, false);
	},
	
	projFcpmWipGantt_consolePanel_afterRefresh: function() {
		this.projFcpmWipGantt_consolePanel.show(false);
    	
    	var openerController = View.controllers.get('projFcpmWip');	
	    var title = '[' + openerController.project_id + '] ' + openerController.project_name;
	    if (openerController.work_pkg_id) title += ' - ' + openerController.work_pkg_id;
	    View.panels.get('projFcpmWipGantt_panelHtml').appendTitle(title);
	},
	
	setGanttRestrictions: function() {
		var openerController = View.controllers.get('projFcpmWip');	
		if (openerController) {
			var project_id = openerController.project_id;
			var work_pkg_id = openerController.work_pkg_id;
			if (project_id) {
		   		project_id = getValidRestVal(project_id);
				var workpkgRest = "work_pkgs.project_id LIKE '" + project_id + "'";
		   		if (work_pkg_id!="") {
		   			work_pkg_id = getValidRestVal(work_pkg_id);
					workpkgRest += " AND work_pkgs.work_pkg_id LIKE '"+ work_pkg_id+"'";
		   		}	
		   		this.pkgRestriction = workpkgRest;
		   		this.restrictions = new Array();
				this.restrictions.push({'level':0,'restriction':workpkgRest});
			}
		}
	},
    
    consolePanel_onFilter: function() {
    	var openerController = View.controllers.get('projFcpmWip');	
		if (openerController) {			   	
		   	var ganttControl = Ab.view.View.getControl('', 'gantt');
		   	var levels = '0';
		  	ganttControl.refresh(this.restrictions, levels);
			ganttControl.zoom(openerController.fromDate, openerController.toDate);
		}
    },
   
    //DOCX report
    projFcpmWipGantt_panelHtml_onExportDOCX:function(){
    	ganttControl.callDOCXReportJob();
    },
    
    //PDF report
    projFcpmWipGantt_panelHtml_onExportPDF:function(){
    	ganttControl.callDOCXReportJob({'outputType': 'pdf'});
    }
    
});

function itemResized_JS(level,id,startTime,endTime,changeArea,dependentTasks){
	View.showMessage(getMessage('cannotBeEdited'));
	var controller = View.controllers.get('projFcpmWipGantt');
	controller.consolePanel_onFilter();
}

function itemClicked_JS(level,id){
	if (level == 0){
		var openerController = View.controllers.get('projFcpmWip');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', openerController.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', id);
		View.openDialog('ab-proj-fcpm-wip-gantt-pkg.axvw', restriction, false, {
		    width: 800,
		    height: 700,
		    closeButton: true	
		});
	}
}

function loadComplete_JS(panelId){
	var controller = View.controllers.get('projFcpmWipGantt');
	var ganttControl = Ab.view.View.getControl('', panelId);
	
	ganttControl.levels = [];
	ganttControl.addLevelofData(0,//hierarchyLevel
		"projFcpmWipGanttDs1",//dataSourceId
	 	"work_pkgs.work_pkg_id",//taskIdField
	 	"work_pkgs.work_pkg_id",//summaryField		
		"work_pkgs.date_start",//startDateField
		"work_pkgs.date_end",//endDateField
		null,//restrictionStartDate
		null,//restrictionEndDate
		"work_pkgs.work_pkg_id",//restrictionFieldForChildren
		"work_pkgs.project_id",//restrictionFieldFromParent
		controller.pkgRestriction);//restrictionFromConsole
	ganttControl.showData();
  	var openerController = View.controllers.get('projFcpmWip');
	ganttControl.zoom(openerController.fromDate, openerController.toDate);
}

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}