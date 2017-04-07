var abSysRoleMobCtrl = View.createController('abSysRoleMobCtrl', {
	// selected role name
	roleName: 'ARCHIBUS ADMINISTRATOR',
	
	// checkboxes settings
	checkboxes: null,
	
	afterViewLoad: function(){
		// initialize checkboxes object
		this.checkboxes =  new Ext.util.MixedCollection();
		this.checkboxes.addAll(
			{id: "chkAbAssetPortal", securityGroups: ["ASSET-MOB"], activityIds: ["AbAssetManagement"], allActivitiesRequired: false}, 
			{id: "chkAbAssetManagement", securityGroups: ["ASSET-MOB"], activityIds: ["AbAssetAM"], allActivitiesRequired: false}, 
			{id: "chkAbEnterpriseAssetManagement", securityGroups: ["ASSET-MOB"], activityIds: ["AbAssetEAM"], allActivitiesRequired: false}, 
			{id: "chkAbRegAssetPortal", securityGroups: ["ASSET-REG-MOB"], activityIds: ["AbAssetManagement"], allActivitiesRequired: false}, 
			{id: "chkAbRegAssetManagement", securityGroups: ["ASSET-REG-MOB"], activityIds: ["AbAssetAM"], allActivitiesRequired: false}, 
			{id: "chkAbRegEnterpriseAssetManagement", securityGroups: ["ASSET-REG-MOB"], activityIds: ["AbAssetEAM"], allActivitiesRequired: false}, 
			{id: "chkAbWorkRequest", securityGroups: ["OPS-MOB"], activityIds: ["AbBldgOpsOnDemandWork"], allActivitiesRequired: false}, 
			{id: "chkAbSpaceBook", securityGroups: ["SPAC-MOB"], activityIds: ["AbSpaceRoomInventoryBAR", "AbSpacePersonnelInventory"], allActivitiesRequired: true}, 
			{id: "chkAbSpaceBookSurvey", securityGroups: ["SPAC-SURVEY"], activityIds: ["AbSpaceRoomInventoryBAR", "AbSpacePersonnelInventory"], allActivitiesRequired: true}, 
			{id: "chkAbSpaceBookPost", securityGroups: ["SPAC-SURVEY-POST"], activityIds: ["AbSpaceRoomInventoryBAR", "AbSpacePersonnelInventory"], allActivitiesRequired: true}, 
			{id: "chkAbSpaceAndOccupancy", securityGroups: ["SPAC-OCCUP-MOB"], activityIds: ["AbSpaceRoomInventoryBAR"], allActivitiesRequired: false}, 
			{id: "chkAbConditionAssessment", securityGroups: ["OPS-CA-MOB"], activityIds: [], allActivitiesRequired: false}, 
			{id: "chkAbConditionAssessmentCA", securityGroups: ["OPS-CA-MOB"], activityIds: ["AbCapitalPlanningCA"], allActivitiesRequired: false}, 
			{id: "chkAbConditionAssessmentES", securityGroups: ["OPS-CA-MOB"], activityIds: ["AbRiskES"], allActivitiesRequired: false}, 
			{id: "chkAbConditionAssessmentCO", securityGroups: ["OPS-CA-MOB"], activityIds: ["AbProjCommissioning"], allActivitiesRequired: false}, 
			{id: "chkAbRiskHazmat", securityGroups: ["RISK-HAZMAT-MOB"], activityIds: ["AbRiskMSDS"], allActivitiesRequired: false}, 
			{id: "chkAbRiskHazmatED", securityGroups: ["RISK-HAZMAT-MOB-ED"], activityIds: ["AbRiskMSDS"], allActivitiesRequired: false}, 
			{id: "chkAbRiskHazmatINV", securityGroups: ["RISK-HAZMAT-MOB-INV"], activityIds: ["AbRiskMSDS"], allActivitiesRequired: false}, 
			{id: "chkAbIncidentReporting", securityGroups: ["RISK-IR-MOB"], activityIds: ["AbRiskEHS"], allActivitiesRequired: false}, 
			{id: "chkAbWorkplacePortal", securityGroups: ["WORKSVC-MOB"], activityIds: ["AbSpacePersonnelInventory", "AbBldgOpsHelpDesk", "AbWorkplaceReservations", "AbMoveManagement"], allActivitiesRequired: false} 
		);
		
		if (valueExists(View.parameters) && valueExists(View.parameters['roleName'])) {
			this.roleName = View.parameters['roleName'];
		}
		
		// check if role name was provided
		if (!valueExistsNotEmpty(this.roleName)) {
			View.showMessage(getMessage("errNoRoleSelected"));
			return false;
		}
		
	},
	
	afterInitialDataFetch: function(){
		this.abSysRoleMobileApp_form.setTitle(getMessage('txtDialogTitle').replace('{0}', this.roleName));
		this.displayCurrentSettings();
		
	},
	
	abSysRoleMobileApp_form_onSave: function() {
		var multipleValueSeparator = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
		var mobileApps = {};

		this.checkboxes.each(function(checkbox){
			var objCheckBox = document.getElementById(checkbox.id);
			if (objCheckBox && objCheckBox.checked) {
				for(var i=0; i< checkbox.securityGroups.length; i++) {
					var securityGroup = checkbox.securityGroups[i];
					var activityIds = "";
					if (valueExistsNotEmpty(mobileApps[securityGroup])) {
						activityIds = mobileApps[securityGroup]+multipleValueSeparator;
					}
					
					for(var j=0; j < checkbox.activityIds.length; j++) {
						var activity = checkbox.activityIds[j];
						if (activityIds.indexOf(activity + multipleValueSeparator) == -1) {
							activityIds = activityIds + activity + multipleValueSeparator;
						}
					}
					
					if (activityIds.lastIndexOf(multipleValueSeparator) == activityIds.length - multipleValueSeparator.length) {
						activityIds = activityIds.substring(0, activityIds.lastIndexOf(multipleValueSeparator));
					}
					
					mobileApps[securityGroup] = activityIds;
				}
			}
		});
		
		// save to database
		try {
			var result = Workflow.callMethod("AbSystemAdministration-UserAndSecurityHandler-assignMobileApplicationsToRole", this.roleName, mobileApps, multipleValueSeparator);
			if(result.code == 'executed') {
				View.closeThisDialog();
			}
			
		}catch(e) {
			Workflow.handleError(e);
		}
	},
	
	displayCurrentSettings: function(){
		var securityGroups = null;
		var activityIds = null;
		try{
			var result = Workflow.callMethod("AbSystemAdministration-UserAndSecurityHandler-getSecurityGroupsForRole", this.roleName);
			if(result.code == 'executed'){
				securityGroups = result.dataSet.records;
			}

			var result = Workflow.callMethod("AbSystemAdministration-UserAndSecurityHandler-getActivitiesForRole", this.roleName);
			if(result.code == 'executed'){
				activityIds = result.dataSet.records;
			}
			
			this.setCheckboxes(this.checkboxes, securityGroups, activityIds);
			
		} catch (e){
			Workflow.handleError(e);
		}
		
	}, 
	
	/**
	 * Display current settings
	 */
	setCheckboxes: function(checkboxes, securityGroupRecords, activityIdRecords){
		var controller = this;
		checkboxes.each(function(checkbox){
			var objCheckBox = document.getElementById(checkbox.id);
			if (objCheckBox) {
				var isSecurityGroupSelected = controller.isCheckboxSelected("afm_groupsforroles.group_name", checkbox.securityGroups, securityGroupRecords, false); 
				var isActivitySelected = controller.isCheckboxSelected("afm_roleprocs.activity_id", checkbox.activityIds, activityIdRecords, checkbox.allActivitiesRequired); 
				objCheckBox.checked = (isSecurityGroupSelected && isActivitySelected);
			}
		});
		
	},
	
	isCheckboxSelected: function(fieldName, requiredValues, records, allOptionsRequired){
		var result = false;
		if(requiredValues.length > 0 ){
			for(var i = 0; i < requiredValues.length ; i++){
				var tmp = requiredValues[i];
				result = this.indexOfRecord(fieldName, tmp, records) != -1;
				if ((result && !allOptionsRequired) 
						|| (allOptionsRequired && !result)) {
					break;
				}
			}
		}else{
			result = true;
		}
		return result;
	},
	
	indexOfRecord: function(fieldName, fieldValue, records) {
		var result = -1;
		for(var i=0; i < records.length; i++){
			if (records[i].getValue(fieldName) == fieldValue) {
				result = i;
				break;
			}
		}
		return result;
	}
});

function resetChild(objCheckbox, childIds) {
	if (objCheckbox && !objCheckbox.checked) {
		for (var i =0; i < childIds.length; i++) {
			var objChild = document.getElementById(childIds[i]);
			if (objChild) {
				objChild.checked = false;
			}
		}
	} else if(objCheckbox.id == "chkAbConditionAssessment") {
		for (var i =0; i < childIds.length; i++) {
			var objChild = document.getElementById(childIds[i]);
			if (objChild) {
				objChild.checked = objCheckbox.checked;
			}
		}
	}
}