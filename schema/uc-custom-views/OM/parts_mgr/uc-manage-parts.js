// CHANGE LOG
// 2010/03/31 - JJYCHAN - ISSUE:36 - Modified to include different colors for new parts status':
//						  'Quote Requested'(orange) and 'Part on Order'(yellow).
// 2010/04/01 - jjychan	- ISSUE:44 - Modified SMS email to map to the SMS.TEMPLATE file.
// 2010/04/07 - EWONG - ISSUE:66 - Modified SMS message to concatenate the parts list.
// 2010/04/16 - JJYCHAN - ISSUE:118 - Made a more descriptive body for the emails sent out.
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons
// 2010/06/01 - JJYCHAN - ISSUE 217 - Modified date string when saving a new description.
// 2010/06/11 - EWONG - ISSUE: 210 - Added query and color coded for the top wr panel.
// 2010/07/07 - EWONG - ISSUE: 244 - Fixed issue with cut and past on the "Parts Description"
// 2010/07/13 - EWONG - ISSUE: 234 - Reformats old description on save to create proper line feeds.
// 2010/08/11 - JJYCHAN - ISSUE 241 - Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
// 2010/09/23 - EWONG - ISSUE: 324 - Changed the wr_audit so that all data is audited correctly.

//**
// * Controller
// */
var legendGridController = View.createController('legendGrid', {
	afterViewLoad: function(){
       //this.ucManageParts_bottomPanel.sortEnabled = false;
	   //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

//	**
//	* Color code the Work requests based on whether or not the orders have been partially filled
//  **
	ucManageParts_topPanel_afterRefresh: function() {
		//check each row of WR to see if there are fulfilled parts
		this.ucManageParts_topPanel.gridRows.each(function(row) {
			var record = row.getRecord();
			var wrId = row.getRecord().getValue('wr.wr_id');

			// set the restriction
			//var rest = "wr_id="+wrId+" AND fulfilled IN (0,2,3)";

			//var record = UC.Data.getDataRecord('wr_other', ['wr_id', 'fullfilled'], rest);
			//var record = View.dataSources.get('wr_other_query_ds').getRecord(rest);
			//if (record != null) {
			//if (!record.isNew) {
		var changeColor = false;
		var fulfilled = record.getValue('wr.fulfilled');
		var fromTable = record.getValue('wr.from_table');

		// Check if it's quotes requested or on order
		if (fulfilled != "") {
			if (fulfilled == 0) {
				changeColor= true;
				color = '#cf7d7d'; //red
				weight='bold';
			}
			else if (fulfilled == 2) {
				changeColor = true;
				color = '#cfcc7d';	//yellow
				weight='normal';
			}
			//if parts are on order,
			else if (fulfilled == 3){
				changeColor = true;
				color = '#7d9ecf';	//blue
				weight='normal';
			}
		}
		else {
			changeColor = true;
			color = '#7dcf87'; //green
			weight='normal';
		}


		// if date_used is greater than 30 days, also bold the text.
		var date_part = record.getValue('wr.date_part');
		if (date_part) {
			var date_requested = record.getValue('wr.date_part').getTime();
			var today = new Date();
			var dayMilliseconds = 86400000;
			if ((today.getTime() - date_requested) / dayMilliseconds > 20) {
				weight='bold';
			}
		}

		//var color= '#B0DD99'; 		//green
		//var cell1 = row.cells.get('wr_id');
		//Ext.get(cell1.dom).setStyle('background-color', color);

		if (changeColor) {
			var cell1 = row.cells.get('wr.wr_id');
			var cell2 = row.cells.get('bl.zone_id');
			var cell3 = row.cells.get('wr.bl_id');

			// set cell weight/color
			Ext.get(cell1.dom).setStyle('font-weight', weight);
			Ext.get(cell2.dom).setStyle('font-weight', weight);
			Ext.get(cell3.dom).setStyle('font-weight', weight);

			Ext.get(cell1.dom).setStyle('background-color', color);
			Ext.get(cell2.dom).setStyle('background-color', color);
			Ext.get(cell3.dom).setStyle('background-color', color);
		}
			//}
		});
	},

//    /**
//     * Called after the request grid is refreshed to display color codes in grid cells.
//     */
    ucManageParts_bottomPanel_afterRefresh: function() {
        // for all grid rows (Ab.grid.Row objects)

        this.ucManageParts_bottomPanel.gridRows.each(function(row) {

            // get wr.status for this row
            var partType = row.getRecord().getValue('wrpt.part_id');

            // map status to color
            var color = '#f5f5f5';
			var weight = 'normal';
			var isLoad = "." + partType.match("LOAD");

			//if it's a loaded part, color gray
			if (isLoad == ".LOAD") {
				color = '#E0E0E0';
				weight='normal';
			}
			//if it's a part that has been fulfilled, color green
			else if (row.getRecord().getValue('wrpt.fulfilled') == '1') {
				color = '#7dcf87'; //green
				weight='normal';
			}
			//if it's a part that is on hold for quote, color orange
			else if (row.getRecord().getValue('wrpt.fulfilled') == '2') {
				color = '#cfcc7d';	//yellow
				weight='normal';
			}
			//if parts are on order,
			else if (row.getRecord().getValue('wrpt.fulfilled') == '3') {
				color = '#7d9ecf';	//blue
				weight='normal';
			}

			//otherwise, bold and color red
			else {
				color = '#cf7d7d';
				weight='bold';
			}



			var cell1 = row.cells.get('part_id');
			var cell2 = row.cells.get('date_assigned');
            var cell3 = row.cells.get('qty_estimated');
			var cell4 = row.cells.get('comments');

            // set cell weight/color
			Ext.get(cell1.dom).setStyle('font-weight', weight);
			Ext.get(cell2.dom).setStyle('font-weight', weight);
			Ext.get(cell3.dom).setStyle('font-weight', weight);
			Ext.get(cell4.dom).setStyle('font-weight', weight);

			Ext.get(cell1.dom).setStyle('background-color', color);
			Ext.get(cell2.dom).setStyle('background-color', color);
			Ext.get(cell3.dom).setStyle('background-color', color);
			Ext.get(cell4.dom).setStyle('background-color', color);
        });
    },


	ucManageParts_partDetailsPanel_beforeSave: function() {
        var newNotes = this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.description.new');
        if (newNotes != "") {
            var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
            var currentDate = new Date();
            var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
                + "/" + currentDate.getDate();


            //Parse the hours to get the correct time.
            var curr_hour = currentDate.getHours();
            var am_pm = "";
            if (curr_hour < 12) {
                am_pm = "AM";
            }
            else {
                am_pm = "PM";
            }
            if (curr_hour == 0) {
                curr_hour = 12;
            }
            if (curr_hour > 12) {
                curr_hour = curr_hour - 12;
            }

            // add leading 0 to minutes if needed.
            var curr_min = currentDate.getMinutes();
            curr_min = curr_min + "";
            if (curr_min.length == 1) {
                curr_min = "0" + curr_min;
            }



            var timeString = curr_hour + ":" + curr_min + " " + am_pm;

            var cfNotes = this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.description');

            // For Firefox: (replace lone \n chars with \r\n)
            newNotes = replaceLF(newNotes);

            //cfNotes = currentUser + " - " + dateString + " : " + newNotes + "\n\n" + cfNotes;
            cfNotes = cfNotes.replace(/\n\n/g, "\r\n") + "\r\n\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

            this.ucManageParts_partDetailsPanel.setFieldValue('wr_other.description', cfNotes);
            this.ucManageParts_partDetailsPanel.setFieldValue('wr_other.description.new', "");
        }

        // If status changed update date_status_changed
        if (this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.fulfilled')
            != this.ucManageParts_partDetailsPanel.getOldFieldValues()['wr_other.fulfilled']) {
            var today = new Date();
            this.ucManageParts_partDetailsPanel.setFieldValue("wr_other.date_status_changed",
				this.wrdetails_ds.formatValue("wr_other.date_status_changed", today, true));
        }
	},

	ucManageParts_partsPTDetailsPanel_beforeSave: function() {
		var newNotes = this.ucManageParts_partsPTDetailsPanel.getFieldValue('wrpt.comments.new');
			if (newNotes != "") {
				var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
				var currentDate = new Date();
				var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
					+ "/" + currentDate.getDate();


				//Parse the hours to get the correct time.
				var curr_hour = currentDate.getHours();
				var am_pm = "";
				if (curr_hour < 12) {
					am_pm = "AM";
				}
				else {
					am_pm = "PM";
				}
				if (curr_hour == 0) {
					curr_hour = 12;
				}
				if (curr_hour > 12) {
					curr_hour = curr_hour - 12;
				}

				// add leading 0 to minutes if needed.
				var curr_min = currentDate.getMinutes();
				curr_min = curr_min + "";
				if (curr_min.length == 1) {
					curr_min = "0" + curr_min;
				}



				var timeString = curr_hour + ":" + curr_min + " " + am_pm;

				var cfNotes = this.ucManageParts_partsPTDetailsPanel.getFieldValue('wrpt.comments');

				// For Firefox: (replace lone \n chars with \r\n)
				newNotes = replaceLF(newNotes);

				//cfNotes = currentUser + " - " + dateString + " : " + newNotes + "\n\n" + cfNotes;
				cfNotes = cfNotes.replace(/\n\n/g, "\r\n") + "\r\n\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

				this.ucManageParts_partsPTDetailsPanel.setFieldValue('wrpt.comments', cfNotes);
				this.ucManageParts_partsPTDetailsPanel.setFieldValue('wrpt.comments.new', "");
			}
	}
});


// *****************************************************************************
// Send the Work Request back (all parts have been ordered)
// ******************************************************************************

function sendWR()	{
	var grid = View.getControl('', 'wrcfGrid');
	var rows = grid.getPrimaryKeysForSelectedRows();

	var dataRows = grid.getSelectedRows();

	var sendTo="";
	var smsTo="";

	//get the emails of all selected rows
	for (i = 0; i < dataRows.length; i++) {
		var dataRow = dataRows[i];
		var dataRowCopy = new Object();
		dataRowCopy['wrcf.wr_id'] = dataRow['wrcf.wr_id'];
		dataRowCopy['wrcf.cf_id'] = dataRow['wrcf.cf_id'];
		dataRowCopy['cf.email'] = dataRow['cf.email'];
		dataRowCopy['cf.sms_address'] = dataRow['cf.sms_address'];
		sendTo=sendTo + dataRowCopy['cf.email'] + ";";
		smsTo=smsTo + dataRowCopy['cf.sms_address'] + ";";
	}


	var form = View.getControl('', 'wrForm');
	var wr_id = form.getFieldValue('wr.wr_id');


	//gather the part data
	var partsRecords = UC.Data.getDataRecords("wr_other", ["other_rs_type", "description", "fulfilled"],
		"wr_id = "+wr_id+" AND (other_rs_type LIKE 'PARTS-%' OR other_rs_type IN('MISC'))");
	var recLength = partsRecords.length;



	//********************************************************************************
	//send the sms
	//kept separate from the sms because it causes error when the two processes
	//are close together
	//********************************************************************************
	// create the sms message
	var smsMessage = "Parts in for WR["+wr_id+"].";

	//list all of the parts on order
	for (i = 0; i < recLength; i++) {
		smsMessage += "[" + partsRecords[i]["wr_other.description"].substring(0,19) + "]";
	}
	// truncate to max of 155 chars
	smsMessage = smsMessage.substring(0,154);

	//send the sms
	smsBody=".";
	// sms
	uc_email(smsTo, 'afm@ucalgary.ca', smsMessage, smsBody, 'sms.template');



	//******************************************************************************
	//Save to uc_wr_audit Table
	//******************************************************************************

	var parameters = {
			'user_name': View.user.name,
			'wr_id': form.getFieldValue('wr.wr_id'),
			'newValues': toJSON( {'wr.status': "PC",
								  'wr.tr_id': form.record.getValue('wr.tr_id')})
	};

	var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
	if (result.code != 'executed') {
			Workflow.handleError(result);
	}


	//******************************************************************************
	// Set the status to Parts Complete
	//******************************************************************************


	form.setFieldValue('wr.status', 'Parts Completed', 'PC');
	form.save();



	//******************************************************************************
	//Save to Audit_log Table
	//******************************************************************************
	var auditDescription;

	//insert wr number.
	auditDescription = "wr.wr_id:" + form.getFieldValue('wr.wr_id') + "\n";

	var oldStatus = "HP";
	var newStatus = "PC";

	auditDescription = auditDescription + "wr.status:" + oldStatus + "/" + newStatus + "\n";

	alert("Work Request has been sent");

	//build the audit record
	var afmAuditRecord= new Ab.data.Record();
	var username = View.user.name;
	afmAuditRecord.isNew = true;
	afmAuditRecord.setValue('audit_log.modified_by_username', username);
	afmAuditRecord.setValue('audit_log.table_name', 'WR');
	afmAuditRecord.setValue('audit_log.description', auditDescription);

	View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);





	//********************************************************************************
	//send the email
	//kept separate from the sms because it causes error when the two processes
	//are close together
	//********************************************************************************

	var subject="Parts are in for WR#" + wr_id;
	var emailBody="WR# " + wr_id + "<br><br>" + "<b>Parts in WR:</b><br><hr><br>";

	for (i = 0; i < recLength; i++) {
		emailBody = emailBody + "<b>[" + partsRecords[i]["wr_other.other_rs_type"] + "]</b> - " +
		partsRecords[i]["wr_other.description"]+"<br><hr><br>";
	}
	// Email
	uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');



	View.closeDialog();
}


// *****************************************************************************
// Replaces lone LF (\n) with CR+LF (\r\n)
// *****************************************************************************
function replaceLF(value)
{
	String.prototype.reverse = function () {
		return this.split('').reverse().join('');
	};

	return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
}


function showPartsDetailsPanel(cmd) {
	var restriction = cmd.restriction;

	// if time_assigned is undefined, then it's a wr_other record
	if (restriction["wrpt.time_assigned"] == undefined) {
		var newRest = new Object();
		newRest["wr_other.wr_id"] = restriction["wrpt.wr_id"];
		newRest["wr_other.other_rs_type"] = restriction["wrpt.part_id"];
		newRest["wr_other.date_used"] = restriction["wrpt.date_assigned"];

		newRest;

		View.panels.get("ucManageParts_partsPTDetailsPanel").show(false);
		View.panels.get("ucManageParts_partDetailsPanel").refresh(newRest);
		View.panels.get("ucManageParts_partDetailsPanel").show(true);
	}
	else {
		View.panels.get("ucManageParts_partDetailsPanel").show(false);
		View.panels.get("ucManageParts_partsPTDetailsPanel").refresh(restriction);
		View.panels.get("ucManageParts_partsPTDetailsPanel").show(true);
	}

}

function partsDetailsAfterSave() {
    var panel = View.panels.get("ucManageParts_bottomPanel");
    if (panel) {
        panel.refresh();
    }


    panel = View.panels.get("ucManageParts_topPanel");
    if (panel) {
        panel.refresh();
    }
}