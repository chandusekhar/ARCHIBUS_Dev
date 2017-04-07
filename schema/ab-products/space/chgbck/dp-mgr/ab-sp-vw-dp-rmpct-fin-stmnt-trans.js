/**
 * @author zhang yi
 */
var controller = View.createController('viewDepartmentShareFiniStaAnalysis', {

    afterInitialDataFetch: function(){
			this.rmpctGrid.show(true);
	},

	deptGrid_afterRefresh: function(){
        var dpGrid = View.panels.get('deptGrid');

		if(dpGrid.rows[0]){
			var dvId = dpGrid.rows[0]["dp.dv_id"];
			var dpId = dpGrid.rows[0]["dp.dp_id"];
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rmpct.dv_id", dvId, "=");
			restriction.addClause("rmpct.dp_id", dpId, "=");
			this.rmpctGrid.refresh(restriction);
		}
	}
    
});


