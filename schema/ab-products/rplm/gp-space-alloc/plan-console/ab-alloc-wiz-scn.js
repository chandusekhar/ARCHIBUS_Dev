var allocWizScnController = View.createController('allocWizScn',{	
	
	/** The filter for the portfolio scenario list.*/
	filter: null,

	openNewPortofolioWindow: function() {
		var thisController = this;
		var dialog = View.openDialog('ab-alloc-wiz-scn-add-portofolio.axvw', null, true, {
			height: 650,
			width: 800,
			title: getMessage('addNewPortofolioScenario'),
			
			afterViewLoad: function(dialogView) {
				var controller = dialogView.controllers.get('allocWizScnNewPortofolioController');
				controller.callback = thisController.addPortfolioScenarioCallback;
			}
		});
	},
	
	addPortfolioScenarioCallback: function(scnId, scnName, scnLevel) {
		allocWizScnController.allocWizScn_grid.refresh();
		var allocWizCtrl = View.getOpenerView().controllers.get('allocWiz');
		allocWizCtrl.scn_id = scnId;
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', scnId, '=');
		allocWizCtrl.allocWizTabs.selectTab('allocWizStack', restriction);

		allocWizCtrl.allocWizTabs.enableTab('allocWizEvts', true);
		allocWizCtrl.allocWizTabs.enableTab('allocWizStack', true);
		allocWizCtrl.allocWizTabs.enableTab('allocWizSpGap', true);
		allocWizScnController.showSpaceRequirementTab(allocWizCtrl, scnId, scnName, scnLevel);
		
		allocWizCtrl.changeSelectedScenario();

		//kb#3049765: reset scn_name in view's title  
		View.getOpenerView().setTitle(getMessage('viewTitle') + ' - ' + scnName);
	},
	
	/**
	 * Filter the portfolio scenario list.
	 */
	refreshTab: function(filterCopy) {
		this.filter = jQuery.extend(true, {}, filterCopy);
		var fromDate = this.filter['from_date'];
		var endDate = this.filter['end_date'];
		var restriction = new Ab.view.Restriction();
		if (fromDate) {
			restriction.addClause('portfolio_scenario.date_start', fromDate, '&gt;=');
		}
		if(endDate) {
			restriction.addClause('portfolio_scenario.date_start', endDate, '&lt;=');
		}
		
		var siteId = this.filter['site_id'];
		if(siteId) {
			this.allocWizScn_grid.addParameter('site_id', "bl.site_id='" + siteId + "'");
		} else {
			this.allocWizScn_grid.addParameter('site_id', "1=1");
		}
		var blId = this.filter['bl_id'];
		if(blId) {
			this.allocWizScn_grid.addParameter('bl_id', "bl.bl_id='" + blId + "'");
		} else {
			this.allocWizScn_grid.addParameter('bl_id', "1=1");
		}

		//kb#3050891: Add the ability to filter by organization	
		addOrganizationRestriction([this.allocWizScn_grid],  this.filter);

		this.allocWizScn_grid.refresh(restriction);
	},
	
	allocWizScn_grid_onSelectScn: function() {
	},

	allocWizScn_form_onSaveWizScn: function() {
		var oldValues = this.allocWizScn_form.getOldFieldValues();
		var oldPortfolioId = oldValues['portfolio_scenario.portfolio_scenario_id'];
		var oldPortfolioScnName = oldValues['portfolio_scenario.scn_name'];
		var oldStartDate = oldValues['portfolio_scenario.date_start'];
		var newPortfolioScnName = this.allocWizScn_form.getFieldValue('portfolio_scenario.scn_name');
		var newStartDate = this.allocWizScn_form.getFieldValue('portfolio_scenario.date_start');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_name', oldPortfolioScnName, '=');
		var projectRecords = this.projectCheckDataSource.getRecords(restriction);
		
		restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', oldPortfolioScnName, '=');
		var sbRecords = this.sbCheckDataSource.getRecords(restriction);
		var thisController = this;
		var needToUpdateGpPlId = false;
		if (oldPortfolioScnName != newPortfolioScnName) {
			if (projectRecords.length > 0 || sbRecords.length > 0) {
				View.confirm(getMessage('editPrimaryPortfolioScenarioId'), function(button) {
					if (button=='yes') {
						if (newStartDate != oldStartDate) {
							View.confirm(getMessage('editPortfolioScenarioStartDate'), function(button) {
								if (button == 'yes') {
									thisController.allocWizScn_form.save();
									needToUpdateGpPlId = true;
									if (newStartDate < oldStartDate) {
										thisController.updateUnallocatedGp(oldPortfolioId, newStartDate);
									}
								}
							});
						} else {
							thisController.allocWizScn_form.save();
							needToUpdateGpPlId = true;
						}
					}
				});
			} else {
				if (newStartDate != oldStartDate) {
					View.confirm(getMessage('editPortfolioScenarioStartDate'), function(button) {
						if (button == 'yes') {
							thisController.allocWizScn_form.save();
							needToUpdateGpPlId = true;
							if (newStartDate < oldStartDate) {
								thisController.updateUnallocatedGp(oldPortfolioId, newStartDate);
							}
						}
					});
				} else {
					this.allocWizScn_form.save();
					needToUpdateGpPlId = true;
				}
			}
		} else {
			if (newStartDate != oldStartDate) {
				View.confirm(getMessage('editPortfolioScenarioStartDate'), function(button) {
					if (button == 'yes') {
						thisController.allocWizScn_form.save();
						if (newStartDate < oldStartDate) {
							thisController.updateUnallocatedGp(oldPortfolioId, newStartDate);
						}
					}
				});
			} else {
				this.allocWizScn_form.save();
			}
		}
		
		if (needToUpdateGpPlId) {
			this.updateGpPortfolioId(oldPortfolioId, newPortfolioId);
		}
		
		this.allocWizScn_grid.refresh();
	},
	
	/**
	 * Update the portfolio id cascadly of gp.
	 */
	updateGpPortfolioId: function(oldValue, newValue) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', oldValue, '=');
		var records = this.groupSpaceDataSource.getRecords(restriction);
		for(var i = 0; i < records.length; i++) {
			var record = records[i];
			record.setValue('gp.portfolio_scenario_id', newValue);
			this.groupSpaceDataSource.saveRecord(record);
		}
	},
	
	/**
	 * Update the start date of the gp. 
	 */
	updateUnallocatedGp: function(oldPortfolioId, newStartDate) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.bl_id', 'UNALLOC', '=');
		restriction.addClause('gp.portfolio_scenario_id', oldPortfolioId, '=');
		restriction.addClause('gp.allocation_type', 'Usable Area - Owned', '=');
		
		var records = this.groupSpaceDataSource.getRecords(restriction);
		for(var i = 0; i < records.length; i++) {
			var record = records[i];
			record.setValue('gp.date_start', newStartDate);
			record.isNew=false;
			this.groupSpaceDataSource.saveRecord(record);
		}
	},
	
	allocWizScn_grid_onCopyScenario: function() {
		var dialog = View.openDialog("ab-alloc-wiz-scn-copy.axvw", null, true, {
			height:450,
			width:800,
			title:getMessage('copyScenarioTitle')
		});
	},
	
	allocWizScn_form_onDeleteWizScn: function() {
		var portfolioScenarioId = this.allocWizScn_form.getFieldValue('gp.portfolio_scenario_id');
		if(this.allocWizScn_form.deleteRecord()) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.portfolio_scenario_id', portfolioScenarioId, '=');
			
			var records = this.groupSpaceDataSource.getRecords(restriction);
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				this.groupSpaceDataSource.deleteRecord(record);
			}
			this.allocWizScn_form.doRefresh();
			this.allocWizScn_grid.refresh();
		}
	},

	/* kb#3048363: add a tab for linked Space Requirement or refresh that tab if it's existing.
	*	 Added for 22.1 by ZY
	*	 @param allocWizCtrl: parent wizard controller 
	*    @param	scnId: current selected scenario id
	*    @param	row: current selected row in scenario's grid
	**/
	allocWizScn_grid_selectScenario_onClick: function(row) {
		var scnId = row.record['portfolio_scenario.portfolio_scenario_id'];
		var scnName = row.record['portfolio_scenario.scn_name'];
		var scnLevel = row.record['portfolio_scenario.scn_level.raw'];

		var allocWizCtrl = View.getOpenerView().controllers.get('allocWiz');
		allocWizCtrl.scn_id = scnId;

		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', scnId, '=');
		allocWizCtrl.allocWizTabs.selectTab('allocWizStack', restriction);

		allocWizCtrl.allocWizTabs.enableTab('allocWizEvts', true);
		allocWizCtrl.allocWizTabs.enableTab('allocWizStack', true);
		allocWizCtrl.allocWizTabs.enableTab('allocWizSpGap', true);
		this.showSpaceRequirementTab(allocWizCtrl, scnId, scnName, scnLevel);

		allocWizCtrl.changeSelectedScenario();
		//kb#3049409: 
		View.getOpenerView().setTitle(getMessage('viewTitle') + ' - ' + scnName);
	},
	
	applyChangedScenario: function(filterCopy){
	
	},

	showSpaceRequirementTab: function(allocWizCtrl, scnId, scnName, scnLevel){
		var tabs = allocWizCtrl.allocWizTabs;
		tabs.scnId = scnId;
		tabs.scnName = scnName;
		if ("fg"==scnLevel){
			tabs.showTab("allocWizSb",true);
		} 
		else {
			tabs.showTab("allocWizSb",false);
			//tabs.hideTab("allocWizSb");
		}
	},

	allocWizScn_grid_onDeleteScenario: function(row) {
		var portfolio_scenario_id = row.getFieldValue('portfolio_scenario.portfolio_scenario_id');

		if (portfolio_scenario_id == "Baseline") {
			View.showMessage(getMessage('errorDeleteBaselineScenario'));
			return;
		}

		View.confirm(getMessage('confirmDeleteExistingScenario') + ' ' + portfolio_scenario_id, function(button){
			if (button == 'yes') {
				allocWizScnController.performDeleteScenario(portfolio_scenario_id);
			} else {
				return;
			}
		})
	},

	performDeleteScenario: function(portfolio_scenario_id) {
		View.openProgressBar("Updating...");

        try {
			var result =  Workflow.callMethod(
				'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-deleteScenario', portfolio_scenario_id);
			View.closeProgressBar();
			this.allocWizScn_grid.refresh();

        } catch (e) {
            Workflow.handleError(e);
        }			
	},

	allocWizScn_grid_onCopyGroup: function() {

		this.copyGroupInventoryForm.refresh(null, true);
		
		this.copyGroupInventoryForm.setFieldValue('gp.portfolio_scenario_id','Baseline');
		
		if ( !this.copyGroupInventoryForm.getFieldValue('gp.date_start') ) {
			var record = this.copyGroupInventoryForm.getRecord();
			record.setValue('gp.date_start', new Date());
			this.copyGroupInventoryForm.onModelUpdate();
		}

		addPeriod("YEAR",5,'copyGroupInventoryForm','gp.date_start','gp.date_end');

        this.copyGroupInventoryForm.showInWindow({
			newRecord: true,
            closeButton: true
        });
	},

	copyGroupInventoryForm_onSave: function() {
		var to_portfolio_scenario_id = this.copyGroupInventoryForm.getFieldValue('gp.portfolio_scenario_id');

		if (this.allocWizScn_ds.getRecords('portfolio_scenario.portfolio_scenario_id = \'' + to_portfolio_scenario_id + '\'').length <= 0) {
			View.showMessage(getMessage('error_invalid_scenario'));
			return false;
		}

		var date_start = this.copyGroupInventoryForm.getFieldValue('gp.date_start');
		var date_end = this.copyGroupInventoryForm.getFieldValue('gp.date_end');
		if ((date_start == "") || (date_end == "")) {
			View.showMessage(getMessage('error_no_dates'));
			return false;
		}

		var record = this.copyGroupInventoryForm.getRecord();
	    var date_start_test = record.getValue('gp.date_start');
		var date_end_test = record.getValue('gp.date_end');
		if (date_end_test <= date_start_test) {
			View.showMessage(getMessage('errorDateEnd'));
			return false;
        }

		View.confirm(getMessage('confirmOverwriteTargetScenarioData'), function(button){
			if (button == 'yes') {
				allocWizScnController.performCopyGroupInventoryToScenario(date_start,date_end,to_portfolio_scenario_id);
			} else {
				return;
			}
		})
	},

	performCopyGroupInventoryToScenario: function(date_start,date_end,to_portfolio_scenario_id) {

		View.openProgressBar("Updating...");

        try {
			var result =  Workflow.callMethod(
				'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-copyGroupInventoryToScenario', date_start, date_end, to_portfolio_scenario_id);
			View.closeProgressBar();
			this.copyGroupInventoryForm.closeWindow();

        } catch (e) {
			View.closeProgressBar();
            Workflow.handleError(e);
        }
	}
});

