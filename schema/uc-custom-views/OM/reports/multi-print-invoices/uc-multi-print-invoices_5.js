// Change Log:
// 2015/11/18 - MSHUSSAI - Modified code to add Vehicle Unit Number as a filter search field
// 2015/11/25 - MSHUSSAI - Modified code to add Cause Type and Repair Type as new filter search fields

var printMultiInvoiceController = View.createController('printMultiInvoiceController', {

	afterViewLoad: function() {
		this.inherit();
	},

	afterInitialDataFetch: function() {
		this.inherit();
	},

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//console filter
	consolePanel_onShow: function() {
		var zone_id = this.consolePanel.getFieldValue('bl.zone_id');
		var bl_id = this.consolePanel.getFieldValue('bl.bl_id');
		var requestor = this.consolePanel.getFieldValue('wr.requestor');
		var ac_id = this.consolePanel.getFieldValue('ac.ac_id');
		var charge_type = this.consolePanel.getFieldValue('wr.charge_type');
		var prob_type = this.consolePanel.getFieldValue('wr.prob_type');
		var status = this.consolePanel.getFieldValue('wr.status');
		var wr_id = this.consolePanel.getFieldValue('wr.wr_id');
		var date_completed_from = this.consolePanel.getFieldValue('wr.date_completed.from');
		var date_completed_to = this.consolePanel.getFieldValue('wr.date_completed.to');
		var date_closed_from = this.consolePanel.getFieldValue('wr.date_closed.from');
		var date_closed_to = this.consolePanel.getFieldValue('wr.date_closed.to');
		var cost_total = this.consolePanel.getFieldValue('wr.cost_total');
		var billed = this.consolePanel.getFieldValue('wr.billed');
		var cause_type = this.consolePanel.getFieldValue('causetyp.cause_type');
		var repair_type = this.consolePanel.getFieldValue('repairty.repair_type');
		var work_type = $('selectbox_bill_exception').value;
		var show_ancillary = $('selectbox_show_ancillary').value;
		var show_fleet = $('selectbox_show_fleet').value;
		var unit_id = this.consolePanel.getFieldValue('vehicle.vehicle_id');

		var restriction = "1=1";
		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wrhwr.bl_id = bl.bl_id and bl.zone_id="+this.literalOrNull(zone_id)+" )";	}
		if(bl_id != ""){	restriction = restriction + " AND wrhwr.bl_id = "+this.literalOrNull(bl_id);	}
		if(requestor != ""){	restriction = restriction + " AND wrhwr.requestor = "+this.literalOrNull(requestor);	}
		if(unit_id != ""){	restriction = restriction + " AND EXISTS (select 1 from vehicle where wrhwr.eq_id = vehicle.eq_id AND vehicle.vehicle_id = "+this.literalOrNull(unit_id)+" )";	}
		if(ac_id != ""){	
			//alert("*"+(this.literalOrNull(ac_id)).replace("'", "")+"*");
			restriction = restriction + " AND wrhwr.ac_id LIKE '%"+ac_id+"%'";	
			//alert("*"+this.literalOrNull(ac_id)+"*");
			//alert(restriction);
		}
		if(charge_type != ""){	restriction = restriction + " AND wrhwr.charge_type = "+this.literalOrNull(charge_type);	}			
		if(status != ""){	restriction = restriction + " AND wrhwr.status = "+this.literalOrNull(status);	}
		if(billed != ""){	restriction = restriction + " AND wrhwr.billed = "+this.literalOrNull(billed);	}
		
		if(cost_total != ""){	restriction = restriction + " AND wrhwr.cost_total > "+cost_total;	}


		if(wr_id != ""){	restriction = restriction + " AND wrhwr.wr_id = "+this.literalOrNull(wr_id);	}
		if(date_completed_from != ""){	restriction = restriction + " AND wrhwr.date_completed >= "+this.literalOrNull(date_completed_from);	}
		if(date_completed_to != ""){	restriction = restriction + " AND wrhwr.date_completed <= "+this.literalOrNull(date_completed_to);	}
		if(date_closed_from != ""){	restriction = restriction + " AND wrhwr.date_closed >= "+this.literalOrNull(date_closed_from);	}
		if(date_closed_to != ""){	restriction = restriction + " AND wrhwr.date_closed <= "+this.literalOrNull(date_closed_to);	}
		if(cause_type != ""){	restriction = restriction + " AND wrhwr.cause_type = "+this.literalOrNull(cause_type);	}
		if(repair_type != ""){	restriction = restriction + " AND wrhwr.repair_type = "+this.literalOrNull(repair_type);	}	
		
		switch(work_type){
			case "Yes":
				restriction = restriction + " AND wrhwr.cost_total <> wrhwr.cost_billed";
			break;
			case "No":
				restriction = restriction + " AND wrhwr.cost_total = wrhwr.cost_billed";
			break;
		}

		switch(show_ancillary){
			case "No":
				restriction = restriction + " AND wrhwr.ac_id NOT LIKE '%-60070-%'  AND wrhwr.ac_id NOT LIKE '%-60071-%' AND wrhwr.ac_id NOT LIKE '%-60030-%' AND wrhwr.ac_id NOT LIKE '%-60031-%' AND wrhwr.ac_id NOT LIKE '%-60010-%' AND wrhwr.ac_id NOT LIKE '%-60012-%' AND wrhwr.ac_id NOT LIKE '%-54460-%' AND wrhwr.ac_id NOT LIKE '%-54461-%' AND wrhwr.ac_id NOT LIKE '%-54435-%' AND wrhwr.ac_id NOT LIKE '%-54436-%' ";
			break;
			case "Only":
				restriction = restriction + " AND (wrhwr.ac_id LIKE '%-60070-%' OR wrhwr.ac_id LIKE '%-60071-%' OR wrhwr.ac_id LIKE '%-60030-%' OR wrhwr.ac_id LIKE '%-60031-%' OR wrhwr.ac_id LIKE '%-60010-%' OR wrhwr.ac_id LIKE '%-60012-%' OR wrhwr.ac_id LIKE '%-54460-%' OR wrhwr.ac_id LIKE '%-54461-%' OR wrhwr.ac_id LIKE '%-54435-%' OR wrhwr.ac_id LIKE '%-54436-%') ";
			break;
		}

		switch(show_fleet){
			case "No":
				restriction = restriction + " AND wrhwr.work_team_id <> 'FLEET' ";
				break;
			case "Only":
				restriction = restriction + " AND wrhwr.work_team_id = 'FLEET' ";
				break;
			case "Fuel":
				restriction = restriction + " AND wrhwr.work_team_id = 'FLEET' and wrhwr.prob_type = 'FLEET-FUEL' ";
				break;
			case "OnlyNoFuel":
				restriction = restriction + " AND (wrhwr.work_team_id = 'FLEET' and wrhwr.prob_type <> 'FLEET-FUEL') ";
				break;
			
		}
		this.wrhwrListPanel.refresh(restriction);
	},

	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		$('selectbox_show_fleet').value='No';
		$('selectbox_show_ancillary').value='No';
	},
	
	consolePanel_onAncillaryFleet: function() {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		
		var fromMonth = firstDay.getMonth()+1;
		var fromYear = firstDay.getFullYear();
		var fromDay = firstDay.getDate();
		
		var toMonth = lastDay.getMonth()+1;
		var toYear = lastDay.getFullYear();
		var toDay = lastDay.getDate();
		
		this.consolePanel.clear();
		//this.consolePanel.setFieldValue('wr.charge_type','Single Funding');
		this.consolePanel.setFieldValue('wr.status','Com');
		this.consolePanel.setFieldValue('wr.date_completed.from',fromMonth + '/' + fromDay + '/' + fromYear);
		this.consolePanel.setFieldValue('wr.date_completed.to',toMonth + '/' + toDay + '/' + toYear);
		this.consolePanel.setFieldValue('ac.ac_id', '60070');
		
		$('selectbox_show_ancillary').value='Only';
		$('selectbox_show_fleet').value='No';
		
		
	},
	
	
	consolePanel_onAncillary: function() {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var fromMonth = firstDay.getMonth()+1;
		var fromYear = firstDay.getFullYear();
		var fromDay = firstDay.getDate();
		
		var toMonth = lastDay.getMonth()+1;
		var toYear = lastDay.getFullYear();
		var toDay = lastDay.getDate();
		
		this.consolePanel.clear();
		this.consolePanel.setFieldValue('wr.charge_type','Single Funding');
		this.consolePanel.setFieldValue('wr.status','Com');
		this.consolePanel.setFieldValue('wr.date_completed.from',fromMonth + '/' + fromDay + '/' + fromYear);
		this.consolePanel.setFieldValue('wr.date_completed.to',toMonth + '/' + toDay + '/' + toYear);
		
		$('selectbox_show_ancillary').value='Only';
		$('selectbox_show_fleet').value='No';
		
	},
	
	consolePanel_onFleet: function() {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var fromMonth = firstDay.getMonth();
		var fromYear = firstDay.getFullYear();
		var fromDay = firstDay.getDate();
		
		var toMonth = lastDay.getMonth()+1;
		var toYear = lastDay.getFullYear();
		var toDay = lastDay.getDate();
		
		this.consolePanel.clear();
		this.consolePanel.setFieldValue('wr.charge_type','Single Funding');
		this.consolePanel.setFieldValue('wr.status','Com');
		this.consolePanel.setFieldValue('wr.date_completed.from',fromMonth + '/' + fromDay + '/' + fromYear);
		this.consolePanel.setFieldValue('wr.date_completed.to',toMonth + '/' + toDay + '/' + toYear);
		
		$('selectbox_show_fleet').value='Only';
		$('selectbox_show_ancillary').value='No';
	},
	
	

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//utility functions
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},
	
	
	
	
	wrhwrListPanel_onMarkBilled: function() {
		//alert("Hello");
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Marking Requests as Billed. Please wait...");

		var dataSourceWr = View.dataSources.get("wrlist_ds");
		var dataSourceHwr = View.dataSources.get("hwrlist_ds");
		
		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			
			var wr_id = selectedRecords[i].getValue("wrhwr.wr_id");
			var cost_total = selectedRecords[i].getValue("wrhwr.cost_total");
			var isarchived = selectedRecords[i].getValue("wrhwr.wrarchived");
			var updateRecord = new Ab.data.Record();
			
			//alert (wr_id + " " + isarchived);
			
			updateRecord.isNew = false;
			
			if (isarchived == "0") {
				updateRecord.setValue('wr.wr_id',wr_id);
				updateRecord.setValue('wr.billed','1');
				updateRecord.setValue('wr.cost_billed', cost_total);

				updateRecord.oldValues = {};
				updateRecord.oldValues["wr.wr_id"]  = wr_id;

				dataSourceWr.saveRecord(updateRecord);
			} else if (isarchived == "1") {
				updateRecord.setValue('hwr.wr_id',wr_id);
				updateRecord.setValue('hwr.billed','1');
				updateRecord.setValue('hwr.cost_billed', cost_total);

				updateRecord.oldValues = {};
				updateRecord.oldValues["hwr.wr_id"]  = wr_id;
				dataSourceHwr.saveRecord(updateRecord);
			}

		}

		this.wrhwrListPanel.refresh();
		View.closeProgressBar();
	},


	saveWrAuditValue: function(record, newStatus, newTrade) {
		var trade = (newTrade == null) ? record.getValue('wr.tr_id') : newTrade;
		var parameters = {
				'user_name': View.user.employee.id,
				'wr_id': record.getValue('wr.wr_id'),
				'newValues': toJSON( {'wr.status': newStatus,
									  'wr.tr_id': trade})
		};

		var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
		if (result.code != 'executed') {
				Workflow.handleError(result);
				return false;
		}

		return true;
	},



});