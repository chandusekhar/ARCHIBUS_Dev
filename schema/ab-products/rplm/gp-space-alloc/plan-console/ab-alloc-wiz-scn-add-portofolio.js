/**
 * Controller for the 'Add Portofolio Scenario' view.
 * @author Qiang
 */
var allocWizScnNewPortofolioController = View.createController('allocWizScnNewPortofolioController', {
	
	callback: null,
	
	/**
	 * Set start date to the current date.
	 */
	afterInitialDataFetch: function() {
		this.addPortofolioScenarioForm.setFieldValue('portfolio_scenario.date_start', getCurrentDateInISOFormat());
	},
	
	/**
	 * Validate the field value and save the portofolio scenario.
	 */
	addPortofolioScenarioForm_onSavePortofolioScenario: function() {
		if (this.addPortofolioScenarioForm.canSave()) {
			try{
				var scenarioLevel = this.getScenarioLevel();
				var scnName = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.scn_name');
				var needCreateSbRecord = true;
				if(scenarioLevel == 'fg') {
					//check if this has to be created
					var restriction = new Ab.view.Restriction();
					restriction.addClause('sb.sb_name', scnName, '=');
					restriction.addClause('sb.sb_level', 'fg', '=');
					var records = this.sbDataSource.getRecords(restriction);
					if (records.length > 0) {
						needCreateSbRecord = false;
					} else {
						var restriction = new Ab.view.Restriction();
						restriction.addClause('sb.sb_name', scnName, '=');
						records = this.sbDataSource.getRecords(restriction);
						if (records.length > 0) {
							View.alert(getMessage('resetPortfolioScenarioId'));
							return;
						}
					}
				}
				this.saveScenario(scenarioLevel);
				this.saveAllocatedBuildingForPortofolioScenario();
				if(scenarioLevel == 'fg' && needCreateSbRecord) {
					this.saveSpaceRequirement(scenarioLevel);
				}
				if (this.callback) {
					this.callback(this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.portfolio_scenario_id'), scnName, scenarioLevel);
				}
				View.closeThisDialog();
			}catch(e) {
				Workflow.handleError(e);
			}
		}
	},
	
	/**
	 * Save the portofolio scenario according to the values of the form.
	 */
	saveScenario: function(scenarioLevel) {
		var portofolioId = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		var scnName = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.scn_name');
		var description = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.description');
		var startDate = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.date_start');
		
		var scenarioRecord = new Ab.data.Record({
			'portfolio_scenario.portfolio_scenario_id': portofolioId,
			'portfolio_scenario.scn_name': scnName,
			'portfolio_scenario.description': description,
			'portfolio_scenario.date_start': startDate,
			'portfolio_scenario.scn_level': scenarioLevel
		});
		
		this.newPortofolioDs.saveRecord(scenarioRecord);
	},
	
	/**
	 * Save five unallocated building for portfolio scenario.
	 */
	saveAllocatedBuildingForPortofolioScenario: function(portfolioScenarioId) {
		//Save 5 unallocated building for the new-created scenario.
		var portfolioScenarioId = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		var dateStart = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.date_start');
		for (var i = 1; i <= 5; i++) {
			var gpRecord =new Ab.data.Record({
				'gp.event_name': getMessage('defaultEventName'),
				'gp.bl_id': 'UNALLOC',
				'gp.fl_id': '0' + i,
				'gp.allocation_type': 'Usable Area - Owned',
				'gp.area_manual': 25000,
				'gp.name': getMessage('UNALLOCBuildingName'),
				'gp.portfolio_scenario_id': portfolioScenarioId,
				'gp.date_start': dateStart,
				'gp.sort_order': 500 + i
			});
			
			this.addGroupSpaceDataSource.saveRecord(gpRecord);
		}
	},
	
	/**
	 * Create a space requirement.
	 */
	saveSpaceRequirement: function(scenarioLevel) {
		var portofolioName = this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.scn_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_name', portofolioName, '=');
		var records = this.projectDataSource.getRecords(restriction);
		if(records.length > 0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('sb.sb_name', portofolioName, '=');
			records = this.sbDataSource.getRecords(restriction);
			if(records.length == 0) {
				this.sbDataSource.saveRecord(this.createSpaceRequirement(scenarioLevel));
			}
		} else {
			this.sbDataSource.saveRecord(this.createSpaceRequirement(scenarioLevel));
		}
	},
	
	createSpaceRequirement: function(scenarioLevel) {
		var sbRecord = new Ab.data.Record();
		sbRecord.setValue('sb.sb_name', this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.scn_name'));
		sbRecord.setValue('sb.sb_level', scenarioLevel);
		sbRecord.setValue('sb.sb_type', 'Space Requirements');
		sbRecord.setValue('sb.sb_desc', this.addPortofolioScenarioForm.getFieldValue('portfolio_scenario.description'));
		return sbRecord;
	},
	
	
	getScenarioLevel: function() {
		var scnLevel = jQuery('input:radio[name="scn_level_radio"]:checked').val();
		return scnLevel;
	}
});

// after user selects a Project
function afterSelectProject(fieldName, selectedValue, previousValue){
	if ( fieldName=="portfolio_scenario.scn_name" ) {
		//  check to see if there is already a linked Space Requirements record (sb.sb_name = project.project_name), 
		// and if so, then apply the value of sb.sb_level to the ��Add Portfolio Scenario�� form
		var record= allocWizScnNewPortofolioController.linkedSpaceRequirementDs.getRecord("sb_name='"+selectedValue+"'");
		if (record && record.getValue("sb.sb_level")) {
			var sbLevel =  record.getValue("sb.sb_level");
			$(sbLevel+"Radio").checked=true;
			$("buRadio").disabled=true;
			$("dvRadio").disabled=true;
			$("dpRadio").disabled=true;
			$("fgRadio").disabled=true;
		} 
		// If there is not already a linked Space Requirements record, and the user chooses Functional Groups for the scenario level, then automatically create a new SB record with sb.sb_name = portfolio_scenario.scn_name.  
	}
}