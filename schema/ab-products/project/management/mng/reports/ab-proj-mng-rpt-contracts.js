var projMngRptContractsController = View.createController('projMngRptContracts',{
    project_id: '',
    
	afterInitialDataFetch: function() {
		this.project_id = View.getOpenerView().getOpenerView().controllers.get('projMng').project_id;
		this.projMngRptContractsGrid.appendTitle(this.project_id);
	},
	
    projMngRptContractsGrid_onProjMngRptContractsTab2: function(obj) {
    	var work_pkg_id = obj.restriction['work_pkg_bids.work_pkg_id'];
    	var vn_id = obj.restriction['work_pkg_bids.vn_id'];
    	var restriction = new Ab.view.Restriction;
    	restriction.addClause('work_pkg_bids.project_id', this.project_id);
    	restriction.addClause('work_pkg_bids.work_pkg_id', work_pkg_id);
    	restriction.addClause('work_pkg_bids.vn_id', vn_id);
    	this.projMngRptContractsTabs.selectTab('projMngRptContractsTab2', restriction);
    }
});

