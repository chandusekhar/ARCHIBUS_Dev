// Created by JASON CHAN 2010/10/28
// TO BE DONE:
// Proper workflow needs to be run for issuing the request



var projectRequestEditPage1Controller = View.createController('projectRequestEditPage1', {

	afterViewLoad: function() {
		this.inherit();
	},


	wr_report_beforeSave: function() {
		var continueSave = true;
		
		var wrId = this.wr_report.getFieldValue('wr.wr_id');
		
		
		//********************
		// copy the new notes to the cf_notes field with a user & timestamp
		//********************
		var newNotes = this.wr_report.getFieldValue('wr.cf_notes.new');
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
			//var cfNotes = this.wr_report.record.getValue('wr.cf_notes');
			// query database for the newest cf_notes.
			cfNotes = UC.Data.getDataValue('wr', 'cf_notes', "wr_id="+wrId);
			// For Firefox: (replace lone \n chars with \r\n)
			newNotes = replaceLF(newNotes);
			cfNotes = cfNotes + "\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;
			//this.wr_report.record.setValue('wr.cf_notes', cfNotes);
			this.wr_report.setFieldValue('wr.cf_notes', cfNotes);
			this.wr_report.setFieldValue('wr.cf_notes.new', "");
			// For IE: doesn't refresh the cf_notes div.
			$('Showwr_report_wr.cf_notes').innerHTML = cfNotes.replace(/\r\n/g,"<br/>");
		}

		if (!continueSave) {
			return continueSave;
		}
		//********************
		//Save to Audit Table
		//********************
		var auditDescription;

		//insert wr number.
		auditDescription = "wr.wr_id:" + this.wr_report.getFieldValue('wr.wr_id') + "\n";
		
		//audit all of the other fields
		
		auditDescription = buildAuditString(auditDescription, "wr_report", "wr.cf_notes");

		//build the audit record
		var afmAuditRecord= new Ab.data.Record();
		var username = View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);
		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);

		return continueSave;
	},


	rejectRequest: function() {
		//View.showMessage(getMessage('confirmSendApproval'));
		View.confirm(getMessage('rejectConfirm'), function(button) {
			if (button=='yes') {
				var form = View.panels.get('wr_report');
				var status = form.getFieldValue('wr.status');
				var wr_id = form.getFieldValue('wr.wr_id');
				
				var toStatus = null;
				if (status == 'AA') {
					toStatus = 'Can';
				}
				else {
					toStatus = 'S';
				}
				
				try {
					//Save to uc_wr_audit Table
					var parameters = {
							'user_name': View.user.name,
							'wr_id': form.getFieldValue('wr.wr_id'),
							'newValues': toJSON( {'wr.status': toStatus,
												'wr.tr_id': form.record.getValue('wr.tr_id')})
					};
					
					Workflow.call('AbCommonResources-uc_auditWrSave', parameters);
					
					if (status == 'AA') {
						var parameters = {
							'wr_id': wr_id
						};

						Workflow.call('AbBldgOpsOnDemandWork-cancelWorkRequest', parameters);
						toStatus = 'Can'
					}
					else {
						var ds = View.dataSources.get(form.dataSourceId);
						var record = form.getRecord();
						var recordValues = ds.processOutboundRecord(record).values;
						delete recordValues['wr.cf_notes.new'];
						
						var parameters = {
							tableName:'wr',
							fieldName:'wr_id',
							'wr.wr_id':wr_id,
							fields: toJSON(recordValues),
							status: 'S'
						};
					
						Workflow.call('AbBldgOpsOnDemandWork-updateWorkRequestStatus', parameters);
						toStatus = 'S';
					}
					
					
					
					View.showMessage(getMessage('rejectCompleted'));
				}
				catch (e) {
					Workflow.handleError(e);
				}
			}
		
		});
	},
	
	wrSendForApproval: function() {
		var controller = this;
		
		//confirmation popup
		View.confirm(getMessage('approvalConfirm'), function(button) {
			if (button=='yes') {
				var form = View.getControl('', 'wr_report');
				var wr_id = form.getFieldValue('wr.wr_id');
				var oldStatus = form.getFieldValue('wr.status');

				//Save to Audit_log Table
				controller.buildWRStatusAuditLog(form.getFieldValue('wr.wr_id'), oldStatus, "CPA");	
	
				//Save to uc_wr_audit Table
				var parameters = {
					'user_name': View.user.name,
					'wr_id': form.getFieldValue('wr.wr_id'),
					'newValues': toJSON( {'wr.status': "CPA",
										'wr.tr_id': form.record.getValue('wr.tr_id')})
				};	
				var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
				if (result.code != 'executed') {
					Workflow.handleError(result);
				}

				//change the status
				form.setFieldValue('wr.status', 'CPA');
				form.save();
				
				//   -----------------------------------------------CLOSE POPUP AND REFRESH ALL PANELS
				
				View.showMessage(getMessage('approvalCompleted'));	
			}
		
		});
	},
	
	refreshStartWrBtn: function() {
		var wrStatus = this.wr_report.getFieldValue('wr.status');
		var enableBtn = false;

		switch (wrStatus) {

		case 'I':
			enableBtn = true;
			break;
		case 'HP':
			enableBtn = true;
			break;
		case 'HA':
			enableBtn = true;
			break;
		case 'HL':
			enableBtn = true;
			break;
		case 'PC':
			enableBtn = true;
			break;
		default:
			enableBtn = false;
		}

		this.wr_report.actions.get('startWr').enableButton(enableBtn);
		//return enableBtn;
	},
	
	// *****************************************************************************
	// 'START WORK' BUTTON
	// *****************************************************************************
	wrStartWork: function() {
		var form = View.getControl('', 'wr_report');
		var wr_id = form.getFieldValue('wr.wr_id');
		var status = form.getFieldValue('wr.status');
		//change the status
		//form.setFieldValue('wr.status', 'Issued and In Process', 'I');
		//form.save();
		
		// -------------------------------------------------------------------------------------------WORKFLOWS NEED TO BE RUN FOR ISSUING THE WR
		try {
			//Save to uc_wr_audit Table
			var parameters = {
					'user_name': View.user.name,
					'wr_id': form.getFieldValue('wr.wr_id'),
					'newValues': toJSON( {'wr.status': "I",
										'wr.tr_id': form.record.getValue('wr.tr_id')})
			};
			
			Workflow.call('AbCommonResources-uc_auditWrSave', parameters);
				
			if (status == 'AA') {
				parameters = {
					'wr.wr_id':wr_id
				};
			
				Workflow.call('AbBldgOpsOnDemandWork-issueWorkRequest', parameters);
			}
			else {
				var ds = View.dataSources.get(this.wr_report.dataSourceId);
				var record = this.wr_report.getRecord();
				var recordValues = ds.processOutboundRecord(record).values;

				var parameters = {
					tableName:'wr',
					fieldName:'wr_id',
					'wr.wr_id':wr_id,
					fields: toJSON(recordValues),
					status: 'I'
				};
			
				Workflow.call('AbBldgOpsOnDemandWork-updateWorkRequestStatus', parameters);
			}
			
			//Save to Audit_log Table
			this.buildWRStatusAuditLog(form.getFieldValue('wr.wr_id'), "AA", "I");
			
			this.wr_report.refresh();
		}
		catch (e) {
			Workflow.handleError(e);
		}


	},
	
	
	wrSendPolyline: function() {
		var controller = this;
		
		//confirmation popup
		View.confirm(getMessage('polylineConfirm'), function(button) {
			if (button=='yes') {
			
				var form = View.getControl('', 'wr_report');
				var wr_id = form.getFieldValue('wr.wr_id');

				//   -----------------------------------------------WORKFLOWS NEED TO BE RUN FOR ISSUING THE WR
		
				//change the status
				form.setFieldValue('wr.status', 'FMIT Polyline', 'POL');
				form.save();

				//Save to Audit_log Table
				controller.buildWRStatusAuditLog(form.getFieldValue('wr.wr_id'), "I", "POL");	
				
				//Save to uc_wr_audit Table
				var parameters = {
					'user_name': View.user.name,
					'wr_id': form.getFieldValue('wr.wr_id'),
					'newValues': toJSON( {'wr.status': "POL",
										'wr.tr_id': form.record.getValue('wr.tr_id')})
				};	
				var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
				if (result.code != 'executed') {
					Workflow.handleError(result);
				}
				
				//   -----------------------------------------------CLOSE POPUP AND REFRESH ALL PANELS
				controller.wrPendingGrid.refresh();
				controller.wrAssignedGrid.refresh();
				controller.wrRequestedGrid.refresh();
				View.getOpenerView().closeDialog();
				
				View.showMessage(getMessage('polylineCompleted'));	
			}
		
		});
	},
	
	
	
	buildWRStatusAuditLog: function(wr_id, oldStatus, newStatus) {
		var auditDescription;
		auditDescription = "wr.wr_id:" + wr_id + "\n";
		auditDescription = auditDescription + "wr.status:" + oldStatus + "/" + newStatus + "\n";
		
		var afmAuditRecord = new Ab.data.Record();
		var username=View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);
		
		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);

		// save to uc_wr_audit Table

//		var form = View.getControl('', 'wr_report');
//		var parameters = {
//			'user_name': username,
//			'wr_id': wr_id,
//			'newValues': toJSON( {'wr.status': "I",
//									'wr.tr_id': form.record.getValue('wr.tr_id')})
//		};
		
//		var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
//		if (result.code != 'executed') {
//				Workflow.handleError(result);
//		}
//		alert("Done");
	
	}
	
	

});



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


function buildAuditString(auditString, formName, fieldName) {

	var form = View.getControl('', formName);
	var newVal = form.getFieldValue(fieldName);
	var oldVal = form.getOldFieldValues()[fieldName];
	var newstring = auditString;


	if (oldVal != newVal) {
			newstring = newstring + fieldName + "\nOld\n[" + oldVal + "]\nNew\n[" + newVal + "]\n\n";
	}

	return newstring;
}

function test() {
	alert("Hello");
}


