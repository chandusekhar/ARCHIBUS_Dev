/**
 * @author Kevenxi
 */
View.createController('abEmxRmController', {

    //----------------event handle--------------------
	afterInitialDataFetch:function(){
		this.onStart();
	},
	
	/**
	 * refresh rooms grid panel by the first row data in floor panel
	 */
    onStart: function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEmxrm_grid_fl.rows.length > 0) {
            var firstFlRow = this.abEmxrm_grid_fl.rows[0];
            restriction.addClause("rm.bl_id", firstFlRow["fl.bl_id"], "=");
			restriction.addClause("rm.fl_id", firstFlRow["fl.fl_id"], "=");
            this.abEmxrm_grid_rm.refresh(restriction);
        }
        else {
        	restriction.addClause("rm.bl_id", "", "=");
			restriction.addClause("rm.fl_id", "", "=");
            this.abEmxrm_grid_rm.refresh(restriction);
        }
    },
	
	/**
	 * called when user the refresh button in floor panel
	 */
	abEmxrm_grid_fl_onRefresh:function(){
		var restriction = new Ab.view.Restriction();
		this.abEmxrm_grid_fl.refresh(restriction);
		this.onStart();
	},
	
    /**
     * set rooms panel title and refresh employees panel
     */
    abEmxrm_grid_rm_afterRefresh: function(){
		if (!this.abEmxrm_grid_rm.restriction){
			return;
		} 
		//get bl_id and fl_id
		var bl_id = this.abEmxrm_grid_rm.restriction.clauses[0].value;
		var fl_id = this.abEmxrm_grid_rm.restriction.clauses[1].value;
		this.setRoomsPanelTitle(bl_id,fl_id);
		
		//refresh employee panel
        var restriction = new Ab.view.Restriction();
        if (this.abEmxrm_grid_rm.rows.length > 0) {
            var firstRmRow = this.abEmxrm_grid_rm.rows[0];
			this.abEmxrm_grid_rm.selectedRowIndex = 0;
            restriction.addClause("em.bl_id", bl_id, "=");
			restriction.addClause("em.fl_id", fl_id, "=");
			restriction.addClause("em.rm_id", firstRmRow["rm.rm_id"], "=");
            this.abEmxrm_grid_em.refresh(restriction);
        }
        else {
			restriction.addClause("em.bl_id", "-1", "=");
			restriction.addClause("em.fl_id", "-1", "=");
			restriction.addClause("em.rm_id", "-1", "=");
            this.abEmxrm_grid_em.refresh(restriction);
        }
    },
	/**
	 * set employees panel title after refresh
	 */
	abEmxrm_grid_em_afterRefresh:function(){
		if (!this.abEmxrm_grid_em.restriction){
			return;
		} 
		//get bl_id and fl_id and rm_id
		var bl_id = this.abEmxrm_grid_em.restriction.clauses[0].value;
		var fl_id = this.abEmxrm_grid_em.restriction.clauses[1].value;
		var rm_id = this.abEmxrm_grid_em.restriction.clauses[2].value;
		this.setEmpsPanelTitle(bl_id,fl_id,rm_id);
	},
	
	/**
	 * generate paginated report for user selection
	 */
	abEmxrm_grid_em_onPaginatedReport: function(){
		if (this.abEmxrm_grid_em.rows.length > 0) {
			var restriction = new Ab.view.Restriction();
			var selectedRoomRow = this.abEmxrm_grid_rm.rows[this.abEmxrm_grid_rm.selectedRowIndex];
			restriction.addClause("em.bl_id", selectedRoomRow["rm.bl_id"], "=");
			restriction.addClause("em.fl_id", selectedRoomRow["rm.fl_id"], "=");
			restriction.addClause("em.rm_id", selectedRoomRow["rm.rm_id"], "=");
			View.openPaginatedReportDialog('ab-emxrm-pgrp.axvw', {'ds_ab-emxrm-pgrp_grid_em':restriction}, null);
		}else{
			View.showMessage(getMessage("noRecords"));
		}
	},
	
	/**
	 * set rooms panel title
	 * @param {Object} bl_id
	 * @param {Object} fl_id
	 */
	setRoomsPanelTitle:function(bl_id,fl_id){
		var title = getMessage("roomsPanelTitle");
		if (bl_id != "" && fl_id != ""){
			title += " " +bl_id+"-"+fl_id ;
		}
		this.abEmxrm_grid_rm.setTitle(title);
	},
	
	/**
	 * set employee panel title
	 * @param {Object} bl_id
	 * @param {Object} fl_id
	 * @param {Object} rm_id
	 */
	setEmpsPanelTitle:function(bl_id,fl_id,rm_id){
		var title = getMessage("empsPanelTitle");
		if (bl_id != "-1" && fl_id != "-1"){
			title += " " +bl_id+"-"+fl_id+"-"+rm_id ;
		}
		this.abEmxrm_grid_em.setTitle(title);
	}
    
    
});
/**
 * called when user select floor
 */
function onClickFloor(){
    var flGrid = View.panels.get("abEmxrm_grid_fl");
    var selectedRow = flGrid.rows[flGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", selectedRow["fl.bl_id"], "=");
	restriction.addClause("rm.fl_id", selectedRow["fl.fl_id"], "=");
	
	var rmGrid = View.panels.get("abEmxrm_grid_rm");
    rmGrid.refresh(restriction);
}
/**
 * called when user select room
 */
function onSelectRoom(){
	var rmGrid = View.panels.get("abEmxrm_grid_rm");
    var selectedRow = rmGrid.rows[rmGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", selectedRow["rm.bl_id"], "=");
	restriction.addClause("em.fl_id", selectedRow["rm.fl_id"], "=");
	restriction.addClause("em.rm_id", selectedRow["rm.rm_id"], "=");
	
	var empsGrid = View.panels.get("abEmxrm_grid_em");
    empsGrid.refresh(restriction);
}

