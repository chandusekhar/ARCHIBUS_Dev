var energyBillProrateController = View.createController('energyBillProrate',{
	
	layout: null,
	groupBy: 'meter',
	groupField: "RTRIM(bas_data_point.data_point_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(bas_data_point.name)",
	vn_id: null,
	bill_id: null,
	checkRestriction: null,
	
	afterViewLoad:function() {
		this.addRadioButtonEventListeners('excludeBill', this.onSelectExcludeBill);
		$('energyBillProrate_groupBy').value = 'meter';
		this.checkRestriction = "(((bill_archive.prorated_aggregated = 'NO' AND bill_archive.reference_bill_id IS NULL AND NOT EXISTS (SELECT 1 FROM bill_archive b WHERE b.reference_bill_id = bill_archive.bill_id)) OR (bill_archive.prorated_aggregated &lt;&gt; 'NO')))";
		this.energyBillProrate_grid.restriction = this.checkRestriction;
	},
	
	energyBillProrate_console_onShow: function() {
		this.groupBy = $('energyBillProrate_groupBy').value;
		setGroupField(this.groupBy);
		var restriction = new Ab.view.Restriction(this.energyBillProrate_console.getFieldValues());
		restriction.sql = this.checkRestriction;
		this.energyBillProrate_grid.refresh(restriction);
		this.energyBillProrate_gridProrate.show(false);
		this.energyBillProrate_chartProrate.show(false);
	},
	
	energyBillProrate_console_onClear: function() {
		$('energyBillProrate_groupBy').value = 'meter';
		this.groupBy = $('energyBillProrate_groupBy').value;
		this.energyBillProrate_console.clear();
		this.energyBillProrate_grid.restriction = null;
		this.energyBillProrate_grid.refresh();
	},
	
	energyBillProrate_grid_onSelectDoc: function(obj) {
	    var record = this.energyBillProrate_ds0.getRecord(obj.restriction);
	    var vn_id = record.getValue('bill_archive.vn_id');
	    var bill_id = record.getValue('bill_archive.bill_id');
	    var billDocFileName = record.getValue('bill_archive.doc');
	    if (billDocFileName == "") {
	    	View.showMessage(getMessage('noBillDoc'));
	    	return;
	    }
	    var keys = {'vn_id': vn_id, 'bill_id': bill_id}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
	},
	
	energyBillProrate_grid_onSelect: function(obj) {
		var controller = View.controllers.get('energyBillProrate');
		this.vn_id = obj.restriction['bill_archive.vn_id'];
		this.bill_id = obj.restriction['bill_archive.bill_id'];
		var records = this.energyBillProrate_ds3.getRecords(obj.restriction);
		if (records.length == 0) {
			View.confirm(getMessage('confirmOpenLink'), function(button){
	            if (button == 'yes') {
	            	controller.energyBillProrate_chartProrate_onLink();
	            }
			});
		} else {
			this.energyBillProrate_grid_onShowTable();
			this.energyBillProrate_grid_onShowChart();
		}
	},
	
	energyBillProrate_grid_onShowChart: function() {
		var chart = this.energyBillProrate_chartProrate;
		chart.addParameter("group_field", this.groupField);
		chart.addParameter("vn_id", this.vn_id);
		chart.addParameter("bill_id", this.bill_id);
		View.initializeProgressBar();
		chart.refresh();
		chart.show(true);
		View.closeProgressBar();
	},
	
	energyBillProrate_grid_onShowTable: function() {
		var vn_id = this.vn_id;
		var bill_id = this.bill_id;
		var titleGroupBy = getMessage(this.groupBy);
		View.groupBy = titleGroupBy;
				
		var title = " " + String.format(getMessage('crossTablePanelTitle'), titleGroupBy);
		title += " - " + vn_id + " - " + bill_id;
		
		var grid = this.energyBillProrate_gridProrate;
	    try { 
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BillProrationService-getBillProrationRecordsForGrid', vn_id, bill_id, this.groupField);					
			View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
				if (valueExists(status.dataSet)) {
					var records = status.dataSet.records;
					grid.setRecords(records);
					grid.show(true);
					grid.appendTitle(title);
					grid.removeSorting();
				} 
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
	},
	
	energyBillProrate_gridProrate_onSelect: function(row) {
		var record = row.getRecord();
		var vn_id = this.vn_id;
		var bill_id = this.bill_id;

		var openerRecord = null;
		var tableName = 'bill_archive';
		var groupFieldValue = "";		
		
		var billRestriction = new Ab.view.Restriction();
		billRestriction.addClause('bill_archive.vn_id', vn_id);
		billRestriction.addClause('bill_archive.bill_id', bill_id);
		openerRecord = this.energyBillVsMeterCommon_dsBillBaseArch.getRecord(billRestriction);
	
		groupFieldValue = record.getValue('bas_data_point.group_field');

		View.openDialog('ab-energy-bill-arch-vs-meter-readings.axvw', null, false, {
	        width: 1200,
	        height: 800,
	        closeButton: true,
	        maximize: true,
	        openerRecord: openerRecord,
	        tableName: tableName,
	        groupField: this.groupField,
	        groupFieldValue: groupFieldValue
	    });
	},
	
	energyBillProrate_chartProrate_onLink: function() {
		View.openDialog('ab-energy-bill-arch-vs-meter-link.axvw', null, false, {
			width:1000, 
			closeButton:true, 
			maximize:true,
			vn_id: this.vn_id,
			bill_id: this.bill_id
		});
	},
	onSelectExcludeBill: function(radioButton) {
    	if (radioButton.checked) {
    	    var excludeType = radioButton.value;
    	    if (excludeType == "parent") {
    	    	this.checkRestriction = "(((bill_archive.prorated_aggregated = 'NO' AND bill_archive.reference_bill_id IS NULL AND NOT EXISTS (SELECT 1 FROM bill_archive b WHERE b.reference_bill_id = bill_archive.bill_id)) OR (bill_archive.prorated_aggregated &lt;&gt; 'NO')))";
    	    }else{
    	    	this.checkRestriction = "bill_archive.prorated_aggregated = 'NO'";
    	    }
    	}
    },
    addRadioButtonEventListeners: function(radioButtonName, method) {
	    var radioButtons = document.getElementsByName(radioButtonName);
        for (i = 0; i < radioButtons.length; i++) {
        	var radioButton = radioButtons[i];
        	Ext.get(radioButton).on('click', method.createDelegate(this, [radioButton]));
        }
    }
});


function changeGroupBy(groupBy) {
	var controller = View.controllers.get('energyBillProrate');
	setGroupField(groupBy);
	controller.energyBillProrate_grid_onShowTable();
	controller.energyBillProrate_grid_onShowChart();
}

function setGroupField(groupBy) {
	var controller = View.controllers.get('energyBillProrate');
	controller.groupBy = groupBy;
	
	controller.groupField = "(${sql.trim('bas_data_point.data_point_id')} ${sql.concat} ' - ' ${sql.concat} ${sql.trim('bas_data_point.name')})";
	if (controller.groupBy == 'site') controller.groupField = "bas_data_point.site_id";
	else if (controller.groupBy == 'building') controller.groupField = "bas_data_point.bl_id";
	else if (controller.groupBy == 'floor') controller.groupField = "(${sql.trim('bas_data_point.bl_id')} ${sql.concat} ' - ' ${sql.concat} ${sql.trim('bas_data_point.fl_id')})";
	else if (controller.groupBy == 'zone') controller.groupField = "(${sql.trim('bas_data_point.bl_id')} ${sql.concat} ' - ' ${sql.concat} ${sql.trim('bas_data_point.fl_id')} ${sql.concat} ' - ' ${sql.concat} ${sql.trim('bas_data_point.zone_id')})";			
}
