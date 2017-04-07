/**
* Added for Manage Document Lib View: second tab.
*
* @author Zhang Yi
*/
var abCompDocLibFormController = View.createController('abCompDocLibFormController',{

	/**
	 * Bind event listeners for doc field in form
	 */
    afterViewLoad: function(){

		// bind custom lisenter of doc button to refresh grid when any doc change happens
		this.abCompDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN, this.onDocChangeHandler, this);
		this.abCompDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION, this.onDocChangeHandler, this);
		this.abCompDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_DELETE, this.onDocChangeHandler, this);
	},


	/**	Custom Event handler: after the document is checked in, version changed or deleted, 
	 *  this function will be called to reset refresh sign of first tab of top controller.
	 */
	onDocChangeHandler: function (panel, fieldName, parameters) {
		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//set changed sign in top controller
		if(this.topCtrl){
			this.topCtrl.onSaveChange();
			this.topCtrl.doc = this.abCompDocForm.getFieldValue("docs_assigned.doc_id") ;
		}
	},

	/**
	* Event handler of action "Cancel".
	*/
	abCompDocForm_onCancel :function(){

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
	abCompDocForm_onSaveAndAddNew : function(){
		if(this.abCompDocForm.canSave()){
			this.saveDocForm();
			this.abCompDocForm.refresh(null, true);
			//save location informations and new location id
			setLocationForm(this.abCompDocForm2, "", true);
		}
	},

	/**
	* Event Handler of action "Save"
	*/
	abCompDocForm_onSave : function(){
		if(this.abCompDocForm.canSave()){
			this.saveDocForm();
		}
	},

	/**
	* Save the document form.
	*/
	saveDocForm : function(){
		//call common JS function to save location informations
		createOrUpdateLocation(this.abCompDocForm, this.abCompDocForm2, "docs_assigned");

		//save location informations and new location id
		this.abCompDocForm.save();

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//set changed sign in top controller
		if(this.topCtrl){
			this.topCtrl.onSaveChange();
			this.topCtrl.doc = this.abCompDocForm.getFieldValue("docs_assigned.doc_id") ;
		}
		//kb 3036188, reset hierarchy_ids value after save.
		var records=this.abCompDocFormDs.getRecords("doc_id = "+ this.abCompDocForm.getFieldValue("docs_assigned.doc_id"));
		var record=records[0];
		this.abCompDocForm.setFieldValue("docfolder.hierarchy_ids", record.getValue('docfolder.hierarchy_ids'));
	},

	/**
	 * Events Handler for 'Delete' action button: 
	*/
	abCompDocForm_onDelete: function(){
		this.abCompDocForm.deleteRecord();
		
		//call deleteLocation WFR to Delete compliance_location record.
		if(this.abCompDocForm.getFieldValue("docs_assigned.location_id")){
			deleteLocation(this.abCompDocForm.getFieldValue("docs_assigned.location_id"),0);
		}

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		if(this.topCtrl){
			this.topCtrl.needRefreshSelectList = true;
			this.topCtrl.selectFirstTab();
		}
		return true;
	},

	/**
	 * Events Handler for 'Copy As New' action button: 
	 * 	copy current loaded record, create a new record, then fill values to  the new record and empty primary keys
	 */
	abCompDocForm_onCopy:function(){
		var docId=this.abCompDocForm.getRecord().getValue("docs_assigned.doc_id");
		if(!docId){
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('docs_assigned.doc_id' ,docId);
		var records=this.abCompDocFormDs.getRecords(restriction);
		var record=records[0];
		this.abCompDocForm.newRecord = true;
		this.abCompDocForm.setRecord(record);
		this.abCompDocForm.setFieldValue('docs_assigned.doc_id','');

		//kb#3051856: initial fields after copy as new  
		this.abCompDocForm.setFieldValue('docs_assigned.name','');
		this.abCompDocForm.setFieldValue('docs_assigned.doc','');
		this.abCompDocForm.enableField('docs_assigned.doc',false);
		this.abCompDocForm.showElement('abCompDocForm_docs_assigned.doc_showDocument', false);
	},


	/**
	 * Events Handler after form is refreshed:  Hide ��Compliance Location Information�� section if docs_assigned.regloc_id IS NULL 
	 */
	abCompDocForm_afterRefresh: function(){
		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}

		var form = this.abCompDocForm;
		//if current view is loaded for Report view
		if("report" == this.topCtrl.mode){
			//set form to read-only modes, hide panel actions and change title
			enableAllFieldsOfPanel(this.abCompDocForm, false);
			enableAllFieldsOfPanel(this.abCompDocForm2, false);
			hideActionsOfPanel(this.abCompDocForm, new Array("saveAndAddNew", "copy","save","delete","cancel") ,false);
			form.setTitle(getMessage('viewDocs'));
		} 
		//else if current view is loaded for Manage view and not for new record
		else if (!form.newRecord) {
			//set location form properly
			var locId = form.getFieldValue("docs_assigned.location_id");
			setLocationForm(this.abCompDocForm2, locId);
		} 
		//else if current view is loaded for Manage view and for new record		
		else {
			//set location form properly
			setLocationForm(this.abCompDocForm2, "");
		}

		//disable Event ID field but enable its select-valut button
		this.abCompDocForm.enableField("docs_assigned.activity_log_id", false);
		this.abCompDocForm.enableFieldActions("docs_assigned.activity_log_id", true);

		//disable location_id field but enable its select-valut button
		this.abCompDocForm.enableField("docs_assigned.location_id", false);
		this.abCompDocForm.enableFieldActions("docs_assigned.location_id",true);

		//Requirement Type should be blank if Requirement Code is blank
		if(form.newRecord || !form.getFieldValue("docs_assigned.reg_requirement")){
			form.showField("regrequirement.regreq_type", false);
		} else {
			form.showField("regrequirement.regreq_type", true);			
		}

		//kb#3036151: Clear doc field for new record
		if(form.newRecord){
			form.setFieldValue("docs_assigned.doc", '');
		}
	}
});

/**
* Action Lisenter of custom select value command for field "Requirement"
*/
function afterSelectRequirement(fieldName, selectedValue, previousValue){
	//when select a requirement show its requirement type in form
	if (fieldName == "docs_assigned.reg_requirement"){
		if(selectedValue){
			onChangeRequirement("docs_assigned", "abCompDocForm",selectedValue);
		}
	}
}

/**
* Action Lisenter of custom select value command for field "location_id"
*/
function afterSelectLocationID(fieldName, selectedValue, previousValue){
	if (fieldName != "docs_assigned.location_id") return;

	//set location form properly
	var ctrl = abCompDocLibFormController;
	setLocationForm(ctrl.abCompDocForm2, selectedValue);
}

/**
* Action Lisenter of custom select value command for field "Event Id"
*/
function afterSelectEventID(fieldName, selectedValue, previousValue){

	var ctrl = abCompDocLibFormController;
	//When an Event ID is selected, if activity_log.location_id is NOT NULL:
	// update the ��Compliance Location Information�� fields from compliance_locations table.  
	// Set docs_assigned.location_id = activity_log.location_id.  
	// Disable the Location Information and Location ID fields.
	if (fieldName == "docs_assigned.location_id") {
		if(selectedValue){
			//set location form properly
			setLocationForm(ctrl.abCompDocForm2, selectedValue);
		}
	}
	// When an Event ID is selected, copy Requirement Code, Program Code, and Regulation 
	// from activity_log to docs_assigned, and disable the fields in docs_assigned.	
	else if( fieldName != "docs_assigned.activity_log_id" ){
		ctrl.abCompDocForm.enableField(fieldName,false);
	}
}

/**
 * Custom select-value function of field "Event ID"
 * The select value dialog box (activity_log) is filtered by the regulation;program;requirement entered in form, 
 * as well as Compliance Location ID. Permanent Restriction activity_type = 'COMPLIANCE - EVENT'.
 */
function selectEventID(){

	var form = View.panels.get("abCompDocForm");
	//consturct restricion for selecting event id
	var res= " activity_log.activity_type='COMPLIANCE - EVENT' ";
	var regulation = form.getFieldValue("docs_assigned.regulation");
	if(regulation){
		res+= " AND activity_log.regulation='"+regulation+"' ";
	}
	var program = form.getFieldValue("docs_assigned.reg_program");
	if(program){
		res+=" AND activity_log.reg_program='"+program+"' ";
	}
	var requirement = form.getFieldValue("docs_assigned.reg_requirement");
	if(requirement){
		res+=" AND activity_log.reg_requirement='"+requirement+"' ";
	}
 	var locatioId = form.getFieldValue("docs_assigned.location_id");
	if(locatioId){
		res+=" AND activity_log.location_id="+locatioId;
	}

	View.selectValue({
		formId: 'abCompDocForm',
		title: getMessage('titleEventID'),
		restriction: res,
		actionListener: "afterSelectEventID",
		fieldNames: ['docs_assigned.regulation', 'docs_assigned.reg_program', 'docs_assigned.reg_requirement',
			'docs_assigned.activity_log_id', 'docs_assigned.location_id'],
		selectTableName : 'activity_log',
		selectFieldNames: ['activity_log.regulation', 'activity_log.reg_program', 'activity_log.reg_requirement', 
			'activity_log.activity_log_id', 'activity_log.location_id'],
		visibleFields: [
			{fieldName: 'activity_log.activity_log_id', title: getMessage('titleEventID')},
			{fieldName: 'activity_log.action_title', title: getMessage('titleEvent')},
			{fieldName: 'activity_log.date_scheduled', title: getMessage('titleDateScheduled')},
			{fieldName: 'activity_log.regulation'},
			{fieldName: 'activity_log.reg_program'},
			{fieldName: 'activity_log.reg_requirement'}
		]
	});
}

/**
 *EventHandler for Custom action "Clear " of field "Event ID":  
 * clear Event ID, enable the Location Information fields and Requirement Code, Program Code, and Regulation.
 */
function clearEventID(){
	var ctrl = abCompDocLibFormController;
	ctrl.abCompDocForm.setFieldValue('docs_assigned.activity_log_id','');
	ctrl.abCompDocForm.enableField('docs_assigned.regulation',true);
	ctrl.abCompDocForm.enableField('docs_assigned.reg_program',true);
	ctrl.abCompDocForm.enableField('docs_assigned.reg_requirement',true);
	var form2 = ctrl.abCompDocForm2;
	form2.fields.each(function(field) {
		form2.enableField(field.fieldDef.id, true);
	});	
}