/**
 * Used in all management views.
 * - Manage Hazard Activity, Manage Hazard Assessment  and corresponding views from 
 * Field Assessor and Abatement Worker
 */
var abCbProjectCtrl = View.createController('abCbProjectCtrl', {
	// assessor/abatement worker restriction
	userRoleRestriction: null,
	
	afterInitialDataFetch: function(){
		this.getMainController().projectCtrl = this;
		this.userRoleRestriction = this.getMainController().userRoleRestriction;

		this.abCbProjects_consolePanel_onShow();
	},

	/**
	 * Get selected rows data.
	 * @param field if is specified return only this field values
	 */
	getSelectedData: function(field){
		var selectedProjectId = this.getMainController().projectId;
		
		if(!valueExists(selectedProjectId)){
			View.showMessage(getMessage("errNoProjectSelected"));
			return false;
		} else {
			var selectedProjectRow = null;
	        for (var r = 0; r < this.abCbProjectsList.rows.length; r++) {
	            var row = this.abCbProjectsList.rows[r];
	            if (row.row.getFieldValue("project.project_id") == selectedProjectId) {
	            	selectedProjectRow = row;
	            	break;
	            }
	        }
	        if(valueExistsNotEmpty(field)){
				return selectedProjectRow[field];
			}else{
				return selectedProjectRow;
			}
		}
	},
	
	/**
	 * On Show button, refresh the grid according to console restriction
	 */
	abCbProjects_consolePanel_onShow: function(){
		var restriction = this.abCbProjects_consolePanel.getFieldRestriction();
		   
    fixGeoLocationRestriction("ctry_id", restriction);
    fixGeoLocationRestriction("state_id", restriction);
    fixGeoLocationRestriction("city_id", restriction);
                   
		var status = $("abCbProjects_status").value;
	    if (status == "In Planning") {
	    	restriction.addClause("project.status", ["Approved","Approved-In Design"], "IN");
	    } else if (status == "In Execution") {
	    	restriction.addClause("project.status", ["Issued-In Process","Issued-On Hold","Completed-Pending","Completed-Not Ver"], "IN");
		}
	    
	    // add the parameter for user role as assessor or abatement worker
	    if(this.userRoleRestriction){
	    	this.abCbProjectsList.addParameter("userRoleRestriction", this.userRoleRestriction);
	    }
		
		this.abCbProjectsList.refresh(restriction);
	},
	
	/**
	 * On details event handler.
	 */
	onDetailsButton: function(context){
		var projectId = context.row.getFieldValue("project.project_id");
		
		var restriction =  new Ab.view.Restriction();
		restriction.addClause('project.project_id', projectId, '=');
		
		View.openDialog('ab-cb-project-dataview.axvw', null, false, { 
		    width: 800, 
		    height: 600, 
		    closeButton: true,
			afterInitialDataFetch: function(dialogView){
				var dialogController = dialogView.controllers.get('repProjDataViewCtrl');
				dialogController.refreshReport(restriction);
			}
		});
	},
	
	getMainController: function(){
		var mainControllerId = this.view.parentTab.mainControllerId;
		var mainController = this.view.getOpenerView().controllers.get(mainControllerId);
		
		return mainController;
	},

	/**
	 * On Select event handler.
	 */
	onSelectProjectButton: function(context){
		var mainController = abCbProjectCtrl.getMainController();
		
		mainController.projectId = context.row.getFieldValue("project.project_id");
		mainController.projProbType = context.row.getFieldValue("project.prob_type");
		mainController.enableTabsFor("initForProject");
	},
	
	abCbProjectsList_afterRefresh: function(){
		this.getMainController().projectId = null;
		this.getMainController().projProbType = null;
	},
	
	/**
	 * select the default value for SELECT field
	 */
	clearSelect: function(fieldId){
		var selectOptions = document.getElementById(fieldId).options;
	    for(var i=0; i<selectOptions.length; i++) {
			if(selectOptions[i].defaultSelected) {
				selectOptions[i].selected = true;
				break;
	    	}
		}
	    
	    return true;
	}
});

function fixGeoLocationRestriction(field, restriction) {
    var console = abCbProjectCtrl.abCbProjects_consolePanel;
    if (console.getFieldValue("bl."+field) != "") {
      restriction.removeClause("bl."+field);
      var op = "LIKE";
      var val = console.getFieldValue("bl."+field) + "%";
      if (console.hasFieldMultipleValues("bl."+field)) {
        op = "IN";
        val = console.getFieldMultipleValues("bl."+field);
      }
      restriction.addClause("bl."+field, val, op, ")AND(");
      restriction.addClause("site."+field, val, op, "OR");
    }
}

