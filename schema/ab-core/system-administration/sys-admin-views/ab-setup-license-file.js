// ab-setup-license-file.js
//
// Steven Meyer 2009-06-09

var licenseController = View.createController("licenseController", {

	workFlowRuleID: 'AbSystemAdministration-checkinLicense',

	form: null,

	targetElement: null,

	messageElement: null,

	// copy existing cluster_num_servers values into desired cluster_num_servers input field
	// give focus to the input field
	afterInitialDataFetch: function() {
		this.form = View.panels.get('scmprefForm');
		var currentNum = this.form.getFieldValue("afm_scmpref.cluster_num_servers");

		this.targetElement = document.getElementById("scmpref_desiredNumber");
		// set the calculated field to be thesame type as the source field to accomodate validation
		this.form.fields.get("desired_cluster_num_servers").fieldDef.type = this.form.fields.get("afm_scmpref.cluster_num_servers").fieldDef.type;
		this.targetElement.value = currentNum;
		this.targetElement.focus();

		this.messageElement = document.getElementById("form_info_message");
	},

	// copy existing cluster_num_servers values into desired cluster_num_servers input field
	scmprefForm_onCancel: function() {
		this.messageElement.style.visibility = "hidden";
		document.getElementById("scmpref_desiredNumber").value = this.form.getFieldValue("afm_scmpref.cluster_num_servers");
	},

	// call WFR after validating
	scmprefForm_onSubmit: function() {
		// return if desired == current 
		var currentNum = this.form.getFieldValue("afm_scmpref.cluster_num_servers");
		var targetElemValue = this.targetElement.value;
		this.messageElement.style.visibility = "hidden";

		if (currentNum == targetElemValue || typeof targetElemValue == 'undefined' || targetElemValue == null || trim(targetElemValue) == "" ) {
			this.messageElement.innerHTML = getMessage('message_no_change');
			this.messageElement.style.color = "Blue";
			this.messageElement.style.visibility = "visible";
			this.targetElement.focus();
			return;
		}

		// validate input is small integer
		targetElemValue = removeGroupingSeparator(trim(targetElemValue));
		var objRegExp  = /^-?\d+$/;
		var isValid = true;
		if(!objRegExp.test(targetElemValue)){
			isValid = false;
		}
		if (!isValid) {
			this.messageElement.innerHTML = getMessage('warning_invalid_input');
			this.messageElement.style.color = "red";
			this.messageElement.style.visibility = "visible";
			this.targetElement.focus();
			return;
		}

		// call WFR
		var parameters = {
			viewVersion: '2.0',
			numberOfServersInCluster: currentNum,
			desiredClusterServerCount: targetElemValue,
			oracleUpdateSql:   getMessage('oracle_update_sql')
		};
		Workflow.runRule(this.workFlowRuleID, parameters);
		// update form
		this.form.refresh();
	}

});