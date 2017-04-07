var allocWizBlAddController = View.createController('allocWizBlAdd', {
	scn_id : '',
	blRecords : '',
	unitTitle : '',
	
	afterViewLoad: function() {
		this.unitTitle = getMessage('unitTitleMetric');
		var units = View.project.units;
		if (units == "imperial") {
			this.unitTitle = getMessage('unitTitleImperial');
		}
	},
	
	afterInitialDataFetch: function() {
		this.scn_id = View.getOpenerView().getOpenerView().controllers.get('allocWiz').scn_id;
		this.allocWizBlAdd_buildings.addParameter('scn_id', this.scn_id);
		this.allocWizBlAdd_buildings.refresh();
	},
	
	allocWizBlAdd_buildings_onContinue: function(row) {
		this.blRecords = this.allocWizBlAdd_buildings.getSelectedRecords();
		if (this.blRecords.length == 0) {
			View.showMessage(getMessage('selectBl'));
			return;
		}
		this.allocWizBlAddTabs.selectTab('allocWizBlAddBl_page2', '', true);
	},
	
	allocWizBlAdd_importForm_afterRefresh: function() {
		this.allocWizBlAdd_importForm.setFieldValue('gp.date_start', View.parameters.dateReview);
	},
	
	allocWizBlAdd_importForm_onFinish: function() {
		var date_start = this.allocWizBlAdd_importForm.getFieldValue('gp.date_start');

		if ($('allocWizBlAddBl_importRadio_no').checked) {
			this.createDefaultGroups(this.blRecords);
			if (View.parameters.callback) {
				if (View.parameters.dateReview) View.parameters.callback(getDateObject(date_start));
				else View.parameters.callback();
			}
			View.closeThisDialog();
		}
		else {
			if (date_start == '') {
				View.showMessage(getMessage('noStartDate'));
				return;
			}
			var pct_growth = this.allocWizBlAdd_importForm.getFieldValue('gp.pct_floor');
			if (pct_growth == '') pct_growth = 0;
			if (pct_growth < -100 || pct_growth >= 10000) {
				View.showMessage(getMessage('error_pct_growth'));
				return;
			}
			var groupBy = 'dp_id';
			if ($('allocWizBlAddBl_groupOptionsRadio_bu').checked) groupBy = 'bu_id';
			else if ($('allocWizBlAddBl_groupOptionsRadio_dv').checked) groupBy = 'dv_id';
			this.createGroupsForBls(date_start, groupBy, pct_growth);
		}
	},
	
	createDefaultGroups: function(blRecords) {
		var name = getMessage('unassigned');
		var date_start = this.allocWizBlAdd_importForm.getFieldValue('gp.date_start');
		View.openProgressBar(getMessage('creatingDefaultGroups'));
		for (var i = 0; i < blRecords.length; i++) {
			View.updateProgressBar(i/blRecords.length);
			var bl_id = blRecords[i].getValue('bl.bl_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('fl.bl_id', bl_id);
			var records = this.allocWizBlAdd_ds3.getRecords(restriction);
			if (records.length < 1) {
				alert(String.format(getMessage('noFloors'), bl_id));
				continue;
			}
			var fl_id = records[0].getValue('fl.fl_id');
			var description = String.format(getMessage('defaultDescription'));
			var record = new Ab.data.Record({
		        'gp.bl_id': bl_id,
		        'gp.fl_id': fl_id,
		        'gp.name' : name,
		        'gp.date_start' : date_start,
		        'gp.portfolio_scenario_id': this.scn_id,
		        'gp.description': description
		    }, true);
			this.allocWizBlAdd_ds2.saveRecord(record);
		}
		View.closeProgressBar();
	},
	
	createGroupsForBls: function(date_start, groupBy, pct_growth) {
		var blDataSet = new Ab.data.DataSetList();
        blDataSet.addRecords(this.blRecords);
        
		View.openProgressBar(getMessage('addingGroups'));
		var flDataSet = new Ab.data.DataSetList();
		try {
			var result =  Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-addRmEmLsGroups', this.scn_id, blDataSet, flDataSet, date_start, groupBy, pct_growth, this.unitTitle);
			View.closeProgressBar();
			this.createDefaultGroupsForEmptyBls();
			if (View.parameters.callback) {
				if (View.parameters.dateReview) View.parameters.callback(getDateObject(date_start));
				else View.parameters.callback();
			}
			View.closeThisDialog();
		}
		catch (e) {
			View.closeProgressBar();
			Workflow.handleError(e);
		}
	},
	
	createDefaultGroupsForEmptyBls: function() {
		var emptyBlRecords = [];
		for (var i = 0; i < this.blRecords.length; i++) {
			var record = this.blRecords[i];
			var bl_id = record.getValue('bl.bl_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
			restriction.addClause('gp.bl_id', bl_id);
			var gpRecords = this.allocWizBlAdd_ds2.getRecords(restriction);
			if (gpRecords.length < 1) emptyBlRecords.push(record);
		}
		if (emptyBlRecords.length > 0) this.createDefaultGroups(emptyBlRecords);
	},
	
	getMinEvtDate: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		
		var date_start = null;
		var records = this.allocWizBlAdd_ds1.getRecords(restriction);
		if (records.length > 0) {
			date_start = records[0].getValue('gp.date_start');
		}
		return date_start;
	}
});

function selectImport(obj) {
	var form = View.panels.get('allocWizBlAdd_importForm');
	var importVal = obj.value;
	if (importVal == 'yes') {
		Ext.get('allocWizBlAddBl_groupOptionsRadio_bu').dom.parentNode.parentNode.style.display = '';
		form.showField('gp.pct_floor', true);
		form.showField('gp.date_start', true);
	} else {
		Ext.get('allocWizBlAddBl_groupOptionsRadio_bu').dom.parentNode.parentNode.style.display = 'none';
		form.showField('gp.pct_floor', false);
		form.showField('gp.date_start', false);
	}
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
