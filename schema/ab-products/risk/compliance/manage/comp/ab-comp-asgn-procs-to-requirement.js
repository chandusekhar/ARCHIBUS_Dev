/**
* Added for 22.1 Compliance Bldgops Integration
 * @author Zhang Yi
 */
var abCompAssignProceduresCtrl = View.createController('abCompAssignProceduresCtrl', {
	//selected compliance requirement that is currently edited in the 'Define Compliance Requirement' form. 
	currentRegulation:"",
	currentProgram:"",
	currentRequirement:"",

	/**
	* Initialize the local variables by values passed from opener view.
	*/
	afterViewLoad: function(){
		var openerView = View.getOpenerView();
		if ( openerView.currentRegulation && openerView.currentProgram && openerView.currentRequirement ) {
			this.currentRegulation = 	openerView.currentRegulation;
			this.currentProgram	= openerView.currentProgram;
			this.currentRequirement = openerView.currentRequirement; 
		}
	},
	
	/**
	* Set SQL parameter values of given panel; meanwhile determine if need to show and refresh the panel by given sign.
	*/
    refreshPanelByRestriction: function(panel, isShow){
		panel.addParameter('regulation',this.currentRegulation);
		panel.addParameter('reg_program',this.currentProgram);
		panel.addParameter('reg_requirement',this.currentRequirement);
		if ( isShow ){
			panel.refresh();
			panel.show(true);
		}
    },

	/**
	* Initialize the SQL parameters of all panels as well as show and refresh grid panels.
	*/
	afterInitialDataFetch: function(){
		var pmpRecords = 	this.pmpDS.getRecords();
		if (!pmpRecords || pmpRecords.length==0 )	{
    		View.alert(getMessage('noPmp'));
		} 

		this.refreshPanelByRestriction(this.pmp_list, true);
		this.refreshPanelByRestriction(this.regreq_pmp_list,true);
		this.refreshPanelByRestriction(this.regreq_pmp_form,false);

		this.pms_list.beforeUnload = function(){
			var opener = View.getOpenerView();
			if ( valueExists(opener.dialogConfig) ) {
				var callbackMethod = opener.dialogConfig.callback;
				if ( valueExists(callbackMethod) && typeof(callbackMethod) == "function" ){
					callbackMethod.call(this, abCompAssignProceduresCtrl.getAssignedProcedures());
				}
			} 
		}
    },

	/**
	* Assign the selected procedures to current compliance requirement by calling the WFR.
	*/
    pmp_list_onAssignSelected: function(){
		//get selected available procedures
        var pmpIds = this.pmp_list.getPrimaryKeysForSelectedRows();
		var requirement = {'reg': this.currentRegulation, 'prog':this.currentProgram, 'req':this.currentRequirement};

		if ( pmpIds &&  pmpIds.length ) {
			try {
				Workflow.callMethod('AbRiskCompliance-ComplianceCommon-assignProceduresToRequirement',requirement, pmpIds);
				this.pmp_list.refresh();
				this.regreq_pmp_list.refresh();
			} 
			catch (e) {
				 Workflow.handleError(e);
			}
		}
		else {
			View.alert(getMessage('selectNoPmp'));
		}
	},

    pmp_list_onClearAll: function(){
		this.pmp_list.unselectAll();
	},

	/**
	* Unassign the selected procedures to current compliance requirement by deleting coresponding records of  'regreq_pmp'.
	*/
    regreq_pmp_list_onUnassignSelected: function(){
        var rows = this.regreq_pmp_list.getSelectedRows();
		if ( rows && rows.length>0 ) {
			for (var i = 0; i < rows.length; i++) {
				var pmpId = rows[i]["regreq_pmp.pmp_id"];
				var reg = rows[i]["regreq_pmp.regulation.key"];
				var prog = rows[i]["regreq_pmp.reg_program.key"];
				var req = rows[i]["regreq_pmp.reg_requirement.key"];

				var record = new Ab.data.Record({
					'regreq_pmp.pmp_id': pmpId,
					'regreq_pmp.regulation': reg,
					'regreq_pmp.reg_program': prog,
					'regreq_pmp.reg_requirement': req
				}, true);

				try {
					var dsDelete = View.dataSources.get("ds_ab-comp-asgn-procs-to-requirement_regreq_pmp");
					dsDelete.deleteRecord(record);
				} 
				catch (e) {
					var message = getMessage('errorDelete');
					View.showMessage('error', message, e.message, e.data);
					return;
				}
			}
			this.pmp_list.refresh();
			this.regreq_pmp_list.refresh();
		}
		else {
			View.alert(getMessage('selectNoPmp'));
		}
	},

	regreq_pmp_list_onClearAll: function(){
		this.regreq_pmp_list.unselectAll();
	} ,

	/**
	* Show the PM Schedules of current compliance requirement in grid .
	*/
	regreq_pmp_form_onShowSchedules: function(){
		this.refreshPanelByRestriction(this.pms_list);
		this.pms_list.addParameter("procedure", this.regreq_pmp_form.getFieldValue("regreq_pmp.pmp_id"));
		this.pms_list.refresh();
		this.pms_list.showInWindow({width: 800, height: 600, closeButton: true});
	},

	/**
	* Construct list of Asssigned Procedures(concatenate procedure codes).
	*/
	getAssignedProcedures:function(){
		var ds = View.dataSources.get('ds_ab-comp-asgn-procs-to-requirement_regreq_pmp');
		ds.addParameter('regulation',this.currentRegulation);
		ds.addParameter('reg_program',this.currentProgram);
		ds.addParameter('reg_requirement',this.currentRequirement);
		var assignedProcedures	  =""; 
		var records = ds.getRecords();
		if ( records && records.length>0 ){
			for(var i=0; i<records.length; i++){
				var record = records[i];
				 assignedProcedures = assignedProcedures +record.getValue('regreq_pmp.pmp_id')+",";
			}
		}
		return assignedProcedures;
	}
});