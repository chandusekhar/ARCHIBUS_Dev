/**
 * Keven.xi
 * 02/07/2010
 */
var controller = View.createController('abEmRmUpdateStatus', {
	
	/**
	 * called when view onload
	 */
	afterInitialDataFetch:function(){
		this.onStart();
	},
	
	/**
	 * 
	 */
	onStart:function(){
		var restriction = new Ab.view.Restriction();
        if (this.abEmRmUpdateStatus_grid_fl.rows.length > 0) {
            var firstFlRow = this.abEmRmUpdateStatus_grid_fl.rows[0];
            restriction.addClause("rm.bl_id", firstFlRow["fl.bl_id"], "=");
			restriction.addClause("rm.fl_id", firstFlRow["fl.fl_id"], "=");
            this.abEmRmUpdateStatus_grid_rm.refresh(restriction);
        }
        else {
        	restriction.addClause("rm.bl_id", "", "=");
			restriction.addClause("rm.fl_id", "", "=");
            this.abEmRmUpdateStatus_grid_rm.refresh(restriction);
        }
	},
	
	/**
	 * called when user the refresh button in floor panel
	 */
	abEmRmUpdateStatus_grid_fl_onRefresh:function(){
		var restriction = new Ab.view.Restriction();
		this.abEmRmUpdateStatus_grid_fl.refresh(restriction);
		this.onStart();
	},
	/**
	 * refresh the editing room status form
	 * or add new room in the selected floor
	 */
	abEmRmUpdateStatus_grid_rm_afterRefresh:function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEmRmUpdateStatus_grid_rm.rows.length > 0) {
			var firstRmRow = this.abEmRmUpdateStatus_grid_rm.rows[0];
			this.abEmRmUpdateStatus_grid_rm.selectedRowIndex = 0;
			
			restriction.addClause("rm.bl_id", firstRmRow["rm.bl_id"], "=");
			restriction.addClause("rm.fl_id", firstRmRow["rm.fl_id"], "=");
			restriction.addClause("rm.rm_id", firstRmRow["rm.rm_id"], "=");
			this.updateRmStatusForm.refresh(restriction,false);
		}
		else {
			var bl_id = this.abEmRmUpdateStatus_grid_rm.restriction.clauses[0].value;
			var fl_id = this.abEmRmUpdateStatus_grid_rm.restriction.clauses[1].value;
			restriction.addClause("rm.bl_id", bl_id, "=");
			restriction.addClause("rm.fl_id", fl_id, "=");
			this.updateRmStatusForm.refresh(restriction,true,true);
		}
	},
	/**
	 * 
	 */
	updateRmStatusForm_afterRefresh:function(){
		if (this.updateRmStatusForm.newRecord){
			this.updateRmStatusForm.actions.get("delete").forceDisable(true);
			this.updateRmStatusForm.actions.get("addNew").forceDisable(true);
		}else{
			this.updateRmStatusForm.actions.get("delete").enable(true);
			this.updateRmStatusForm.actions.get("addNew").enable(true);
		}
		this.setEditPanelTitle(this.updateRmStatusForm.newRecord);
	},
	/**
	 * called when user click add new button
	 */
	updateRmStatusForm_onAddNew:function(){
		var restriction = new Ab.view.Restriction();
		var rmGrid = this.abEmRmUpdateStatus_grid_rm;
		var selectedRow = rmGrid.rows[rmGrid.selectedRowIndex];
		restriction.addClause("rm.bl_id", selectedRow["rm.bl_id"], "=");
		restriction.addClause("rm.fl_id", selectedRow["rm.fl_id"], "=");
		restriction.addClause("rm.rm_id", selectedRow["rm.rm_id"], "=");
		this.updateRmStatusForm.refresh(restriction,true,true);
	},
	/**
	 * called when user click cancel button
	 */
	updateRmStatusForm_onCancel:function(){
		if (this.updateRmStatusForm.newRecord){
			if (this.abEmRmUpdateStatus_grid_rm.selectedRowIndex >=0 ){
				onClickRoom();
			}else{
				//do nothing
			}
		}else{
				onClickRoom();
		}
	},
	/**
	 * set Edit form title
	 * @param {Object} newRecord
	 */
	setEditPanelTitle:function(newRecord){
		if (newRecord){
			this.updateRmStatusForm.setTitle(getMessage("addNewPanelTitle"));
		}else{
			this.updateRmStatusForm.setTitle(getMessage("editPanelTitle"));
		}
	}
    
});

/**
 * called when user select floor
 */
function onClickFloor(){
    var flGrid = View.panels.get("abEmRmUpdateStatus_grid_fl");
    var selectedRow = flGrid.rows[flGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.bl_id", selectedRow["fl.bl_id"], "=");
	restriction.addClause("eq.fl_id", selectedRow["fl.fl_id"], "=");
	
	var rmGrid = View.panels.get("abEmRmUpdateStatus_grid_rm");
    rmGrid.refresh(restriction);
}

function onClickRoom(){
	var rmGrid = View.panels.get("abEmRmUpdateStatus_grid_rm");
    var selectedRow = rmGrid.rows[rmGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", selectedRow["rm.bl_id"], "=");
	restriction.addClause("rm.fl_id", selectedRow["rm.fl_id"], "=");
	restriction.addClause("rm.rm_id", selectedRow["rm.rm_id"], "=");
	
	var updateRmStatusForm = View.panels.get("updateRmStatusForm");
    updateRmStatusForm.refresh(restriction,false);
}
