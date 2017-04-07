/**
 * Keven.xi
 * 02/03/2010
 */
var controller = View.createController('abEmEmergency', {
	
	/**
	 * called when view onload,initial the employee list panel
	 */
	afterInitialDataFetch:function(){
        this.abEmEmergencyInfo_grid_em.refresh();
	},
	
    /**
     * perform a LIKE filter on em_id
     */
    abEmEmergencyInfo_console_em_onShow: function(){
        var em_id = this.abEmEmergencyInfo_console_em.getFieldValue("em.em_id");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("em.em_id", em_id + "%", "LIKE");
        this.abEmEmergencyInfo_grid_em.refresh(restriction);
    },
	
	/**
	 * refresh self grid
	 */
	abEmEmergencyInfo_grid_em_onRefresh:function(){
		if (this.abEmEmergencyInfo_grid_em.restriction != null){
			this.abEmEmergencyInfo_grid_em.refresh(this.abEmEmergencyInfo_grid_em.restriction);
		}
	},
    
    /**
     * refresh detail panel
     */
    abEmEmergencyInfo_grid_em_afterRefresh: function(){
        var first_emid = "";
        if (this.abEmEmergencyInfo_grid_em.rows.length > 0) {
            first_emid = this.abEmEmergencyInfo_grid_em.rows[0]["em.em_id"];
			var restriction = new Ab.view.Restriction();
			restriction.addClause("em.em_id", first_emid, "=");
			this.abEmEmergencyInfo_colrep_em.refresh(restriction);
        }else{
			this.abEmEmergencyInfo_colrep_em.show(false);
		}
    }
    
});
