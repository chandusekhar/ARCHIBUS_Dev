//CHANGELOG
//2010/04/07 - JJYCHAN - ISSUE:63 - Modified function deleteItems().  User is not allowed to delete
//						 part when it has been fulfilled or processed
//2010/04/12 - JJYCHAN - ISSUE:76 - Bug fix for above change.  Could not delete parts that are not fulfilled.
//                       Regular expression was used for replacing quotations, and used literal "No" instead of 0
//						 to mark as not fulfilled.
//2010/04/16 - JJYCHAN - ISSUE:111 - Issue only occured when another cf is checked while adding a new wrcf.  Also,
//						 made the costs more literal.  Before they were strings, where "," and quotation marks would
//						 cause errors.  Stripped costs of these characters, fixing these errors.
//2010/04/16 - JJYCHAN - ISSUE:90 - Functionality added to function wrOtherEditPanel_beforeSave().  Now checks quantity
//						 before saving.  Cannot be 0.
//2010/04/19 - JJYCHAN - ISSUE:127 - Added functions wrOtherEditPanel_afterRefresh(), onOtherChanged(), and onOtherSelect()
//						 to facilitate KEYSHOP type requests, which must allow costs to be entered.
//2010/04/28 - JJYCHAN - Contractor costs now default to fulfilled.
//2010/04/30 - JJYCHAN - ISSUE: 162 - Original parts quantity no longer gets overwritten when part of same type is added.
//						 function wrOtherEditPanel_beforeSave()
//2010/04/30 - JJYCHAN - ISSUE: 157 - functions wrcfEditPanel_beforeSave and wrtlEditPanel_beforeSave modified
//						 now looks at fieldvalue rather than record value.
//2010/07/07 - EWONG - ISSUE: 177 - Changing a Part to an already existing type may cause "Another record
//                     already exist..." error.
//2010/11/24 - EWONG - 182 UPGRADE - Fixed issue with restriction being null when first load (causing parts/tools panel to
//                     show all records.
//2012/09/12 - EWONG - Fixed an issue with fields staying hidden when choosing from the wrcf (Timecard) after editing from wrcf (Assignment)

// *****************************************************************************
// View controller object for the Cost tab.
// *****************************************************************************
var costTabController = View.createController('costTabController', {
	firstLoad: true,	// variable to flag if the View is first loaded.
	savedPKey: null,	// Archibus record of the primary key of the previously saved record.
	isFleet: false,
	infoController: null,
	infoPanel: null,

	afterInitialDataFetch: function() {
		this.inherit();
	},

	wrcfReportGrid_afterRefresh: function() {
		// When the tab is refreshed by the parent, only the "main" (first) panel
		// is refreshed.  So we will refresh the other panels after the main panel
		// refreshes.
		//
		// This is done here instead of "afterInitialDataFetch" because
		// View.restriction is null during that event.
		// 18.2 Fix (rest is null when this first loads).
		var rest = this.wrcfReportGrid.restriction;
		if (this.firstLoad && rest != null) {
			this.firstLoad = false;
			this.wrcfTimeReportGrid.refresh(rest);
			this.wrtlReportGrid.refresh(rest);
			this.wrOtherReportGrid.refresh(rest);
		}

		this.infoController = View.controllers.get('infoTabController');
		this.infoPanel = this.nav_details_info;
	},

	/**
	 * wrcfEditPanel: Before Save event handler.
	 */
	wrcfEditPanel_beforeSave: function() {
		var continueSave = true;

		/*
		// Due to a bug in Archibus (not returning the saved record), we'll save a
		// copy of the primary key of new records so that the "update costs"
		// workflows will correctly update new records.
		if (this.wrcfEditPanel.record.isNew) {
			var rec = new Ab.data.Record();
			rec.values["wrcf.wr_id"] = this.wrcfEditPanel.getFieldValue("wrcf.wr_id");
			rec.values["wrcf.cf_id"] = this.wrcfEditPanel.getFieldValue("wrcf.cf_id");
			//rec.values["wrcf.date_assigned"] = this.wrcfEditPanel.record.values["wrcf.date_assigned"];
			//rec.values["wrcf.time_assigned"] = this.wrcfEditPanel.record.values["wrcf.time_assigned"];
			rec.values["wrcf.date_assigned"] = this.wrcfEditPanel.getFieldValue("wrcf.date_assigned");
			rec.values["wrcf.time_assigned"] = this.wrcfEditPanel.getFieldValue("wrcf.time_assigned");

			this.savedPKey = rec;
		}
		*/
		return continueSave;
	},

	/**
	 * wrcfEditPanel: Before Save event handler.
	 */
	wrtlEditPanel_beforeSave: function() {
		var continueSave = true;

		// Due to a bug in Archibus (not returning the saved record), we'll save a
		// copy of the primary key of new records so that the "update costs"
		// workflows will correctly update new records.
		if (this.wrtlEditPanel.record.isNew) {
			var rec = new Ab.data.Record();
			rec.values["wrtl.wr_id"] = this.wrtlEditPanel.getFieldValue("wrtl.wr_id");
			rec.values["wrtl.cf_id"] = this.wrtlEditPanel.getFieldValue("wrtl.cf_id");
			//rec.values["wrtl.date_assigned"] = this.wrtlEditPanel.record.values["wrtl.date_assigned"];
			//rec.values["wrtl.time_assigned"] = this.wrtlEditPanel.record.values["wrtl.time_assigned"];
			rec.values["wrtl.date_assigned"] = this.wrtlEditPanel.getFieldValue("wrtl.date_assigned");
			rec.values["wrtl.date_assigned"] = this.wrtlEditPanel.getFieldValue("wrtl.time_assigned");

			this.savedPKey = rec;
		}

		return continueSave;
	},

	/**
	 * wrcfEditPanel: Before Save event handler.
	 */
	wrtlEditPanel_beforeSave: function() {
		var continueSave = true;

		// Due to a bug in Archibus (not returning the saved record), we'll save a
		// copy of the primary key of new records so that the "update costs"
		// workflows will correctly update new records.
		if (this.wrtlEditPanel.record.isNew) {
			var rec = new Ab.data.Record();
			rec.values["wrtl.wr_id"] = this.wrtlEditPanel.getFieldValue("wrtl.wr_id");
			rec.values["wrtl.tool_id"] = this.wrtlEditPanel.getFieldValue("wrtl.tool_id");
			rec.values["wrtl.date_assigned"] = this.wrtlEditPanel.record.values["wrtl.date_assigned"];
			rec.values["wrtl.time_assigned"] = this.wrtlEditPanel.record.values["wrtl.time_assigned"];

			this.savedPKey = rec;
		}

		return continueSave;
	},


//	/**
//	 * Show fields depending on the other_rs_type
//	 * If it's as type 'KEYSHOP' users should be able to edit costs
//	 */

	wrOtherEditPanel_afterRefresh: function() {
		if (this.isFleet) {
			this.wrOtherEditPanel.setTitle("Add/Edit Other Costs");
		}

		other_type = this.wrOtherEditPanel.getFieldValue("wr_other.other_rs_type");


		if (other_type == 'KEYSHOP' || other_type == 'P-CARD' || other_type == 'FLEET') {
			this.wrOtherEditPanel.enableField("wr_other.cost_total", true);
			this.wrOtherEditPanel.enableField("wr_other.description", true);
			this.wrOtherEditPanel.enableField("wr_other.date_used", true);
			this.wrOtherEditPanel.enableField("wr_other.qty_used", true);
		} else if (other_type == 'CONTRACTOR') {
			this.wrOtherEditPanel.enableField("wr_other.vn_id", true);
			this.wrOtherEditPanel.enableField("wr_other.description", true);
		} else {
			this.wrOtherEditPanel.enableField("wr_other.cost_total", false);
			this.wrOtherEditPanel.enableField("wr_other.vn_id", false);
		}

	},


//	/**
//	 * wrOtherEditPanel: Before Save event handler.
//	 */
	wrOtherEditPanel_beforeSave: function() {
		var continueSave = true;

		var qty = this.wrOtherEditPanel.getFieldValue("wr_other.qty_used");


		if (qty == 0) {
			continueSave = false;
			View.showMessage(getMessage('quantityZero'));

		}

		// Fleet: if it's fleet, ensure the id doesn't start with PARTS or VECHICLE
		var otherRsType = this.wrOtherEditPanel.getFieldValue("wr_other.other_rs_type");
		if (this.isFleet && (otherRsType.substring(0,5) == "PARTS" || otherRsType.substring(0,7) == "VEHICLE")) {
			continueSave = false;
			View.showMessage(getMessage('nonFleetPartsOnly'));
		}

		// For New Records (or when a new part type is choosen)
		// fill in the "date_used" field with today's date or the if a record
		// exist with this primary key (wr_id, other_res_type, date_used) then increment
		// the date_used to the next available date.
		if (this.wrOtherEditPanel.record.isNew ||
				this.wrOtherEditPanel.record.oldValues["wr_other.other_rs_type"] != this.wrOtherEditPanel.getFieldValue("wr_other.other_rs_type")) {
			var insertDate = new Date();

			var wrId = this.wrOtherEditPanel.getFieldValue("wr_other.wr_id");

			var otherRsType = this.wrOtherEditPanel.getFieldValue("wr_other.other_rs_type");


			var rest = "wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type ='"+otherRsType
									+"' AND CONVERT(DATETIME, wr_other.date_used, 101) = CONVERT(DATETIME,'"
									+ this.ds_wr_other.formatValue("wr_other.date_used", insertDate, true) + "')";


			if (this.ds_wr_other.getRecord(rest).values["wr_other.date_used"] != undefined ) {
				// Primary key already exists, use the max date associated with the
				// wr_id and other_rs_type by 1.
				rest = "wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type = '"+otherRsType
									+" ' AND wr_other.date_used = (SELECT max(date_used) FROM wr_other WHERE "
									+" wr_other.wr_id = "+wrId
									+" AND wr_other.other_rs_type ='"+otherRsType+"')"

				insertDate = this.ds_wr_other.getRecord(rest).values["wr_other.date_used"];
				insertDate.setTime(insertDate.getTime() + 86400000);	// Add 1 day to the date (86400000ms)
			}
			//alert("Insert Date:" + insertDate);
			// Set the date to the underlying field
			this.wrOtherEditPanel.setFieldValue("wr_other.date_used",
				this.ds_wr_other.formatValue("wr_other.date_used", insertDate, true));
			//this.wrOtherEditPanel.record.values["wr_other.date_used"] = insertDate; // Fixed in 18.2, no longer need to save directly to record
			// Due to a bug in Archibus (not returning the saved record), we'll save a
			// copy of the primary key of new records so that the "update costs"
			// workflows will correctly update new records.
			var rec = new Ab.data.Record();
			rec.values["wr_other.wr_id"] = this.wrOtherEditPanel.getFieldValue("wr_other.wr_id");
			rec.values["wr_other.other_rs_type"] = this.wrOtherEditPanel.getFieldValue("wr_other.other_rs_type");
			rec.values["wr_other.qty_used"] = this.wrOtherEditPanel.getFieldValue("wr_other.qty_used");
			//rec.values["wr_other.date_used"] = this.wrOtherEditPanel.record.values["wr_other.date_used"];		// obtain date object directly from record
			//rec.values["wr_other.qty_used"] = this.wrOtherEditPanel.getFieldValue("wr_other.date_used");
			rec.values["wr_other.date_used"] = insertDate;		// obtain date object directly from record

			//alert(this.wrOtherEditPanel.getFieldValue("wr_other.date_used"));
			//alert(insertDate);
			this.savedPKey = rec;
		}


		return continueSave;
	},

	// *****************************************************************************
	// getting input data from the edit form panel
	// Note: Pass in a "tablename" if the time_assigned needs to be filled in with
	//       the old value.  Archibus does not fill in the record with the old
	//       time_assigned (bug).  This is needed for the wrcf, wrpt and wrtools
	//       tables that use time_assigned as a primary key.
	// *****************************************************************************
	gettingRecordsData: function(panel, tablename)
	{
		var ds = View.dataSources.get(panel.dataSourceId);
		var record = panel.getRecord();

		// check the record
		// if the wr_id does not exist, it means it was a new record and Archibus
		// did not refresh properly, we will use the saved pkey record and clear the
		// variable.
		if (record.values["wr.wr_id"] == undefined) {
			var savedPKey = this.savedPKey;

			if (savedPKey != null) {
				record = savedPKey;
				this.savedPKey = null;
			}
		}

		// fill in time assigned with the oldValue if needed
		if (tablename != undefined) {
			var fieldname = tablename + ".time_assigned";
			if (record.values[fieldname] == undefined) {
				record.values[fieldname] = record.oldValues[fieldname];
			}
		}

		var recordValues = ds.processOutboundRecord(record).values;
		return toJSON(recordValues);
	},

	onOtherChanged: function(newVal)
	{
		if (newVal == 'KEYSHOP' || newVal == 'P-CARD' || newVal == 'FLEET') {
		//this.wrOtherEditPanel.fields.get("wr_other.fulfilled").readOnly="false";
		//this.wrOtherEditPanel.fields.get("wr_other.fulfilled").actions.get("").show(true);
			//this.wrOtherEditPanel.enableField("wr_other.fulfilled", true);
			this.wrOtherEditPanel.setFieldValue("wr_other.fulfilled", 'Yes', '1');
			this.wrOtherEditPanel.enableField("wr_other.cost_total", true);
		} else  if(newVal == 'CONTRACTOR') {
			this.wrOtherEditPanel.setFieldValue("wr_other.fulfilled", 'Yes', '1');
			this.wrOtherEditPanel.enableField("wr_other.vn_id", true);

			this.wrOtherEditPanel.enableField("wr_other.description", true);


		} else  if(newVal == 'TRAVEL ALLOWANCE') {
			this.wrOtherEditPanel.setFieldValue("wr_other.fulfilled", 'Yes', '1');
			this.wrOtherEditPanel.enableField("wr_other.cost_total", true);
			this.wrOtherEditPanel.setFieldValue("wr_other.cost_total", '10.00');
			this.wrOtherEditPanel.setFieldValue("wr_other.qty_used", '1');
			this.wrOtherEditPanel.setFieldValue("wr_other.description", 'Call-Out Travel Allowance');
		} else {
			this.wrOtherEditPanel.setFieldValue("wr_other.fulfilled", 'No', '0');
			this.wrOtherEditPanel.enableField("wr_other.cost_total", false);
			this.wrOtherEditPanel.enableField("wr_other.vn_id", false);
		}
	}

});


// *****************************************************************************
// Fill in (readonly/hidden) primary key fields.
// *****************************************************************************
function fillRequiredInfo(button)
{
	var tablename;
	var editPanelName;
	var timecard = false;

	// determine which panel to fill information for from the button id
	switch (button.id) {
	case "btnWrcfAdd":
		tablename = "wrcf";
		editPanelName = "wrcfEditPanel";
		break;
	case "btnWrcfAddTime":
		tablename = "wrcf"
		editPanelName = "wrcfEditPanel";
		timecard = true;
		break;
	case "btnWrtlAdd":
		tablename = "wrtl";
		editPanelName = "wrtlEditPanel";
		break;
	case "btnWrptAdd":
		tablename = "wrpt";
		editPanelName = "wrptEditPanel";
		break;
	case "btnWrOtherAdd":
		tablename = "wr_other";
		editPanelName = "wrOtherEditPanel";
		break;
	}

	// fill in wr_id and date/time
	if (tablename != undefined) {
		var panel = View.getControl('',editPanelName);
		//var record = panel.getRecord();
		record = panel.record;

		// get the wr_id from the restriction (the form is wr_id=23434)
		// we'll use substring, but need to ensure that the restriction is passed in
		// the above form (no quotes, no table_name) from uc-wr-manager-details.js
		var rest = View.restriction;
		var wrId = rest.substring(6);

		// get the current date/time
		var currentDate = new Date();

		panel.setFieldValue(tablename+".wr_id", wrId);

		// wr_other uses different date field for primary key (and no time field)
		if (tablename != "wr_other") {
			var dateValue = View.dataSources.get(panel.dataSourceId).formatValue(tablename+".date_assigned", currentDate, true);
			var timeValue = currentDate.getHours() + ':' + currentDate.getMinutes()+ ':' +  currentDate.getSeconds();
			panel.setFieldValue(tablename+".date_assigned", dateValue);   // changes the input field value (required field, WC will complain)
			record.setValue(tablename+".date_assigned", currentDate);   // changes the record date (in case the field is hidden)
			panel.setFieldValue(tablename+".time_assigned", timeValue); // changes the record data (required field, WC will complain)
			record.setValue(tablename+".time_assigned", currentDate);   // changes the record data (field is hidden)
		}
		else {
			var dateValue = View.dataSources.get(panel.dataSourceId).formatValue(tablename+".date_used", currentDate, true);
			panel.setFieldValue(tablename+".date_used", dateValue);
		}

		if (tablename == "wrcf" && timecard) {
			panel.setFieldValue(tablename+".entry_type", "Timecard");
			record.setValue(tablename+".entry_type", "Timecard");
			panel.showField("wrcf.hours_straight",true);
			panel.showField("wrcf.hours_over",true);
			panel.showField("wrcf.hours_double",true);
			panel.showField("wrcf.cost_total",true);
		}
		else if (tablename == "wrcf") {
			panel.showField("wrcf.hours_straight",false);
			panel.showField("wrcf.hours_over",false);
			panel.showField("wrcf.hours_double",false);
			panel.showField("wrcf.cost_total",false);
		}

		if (tablename == "wrpt") {
			panel.setFieldValue("wrpt.qty_estimated", parseInt(panel.getFieldValue("wrpt.qty_estimated")));
		}
	}
}


//*******************************************************************************
// * The following functions are left outside the controller because they are
// * directly called from the axvw.
// ******************************************************************************/

// *****************************************************************************
// runs the workflow required to roll up hours and costs data for Craftsperson
// *****************************************************************************
function saveWorkRequestCraftsperson()
{
	var panel = View.panels.get('wrcfEditPanel');
	var record = UC.Data.getDataRecordValuesFromForm(panel);

	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestCraftsperson", record);
        View.getControl('', 'wrcfReportGrid').refresh();
		View.getControl('', 'wrcfTimeReportGrid').refresh();
    }
   	catch (e) {
		Workflow.handleError(e);
 	}
}


// *****************************************************************************
// runs the workflow required to roll up hours and costs data for Tools
// and refresh the DataGrid.
// *****************************************************************************
function saveWorkRequestTool()
{
	var panel = View.panels.get('wrtlEditPanel');
	var record = UC.Data.getDataRecordValuesFromForm(panel);

	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool", record);
        View.getControl('', 'wrtlReportGrid').refresh();
    }
   	catch (e) {
		Workflow.handleError(e);
 	}
}



// *****************************************************************************
// runs the workflow required to roll up hours and costs data for Other Costs
// and refresh the DataGrid.
// *****************************************************************************
function saveWorkRequestOther()
{
	var panel = View.panels.get('wrOtherEditPanel');
	var record = UC.Data.getDataRecordValuesFromForm(panel);

	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveOtherCosts", record);
        View.getControl('', 'wrOtherReportGrid').refresh();
    }
   	catch (e) {
		Workflow.handleError(e);
 	}

	var other_rs_type = record['wr_other.other_rs_type'];
	// Ask if the request should be updated to On Hold For Parts
	// Note "confirm" is non-modal, any code after it will run without waiting for a response.
	if (other_rs_type.substring(0,6) === 'PARTS-' && costTabController.infoPanel && costTabController.infoPanel.getFieldValue('wr.status') !== 'AA') {
		var oldStatus = costTabController.infoPanel.getFieldValue('wr.status');
		View.confirm(getMessage('confirmSetOnHoldForParts'), function(button) {
			if (button == 'yes') {
				var result = {};
				try {
					var wr_id = panel.getFieldValue('wr_other.wr_id');
					var status = "HP";
					var recordValues = {};
					recordValues["wr.wr_id"] = wr_id;
					recordValues["wr.status"] = oldStatus;
					result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, status);
					costTabController.infoController.saveWrAuditValues();
					costTabController.infoController.afterSaveWorkflowFunc = null;
					costTabController.infoController.afterSaveWorkflow();
					costTabController.infoPanel.refresh();
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	}
}


// *****************************************************************************
// Clear any checked rows
// This is to prevent any errors when adding a new line item
// *****************************************************************************
function clearchecks(gridName)
{

		var grid = View.getControl('',gridName);
		var count = grid.gridRows.getCount();


		for (var i = 0; i < count; i++) {
			//var dataRow = dataRows[i];
			var row = grid.gridRows.get(i);
			row.select(false);
		}

}


/**
 * Delete database records, selected in given grid, from given table and
 * recalculate the costs.
 */
function deleteItems(gridName, tableName)
{
	var grid = View.getControl('', gridName);
	var records = grid.getPrimaryKeysForSelectedRows();
	var dataRows = grid.getSelectedRows();

	var deleteOK = true;

	if(records.length==0){
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}

	//if the item being deleted is a cf, check to see if the number of hours assigned is 0
	if (gridName=="wrcfReportGrid") {

		for (var i = 0; i < dataRows.length; i++) {
			var dataRow = dataRows[i];

			// data row objects contain a reference to the parent grid control
			// because of this, you should never pass data row objects to toJSON() method

			// if you need to serialize data rows to JSON format, create new objects:
			var dataRowCopy = new Object();
			dataRowCopy['wrcf.cost_total'] = dataRow['wrcf.cost_total'];
			//var message = toJSON(dataRowCopy) + '\n';
			var totalcost = toJSON(dataRowCopy['wrcf.cost_total']);

			totalcost = totalcost.replace(/['"]/g,'');
			totalcost = totalcost.replace(',','');

			totalcost = (totalcost.substring(1, totalcost.length - 1)) * 1;

			if (totalcost > 0) {
				deleteOK = false;

				View.showMessage(getMessage('cannotDeleteCf'));
			}
		}


	};

	if (gridName=="wrOtherReportGrid") {
		for (var i = 0; i < dataRows.length; i++) {
			var dataRow = dataRows[i];

			var dataRowCopy = new Object();
			dataRowCopy['wr_other.fulfilled'] = dataRow['wr_other.fulfilled'];
			var fulfilled = toJSON(dataRowCopy['wr_other.fulfilled']);

			//remove quotes using a global regular expression
			var fulfilled = fulfilled.replace(/\"/g, "");

			if (fulfilled != "No") {
				deleteOK = false;
				View.showMessage(getMessage('cannotDeleteOther'));
			}
		}
	};

	if (gridName=="wrptReportGrid") {
		for (var i = 0; i < dataRows.length; i++) {
			var dataRow = dataRows[i];

			var dataRowCopy = new Object();
			dataRowCopy['wrpt.fulfilled'] = dataRow['wrpt.fulfilled'];
			var fulfilled = toJSON(dataRowCopy['wrpt.fulfilled']);

			//remove quotes using a global regular expression
			var fulfilled = fulfilled.replace(/\"/g, "");

			if (fulfilled != "No") {
				deleteOK = false;
				View.showMessage(getMessage('cannotDeleteOther'));
			}
		}
	};

	if (deleteOK) {
		// call the deleteItems workflow after confirmation.  deleteItems will
		// recalculate the hours/costs.
		View.confirm(getMessage('confirmDelete'), function(button) {
			if (button == 'yes') {
				var result = {};
				try {
					result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', tableName, records);
					grid.refresh();
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	}
}

function onOtherSelect(fieldname, newVal, oldVal)
{
	if (fieldname == "wr_other.other_rs_type" && newVal != oldVal) {
		costTabController.onOtherChanged(newVal);
	}
}

function cfSelectVal(){
	var panel = View.panels.get('wrcfEditPanel');
	var restriction = "cf.status='A' AND assign_work=1"

	var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wr.tr_id='FLEET' and wr.wr_id="+ panel.getFieldValue('wrcf.wr_id'));
	if (wrRecords != undefined && wrRecords.length > 0) {
		//restriction += " and cf.tr_id in ('FLEET','MECHANIC')"
		restriction += " and cf.work_team_id='FLEET'";
	}

	View.selectValue({
		formId: 'wrcfEditPanel',
		title: "Craftpersons",
		fieldNames: ['wrcf.cf_id'],
		selectTableName: 'cf',
		selectFieldNames: ['cf.cf_id'],
		visibleFieldNames: ['cf.cf_id','cf.name','cf.work_team_id','cf.tr_id','cf.position','cf.rate_hourly','cf.rate_over','cf.rate_double','cf.status'],
		restriction: restriction,
		applyFilter: true,
		sortValues: toJSON([{fieldName : "cf.work_team_id"},{fieldName : "cf.cf_id"}])
	});
}



// *****************************************************************************
// runs the workflow required to roll up hours and costs data for Parts
// and refresh the DataGrid.
// *****************************************************************************
function saveWorkRequestPart()
{
	var panel = View.panels.get('wrptEditPanel');
	var record = UC.Data.getDataRecordValuesFromForm(panel);

	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPart", record);
        View.getControl('', 'wrptReportGrid').refresh();
    }
   	catch (e) {
		Workflow.handleError(e);
 	}
}


function selectValueWrOther() {
	var rest = "other_rs.other_rs_type not like 'LOAD%'";

	if (costTabController.isFleet) {
		rest += " AND other_rs.other_rs_type NOT LIKE 'PARTS%' AND other_rs.other_rs_type NOT LIKE 'VEHICLE%'"
	}

	View.selectValue({
		formId: 'wrOtherEditPanel',
		title: "Parts/Contractor",
		fieldNames: ["wr_other.other_rs_type"],
		selectTableName: 'other_rs',
		selectFieldNames: ["other_rs.other_rs_type"],
		visibleFieldNames: ["other_rs.other_rs_type","other_rs.description"],
		actionListener: 'onOtherSelect',
		restriction: rest
	});
}
