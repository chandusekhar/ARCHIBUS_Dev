var controller = View.createController('changeEqSurveyFieldsController', {
	//survey ids
	surveyIds: [],
	
	isNewSurvey: false,
	
	afterSelectFieldsFunction: null,

	fieldNames: [],
	mlHeadings: {},
	required: {},
	
	afterViewLoad: function() {
		if(this.view.parameters){
			if(this.view.parameters.surveyIds){
				this.surveyIds = this.view.parameters.surveyIds;
			}
			
			if(this.view.parameters.afterSelectFieldsFunction){
				this.afterSelectFieldsFunction = this.view.parameters.afterSelectFieldsFunction;
			}
		}
		
		if(this.surveyIds.length < 1){
			//new created survey
			var surveyId = View.getOpenerView().controllers.get('eqNewSurveyController').currentSurveyId;
			if(surveyId){
				this.surveyIds = [surveyId];  
			}
			
			this.isNewSurvey = true;
			this.changeFieldsTemplatePanel.actions.get("cancel").show(false);
		}
		
		
		//hide all the buttons at title bar.
		if(Ext.get("alterButton")!=null)
			Ext.get("alterButton").dom.hidden = true;
		if(Ext.get("favoritesButton")!=null)
			Ext.get("favoritesButton").dom.hidden = true;
		if(Ext.get("printButton")!=null)
			Ext.get("printButton").dom.hidden = true;
		if(Ext.get("emailButton")!=null)
			Ext.get("emailButton").dom.hidden = true;
		if(Ext.get("loggingButton")!=null)
			Ext.get("loggingButton").dom.hidden = true;
		
		this.storeFieldNameAndHeadings(this.getTableDef('eq_audit'));
		
		// add the input fields
		this.loadInputFields();
		
		this.checkDefaultFields();
   	},
   	
	/**
	 *Stores the required field, optional fields and their multiple headings into array and map.
	 */
	storeFieldNameAndHeadings: function(eq_audit_tableDef) {
		if(eq_audit_tableDef!= null){
			var fieldDefs = eq_audit_tableDef.fieldDefs;
			for(var i=0; i < fieldDefs.length; i++){
				var fieldDef = fieldDefs[i];
				var fieldName = fieldDef.name;
				if('mob_locked_by' === fieldName || 'transfer_status'=== fieldName 
						|| 'mob_is_changed' === fieldName || 'survey_photo_eq_isnew' === fieldName || 'survey_redline_eq_isnew' === fieldName){
					continue;
				}
				this.fieldNames.push(fieldName);
				this.required[fieldName] = !fieldDef.allowNull;
				this.mlHeadings[fieldName] = fieldDef.multiLineHeadings.join(' ');
			}
			
			//21.2 spec: The Survey Photo field is required
			this.required['survey_photo_eq'] = true;
			this.required['date_last_surveyed'] = true;
			
			//KB3046308: mark redline field as required and non-selectable
			this.required['survey_redline_eq'] = true;
		}
	},
	
	addField: function(fieldName){
		var index = this.fieldNames.indexOf(fieldName);
		var inputElemHtml = "";
		if(index > -1){
			inputElemHtml += "<tr><td align='right'><input type='checkbox' id='checkbox_" + fieldName + "'";
			
			if(this.required[fieldName]){
				inputElemHtml += " checked='true' disabled='true'";
			}
			
			if(fieldName == 'dv_id')
				inputElemHtml += " onchange='onDvCheckBox()'";
			else if(fieldName == 'dp_id')
				inputElemHtml += " onchange='onDpCheckBox()'";
				
			inputElemHtml += "></input></td><td><span translatable='true'>" + this.mlHeadings[fieldName] + "</span>";
			if(this.required[fieldName])
				inputElemHtml += "<span style='color:red;'>*</span>";
			
			inputElemHtml += "</td></tr>";
		}
		return inputElemHtml;
	},
	
	loadInputFields: function() {	
		var changeFieldsDiv = $('changeFieldsTemplatePanel');
		var inputElemHtml = "<table align='center'><tr></tr>";		
		inputElemHtml += this.addField("survey_id");
		inputElemHtml += this.addField("site_id");
		inputElemHtml += this.addField("bl_id");
		inputElemHtml += this.addField("fl_id");
		inputElemHtml += this.addField("rm_id");
		inputElemHtml += this.addField("dv_id");
		inputElemHtml += this.addField("dp_id");
		inputElemHtml += this.addField("eq_id");
		inputElemHtml += this.addField("status");
		for(var i=0; i < this.fieldNames.length; i++){
			var fieldName = this.fieldNames[i];
			if(fieldName!='survey_id' && fieldName!='site_id' && fieldName!='bl_id' && fieldName!='fl_id' 
				&& fieldName!='rm_id' && fieldName!='dv_id' && fieldName!='dp_id' && fieldName!='eq_id' && fieldName!='status')
				inputElemHtml += this.addField(fieldName);
		}
		inputElemHtml += "</table>";
		changeFieldsDiv.innerHTML = inputElemHtml ;		
	},
	
   	getTableDef : function(tableName) {
   		var tableDef = null;
	   	MobileSyncService.getTableDef(tableName, {
			async : false,
	        headers: { "cache-control": "no-cache" },
			callback : function(returnValue) {
				tableDef = returnValue;
			},
			errorHandler : function(message, exception) {
				 Ab.view.View.showException(message);
			}
		});	
	   return tableDef;
   	},
   	
   	checkDefaultFields: function(){
   		var dataSource = getSurveyDataSource();
   		if(controller.surveyIds.length == 1){
   			var record = getSurveyRecord(dataSource, controller.surveyIds[0]);
   			var defaultFields = record.getValue('survey.survey_fields');
   			
   			if(!defaultFields){
   				defaultFields = getEqFieldsActivityParamValue();
   			}
   			
   			var fieldsArray = defaultFields.split(";");
			for(var i=0; i < fieldsArray.length; i++){
				var checkBoxElem = $('checkbox_' + fieldsArray[i]);
				if(checkBoxElem)
					checkBoxElem.checked=true;
			}
   		}
   	}
});

function onChangeSurveyFields() {
	var fieldsToSurvey = '';
	for(var i=0; i < controller.fieldNames.length; i++){
		var fieldName = controller.fieldNames[i];
		var checkBoxElem = $('checkbox_' + fieldName);
		if(checkBoxElem && checkBoxElem.checked){
			if(fieldsToSurvey.length >0)
				fieldsToSurvey += ";";
			
			fieldsToSurvey += fieldName;
		}
	}
	
	var dataSource = getSurveyDataSource();
	for(var i=0; i< controller.surveyIds.length; i++){
		var record = getSurveyRecord(dataSource, controller.surveyIds[i]);
		record.setValue('survey.survey_fields', fieldsToSurvey);
		record.isNew = false;
		
		try{
			dataSource.saveRecord(record);
		} catch(e){
			View.showMessage('error', getMessage('error_save'), e.message, e.data);
		}
	}
	
	var openerView = View.getOpenerView();
	if(controller.afterSelectFieldsFunction != null){
		controller.afterSelectFieldsFunction();
		openerView.panels.get('eqSurveyGrid_grid').refresh();
	}
	
	updateEquipmentToSurvey();
}

function updateEquipmentToSurvey(){
	for(var i=0; i< controller.surveyIds.length; i++){
		var survey_id = controller.surveyIds[i];
	
		try {
			result = Workflow.callMethod('AbAssetManagement-AssetMobileService-updateEquipmentToSurvey', survey_id);
	    }catch (e) {
	    	if (e.code=='ruleFailed'){
	    		View.showMessage(e.message);
	    	}else{
	    		Workflow.handleError(e);
	     	}
	     	return;
	    }	
	       	
	    if (result.code == 'executed') {
	    	var openerView = View.getOpenerView();
	    	if(controller.isNewSurvey){
	    		openerView = View.getOpenerView().getOpenerView();
	    		openerView.panels.get('eqSurveyGrid_grid').refresh();
	    	}	
	    	
    		openerView.closeDialog();
	    	
	    }
	}
}

function onDvCheckBox() {
	$('checkbox_dp_id').checked = $('checkbox_dv_id').checked;
}

function onDpCheckBox() {
	$('checkbox_dv_id').checked = $('checkbox_dp_id').checked;
}
