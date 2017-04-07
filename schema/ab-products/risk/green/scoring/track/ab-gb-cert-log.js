/**
 * @author vike
 */

/**
 * overwrite onExpandClick function and onCollapseClick function for 
 * kb# 3030792-Text of "Show filter" button should also change accordly
 * if user expands the filter by click the down arrow
 */
Ext.layout.BorderLayout.Region.prototype.onExpandClick=function(e){
	if(this.isSlid){
		this.afterSlideIn();
		this.panel.expand(false);
	}else{
		this.panel.expand();
	}

	var action=abGbCertLogController.abGbCertLogGrid.actions.get('showFilter');
	action['config']['text']=getMessage("hidefilter");
	action.setTitle(getMessage("hidefilter"));
}

Ext.layout.BorderLayout.Region.prototype.onCollapseClick=function(e){
	this.panel.collapse();
	var action=abGbCertLogController.abGbCertLogGrid.actions.get('showFilter');
	action['config']['text']=getMessage("showfilter");
	action.setTitle(getMessage("showfilter"));
}


var abGbCertLogController = View.createController('abGbCertLogController',
		{
			
	// ----------------------- properties -----------------------------
			bl_id : '',
			project_name : '',
			cert_std : '',
			fieldsArraysForRestriction : new Array( [ 'gb_cert_log.subject' ],
					[ 'gb_cert_log.submitted_by' ]),

					
			
			afterInitialDataFetch : function() {
				var layout = View.getLayoutManager('nested_center');
				layout.collapseRegion('north');
			},		
			
			/**
			 * This event handler is called by Filter Options button in Activity log grid.
			 */
			abGbCertLogGrid_onShowFilter : function() {
	
				// If above console is hidden then show it;
				// Else hide the console 
				var layout = View.getLayoutManager('nested_center');
				var action=this.abGbCertLogGrid.actions.get('showFilter');
				var title=action['config']['text'];
				if (layout.isRegionCollapsed('north')) {
					if(getMessage("showfilter")==title){
						var res = "1=1 " + this.getForeign();
						this.abGbCertLogGrid.addParameter('res', res)
						this.abGbCertLogGrid.refresh();
						action.setTitle(getMessage("hidefilter"));
						action['config']['text']=getMessage("hidefilter");
						layout.expandRegion('north');
					}
					else{
						action.setTitle(getMessage("showfilter"));
						action['config']['text']=getMessage("showfilter");
						layout.collapseRegion('north');
					}
				} else {
					if(getMessage("hidefilter")==title){
						action.setTitle(getMessage("showfilter"));
						action['config']['text']=getMessage("showfilter");
						layout.collapseRegion('north');
					}
					else{
						action.setTitle(getMessage("hidefilter"));
						action['config']['text']=getMessage("hidefilter");
						layout.expandRegion('north');
					}
				}
			},
		

			//Process delete action
			abGbCertLogForm_onDelete : function() {
				
				//If new record, do nothing
				if (this.abGbCertLogForm.newRecord) {
					return;
				}
				
				//Else retrieve pk value and pop confirm window 
				var logDS = this.abGbCertLogGridDs;
				var record = this.abGbCertLogForm.getRecord();
				var confirmMessage = getMessage("messageConfirmDelete");
				View.confirm(confirmMessage, function(button) {
					if (button == 'yes') {
						try {
							
							//confirm to delete: delete record and refresh panels
							logDS.deleteRecord(record);
							abGbCertLogController.abGbCertLogForm.show(false);
							abGbCertLogController.abGbCertLogGrid.refresh();
						} catch (e) {
							var errMessage = getMessage("errorDelete");
							View.showMessage('error', errMessage, e.message,
									e.data);
							return;
						}
					}
				})
			},

			/**
			 * This event handler is called by Add New button in Activity log grid.
			 */
			abGbCertLogGrid_onAddNew : function() {
				
				// create and show a new record in activity log form
				var logForm = this.abGbCertLogForm;
				logForm.show(true);
				logForm.newRecord = true;
				logForm.refresh();
				
				// prefilled values to proper fields of edit form 
				logForm.setFieldValue("gb_cert_log.bl_id",
						abGbCertLogController.bl_id);
				logForm.setFieldValue("gb_cert_log.project_name",
						abGbCertLogController.project_name);
				logForm.setFieldValue("gb_cert_log.cert_std",
						abGbCertLogController.cert_std);
				logForm.setFieldValue("gb_cert_log.submitted_by",
						View.user.name);
			},
			abGbCertLogForm_onSave : function() {
				this.abGbCertLogForm.save();
				
				//call getForeign function get restrictions
				var res = '1=1' + this.getForeign();
				
				//show and refresh Project Activity Logs Grid according to restrictions
				this.abGbCertLogGrid.addParameter('res', res);
				this.abGbCertLogGrid.refresh();
			},
			
			/**
			 * This event handler is called by show button in Activity log grid.
			 */
			abGbCertLogConsole_onShow : function() {
				//compare date
				var consoel = this.abGbCertLogConsole;
				var fromDate = consoel.getFieldElement('gb_cert_log.log_date.from').value;
				var toDate = consoel.getFieldElement('gb_cert_log.log_date.to').value;
				if(fromDate && toDate && !compareLocalizedDates(fromDate,toDate)){
					View.showMessage(getMessage("messageDateCompare"));
				}else{
				var restriction = this.getConsoleRestriction();
				this.abGbCertLogGrid.addParameter('res', restriction)
				this.abGbCertLogGrid.refresh();
				}
			},
			
			/**
			 * This event handler is called by clear button in Activity log grid.
			 */
			abGbCertLogConsole_onClear : function() {
				this.abGbCertLogConsole.clear();
			},
			
			/**
			 * store current selected row and retrieve field values from select row and use them as restrictions
			 */
			getForeign : function() {
				var grid = this.abGbCertLogProjGrid;
				var res='';
				var num = grid.selectedRowIndex;
				if(num!=-1){
					var rows = grid.rows;
					var log = rows[num];
					
					var bl_id = log['gb_cert_proj.bl_id'];
					var proj = log['gb_cert_proj.project_name'];
					var cert_std = log['gb_cert_proj.cert_std'];
					this.bl_id = bl_id;
					this.project_name = proj;
					this.cert_std = cert_std;
					res = "  and gb_cert_log.bl_id='" + bl_id
							+ "'  and gb_cert_log.project_name='" + proj
							+ "'  and gb_cert_log.cert_std='" + cert_std + "'";
				}
				return res;
			},
			
			/**
			 * get introduced values from console and construct a restriction
			 */
			getConsoleRestriction : function() {
				var res = this.getForeign();
				var console = View.panels.get('abGbCertLogConsole');
				var restriction = getRestrictionStrFromConsole(console,
						this.fieldsArraysForRestriction);
				restriction = restriction
						+ getRestrictionStrOfDateRange(console,
								"gb_cert_log.log_date") + res;
				return restriction;
			}

		})

/**
 * This event handler is called when user click any row in Rating project grid
 */
function onSelectRatingProject() {
	//call getForeign function get restrictions
	var res = '1=1' + abGbCertLogController.getForeign();
	//show and refresh Project Activity Logs Grid according to restrictions
	abGbCertLogController.abGbCertLogGrid.addParameter('res', res);
	abGbCertLogController.abGbCertLogGrid.refresh();
	//hide abGbCertLogForm Panel
	abGbCertLogController.abGbCertLogForm.show(false);

}

/**
 * Get restriction from fieldsArrays
 * * @param {Object} console id
 * @param {Object} fieldsArrays
 */
function getRestrictionStrFromConsole(console, fieldsArraysForRestriction) {
	var otherRes = ' 1=1 ';
	for ( var i = 0; i < fieldsArraysForRestriction.length; i++) {
		var field = fieldsArraysForRestriction[i];
		var consoleFieldValue = console.getFieldValue(field[0]);
		if (consoleFieldValue) {
			if (!isMultiSelect(consoleFieldValue)) {
				if (field[1] && field[1] == 'like') {
					if (field[2]) {
						otherRes = otherRes + " AND " + field[2] + " like '%"
								+ consoleFieldValue + "%' ";
					} else {
						otherRes = otherRes + " AND " + field[0] + " like '%"
								+ consoleFieldValue + "%' ";
					}
				} else {
					if (field[2]) {
						otherRes = otherRes + " AND " + field[2] + "='"
								+ consoleFieldValue + "' ";
					} else {
						otherRes = otherRes + " AND " + field[0] + "='"
								+ consoleFieldValue + "' ";
					}
				}
			} else {
				otherRes = otherRes
						+ " AND "
						+ getMultiSelectFieldRestriction(field,
								consoleFieldValue);
			}
		}
	}
	return otherRes;
}

/**
 * Get restriction from date field
 * * @param {Object} console id
 * @param {Object} fieldName
 */
function getRestrictionStrOfDateRange(consolePanel, fieldName) {
	var restrictionStr = "";
	var dateStart = consolePanel.getFieldValue(fieldName + ".from");
	var dateEnd = consolePanel.getFieldValue(fieldName + ".to");
	if (dateStart) {
		restrictionStr += " AND " + fieldName + " >= ${sql.date('" + dateStart
				+ "')} ";
	}
	if (dateEnd) {
		restrictionStr += " AND " + fieldName + " <= ${sql.date('" + dateEnd
				+ "')} ";
	}
	return restrictionStr;
}

function isMultiSelect(consoleFieldValue) {
	return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}

