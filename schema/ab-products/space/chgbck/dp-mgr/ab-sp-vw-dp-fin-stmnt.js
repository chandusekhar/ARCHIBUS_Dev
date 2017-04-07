/**
 * @author zhang yi
 */
var controller = View.createController('viewDepartmentFiniStaAnalysis', {

    afterInitialDataFetch: function(){
			this.roomGroupGrid.show(true);	
	},

	deptGrid_afterRefresh: function(){
        var dpGrid = View.panels.get('deptGrid');

		if(dpGrid.rows[0]){
			var dvId = dpGrid.rows[0]["dp.dv_id"];
			var dpId = dpGrid.rows[0]["dp.dp_id"];
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rm.dv_id", dvId, "=");
			restriction.addClause("rm.dp_id", dpId, "=");
			this.roomGroupGrid.refresh(restriction);
		}
	}
    
});

