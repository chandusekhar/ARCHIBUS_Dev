/**
 * Controller for the create new work request.
 */
var wrCreateController = View.createController('wrCreateController', {
	
	/**
	 * Ab.operation.express.console.PriorityField
	 */
	priorityField : null,
	
	/**
	 * Linked To Request
	 */
	linkedToRequest : null,
	
	linkedToTable: 'wr',
	
	/**
	 * Current sub problem type
	 */
	currentSubProbTypes : null,
	
	/**
	 * Set interface and actions after view loaded
	 */
	afterViewLoad : function() {
		//Initial priorityField
		this.priorityField = new Ab.operation.express.console.PriorityField('createRequestForm');
		
		// hide the drawing action after load
		Ext.get('selectRoom').dom.style.display = "none";

		// show or hide equipment information
		this.showEquipment();

		// show or hide problem type information
		this.showProblemType();

		// set location field select value action command config
		this.setLocationFieldSelectValueConfig();

		// add listener for actions
		this.addListenerForActions();

		// set auto complete event listener
		View.panels.get('createRequestForm').addEventListener("onAutoCompleteSelect", this.onAutoCompleteSelect.createDelegate(this));
		
		//KB3040688 - set the problem class to newly created problem types automatically if this view is used for Operation console
		//cannot delete below line, it is required in Add new pop up view ab-probtype-edit.axvw
		View.isOnDemandProblemType = true;
	},

	/**
	 * Show or hide equipment information.
	 */
	showEquipment : function() {
		var equipmentPanel = Ext.fly('createRequestForm_activity_log.eq_id_labelCell').parent().parent();
		if (this.isShowEquipment()) {
			equipmentPanel.setDisplayed(true);
		} else {
			equipmentPanel.setDisplayed(false);
		}
	},

	/**
	 * Show or hide problem type information.
	 */
	showProblemType : function() {
		var problemTypePanel = Ext.fly('createRequestForm_prob_type_parent_labelCell').parent().parent();
		if (this.isShowProblemType()) {
			problemTypePanel.setDisplayed(true);
		} else {
			problemTypePanel.setDisplayed(false);
		}
	},

	/**
	 * Check application parameter and security group to determine whether to show equipment panel.
	 */
	isShowEquipment : function(fieldValue, message) {
		var showEquipmentOnCreateRequest = View.activityParameters['AbBldgOpsOnDemandWork-ShowEquipmentOnReportProblem'];
		if (showEquipmentOnCreateRequest == '1' || View.user.isMemberOfGroup('SHOW-ALL-REQUEST-FIELDS')) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Check application parameter and security group to determine whether to show Problem Type panel.
	 */
	isShowProblemType : function(fieldValue, message) {
		var showProblemTypesOnCreateRequest = View.activityParameters['AbBldgOpsOnDemandWork-ShowProblemTypesOnReportProblem'];
		if (showProblemTypesOnCreateRequest == '1' || View.user.isMemberOfGroup('SHOW-ALL-REQUEST-FIELDS')) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Set panel values after the form refreshed.
	 */
	createRequestForm_afterRefresh : function() {
		// set default user name
		this.setDefaultUser();
		
		// show parent problem tyle in the box
		this.showParentProblemType();
		
		// show priority
		this.priorityField.showPriority();
		
		//set field values base on the liked work request
		this.setFieldValuesFromLinkedRequest();

		//set field values base on the liked compliance event
		this.setFieldValuesFromLinkedEvent();
	},
	
	/**
	 * Set field values base on the liked work request.
	 */
	setFieldValuesFromLinkedRequest : function() {
		if(!View.getOpenerView()){
			return;
		}
		
		this.linkedToRequest = View.getOpenerView().linkedToRequest;
		if (View.getOpenerView().linkedToTable != undefined) {
			this.linkedToTable = View.getOpenerView().linkedToTable;
		}
		View.getOpenerView().linkedToRequest = null;
		if(valueExists(this.linkedToRequest)){
			$('sameAsRequestor').checked = false;
			this.createRequestForm.setFieldValue('activity_log.dv_id', this.linkedToRequest.getValue(this.linkedToTable+'.dv_id'));
			this.createRequestForm.setFieldValue('activity_log.dp_id', this.linkedToRequest.getValue(this.linkedToTable+'.dp_id'));
			this.createRequestForm.setFieldValue('activity_log.site_id', this.linkedToRequest.getValue(this.linkedToTable+'.site_id'));
			this.createRequestForm.setFieldValue('activity_log.bl_id', this.linkedToRequest.getValue(this.linkedToTable+'.bl_id'));
			this.createRequestForm.setFieldValue('activity_log.fl_id', this.linkedToRequest.getValue(this.linkedToTable+'.fl_id'));
			this.createRequestForm.setFieldValue('activity_log.rm_id', this.linkedToRequest.getValue(this.linkedToTable+'.rm_id'));
			this.createRequestForm.setFieldValue('activity_log.location', this.linkedToRequest.getValue(this.linkedToTable+'.location'));
			this.createRequestForm.setFieldValue('activity_log.eq_id', this.linkedToRequest.getValue(this.linkedToTable+'.eq_id'));
			this.createRequestForm.setFieldValue('activity_log.prob_type', this.linkedToRequest.getValue(this.linkedToTable+'.prob_type'));
			afterSelectProblemType(null,this.linkedToRequest.getValue(this.linkedToTable+'.prob_type'));
			jQuery('#viewToolbar_layoutWrapper').hide();
		}
	},

	/**
	 * Set field values base on the liked work request.
	 */
	setFieldValuesFromLinkedEvent : function() {
		if(!View.getOpenerView()){
			return;
		}
		
		this.linkedEventValue = View.getOpenerView().linkedEventValue;
		View.getOpenerView().linkedEventValue = null;
		if(valueExists(this.linkedEventValue)){
			$('sameAsRequestor').checked = false;
			this.createRequestForm.setFieldValue('activity_log.site_id', this.linkedEventValue['activity_log.site_id']);
			this.createRequestForm.setFieldValue('activity_log.bl_id', this.linkedEventValue['activity_log.bl_id']);
			this.createRequestForm.setFieldValue('activity_log.fl_id', this.linkedEventValue['activity_log.fl_id']);
			this.createRequestForm.setFieldValue('activity_log.rm_id', this.linkedEventValue['activity_log.rm_id']);
			this.createRequestForm.setFieldValue('activity_log.location', this.linkedEventValue['activity_log.location']);
			this.createRequestForm.setFieldValue('activity_log.eq_id', this.linkedEventValue['activity_log.eq_id']);
			this.createRequestForm.setFieldValue('activity_log.description', this.linkedEventValue['activity_log.description']);
			this.createRequestForm.setFieldValue('activity_log.assessment_id', this.linkedEventValue['activity_log.assessment_id']);
			jQuery('#viewToolbar_layoutWrapper').hide();
		}
	},

	/**
	 * Set default user.
	 */
	setDefaultUser : function() {
		var form = this.createRequestForm;
		// set current user employee and phone
		form.setFieldValue('activity_log.requestor', View.user.employee.id);
		form.setFieldValue('activity_log.phone_requestor', View.user.employee.phone);

		// set current user location
		$('sameAsRequestor').checked = true;
		this.onChangeSameAsRequestor();
	},

	/**
	 * Add listener for buttons.
	 */
	addListenerForActions : function() {
		Ext.get('sameAsRequestor').on('click', this.onChangeSameAsRequestor.createDelegate(this));
		Ext.get('selectRoom').on('click', this.onSelectRoom.createDelegate(this));
		Ext.get('createRequestForm_activity_log.site_id').on('change', function() {afterSelectLocation('activity_log.site_id')});
		Ext.get('createRequestForm_activity_log.bl_id').on('change', function() {afterSelectLocation('activity_log.bl_id')});
		Ext.get('createRequestForm_activity_log.fl_id').on('change', function() {afterSelectLocation('activity_log.fl_id')});
		Ext.get('createRequestForm_activity_log.rm_id').on('change', afterSelectLocation);
		Ext.get('createRequestForm_prob_type_parent').on('change', this.onToggleParentProblemType.createDelegate(this));
		Ext.get('createRequestForm_prob_type_sub').on('change', this.onToggleSubProblemType.createDelegate(this));
		Ext.get('createRequestForm_activity_log.requestor').on('change', afterSelectRequestor);
		Ext.get('createRequestForm_activity_log.eq_id').on('change', afterSelectEq);
	},

	/**
	 * Set select value action config for location field.
	 */
	setLocationFieldSelectValueConfig : function() {
		//set 'AddNewDialog' property for location fields
		this.setAddNewDialogForLocationField( 'activity_log.site_id', 'ab-bldgops-console-add-new-site.axvw',  getMessage('site') );
		this.setAddNewDialogForLocationField('activity_log.bl_id',  'ab-bldgops-console-add-new-bl.axvw',  getMessage('building') ) ;
		this.setAddNewDialogForLocationField('activity_log.fl_id',  'ab-bldgops-console-add-new-fl.axvw',  getMessage('floor') );
		this.setAddNewDialogForLocationField( 'activity_log.rm_id', 'ab-bldgops-console-add-new-rm.axvw',  getMessage('room') );

		//set other properties of select-value dialog for other fields
		var form = this.createRequestForm;
		form.fields.get("activity_log.bl_id").actions.get(0).command.commands[0].fieldNames = 'activity_log.site_id,activity_log.bl_id';
		form.fields.get("activity_log.bl_id").actions.get(0).command.commands[0].selectFieldNames = 'bl.site_id,bl.bl_id';
		form.fields.get("activity_log.eq_id").actions.get(0).command.commands[0].dialogTitle = getMessage('equipment');
	},

	/**
	 * Configure 'addNewDialog' property of location fields - By ZY
	 */
	setAddNewDialogForLocationField : function(fieldId, viewName, title) {
		var form = this.createRequestForm;
		form.fields.get(fieldId).actions.get(0).command.commands[0].showAddNewButton = View.user.isMemberOfGroup('ADD-NEW-OPS-DATA');
		form.fields.get(fieldId).actions.get(0).command.commands[0].addNewDialog = viewName;
		form.fields.get(fieldId).actions.get(0).command.commands[0].dialogTitle = title;
		form.fields.get(fieldId).actions.get(0).command.commands[0].actionListener = afterSelectLocation;
	},

	/**
	 * Show parent problem type in the box
	 */
	showParentProblemType : function() {
		// get parent field and clear all old options
		var parentField = this.createRequestForm.fields.get('prob_type_parent');
		parentField.clearOptions();
		
		// add first empty option
		parentField.addOption('', '');

		// query parent problem type
		var restrction = "(probtype.prob_class='OD' AND probtype.hierarchy_ids LIKE '%|' AND probtype.hierarchy_ids NOT LIKE '%|%|')";
		var records = this.probtypeDS.getRecords(restrction);

		// add the query results to the field options
		for ( var i = 0; i < records.length; i++) {
			parentField.addOption(records[i].getValue('probtype.prob_type'), records[i].getValue('probtype.prob_type'));
		}
	},

	/**
	 * Event handler when change parent problem type.
	 */
	onToggleParentProblemType : function() {
		// show sub problem type by parent problem type
		this.showSubProblemTypeByParent();
		
		//set problem type for priority
		this.setProblemType();

		// show priority
		this.priorityField.showPriority();
	},

	/**
	 * Event handler when change sub problem type.
	 */
	onToggleSubProblemType : function() {
		
		//set problem type for priority
		this.setProblemType();
		// show priority
		this.priorityField.showPriority();
		
	},

	/**
	 * Show sub problem type by parent type.
	 */
	showSubProblemTypeByParent : function() {
		this.currentSubProbTypes = [];
		// get sub problem type and clear all old options
		var subField = this.createRequestForm.fields.get('prob_type_sub');
		subField.clearOptions();

		// add fist empty option
		subField.addOption('', '');

		// get parent problem type
		var problemType = this.createRequestForm.getFieldValue('prob_type_parent');

		// query sub problem type
		var restrction = "(probtype.prob_class='OD' AND probtype.hierarchy_ids LIKE '" + problemType + "|%' AND probtype.hierarchy_ids LIKE '%|%|' AND probtype.hierarchy_ids NOT LIKE '%|%|%|')";
		var records = this.probtypeDS.getRecords(restrction);

		// add query results to the field options
		for ( var i = 0; i < records.length; i++) {
			//KB3046937( IE/Google Chrome:The Second tire problem type is not filled when user select problem type by 'View All Problem Types' in Report Problem form
			var subProblemType = records[i].getValue('probtype.prob_type').replace(problemType + '|', '');
			subField.addOption(subProblemType, subProblemType);
			this.currentSubProbTypes.push({key:subProblemType,value:records[i].getValue('probtype.prob_type')});
			
		}
	},

	/**
	 * Event handler when change same as requestor checkbox.
	 */
	onChangeSameAsRequestor : function() {
		// if checked, set current user's location
		if ($('sameAsRequestor').checked) {
			// set location field values from requestor field
			this.setLocationFromRequestor();
		} else {
			// if not checked, set empty location
			this.createRequestForm.setFieldValue('activity_log.site_id', '');
			this.createRequestForm.setFieldValue('activity_log.bl_id', '');
			this.createRequestForm.setFieldValue('activity_log.fl_id', '');
			this.createRequestForm.setFieldValue('activity_log.rm_id', '');
		}

		// showing drawing button and showing priority
		this.afterLocationChange();
	},

	/**
	 * Query requestor's location and set values to the form.
	 */
	setLocationFromRequestor : function() {
		var requestor = this.createRequestForm.getFieldValue("activity_log.requestor");
		if (requestor != '') {
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getEmployeeLocation', requestor);
				var results = eval("(" + result.jsonExpression + ")");
				if (results != null) {
					this.createRequestForm.setFieldValue('activity_log.site_id', results.site_id, null, false);
					this.createRequestForm.setFieldValue('activity_log.bl_id', results.bl_id);
					this.createRequestForm.setFieldValue('activity_log.fl_id', results.fl_id);
					this.createRequestForm.setFieldValue('activity_log.rm_id', results.rm_id);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},

	/**
	 * Open pop up to show floor plan.
	 */
	onSelectRoom : function() {
		// show select value floor drawing
		var form = this.createRequestForm;
		showWorkRequestFloolPlan(form.getFieldValue('activity_log.bl_id'), form.getFieldValue('activity_log.fl_id'), form.getFieldValue('activity_log.rm_id'), function(rmId) {
			form.setFieldValue('activity_log.rm_id', rmId)
		});
	},

	/**
	 * Event listener for autoComplete .
	 */
	onAutoCompleteSelect : function(form, fieldName, selectedValue) {
		if (fieldName == 'activity_log.site_id' || fieldName == 'activity_log.bl_id' || fieldName == 'activity_log.fl_id' || fieldName == 'activity_log.rm_id') {
			this.afterLocationChange();
		}
		
		if (fieldName == 'activity_log.eq_id') {
			afterSelectEq();
		}
		
		if (fieldName == 'activity_log.requestor') {
			afterSelectRequestor();
		}
	},
	
	/**
	 * Populate site field and showing drawing button and priority field .
	 */
	afterLocationChange : function() {
		//Populate site field base on bl_id
		this.populateSite();
		
		//show drawing button base on bl_id and fl_id
		this.showDrawingButton();
		
		//show priority base on all fields in the form
		this.priorityField.showPriority();
		
		//disable add new button in select value dialog by user' input
		this.disableAddNewButtonByInput();
		
	},
	
	/**
	 * Disable Add new button according to user's input.
	 */
	disableAddNewButtonByInput : function() {
		var form = this.createRequestForm;
		var disableFlAddNewButton = false;
		var disableRmAddNewButton = false;
		if(!form.getFieldValue('activity_log.bl_id')){
			disableFlAddNewButton = true;
		}
		
		if(!form.getFieldValue('activity_log.bl_id') || !form.getFieldValue('activity_log.fl_id')){
			disableRmAddNewButton = true;
		}
		form.fields.get("activity_log.fl_id").actions.get(0).command.commands[0].showAddNewButton = !disableFlAddNewButton && View.user.isMemberOfGroup('ADD-NEW-OPS-DATA');
		form.fields.get("activity_log.rm_id").actions.get(0).command.commands[0].showAddNewButton = !disableRmAddNewButton  &&  View.user.isMemberOfGroup('ADD-NEW-OPS-DATA');
	},

	/**
	 * Populate site field.
	 */
	populateSite : function() {
		// get building and floor
		var blId = this.createRequestForm.getFieldValue('activity_log.bl_id');

		// if building and floor not empty , show drawing button
		if (valueExistsNotEmpty(blId)) {
			// query bl table
			var restriction = new Ab.view.Restriction();
			restriction.addClause("bl.bl_id", blId, '=');
			var records = this.siteQuerfyDS.getRecords(restriction);

			// return site_id from the record
			if (records.length > 0) {
				this.createRequestForm.setFieldValue('activity_log.site_id', records[0].getValue('bl.site_id'), null, false);
			} else {
				this.createRequestForm.setFieldValue('activity_log.site_id', '');
			}
		}
	},

	/**
	 * Show or hide drawing button.
	 */
	showDrawingButton : function() {
		// get button dom
		var button = Ext.get('selectRoom').dom;

		// get building and floor
		var buildingId = this.createRequestForm.getFieldValue('activity_log.bl_id');
		var floorId = this.createRequestForm.getFieldValue('activity_log.fl_id');
		
		// query RM table to get drawing name
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", buildingId, '=');
		restriction.addClause("rm.fl_id", floorId, '=');
		var records = this.drawingQuerfyDS.getRecords(restriction);
		
		// if exist drawing name, show drawing button 
		if (records.length > 0) {
			button.style.display = "";
		} else {
			// if not exist , hide drawing button
			button.style.display = "none";
		}
	},
	
	/**
	 * Event handler of Add Documents button.
	 */
	createRequestForm_onAddDocuments : function() {
		this.addDocuments = true;
		this.createRequestForm_onSubmit();
	},

	/**
	 * Event handler of submit button.
	 */
	createRequestForm_onSubmit : function() {
		// check required field
		if (this.checkRequiredFields()) {
			// if all required fields not empty, call wfr to submit request
			var record = ABHDC_getDataRecord2(this.createRequestForm);
			try {
				
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-checkRequestDuplicates', record);
				var res = eval('('+result.jsonExpression+')');
				if (res.duplicates){										
					var restriction = this.createDuplicatesRestriction();
					View.openDialog("ab-bldgops-console-wr-similar.axvw", restriction, false); 
					return;
				}		
				
			} catch (e) {
				View.showMessage(e.message);
				return;
			}
			
			this.submitRequest();
		}
	},
	
	/**
	 * Create duplicate restriction.
	 */
	submitRequest : function() {
		try {
			var addDocuments =  this.addDocuments;
			var record = ABHDC_getDataRecord2(this.createRequestForm);
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
			var wrId = null;
			// get activity_log_id from result
			if (result.jsonExpression != "") {
				var res = eval('(' + result.jsonExpression + ')');
				wrId = this.getWrIdFromActivtiyLogId(res.activity_log_id);
				alert(getMessage('submitSucess') + ' ' + wrId)
				
				if(valueExists(this.linkedToRequest)){
					var parentWrId = this.linkedToRequest.getValue(this.linkedToTable+'.wr_id');
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveParentWorkRequest', parseInt(wrId), parseInt(parentWrId));
				}
			}

			var openerView = View.getOpenerView();
			var linkedToRequest = this.linkedToRequest;
			if (openerView) {
				//Pop up create form from Ops console 
				var wrFilter = openerView.controllers.get('wrFilter'); 
				if (wrFilter) {
					wrFilter.wrFilter_onFilter();
					if(valueExists(linkedToRequest)){						
						openerView.workRequestDetailDialogController.loadRelatedWorkRequests();
					}
					
					this.showDocumentsForm(addDocuments,openerView,wrId);
					
					
				} else if (openerView.workRequestDetailDialogController) {
					// valueExists gives error in IE
					if (linkedToRequest != null){
						openerView.dialog = openerView.workRequestDetailDialog;
						openerView.workRequestDetailDialogController.loadRelatedWorkRequests();
					}
					
					this.showDocumentsForm(addDocuments,openerView,wrId);
					
				}else if (openerView.searchAndManageViewController) {
					// valueExists gives error in IE
					if (linkedToRequest != null){
						openerView.searchAndManageViewController.loadRelatedWorkRequests();
					}
					
					this.showDocumentsForm(addDocuments,openerView,wrId);
					
				} else {
					if(addDocuments){
						View.needReloadAfterAddDocuments = true;
						this.showDocumentsForm(addDocuments,View,wrId);
					}else{
						// if work as stand-alone view, then reload the view
						window.location.reload(false);
					}
					
				}			 	
			} else {
				if(addDocuments){
					View.needReloadAfterAddDocuments = true;
					this.showDocumentsForm(addDocuments,View,wrId);
				}else{
					// if work as stand-alone view, then reload the view
					window.location.reload(false);
				}
			}
			
		} catch (e) {
			View.showMessage(e.message);
		}
	},
	
	/**
	 * Show documents form.
	 */
	showDocumentsForm : function(addDocuments, view, wrId) {
		if(addDocuments){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('wr.wr_id', wrId, '=');
			View.openDialog('ab-bldgops-console-wr-add-docs.axvw', restriction, false, {closeButton : false});
		}else{
			// close report problem form
			View.closeThisDialog();
		}
	},
	
	/**
	 * Create duplicate restriction.
	 */
	createDuplicatesRestriction : function() {
		var form = this.createRequestForm;
		var siteId = form.getFieldValue('activity_log.site_id');
		var blId = form.getFieldValue('activity_log.bl_id');
		var date="";
		//get current iso-format date of building  and site' time zone 
		try {
	   		var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTimeSiteAndBl', siteId,blId);
			 if (result.code == 'executed') {
				var obj = eval('(' + result.jsonExpression + ')');
				date= obj.date;
			} else {
				Workflow.handleError(e);
			}
	    }catch (e) {
			 Workflow.handleError(e);
	 	}
		
		var restriction = new Ab.view.Restriction();	
		restriction.addClause("wr.date_requested",date,'=');	
		
		var eq_id = form.getFieldValue('activity_log.eq_id');
		if(eq_id != ''){ 
			restriction.addClause("wr.eq_id",eq_id,'=');
		} 
	    
		//fix KB3029909 - make the duplicate check only for the location specified(Guo 2011/4/11)
	    var fl_id = form.getFieldValue('activity_log.fl_id');
	    var rm_id = form.getFieldValue('activity_log.rm_id');
	    if (siteId) {
	        restriction.addClause("wr.site_id", siteId, '=');
	    }
		if (blId) {
	        restriction.addClause("wr.bl_id", blId, '=');
	    }	
		if (fl_id) {
	        restriction.addClause("wr.fl_id", fl_id, '=');
	    }	
		if (rm_id) {
	        restriction.addClause("wr.rm_id", rm_id, '=');
	    }					
		
		var prob_type = form.getFieldValue('activity_log.prob_type');
		if(prob_type != ''){
			restriction.addClause("wr.prob_type",prob_type,"=");
		}
		
		return restriction;
	},
	
	/**
	 * Event handler of submit button.
	 */
	createRequestForm_onCancelRequest : function() {
		var openerView = View.getOpenerView();
		if (openerView) {
			var wrFilter = openerView.controllers.get('wrFilter');
			if (wrFilter) {
				// If open as pop up , then close dialog
				View.closeThisDialog();
			}else{
				// if work as stand-alone view, then reload the view
				window.location.reload(false);
			}
		}else{
			//if work as stand-alone view, then reload the view
			window.location.reload(false);
		}
	},

	/**
	 * Get work request id from activity_log id.
	 */
	getWrIdFromActivtiyLogId : function(activityLogId) {
		// query wr table with activity_log id restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause("wr.activity_log_id", activityLogId, '=');
		var records = this.wrQuerfyDS.getRecords(restriction);

		// return wr_id from the record
		if (records.length > 0) {
			return records[0].getValue('wr.wr_id');
		} else {
			return '';
		}
	},

	/**
	 * Check required fields.
	 */
	checkRequiredFields : function() {
		// check requestor field
		var requestor = this.createRequestForm.getFieldValue("activity_log.requestor");
		if (this.checkEmptyValue(requestor, getMessage("noRequestor"))) {
			return false;
		}

		// check building
		var blId = this.createRequestForm.getFieldValue("activity_log.bl_id");
		if (this.checkEmptyValue(blId, getMessage("noBl"))) {
			return false;
		}

		// check description
		var description = this.createRequestForm.getFieldValue("activity_log.description");
		if (this.checkEmptyValue(description, getMessage("noDescription"))) {
			return false;
		}

		// check description
		var priority = this.createRequestForm.getFieldValue("activity_log.priority");
		if (this.checkEmptyValue(priority, getMessage("noPriority"))) {
			return false;
		}

		return this.checkEqLocation();
	},

	/**
	 * Check whether value is empty.
	 */
	checkEmptyValue : function(fieldValue, message) {
		if (!valueExistsNotEmpty(fieldValue)) {
			View.showMessage(message);
			return true;
		}

		return false;
	},
	
	/**
	 * Check equipment locaiton and location field in the form.
	 */
	checkEqLocation: function(){
		var eqId = this.createRequestForm.getFieldValue('activity_log.eq_id');
		if(eqId){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('eq.eq_id',eqId, '=');
			
			var blId = this.createRequestForm.getFieldValue('activity_log.bl_id');
			var flId = this.createRequestForm.getFieldValue('activity_log.fl_id');
			var rmId = this.createRequestForm.getFieldValue('activity_log.rm_id');
			
			if(blId){
				restriction.addClause('eq.bl_id',blId, '=');
			}else{
				restriction.addClause('eq.bl_id',null, 'IS NULL');
			}
			
			if(flId){
				restriction.addClause('eq.fl_id',flId, '=');
			}else{
				restriction.addClause('eq.fl_id',null, 'IS NULL');
			}
			
			if(rmId){
				restriction.addClause('eq.rm_id',rmId, '=');
			}else{
				restriction.addClause('eq.rm_id',null, 'IS NULL');
			}
			
			var records = this.eqWarrantyDS.getRecords(restriction);
			if(records.length == 0){
				var continueToNext = confirm(getMessage('differentEqLocaiton'));
				return continueToNext;
			}else{
				return true;
			}
		}
		
		return true;
	},

	/**
	 * Set problem type for priority.
	 */
	setProblemType : function() {
		// get parent problem type
		var problemType = this.createRequestForm.getFieldValue('prob_type_parent');
		// get sub problem type
		var problemSubType = this.createRequestForm.getFieldValue('prob_type_sub');

		// return sub problem if not empty
		if (problemSubType) {
			for(var i = 0; i< this.currentSubProbTypes.length; i++){
				if(this.currentSubProbTypes[i].key == problemSubType){
					problemType = this.currentSubProbTypes[i].value;
				}
			}
		}
		
		this.createRequestForm.setFieldValue('activity_log.prob_type', problemType);
	},

	/**
	 * List all requets for the the selected equipment.
	 */
	createRequestForm_onListRequestForEq : function() {
		var eqId = this.createRequestForm.getFieldValue('activity_log.eq_id');
		if (eqId) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('wr.eq_id', eqId, '=');
			View.openDialog("ab-helpdesk-workrequest-history.axvw", restriction, false);
		}
	},
	
	/**
	 * Set equipment Warranty fields.
	 */
	setWarrantyFields : function() {
		var form = this.createRequestForm;
		// get the equipment code
		var eqId = form.getFieldValue('activity_log.eq_id');
		
		// get the related warranty vendor and warranty expiration date
		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq.eq_id', eqId, '=');
		var ds = View.dataSources.get('eqWarrantyDS');
		var record = ds.processOutboundRecord(ds.getRecord(restriction));
		var warVendor = record.getValue('warranty.war_vendor');
		var warExpDate = record.getValue('warranty.date_expiration');
		var isexpiration = record.getValue('eq.isexpiration');

		// set the field warVendor
		if (warVendor) {
			form.setFieldValue('warVendor', warVendor);
		} else {
			form.setFieldValue('warVendor', '');
		}
		// set the field warExpDate
		if (warExpDate) {
			form.setFieldValue('warExpDate', warExpDate);
			// If the warranty.date_expiration is earlier than today set text color to red
			if (isexpiration == 'true') {
				form.getFieldElement('warExpDate' + '_short', 'Show').style.color = 'Red';
			}
			// If the warranty.date_expiration is not earlier than today set text color to black
			if (isexpiration == 'false') {
				form.getFieldElement('warExpDate' + '_short', 'Show').style.color = 'Black';
			}

		} else {
			form.setFieldValue('warExpDate', '');
		}
	},

	/**
	 * Review warrant details.
	 */
	createRequestForm_onReviewWarrantyDetails : function() {
		// get the equipment code
		var eqId = this.createRequestForm.getFieldValue('activity_log.eq_id');
		// if equipment code is not null open the details panel as a pop up window
		if (eqId) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('eq.eq_id', eqId, '=');
			var detailsPanel = this.eqWarrantyDetails;
			detailsPanel.show(true);
			detailsPanel.refresh(restriction);
			detailsPanel.showInWindow({
				width : 800,
				height : 300
			});
		}
	}
});

/**
 * Action Listener after select requestor.
 */
function afterSelectRequestor(fieldName, selectedValue) {
	if (fieldName == 'activity_log.requestor') {
		var form = View.panels.get('createRequestForm');
		form.setFieldValue('activity_log.requestor',selectedValue);
	}
	
	//KB3047806 - set dv dp from requestor field
	setRequestorInfo();
	Ext.get('sameAsRequestor').dom.checked = false;
	wrCreateController.onChangeSameAsRequestor();
}

/**
 * Retrieves requestor information (phone, dv_id, dp_id) from the database.
 */
function setRequestorInfo(){
	
	var requestPanel = View.panels.get("createRequestForm");
	var requestorValue = requestPanel.getFieldValue("activity_log.requestor");
	
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getRequestorInformation', requestorValue);
	}catch(e){
		Workflow.handleError(e);
	}
	
	if(result.code == 'executed'){
		var res = eval('('+result.jsonExpression+')');
		if(res != null){
			
			
			//KB3043720 - clear phone number before select new requestor
			requestPanel.setFieldValue("activity_log.phone_requestor",'');
			requestPanel.setFieldValue("activity_log.dv_id",'');
			requestPanel.setFieldValue("activity_log.dp_id",'');
			
			if(res.phone != undefined)
				requestPanel.setFieldValue("activity_log.phone_requestor",res.phone);
			
			if(res.dv_id != undefined)
				requestPanel.setFieldValue("activity_log.dv_id",res.dv_id);
				
			if(res.dp_id != undefined)
				requestPanel.setFieldValue("activity_log.dp_id",res.dp_id);
		}
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Action Listener after select problem type.
 */
function afterSelectProblemType(fieldName, selectedValue) {
	// parse parent and sub problem type
	var parentType = selectedValue;
	var subType = '';
	if (selectedValue.indexOf('|') !== -1) {
		parentType = selectedValue.split('|')[0];
		subType = selectedValue.split('|')[1];
	}

	// set parent problem type
	setParentProblemType(parentType);
	// show sub problem type options by parent
	wrCreateController.showSubProblemTypeByParent();
	// set sub problem type option
	setSubProblemType(selectedValue.replace(parentType + '|', ''));
	
	//KB3046702 - set correct problem type to make sure the priority information is updated
	wrCreateController.setProblemType();

	// show priority
	wrCreateController.priorityField.showPriority();
}

function setParentProblemType(value){
	var fieldElement = jQuery('#createRequestForm_prob_type_parent')[0];
	var options = fieldElement.options;
	for(var i=0;i<options.length;i++){
		if(options[i].value == value){
			fieldElement.selectedIndex = i;
			break;
		}
	}
	
}

function setSubProblemType(value){
	var fieldElement = jQuery('#createRequestForm_prob_type_sub')[0];
	var options = fieldElement.options;
	for(var i=0;i<options.length;i++){
		if(options[i].value == value){
			fieldElement.selectedIndex = i;
			break;
		}
	}
}

/**
 * Action Listener after select location fields.
 */
function afterSelectLocation(fieldName, selectedValue, previousValue) {
	
	clearOldValuesAfterChangeLocationField(fieldName);
	
	// set bl_id to make sure the method afterLocationChange() can get the current selected value
	if (fieldName == 'activity_log.bl_id' && valueExistsNotEmpty(selectedValue)) {
		wrCreateController.createRequestForm.setFieldValue('activity_log.bl_id', selectedValue);
	}
	
	// set fl_id to make sure the method afterLocationChange() can get the current selected value
	if (fieldName == 'activity_log.fl_id' && valueExistsNotEmpty(selectedValue)) {
		wrCreateController.createRequestForm.setFieldValue('activity_log.fl_id', selectedValue);
	}
	
	// populate site field and showing drawing button and showing priority
	wrCreateController.afterLocationChange();
}

/**
 * Clear old values after change locaiton fields.
 */
function clearOldValuesAfterChangeLocationField(fieldName) {
	if (fieldName == 'activity_log.site_id') {
		// clear bl, fl, rm infor after change site
		wrCreateController.createRequestForm.setFieldValue('activity_log.bl_id', '');
		wrCreateController.createRequestForm.setFieldValue('activity_log.fl_id', '');
		wrCreateController.createRequestForm.setFieldValue('activity_log.rm_id', '');
		
	}else if (fieldName == 'activity_log.bl_id') {
		// clear fl, rm infor after change bl
		wrCreateController.createRequestForm.setFieldValue('activity_log.fl_id', '');
		wrCreateController.createRequestForm.setFieldValue('activity_log.rm_id', '');
	}else if (fieldName == 'activity_log.fl_id') {
		// clear rm infor after change fl
		wrCreateController.createRequestForm.setFieldValue('activity_log.rm_id', '');
	}
}

/**
 * Action Listener after select location fields.
 */
function afterSelectEq(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('createRequestForm');
	if (typeof fieldName != 'string') {
		// set warranty fields
		wrCreateController.setWarrantyFields();
		wrCreateController.priorityField.showPriority();
	}else{
		if (fieldName == 'activity_log.eq_id') {
			form.setFieldValue('activity_log.eq_id',selectedValue);
			// set warranty fields
			wrCreateController.setWarrantyFields();
		}
		
		if (fieldName == 'activity_log.bl_id') {
			form.setFieldValue('activity_log.bl_id',selectedValue);
			// set site code base on building code
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bl.bl_id',selectedValue, '=');
			var blRecords = View.dataSources.get('siteQueryDS').getRecords(restriction);
			if(blRecords.length>0){
				form.setFieldValue('activity_log.site_id',blRecords[0].getValue('bl.site_id'), null, false);
			};
		}
		
		
		if (fieldName == 'activity_log.rm_id') {
			// show priority
			wrCreateController.priorityField.showPriority();
		}
	}
}

/**
 * KB3040749 - Over write core API to open Add new dialog and close select value dialog.
 */
Ab.grid.SelectValue.prototype.onAddNew = function() {
	var parameters = Ab.view.View.selectValueParameters;
	View.closeDialog();
	View.openDialog(this.addNewDialog, null, false, {
		x : 100,
		y : 100,
		width : 850,
		height : 800,
		title : getAddNewDialogTitle(this.addNewDialog),
		useAddNewSelectVDialog : false,
		closeButton : false
	});
}

/**
 * KB3042553 - avoid title concatenation.
 */
function getAddNewDialogTitle(addNewDialog){
	switch (addNewDialog){
		case 'ab-bldgops-console-add-new-eq.axvw':
				return getMessage('addNewEq');
			break;
		case 'ab-bldgops-console-add-new-probtype.axvw':
			return getMessage('addNewProbType');
		break;
		case 'ab-bldgops-console-add-new-pd.axvw':
			return getMessage('addNewProblemDescription');
		break;
		case 'ab-bldgops-console-add-new-site.axvw':
			return getMessage('addNewSite');
		break;
		case 'ab-bldgops-console-add-new-bl.axvw':
			return getMessage('addNewBl');
		break;
		case 'ab-bldgops-console-add-new-fl.axvw':
			return getMessage('addNewFl');
		break;
		case 'ab-bldgops-console-add-new-rm.axvw':
			return getMessage('addNewRm');
		break;
		default:
			return '';
	} 
}


/**
 * Action Listener after select Problem description field.
 */
function afterSelectPd(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('createRequestForm');
	form.setFieldValue('activity_log.description', previousValue + selectedValue);
	return false;
}