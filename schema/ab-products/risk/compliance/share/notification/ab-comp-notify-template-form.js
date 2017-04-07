/**
* Added for 20.1 Compliance :  Notify Template edit form view
*
* This view is used inside below views: 
*	1. PNAV taks: Define Notification Templates
*	2. Pop-up dialog for clicking "View Default Notification" button
*	3. Load to sub-tab of some manage views include: Manage Compliance Program,   Manage Compliance Requirements,  Manage Notification Templates, Manage All Events, 		
*	4. Operational Report : Compliance Notification Templates
*
* @author Zhang Yi
*/
var abCompNotiTemplateFormController = View.createController('abCompNotiTemplateFormController',
{
	//sign indicate if current form is load as a tab in Notification tabs 
	isInNotifyTab:false,

	//top level controller: possible  'abCompManageNotifyTemplateController' f or manege view;  'defNotificationController' for BOP View; others for sub tab of Manage Program or Mange Requirement view
	topController: null,

	//array of texts show in condition drop-down list after "If"
	statusTextArray: new Array(
			"", "Started", "Not Started", "Canceled", "Stopped", "On-Hold", "Completed", "Not Completed","Verified", "Not Verified", "Closed", "Not Closed"),

	//array of coresponding values of texts show in drop-down list after "If", this value will be saved to field "trigger_condition_to"
	statusValueArray: new Array(
			"", 
			"${status} IN ('IN PROGRESS', 'COMPLETED', 'COMPLETED-V', 'CLOSED')", 
			"${status} NOT IN ('IN PROGRESS', 'COMPLETED', 'COMPLETED-V','CLOSED')", 
			"${status} = 'CANCELLED'", 
			"${status} = 'STOPPED'", 
			"${status} = 'IN PROCESS-H'", 
			"${status} IN ('COMPLETED', 'COMPLETED-V', 'CLOSED')", 
			"${status} NOT IN ('COMPLETED', 'COMPLETED-V', 'CLOSED')", 
			"${status} IN ('COMPLETED-V', 'CLOSED')", 
			"${status} NOT IN ('COMPLETED-V', 'CLOSED')", 
			"${status} = 'CLOSED'", 
			"${status} != 'CLOSED'"
	),

	//array of texts show in date field drop-down list  connected to condition
	dateConditionTextArray: new Array(
			"Date Scheduled Start", "Date Scheduled End", "Date Completion Required"),
	//array of coresponding field names of  date field drop-down list, this value will be saved to field "trigger_date_field"
	dateConditionValueArray: new Array(
			"date_scheduled", "date_scheduled_end", "date_required"),

	afterViewLoad: function(){
		//set tabs
		var tabs=null;
		if(View.parentTab){
			tabs= View.parentTab.parentPanel;
		}
		if(tabs && tabs.id=="notificationTabs"){
			this.isInNotifyTab = true;
		}

		//initial UI Element
		this.initialFormUI();
		
   },

	afterInitialDataFetch:function(){
		var index = View.getOpenerView().controllers.length-1;
		this.topController = View.getOpenerView().controllers.get(index);
		if("report" == this.topController.mode){
			//initial UI element for showing form in report mode (View Default Notifications) 
			this.isViewDefaultNotification = true;
			this.configureFormForViewDefaultNotification();
		}
	},


	initialFormUI: function(){
		//set style to section titles
		this.setSectionTitle("content");
		this.setSectionTitle("recipient");
		this.setSectionTitle("condition");

		//initial dropdown lists
		for(var i=1; i<this.statusTextArray.length;i++){
			this.statusTextArray[i] = getMessage("statusTitle"+i);
		}
		for(var i=0; i<this.dateConditionTextArray.length;i++){
			this.dateConditionTextArray[i] = getMessage("dateConditionTitle"+i);
		}
		initialDropdownList("ccc", this.statusValueArray, this.statusTextArray);
		initialDropdownList("zzz", this.dateConditionValueArray, this.dateConditionTextArray);
	},

	abCompNotificationFrom_afterRefresh: function(){
		//set proper radio button selection for subject and content field
		this.setRadioSelected();
			  
		//select proper value of drow-down list for current loaded record
		this.setRecordValueToListField();

		//if view opened for add new
		if(this.abCompNotificationFrom.newRecord){
			// For new records, set default values for fields mapped to 
			// custom dropdowns before calling setRecordValueToListField
			this.abCompNotificationFrom.setFieldValue("notify_templates.trigger_date_field", this.dateConditionValueArray[0]);

			//set default values to new record
			this.setDefaultFieldValues();
			//for new record enable all fields of form
			this.enableForm(this.abCompNotificationFrom, true);
		}  
		
		else {
			//if  activity_id IS NULL
			if(this.abCompNotificationFrom.getFieldValue("notify_templates.activity_id")){
				// show record in Panel 2 in report mode or with all fields disabled, and hide Panel actions Save and Add New, Save, Delete
				this.enableForm(this.abCompNotificationFrom, true);
			}
			else{
				// restore fields and actions to enable
				this.enableForm(this.abCompNotificationFrom, false);
			}
			//configure form UI for "View Default Notification" action click or for 'View' row button click
			var defCtrl = View.controllers.get("defNotificationController") ;
			var bpoRptCtrl = View.controllers.get("bpoRptNotifyTemplateController") ;
			var rptCtrl = View.controllers.get("rptNotifyTemplateController") ;
			if(this.isViewDefaultNotification || (defCtrl && defCtrl.isView) || bpoRptCtrl || rptCtrl){
				this.configureFormForViewDefaultNotification();
			}
			if(this.isInNotifyTab){
				this.configureFormForViewDefaultNotification();
			} 
		}
    },

	//set proper radio button selection for subject and content field
	setRadioSelected:function(){
		var selectSubject = false;
		//if is new record or existed record has subject,  set selectSubject to true
		if( this.abCompNotificationFrom.newRecord ||  this.abCompNotificationFrom.getFieldValue("notify_templates.notify_subject_id") ){
			selectSubject = true;
		}
	},
	
	//select proper value of drow-down list for current loaded record
	setRecordValueToListField:function(){
		setOptionValue('ccc', this.abCompNotificationFrom.getFieldValue("notify_templates.trigger_condition_to"));
		setOptionValue('zzz', this.abCompNotificationFrom.getFieldValue("notify_templates.trigger_date_field"));
		//after selection of drop-down list, enable or disable related field
		onChangeLeadSeq();
	},
	
	//once the selection of condition drop-down list changes , set coresponding value to field trigger_condition_to
	cccChange:function(){
		this.abCompNotificationFrom.setFieldValue("notify_templates.trigger_condition_to", $("ccc").value);
	},

	//once the selection of date option drop-down list changes , set coresponding value to field trigger_date_field
	zzzChange:function(){
		this.abCompNotificationFrom.setFieldValue("notify_templates.trigger_date_field", $("zzz").value);
	},

	//change style of given section title
	setSectionTitle:function(title){
		$(title).innerHTML=getMessage(title); 
		$(title).style.fontSize = '12px';
		$(title).style.fontWeight = 'bold';
	},

	//enable or disable form fields and actions
	enableForm:function(form, enable){
		form.actions.get('save').show(enable);
		form.actions.get('saveAndAddNew').show(enable);
		form.actions.get('delete').show(enable);
		form.fields.each(function(field) {
				form.enableField(field.fieldDef.id, enable);
		});
		$('zzz').disabled=!enable;
		$('ccc').disabled=!enable;
	},

	/**
	 * Events Handler for 'Copy As New' action button: 
	 * 	copy current loaded record, create a new record, then fill values to  the new record and empty primary keys
	 */
	abCompNotificationFrom_onCopyAsNew:function(){
		var template_id=this.abCompNotificationFrom.getRecord().getValue("notify_templates.template_id");
		if(!template_id){
			View.showMessage(getMessage("nullTemplate"));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('notify_templates.template_id' ,template_id);
		var records=this.abCompNotiTemplateFormDS.getRecords(restriction);
		var record=records[0];
		this.abCompNotificationFrom.newRecord = true;
		this.abCompNotificationFrom.setRecord(record);
		this.abCompNotificationFrom.setFieldValue('notify_templates.template_id','');
	},


	/**
	 * For "View Default Notifications", hide all actions, disable all fields and change title of edit form.
	 */
	configureFormForViewDefaultNotification:function(){
		showAllActionsOfPanel(this.abCompNotificationFrom,false);
		this.abCompNotificationFrom.showActions(false);
		this.enableForm(this.abCompNotificationFrom,false);
		if(	this.isViewDefaultNotification){
			this.abCompNotificationFrom.setTitle(getMessage("defForm"));
		} else {
			this.abCompNotificationFrom.setTitle(getMessage("viewForm"));
		}
	},

	/**
	 * For "View Default Notifications", hide all actions, disable all fields and change title of edit form.
	 */
	saveForm:function(){
		if(this.abCompNotificationFrom.getFieldValue("notify_templates.notify_subject") && this.abCompNotificationFrom.getFieldValue("notify_templates.notify_subject_id") || 
			!this.abCompNotificationFrom.getFieldValue("notify_templates.notify_subject") && !this.abCompNotificationFrom.getFieldValue("notify_templates.notify_subject_id")){

			View.showMessage(getMessage("onlyOneSubject"));

		}  else if('None'==this.abCompNotificationFrom.getFieldValue("notify_templates.trigger_lead_seq") && !$("ccc").value){//kb3035794:add below validation
			//if trigger_lead_seq is ¡¯None¡¯ and [Send If Event Status is] is blank, show error message and do not save.
			View.showMessage(getMessage("noneStatus"));
			
		}  else {
			
			if(this.abCompNotificationFrom.canSave()){
				this.abCompNotificationFrom.save();
				this.createRegNotify();
				this.setRefreshSign();
			} 
		}
	},

	/**
	 * Eventhandler for action "Delete" of edit form: after delete current notification template record, select first tab and refresh grid in it.
	 */
	afterDeleteForm:function(){
		//set refresh sigh used in parent controller for refreshing parent tabs 
		this.setRefreshSign();
		//select first tab
		if(this.topController && this.topController.notifyTemplateTabs){
			this.topController.notifyTemplateTabs.selectTab("selectTemplate");
			//after deletion disable rest tabs except first tab
			this.topController.enableRestTabs(false);
		}
	},

	/**
	 * For "View Default Notifications", hide all actions, disable all fields and change title of edit form.
	 */
	setRefreshSign:function(){
		if(this.topController && this.topController.id=='abCompManageNotifyTemplateController'){
			this.topController.needRefreshSelectList=true;				
		} else {
			this.abCompNotificationGrid.refresh();
		}
	},

	/**
	 *Private Function: fill default values to field.
	 */
	setDefaultFieldValues:function(){
		this.abCompNotificationFrom.setFieldValue("notify_templates.activity_id", "AbRiskCompliance");
		this.abCompNotificationFrom.setFieldValue("notify_templates.notify_subject_refby", "NOTIFY_TEMPLATE_SUBJECT");
		this.abCompNotificationFrom.setFieldValue("notify_templates.notify_message_refby", "NOTIFY_TEMPLATE_BODY");
		this.abCompNotificationFrom.setFieldValue("notify_templates.trigger_lead_seq", "Before");
	},

	/**
	 *Private Function: After saving a new record to notify_templates, immediately insert a new record into regnotify where template_id = new template_id and 
	 * regulation,reg_program = regulation,reg_program of record in Tab 2.  Refresh the grid in Panel 1 and the new record should show up with the checkbox selected
	 */
	createRegNotify:function(){
		
		var templateId = 	this.abCompNotificationFrom.getFieldValue("notify_templates.template_id");
		var topCtrl = View.getOpenerView().controllers.get(0);
		
		//if exists template id and regulation and program
		if(templateId && topCtrl && topCtrl.regulation && topCtrl.regprogram){
			var record = this.abCompRegNotifyDS.getDefaultRecord();
			record.setValue("regnotify.template_id",templateId);
			record.setValue("regnotify.regulation",topCtrl.regulation);
			record.setValue("regnotify.reg_program",topCtrl.regprogram);
			//if exists requirement then set it
			if(topCtrl.regrequirement){
				record.setValue("regnotify.reg_requirement",topCtrl.regrequirement);
			}
			//save new regnotify record
			this.abCompRegNotifyDS.saveRecord(record);
			//refresh grid to make newly created regnotify to be 'checked'
			this.abCompNotificationGrid.refresh();
		}
	}
});

/**
 * Events Handler for clicking on radio buttons from 'Notification Content' group,
 * enable or disable fields according to radio button selection
 * @param {Object} selectedBtn - name of clicked radio button
 */
function  onClickRadioShow(selectSubject){		

	var controller = abCompNotiTemplateFormController;
	var form = controller.abCompNotificationFrom;
	if(selectSubject){
		form.enableField('notify_templates.notify_subject', true);
		form.enableField('notify_templates.notify_subject_id', false);
		form.enableField('notify_templates.notify_message_id', false);
		form.setFieldValue('notify_templates.notify_subject_id', '');
		form.setFieldValue('notify_templates.notify_message_id','');
	}	
	else {
		form.enableField('notify_templates.notify_subject', false);
		form.setFieldValue('notify_templates.notify_subject', '');
		form.enableField('notify_templates.notify_subject_id', true);
		form.enableField('notify_templates.notify_message_id', true);
	}
}

/**
 * Events Handler for change selection of  drop-down list after "Days".
 */
function  onChangeLeadSeq(selectSubject){	
	
	var controller = abCompNotiTemplateFormController;
	var form = controller.abCompNotificationFrom;
	var seq = form.getFieldValue("notify_templates.trigger_lead_seq");
	//if select 'None' then:
	//  disable fields [Days Before/After Trigger Date To Send] and [Event Trigger Date]; 
	//  restore field title
	if('None'==seq){
		form.enableField('notify_templates.trigger_lead', false);
		$('zzz').disabled= true;
		form.setFieldLabel('notify_templates.trigger_lead',getMessage("none")+":");
	}	
	// else enable fields, change title of field [Days Before/After Trigger Date To Send] accordingly
	else {
		form.enableField('notify_templates.trigger_lead', true);
		$('zzz').disabled= false;
		if('Before'==seq){
			form.setFieldLabel('notify_templates.trigger_lead',getMessage("before")+":");
		} else if('After'==seq) {
			form.setFieldLabel('notify_templates.trigger_lead',getMessage("after")+":");
		}
	}
}

/**
 * Action Listener fo select value button for "AddEmployee", replace "^" with ";" and add new addresses to existed list.
 */
function afterSelectEmail(fieldName, selectedValue, previousValue){
	var previousValueArray = previousValue.split(";");
	var selectedValueArray = selectedValue.split("^");
	var finalValue= previousValue;
	for(var i=0;i<selectedValueArray.length;i++){
		var isExisted = false;
		for(var j=0; j<previousValueArray.length;j++){
			if(selectedValueArray[i]==previousValueArray[j]){
				isExisted = true;
				break
			}
		}
		if(!isExisted){
			finalValue = finalValue +	 selectedValueArray[i]+";";
		}
	}
	abCompNotiTemplateFormController.abCompNotificationFrom.setFieldValue("notify_templates.notify_recipients", finalValue);
	return false;
}
