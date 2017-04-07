var abEamLifecycleDepCtrl = View.createController('abEamLifecycleDepCtrl', {
	
	assetType: null,
	
	assetId: null,
	
	afterInitialDataFetch: function(){
		this.abEamLifecycleDepRefresh.refresh();
	},
	
	refreshView: function(){
		if(valueExistsNotEmpty(this.assetType)){
			if(this.assetType == 'bl'){
				this.abEamLifecycleDepProperty_report.show(false, true);
				this.abEamLifecycleDepEq_report.show(false, true);
				this.abEamLifecycleDepTa_report.show(false, true);

				this.abEamLifecycleDepBl_report.refresh(new Ab.view.Restriction({'bl.bl_id': this.assetId}));
				this.abEamLifecycleDepBl_report.show(true, true);
				
			} else if (this.assetType == 'property') {
				this.abEamLifecycleDepBl_report.show(false, true);
				this.abEamLifecycleDepEq_report.show(false, true);
				this.abEamLifecycleDepTa_report.show(false, true);

				this.abEamLifecycleDepProperty_report.refresh(new Ab.view.Restriction({'property.pr_id': this.assetId}));
				this.abEamLifecycleDepProperty_report.show(true, true);
				
			} else if (this.assetType == 'eq') {

				this.abEamLifecycleDepBl_report.show(false, true);
				this.abEamLifecycleDepProperty_report.show(false, true);
				this.abEamLifecycleDepTa_report.show(false, true);

				this.abEamLifecycleDepEq_report.refresh(new Ab.view.Restriction({'eq_dep.eq_id': this.assetId}));
				this.abEamLifecycleDepEq_report.show(true, true);
				
			} else if (this.assetType == 'ta') {

				this.abEamLifecycleDepBl_report.show(false, true);
				this.abEamLifecycleDepProperty_report.show(false, true);
				this.abEamLifecycleDepEq_report.show(false, true);

				this.abEamLifecycleDepTa_report.refresh(new Ab.view.Restriction({'ta_dep.ta_id': this.assetId}));
				this.abEamLifecycleDepTa_report.show(true, true);
			}
		}
	},
	
	getInputParameters: function(){
		var restriction = null;
		
		if(valueExists(this.view.restriction)){
			restriction = this.view.restriction;
		}
		
		if(valueExists(this.view.getParentTab()) 
				&& valueExists(this.view.getParentTab().restriction)){
			restriction = this.view.getParentTab().restriction;
		}
		
		if(valueExists(restriction)){
			var typeClause = restriction.findClause('bl.asset_type');
			if(typeClause){
				this.assetType = typeClause.value;
			}
			var idClause = restriction.findClause('bl.asset_id');
			if(idClause){
				this.assetId = idClause.value;
			}
		}
	},
	
	abEamLifecycleDepRefresh_afterRefresh: function(){
		this.getInputParameters();
		this.refreshView();
	},
	
	abEamLifecycleDepEq_report_onRecalculate: function(){
		recalculateDepreciation('eq', 'abEamLifecycleDepEq_report', getMessage('confirmRecalculationEq'), getMessage('calculateMessageEq'));
	},
	
	abEamLifecycleDepTa_report_onRecalculate: function(){
		recalculateDepreciation('ta', 'abEamLifecycleDepTa_report', getMessage('confirmRecalculationTa'), getMessage('calculateMessageTa'));
	},
	
	abEamLifecycleDepEq_report_onAddLog: function(){
		this.view.getOpenerView().openDialog('ab-ap-dep-log.axvw', null, false, {
			width: 800,
			height: 800
		});
	},
	
	abEamLifecycleDepTa_report_onAddLog: function(){
		this.view.getOpenerView().openDialog('ab-ap-dep-log.axvw', null, false, {
			width: 800,
			height: 800
		});
	}
});


/**
 * Calls the WFR for recalculation depreciation
 * for equipments or tagged furniture, depending on the parameter <forWhat>
 * @param {String} forWhat Values in 'eq','ta'
 * @param {String} panelToRefresh
 * @param {String} confirmMessage
 * @param {String} statusMessage
 * 
 */
function recalculateDepreciation(forWhat, panelToRefresh, confirmMessage, statusMessage){
	// confirm recalculation
	var jobName = "AbAssetManagement-AssetService-calculateEquipmentDepreciation";

	switch(forWhat) {
		case 'eq':
			jobName = "AbAssetManagement-AssetService-calculateEquipmentDepreciation";
			break;
		case 'ta':
		    jobName = "AbAssetManagement-AssetService-calculateTaggedFurnitureDepreciation";
			break;
		default: 
			break;
	}


	View.confirm(confirmMessage, function(button) {
		if (button == 'yes') {
			try {
			    var jobId = Workflow.startJob(jobName);
				View.openJobProgressBar(statusMessage, jobId, '', function(status) {
					if(View.panels.get(panelToRefresh).visible){
						View.panels.get(panelToRefresh).refresh();
					}
			    });
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}
