/**
 * Keven.xi
 * 02/07/2010
 */
var controller = View.createController('abEmSysUpdateStatus', {

    /**
     * called when view onload
     */
    afterInitialDataFetch: function(){
        this.onStart();
    },
    
    /**
     *
     */
    onStart: function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEmSysUpdateStatus_grid_bl.rows.length > 0) {
            var firstBlRow = this.abEmSysUpdateStatus_grid_bl.rows[0];
            restriction.addClause("system_bl.bl_id", firstBlRow["bl.bl_id"], "=");
            this.abEmSysUpdateStatus_grid_system.refresh(restriction);
        }
        else {
			View.alert(getMessage('noRecord'));
			this.abEmSysUpdateStatus_grid_bl.show(false);
        }
    },
	/**
     * called when user the refresh button in building panel
     */
    abEmSysUpdateStatus_grid_bl_onRefresh: function(){
        var restriction = new Ab.view.Restriction();
        this.abEmSysUpdateStatus_grid_bl.refresh(restriction);
		this.onStart();
    },
    /**
     * refresh the editing room status form
     * or add new room in the selected floor
     */
    abEmSysUpdateStatus_grid_system_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEmSysUpdateStatus_grid_system.rows.length > 0) {
            var firstRmRow = this.abEmSysUpdateStatus_grid_system.rows[0];
            this.abEmSysUpdateStatus_grid_system.selectedRowIndex = 0;
            
            restriction.addClause("system_bl.system_id", firstRmRow["system_bl.system_id"], "=");
            this.updateSysStatusForm.refresh(restriction, false);
        }
        else {
            var bl_id = this.abEmSysUpdateStatus_grid_system.restriction.clauses[0].value;
            restriction.addClause("system_bl.bl_id", bl_id, "=");
            this.updateSysStatusForm.refresh(restriction, true, true);
        }
    },
    /**
     *
     */
    updateSysStatusForm_afterRefresh: function(){
        if (this.updateSysStatusForm.newRecord) {
            this.updateSysStatusForm.actions.get("delete").forceDisable(true);
            this.updateSysStatusForm.actions.get("addNew").forceDisable(true);
        }
        else {
            this.updateSysStatusForm.actions.get("delete").enable(true);
            this.updateSysStatusForm.actions.get("addNew").enable(true);
        }
		this.setEditPanelTitle(this.updateSysStatusForm.newRecord);
    },
    /**
     * called when user click add new button
     */
    updateSysStatusForm_onAddNew: function(){
        var restriction = new Ab.view.Restriction();
		var systemGrid = this.abEmSysUpdateStatus_grid_system;
        var selectedRow = systemGrid.rows[systemGrid.selectedRowIndex];
        restriction.addClause("system_bl.bl_id", selectedRow["system_bl.bl_id"], "=");
        this.updateSysStatusForm.refresh(restriction, true, true);
    },

	    /**
     * called when user click cancel button
     */
    updateSysStatusForm_onSave: function(){
		if (this.updateSysStatusForm.canSave()) {
			var record = this.updateSysStatusForm.getRecord();
			try {
				var result = Workflow.callMethod('AbRiskEmergencyPreparedness-EPCommonService-updateSystemStatus',record);
				if (result.code == "executed") {
					View.showMessage(getMessage("recordSuccessfullySaved"));
				}
			}
            catch (e) {
                Workflow.handleError(e);
				return;
            }
		}
		else{
			alert(getMessage("errorSave"));
		}
    },

	/**
     * called when user click cancel button
     */
    updateSysStatusForm_onCancel: function(){
        if (this.updateSysStatusForm.newRecord) {
            if (this.abEmSysUpdateStatus_grid_system.selectedRowIndex >= 0) {
                onClickSystem();
            }
            else {
                //do nothing
            }
        }
        else {
            onClickSystem();
        }
    },
	/**
	 * set Edit form title
	 * @param {Object} newRecord
	 */
	setEditPanelTitle:function(newRecord){
		if (newRecord){
			this.updateSysStatusForm.setTitle(getMessage("addNewPanelTitle"));
		}else{
			this.updateSysStatusForm.setTitle(getMessage("editPanelTitle"));
		}
	}
    
});

/**
 * called when user select floor
 */
function onClickBuilding(){
    var blGrid = View.panels.get("abEmSysUpdateStatus_grid_bl");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("system_bl.bl_id", selectedRow["bl.bl_id"], "=");
    
    var systemGrid = View.panels.get("abEmSysUpdateStatus_grid_system");
    systemGrid.refresh(restriction);
}

function onClickSystem(){
    var systemGrid = View.panels.get("abEmSysUpdateStatus_grid_system");
    var selectedRow = systemGrid.rows[systemGrid.selectedRowIndex];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("system_bl.system_id", selectedRow["system_bl.system_id"], "=");
    
    var updateSysStatusForm = View.panels.get("updateSysStatusForm");
    updateSysStatusForm.refresh(restriction, false);
}
