/**
 * @author Cristina Moldovan
 * 07/06/2009
 */
var defProjCtrl = View.createController('defProjCtrl',{
	afterViewLoad: function(){
		if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA'){
			this.projectsTreePanel.addParameter('projectType', 'ASSESSMENT');
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			this.projectsTreePanel.addParameter('projectType', 'ASSESSMENT - ENVIRONMENTAL');
		}else if(this.view.taskInfo.activityId == 'AbProjCommissioning'){
			this.projectsTreePanel.addParameter('projectType', 'COMMISSIONING');
		}
	},
	projectDetailsPanel_onSave: function() {
		// refresh the opener view
		if(View.parameters != undefined && View.parameters.callback != undefined)
			View.parameters.callback();
	},
	
	projectDetailsPanel_onDelete: function() {
        var controller = this;
		var dataSource = this.dsProjectDetails;
		var record = this.projectDetailsPanel.getRecord();
        var primaryFieldValue = record.getValue("project.project_id");
        if (!primaryFieldValue) {
            return;
        }
		var crtView = View;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
					// refresh the opener view
					if(crtView.parameters != undefined && crtView.parameters.callback != undefined)
						crtView.parameters.callback();
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.projectDetailsPanel.show(false);
                controller.projectsTreePanel.refresh();
            }
        })

	}
})

function setProjectType(){
	var form = View.panels.get('projectDetailsPanel');
	var controller= View.controllers.get('defProjCtrl');
	if(controller.view.taskInfo.activityId == 'AbCapitalPlanningCA'){
		form.setFieldValue('project.project_type', 'ASSESSMENT');
	}else if(controller.view.taskInfo.activityId == 'AbRiskES'){
		form.setFieldValue('project.project_type', 'ASSESSMENT - ENVIRONMENTAL');
	}else if(controller.view.taskInfo.activityId == 'AbProjCommissioning'){
		form.setFieldValue('project.project_type', 'COMMISSIONING');
	}
}
