var Controller = View.createController('proseduresForGroup', {
    afterInitialDataFetch: function(){
		var pmGroup;
		var records;
        var pmsPanel = View.getOpenerView().panels.get("pmgp_select");
        var selectedRowIndex = pmsPanel.selectedRowIndex;
        if (selectedRowIndex != -1) {
            pmGroup = pmsPanel.rows[selectedRowIndex]['pmgp.pm_group'];
        }
        //var pmGroupId = View.getOpenerView().pmGroupId;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('pms.pm_group', pmGroup, '=');
        records = View.dataSources.get('ds_ab-pm-sched-for-group_pms').getRecords(restriction);
		View.panels.get('pms').dataView.setRecords(records);
		
    }
});
