/**
*
* Compliance Violations Form  view, used for: Manage Compliance Violations View - second tab
*
* @author Zhang Yi
*/
var abCompViolationFormController = View.createController('abCompViolationFormController',
{
	/**
	* Event Handler of action "Cancel".
	*/
	abCompViolationForm_onCancel :function(){

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}

		//Call function of top controller to select first tab
		this.topCtrl.selectFirstTab();
	},

	/**
	* Event Handler of action "Save and Add New"
	*/
	abCompViolationForm_onSaveAndAddNew : function(){

		this.abCompViolationForm_onSave();
		this.abCompViolationForm.refresh(null, true);

		//save location informations and new location id
		setLocationForm(this.abCompViolationForm2, "", true);
	},

	/**
	* Event Handler of action "Save"
	*/
	abCompViolationForm_onSave : function(){
		if(this.abCompViolationForm.canSave()){
			//check if vialation_id is existed
			var innerThis = this;
			if(this.violationIDExists()){
				// confirm if continue save or not.
				View.confirm(getMessage('existedViolationID'), function(button){
					if (button == 'yes') {
						innerThis.createNewViolation();
					}  
				});
			}  
			else {
				this.createNewViolation();
			}
		}
	},

	/**
	 * Privation Function :  create new violation record.
	 */
	createNewViolation:function(){
		//call common JS function to save location informations
		createOrUpdateLocation(this.abCompViolationForm, this.abCompViolationForm2, "regviolation");

		this.abCompViolationForm.save();

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//set changed sign in top controller
		if(this.topCtrl){
			this.topCtrl.onSaveChange();
			this.topCtrl.violation = this.abCompViolationForm.getFieldValue("regviolation.violation_num") ;
		}
	},

	/**
	 * Privation Function :  check if violation ID exists in database
	 */
	violationIDExists:function(){
		var record = this.abCompViolationForm.getOutboundRecord();	 
		var values = record.values;
		var oldValues = record.oldValues;
		var isNew = 	record.isNew;

		var violationId=this.abCompViolationForm.getFieldValue("regviolation.violation_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('regviolation.violation_id' ,violationId);
		
		var records=this.abCompViolationFormDS.getRecords(restriction);
		if(records && records.length>0){
			if(isNew)	 {
				return true;
			}
			else {
				 if( values['regviolation.violation_id'] == oldValues['regviolation.violation_id'] ){
					 return false;
				 }
				 else{ 
					 return true;
				 }
			}
		}
		return false;
	},

	/**
	 * Event Handler for 'Copy As New' action button: 
	 * 	copy current loaded record, create a new record, then fill values to  the new record and empty primary keys
	 */
	abCompViolationForm_onCopyAsNew:function(){
		var violationNum=this.abCompViolationForm.getRecord().getValue("regviolation.violation_num");
		if(!violationNum){
			View.showMessage(getMessage("nullTemplate"));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('regviolation.violation_num' ,violationNum);
		var records=this.abCompViolationFormDS.getRecords(restriction);
		var record=records[0];
		this.abCompViolationForm.newRecord = true;
		this.abCompViolationForm.setRecord(record);
		this.abCompViolationForm.setFieldValue('regviolation.violation_num','');
	},

	/**
	 * Event Handler for 'Delete' action button: 
	*/
	abCompViolationForm_onDelete: function(){

		this.abCompViolationForm.deleteRecord();
		//call deleteLocation WFR to Delete compliance_location record.
		if(this.abCompViolationForm.getFieldValue("regviolation.location_id")){
			deleteLocation(this.abCompViolationForm.getFieldValue("regviolation.location_id"),0);
		}
		
		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		if(this.topCtrl){
			this.topCtrl.needRefreshSelectList = true;
			this.topCtrl.selectFirstTab();
		}
	},

	/**
	 * Event Handler of afterRefresh of Violation form
	 */
	abCompViolationForm_afterRefresh: function(){
		var form = this.abCompViolationForm;

		//if not report mode and editing an existed violation record
		if (!form.newRecord) {
			//set location form properly
			var locId = form.getFieldValue("regviolation.location_id");
			setLocationForm(this.abCompViolationForm2, locId);
		} 
		//if creating a new violation record
		else {
			//set location form properly
			setLocationForm(this.abCompViolationForm2, "");
		}
		
		//Requirement Type should be blank if Requirement Code is blank
		if(form.newRecord || !form.getFieldValue("regrequirement.reg_requirement")){
			form.showField("regrequirement.regreq_type", false);
		} else {
			form.showField("regrequirement.regreq_type", true);			
		}

		//disable location_id field but enable its select-valut button
		form.enableField("regviolation.location_id", false);
		form.enableFieldActions("regviolation.location_id", true);
	}
});

/**
 * Action Listener of select-value command of field "location_id"
 */
function afterSelectLocationID(fieldName, selectedValue, previousValue){
	//only monitor the field "regviolation.location_id"
	if ( "regviolation.location_id" ==fieldName) {

		//set location form properly
		var ctrl = abCompViolationFormController;
		setLocationForm(ctrl.abCompViolationForm2, selectedValue);
	}
}

/**
* Action Lisenter of custom select value command for field "Requirement"
*/
function afterSelectRequirement(fieldName, selectedValue, previousValue){
	//when select a requirement show its requirement type in form
	if (fieldName == "regviolation.reg_requirement"){
		if(selectedValue){
			onChangeRequirement("regviolation", "abCompViolationForm",selectedValue);
		}
	}
}

