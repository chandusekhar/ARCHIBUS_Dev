var energyBasEditProcessController = View.createController('energyBasEditProcess', {
	name: '',
	data_point_id: null,
	isSelected: true,
	
	afterInitialDataFetch: function() {	
		this.energyBasEdit_yearMonth.addParameter('incomplete', getMessage('incomplete'));
		this.energyBasEdit_yearMonth.addParameter('complete', getMessage('complete'));
		this.energyBasEdit_yearMonth.refresh();
	},
	
	energyBasEdit_yearMonth_beforeRefresh: function() {
		View.openProgressBar(getMessage('loading'));
		if(this.isSelected) this.setDataPoint();
	},
	
	setDataPoint: function() {
		var openerController = View.getOpenerView().controllers.get('energyBasEdit');
		this.data_point_id = openerController.data_point_id;
		this.name = openerController.name;
		
    	this.energyBasEdit_yearMonth.addParameter('id', this.data_point_id);
    	this.energyBasEdit_yearMonth.appendTitle(this.data_point_id + "-" + this.name);
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bas_data_point.data_point_id', this.data_point_id);
    	this.energyBasEdit_grid.refresh(restriction);
    	this.energyBasEdit_grid.appendTitle(this.data_point_id + "-" + this.name + " - " + getMessage('allMonths'));
    	var record = this.energyBasEdit_ds7.getRecord(restriction);

    	if (openerController.isVirtual) {
    		var metersToIncludeExclude = record.getValue('bas_data_point.meters_to_include');
    		var metersToExclude = record.getValue('bas_data_point.meters_to_exclude');
    		if (metersToExclude != '') metersToIncludeExclude += "," + metersToExclude;
    		var message = String.format(getMessage('virtualMeter'), metersToIncludeExclude);
    		View.alert(message);
    		this.energyBasEdit_grid.enableAction('add', false);
    		this.energyBasEdit_grid.enableAction('data', false);
    	} else {
    		this.energyBasEdit_grid.enableAction('add', true);
    		this.energyBasEdit_grid.enableAction('data', true);
    	}
    	
    	this.isSelected = false;
	},
	
	energyBasEdit_yearMonth_onSelectPreviousTab: function() {
		this.energyBasEdit_grid.enableAction('add', true);
		this.energyBasEdit_grid.enableAction('data', true);
		this.isSelected = true;
		var openerController = View.getOpenerView().controllers.get('energyBasEdit');   	
    	openerController.energyBasEditTabs.selectTab('energyBasEditSelect');
	},
	
	energyBasEdit_yearMonth_afterRefresh: function() {
    	var controller = this;
    	this.energyBasEdit_yearMonth.gridRows.each(function (row) {
    		var record = row.getRecord(); 
    		var process_status = record.getValue('bas_data_clean_num.process_status');
	    	var processedIcon = row.actions.get('processedIcon');
	    	
			if (process_status != 'NOT PROCESSED') {		  
				processedIcon.show(true);
			}
			else processedIcon.show(false);
    	});
    	View.closeProgressBar();
    }, 
    
    energyBasEdit_yearMonth_onSelect: function(row) {
    	var year_month = row.getRecord().getValue('bas_data_clean_num.year_month');
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bas_data_clean_num.year_month', year_month);
    	restriction.addClause('bas_data_clean_num.data_point_id', this.data_point_id);
    	this.energyBasEdit_grid.refresh(restriction);
    	this.energyBasEdit_grid.appendTitle(this.data_point_id + "-" + this.name + " - " + getMessage('forMonth') + " " + year_month);
    },
    
    energyBasEdit_yearMonth_onProcess: function(row) {
    	var year_month = row.getRecord().getValue('bas_data_clean_num.year_month');
    	this.processMonth(year_month);
    },
    
    processMonth: function(year_month) {
    	var controller = this;
		try {
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BasDataService-processBasDataRecords', controller.data_point_id, year_month);
			View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
				controller.energyBasEdit_yearMonth.refresh();
	            var restriction = new Ab.view.Restriction();
	        	restriction.addClause('bas_data_clean_num.year_month', year_month);
	        	restriction.addClause('bas_data_clean_num.data_point_id', controller.data_point_id);
	        	controller.energyBasEdit_grid.refresh(restriction);
	        	controller.energyBasEdit_grid.appendTitle(controller.data_point_id + "-" + controller.name + " - " + getMessage('forMonth') + " " + year_month);
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
    },
    
    energyBasEdit_yearMonth_onProcessAll: function() {
    	var controller = this;
		try {
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BasDataService-processAllBasDataRecords', controller.data_point_id);
			View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
				controller.energyBasEdit_yearMonth.refresh();
	            var restriction = new Ab.view.Restriction();
	        	restriction.addClause('bas_data_clean_num.data_point_id', controller.data_point_id);
	        	controller.energyBasEdit_grid.refresh(restriction);
	        	controller.energyBasEdit_grid.appendTitle(controller.data_point_id + "-" + controller.name + " - " + getMessage('allMonths'));
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
    },
    
    energyBasEdit_form_afterRefresh: function() {
    	for (var i = 1; i < 3; i++) {
			this.energyBasEdit_form.getFieldElement('bas_data_clean_num.process_status').options[i].setAttribute("disabled", "true");
		}
    },
    
    // Whenever user uses the edit form to Save or Delete a single record, trigger processing for that month, 
    // automatically processing monthly/quarterly/yearly aggregates for all following months.
    energyBasEdit_form_onSave: function() {
    	if (this.energyBasEdit_form.getFieldValue('bas_data_clean_num.delta') != 0) {
    		this.energyBasEdit_form.setFieldValue('bas_data_clean_num.process_status', 'MANUAL');
    	}
    	if (!this.energyBasEdit_form.save()) return;
    	var date_measured = this.energyBasEdit_form.getFieldValue('bas_data_clean_num.date_measured');
    	var year_month = this.getYearMonthFromDate(date_measured);
    	this.processMonth(year_month);
    	this.energyBasEdit_form.closeWindow();
    },
    
    energyBasEdit_form_onDelete: function() {
    	var controller = this;
    	View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
            	controller.energyBasEdit_form.deleteRecord();
            	var date_measured = controller.energyBasEdit_form.getFieldValue('bas_data_clean_num.date_measured');
            	var year_month = controller.getYearMonthFromDate(date_measured);
            	controller.processMonth(year_month);
            	controller.energyBasEdit_form.closeWindow();
            }
		});
    },
    
    getYearMonthFromDate: function(date_measured) {
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('afm_cal_dates.cal_date', date_measured);
    	var record = this.energyBasEdit_ds8.getRecord(restriction);
    	return record.getValue('afm_cal_dates.year_month');
    }
});

