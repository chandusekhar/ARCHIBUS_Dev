/**
 * Keven.xi
 * 02/04/2010
 */
var controller = View.createController('abEmEpUpdateStatus', {
	
	/**
	 * called when view onload,initial the employee list panel
	 */
	afterInitialDataFetch:function(){
        this.abEmEpUpdateStatus_grid_em.refresh();
	},
	
    /**
     * perform a LIKE filter on em_id
     */
    abEmEpUpdateStatus_console_em_onShow: function(){
        var em_id = this.abEmEpUpdateStatus_console_em.getFieldValue("em.em_id");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("em.em_id", em_id + "%", "LIKE");
        this.abEmEpUpdateStatus_grid_em.refresh(restriction);
    },
	
	/**
	 * refresh self grid
	 */
	abEmEpUpdateStatus_grid_em_onRefresh:function(){
		if (this.abEmEpUpdateStatus_grid_em.restriction != null){
			this.abEmEpUpdateStatus_grid_em.refresh(this.abEmEpUpdateStatus_grid_em.restriction);
		}
	},
    
    /**
     * refresh detail panel
     */
    abEmEpUpdateStatus_grid_em_afterRefresh: function(){
        var first_emid = "";
        if (this.abEmEpUpdateStatus_grid_em.rows.length > 0) {
            first_emid = this.abEmEpUpdateStatus_grid_em.rows[0]["em.em_id"];
			var restriction = new Ab.view.Restriction();
			restriction.addClause("em.em_id", first_emid, "=");
			this.abEmEpUpdateStatus_form_em.refresh(restriction);
        }else{
			this.abEmEpUpdateStatus_form_em.show(false);
		}
    }
    
});
