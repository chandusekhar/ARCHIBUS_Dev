// CHANGE LOG
// 2010/12/01 - EWONG - Changed the PMP SelectValue so that after choosing a PMP, both the scheduled and recommended intervals gets updated.
// 2010/12/01 - EWONG - When creating a new PMS, the eq's bl/fl/rm is no longer copied down to the PMS.  The eq's bl/fl/rm is shown instead.
// 2010/12/01 - EWONG - Added logic to "disable" (set interval_freq = 4) all pms associated with the eq when it the status changes to (out/dec) and vice versa.
// 2010/12/01 - EWONG - Disable the "Add Schedule" button if status is in 'out' or 'dec'.
// 2016/03/20  -  JJYCHAN - Fixed issue with Schedule interval not loading correctly in Chrome and Internet Explorer

var ucManageEqEqstd = View.createController('ucManageEqEqstd', {
	afterViewLoad: function()
	{
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
	},

	eq_details_afterRefresh: function()
	{
		var warranty_id = this.eq_details.getFieldValue("eq.warranty_id");
		if (warranty_id != "" ) {
			var warranty_date = UC.Data.getDataValue('warranty', 'date_expiration', "warranty_id='"+warranty_id.replace(/'/g, "''")+"'");
			this.eq_details.setFieldValue("war_expiry", warranty_date);
		}
	},

	eq_details_beforeSave: function()
	{
		// save the warranty information (if necessary)
		if (this.eq_details.getFieldValue("war_expiry") != "") {
			var dataSource = View.dataSources.get('warranty_save_ds');

			var isNew = false;
			var warranty_id = this.eq_details.getFieldValue("eq.warranty_id");
			if (warranty_id == "") {
				// to the create a new record and set the eq.warranty_id
				isNew = true;
				warranty_id = this.eq_details.getFieldValue("eq.eq_id");
				this.eq_details.setFieldValue("eq.warranty_id", warranty_id);
			}

			var rec = new Ab.data.Record();
			rec.isNew = isNew;
			rec.setValue('warranty.warranty_id', warranty_id);
			rec.setValue('warranty.date_expiration', this.eq_details.getFieldValue("war_expiry"));

			rec.oldValues = new Object();
			rec.oldValues['warranty.warranty_id'] = warranty_id;

			dataSource.saveRecord(rec);
		}
	},

    // variable to hold the new status (record only keeps the status at first load)
    currentStatus: null,

    checkDisablePMS: function() {
        if (this.currentStatus == null) {
            this.eq_details.record.oldValues['eq.status'];
        }

        var newStatus = this.eq_details.record.values['eq.status'];
        if (this.currentStatus != newStatus) {
            var interval_freq = 1;
            switch(newStatus) {
            case 'out':
            case 'dec':
                interval_freq = 4;
                break;
            default:
                interval_freq = 1;
                break;
            }

            // change the interval_freq of all the pms
            this.pms_grid.gridRows.each(function (row) {
                var record = row.getRecord();
				var pms_id = record.getValue('pms.pms_id');
				var saveRecord = new Ab.data.Record();
				saveRecord.isNew = false;
				saveRecord.setValue('pms.pms_id', pms_id);
                saveRecord.setValue('pms.interval_freq', interval_freq);

				//delete record.oldValues['pms.interval_freq'];   // ensure the interval_freq saves
				saveRecord.oldValues = new Object();
				saveRecord.oldValues['pms.pms_id'] = pms_id;

				View.dataSources.get('pms_ds').saveRecord(saveRecord);
            });

            // rerun the pmdd generation for this equipment
            var eq_id = this.eq_details.getFieldValue('eq.eq_id');
            var PMSRest = "pms.eq_id = '"+eq_id.replace(/'/g, "''")+"'"

            var parameters = {
                "pmsidRestriction": PMSRest
            }

            try {
                var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
            }
            catch (e) {
                Workflow.handleError(e);
            }


        }

        this.pms_grid.refresh("pms.eq_id='"+this.eq_details.getFieldValue('eq.eq_id').replace(/'/g,"''")+"'");
        this.currentStatus = newStatus;
    },
	/*
	changedFreqType: function()
	{
		var freqType = this.schedule_edit.getFieldValue('pms.interval_type');
		if (freqType == 'm') {
			this.schedule_edit.setFieldValue('pms.interval_1', 1);
			this.schedule_edit.enableField('pms.interval_1', false);
			document.getElementById('radioGrid').style.display = 'block';
		}
		else {
			this.schedule_edit.enableField('pms.interval_1', true);
			document.getElementById('radioGrid').style.display = 'none';
		}
	},
	*/

	eq_search_onActionSearchBarcode: function()
	{
		// get the barcode from the inputbox.
		var barcode = this.eq_search.getFieldValue("eq.eq_id");

		this.eq_drilldown.refresh("eq_id = '"+barcode.replace(/'/g, "''")+"'");
	},

	pms_grid_onSchedEdit: function(row) {

		//var eqId = row.getFieldValue("pms.eq_id");
		var pmsID = row.getFieldValue("pms.pms_id");
		//var pmpID = row.getFieldValue("pms.pmp_id");
		var resFromAsign = new Ab.view.Restriction();
		//resFromAsign.addClause('pms.eq_id', eqId, '=', 'or');
		//resFromAsign.addClause('pms.pmp_id', pmpID, '=', ')AND(');
		resFromAsign.addClause('pms.pms_id', pmsID, '=');
		View.resFromAsign = resFromAsign;
		View.panelToRefresh = "pms_grid";
		View.openDialog('pro-pm-def-sched.axvw');
	},

	schedule_edit_saveForm: function() {

		frm = this.schedule_edit
		bolPMDD = frm.record.isNew

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_type') != frm.getFieldValue('pms.interval_type')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_freq') != frm.getFieldValue('pms.interval_freq')}
		if (!bolPMDD) {
			var interval = "pms.interval_" + frm.record.getValue('pms.interval_freq')
			bolPMDD = frm.record.getValue(interval) != frm.getFieldValue(interval)
		}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.fixed') != frm.getFieldValue('pms.fixed')}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.date_first_todo').dateFormat('Y-m-j' ) != frm.getFieldValue('pms.date_first_todo')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_type') != frm.getFieldValue('pms.interval_type')}

		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.interval_freq') != frm.getFieldValue('pms.interval_freq')}
		if (!bolPMDD) {
			var interval = "pms.interval_" + frm.record.getValue('pms.interval_freq')
			bolPMDD = frm.record.getValue(interval) != frm.getFieldValue(interval)
		}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.fixed') != frm.getFieldValue('pms.fixed')}
		if (!bolPMDD) {bolPMDD = frm.record.getValue('pms.date_first_todo').dateFormat('Y-m-j' ) != frm.getFieldValue('pms.date_first_todo')}

		if (this.schedule_edit.save()) {
			this.pms_grid.refresh();
			if (bolPMDD) {
				PMSRest = "pms.pms_id in (" + frm.getFieldValue('pms.pms_id') + ")"
				PMSRest = PMSRest + " and (exists (select 1 from pmp where pmp.pmp_id = pms.pmp_id and pmp.pmp_type <> 'EQ')"
				PMSRest = PMSRest + " or exists (select 1 from eq where eq.eq_id = pms.eq_id and eq.status = 'in'))"

				var parameters = {
					"pmsidRestriction": PMSRest
				}

				try {
					var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
				}
				catch (e) {
					Workflow.handleError(e);
				}
			}

			//View.closeDialog();
			this.schedule_edit.closeWindow();
		}
	},

    pms_grid_afterRefresh: function() {
        var eqStatus = this.eq_details.getFieldValue('eq.status');
        if (eqStatus == 'out' || eqStatus == 'dec' || this.eq_details.getFieldValue('eq.eq_id') == "") {
            this.pms_grid.actions.get('sched_add').enable(false);
        }
    },

	pms_grid_new_sched: function() {
		var eq_id = this.schedule_edit.getFieldValue("pms.eq_id");

		var bl_id = this.eq_details.getFieldValue("eq.bl_id");
		var fl_id = this.eq_details.getFieldValue("eq.fl_id");
		var rm_id = this.eq_details.getFieldValue("eq.rm_id");

		/*
		this.schedule_edit.setFieldValue("pms.bl_id", bl_id);
		this.schedule_edit.setFieldValue("pms.fl_id", fl_id);
		this.schedule_edit.setFieldValue("pms.rm_id", rm_id);
		*/
		// Change the shown value
		$('Showschedule_edit_eq.bl_id').innerHTML = bl_id;
		$('Showschedule_edit_eq.fl_id').innerHTML = fl_id;
		$('Showschedule_edit_eq.rm_id').innerHTML = rm_id;
	}
});

// ************************************************************************
// Checks the Account Code (through PHP) and call the saveFormCallback function
// if successful.  Valid Account codes are automatically inserted into the
// ac table.
// ************************************************************************
function checkAcctAndSave()
{
	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is null then save form directly
	if (parsed_ac_id=="") {
		saveFormCallback("");
	}
	else {
		// check account code through php
		uc_psAccountCode(
			$('ac_id_part1').value,
			$('ac_id_part2').value,
			$('ac_id_part3').value,
			$('ac_id_part4').value,
			$('ac_id_part5').value,
			$('ac_id_part6').value,
			$('ac_id_part7').value,
			$('ac_id_part8').value,
			'saveFormCallback');
	}
}

function saveFormCallback(acct)
{
	var success = false;
	var ac_id=acct.replace("\r\n\r\n", "");

	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is not null, ensure that the returned ac_id isn't blank.
	if (parsed_ac_id != "" && ac_id == "") {
		ac_id = "0";
	}

	switch(ac_id)
	{
	case "1":
		View.showMessage(getMessage('error_Account1'));
		success = false;
		break;
	case "2":
		View.showMessage(getMessage('error_Account2'));
		success = false;
		break;
	case "3":
		View.showMessage(getMessage('error_Account3'));
		success = false;
		break;
	case "4":
		View.showMessage(getMessage('error_Account4'));
		success = false;
		break;
	case "5":
		View.showMessage(getMessage('error_Account5'));
		success = false;
		break;
	case "6":
		View.showMessage(getMessage('error_Account6'));
		success = false;
		break;
	case "7":
		View.showMessage(getMessage('error_Account7'));
		success = false;
		break;
	case "8":
		View.showMessage(getMessage('error_Account8'));
		success = false;
		break;
	case "99":
		View.showMessage(getMessage('error_Account99'));
		success = false;
		break;
	case "0":
		View.showMessage(getMessage('error_invalidAccount'));
		success = false;
		break;
	default:
		success = true;
	};

	// Set the valid account code
	if (success) {
		View.panels.get("schedule_edit").setFieldValue("pms.ac_id", ac_id);
		ucManageEqEqstd.schedule_edit_saveForm();
	}
}

function loadAcctCode(acct) {
	var position = 0;
	var mark = acct.indexOf('-', position);
	var bu = acct.substring(position, mark);
	//fund
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var fund= acct.substring(position, mark);
	//dept
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var dept= acct.substring(position, mark);
	//account
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var account= acct.substring(position, mark);
	//program
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var program= acct.substring(position, mark);
	//internal
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var internal= acct.substring(position, mark);
	//project
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var project= acct.substring(position, mark);
	//affiliate
	position=mark+1;
	//mark=acct.indexOf('-',mark+1);
	var affiliate= acct.substring(position);

	$('ac_id_part1').value = bu;
	$('ac_id_part2').value = fund;
	$('ac_id_part3').value = dept;
	$('ac_id_part4').value = account;
	$('ac_id_part5').value = program;
	$('ac_id_part6').value = internal;
	$('ac_id_part7').value = project;
	$('ac_id_part8').value = affiliate;
}

function pmpSelValAfterSelect(field_name, selectedValue, prevValue, selectedValueRaw) {
	
	//alert("Step 1: Field name: " + field_name + " Selected Value " + selectedValue + " Prev Value " + prevValue + " Selected Value Raw " + selectedValueRaw);
	
	if (field_name == 'pms.interval_type') {
		// Fixes Archibus issue where the selected value doesn't change the
		// drop down box.
		View.panels.get('schedule_edit').setFieldValue('pms.interval_type', selectedValueRaw);
		//alert("Step 2a: Field name: " + field_name + " Selected Value " + selectedValue + " Prev Value " + prevValue + " Selected Value Raw " + selectedValueRaw);
		return false;
		
	}
	else if (field_name == 'pmp.pmp_cat') {
		// if LPM make interval readOnly
		var panel = View.panels.get('schedule_edit');
        if (selectedValue == 'LPM') {
			panel.enableField('pms.interval_1', false);
			panel.enableField('pms.interval_type', false);
		}
		else {
			panel.enableField('pms.interval_1', true);
			panel.enableField('pms.interval_type', true);
		}
		
		//alert("Step 3: Field name: " + field_name + " Selected Value " + selectedValue + " Prev Value " + prevValue + " Selected Value Raw " + selectedValueRaw);
	}
	else if (field_name == 'pmp.interval_rec') {
		View.panels.get('schedule_edit').setFieldValue('pmp.interval_rec', selectedValue);
		
		//alert("Step 4: Field name: " + field_name + " Selected Value " + selectedValue + " Prev Value " + prevValue + " Selected Value Raw " + selectedValueRaw);
	}
	else if (field_name == 'pmp.interval_type') {
		// Fixes Archibus issue where the selected value doesn't change the
		// drop down box.
		View.panels.get('schedule_edit').setFieldValue('pmp.interval_type', selectedValueRaw);
		
		//alert("Step 5: Field name: " + field_name + " Selected Value " + selectedValue + " Prev Value " + prevValue + " Selected Value Raw " + selectedValueRaw);
		return false;
	}
}