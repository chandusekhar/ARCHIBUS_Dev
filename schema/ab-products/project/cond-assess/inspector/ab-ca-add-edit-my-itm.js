/**
 * controller definition
 */
var addEditCaMyItemController = View.createController('addEditCaMyItemCtrl', {
	quest:null,

    afterInitialDataFetch: function(){
        this.setClassifDescriptionText(null);
        
        if (this.view.newRecord == true) {
            this.view.setTitle(getMessage("addNewItem"));
            this.setDefaultValues();
            if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
            	this.addEditCondAssessPanel.setFieldValue('activity_log.activity_type', '');
            }
            this.addEditCondAssessPanel.setFieldValue("activity_log.assessed_by", this.view.user.name);
			this.addEditCondAssessPanel.setFieldValue("activity_log.date_assessed", this.dsAddEditCondAssess.formatValue("activity_log.date_assessed", new Date(), true));
        } else {
			var actLogID = this.addEditCondAssessPanel.getFieldValue('activity_log.activity_log_id');
			this.addEditCondAssessPanel.setFieldValue("location_ca", this.addEditCondAssessPanel.getRecord().getValue("activity_log.location"));
			this.addEditCondAssessPanel.setFieldValue("location_es", this.addEditCondAssessPanel.getRecord().getValue("activity_log.location"));
			this.view.setTitle(View.originalTitle += ' ' + actLogID);	
		}
        
        this.setAddStdDescButton();
		this.setQuestionnairePanel();
    },
    
    addEditCondAssessPanel_onSave: function(){
		if (this.validateBlAndSite(this.addEditCondAssessPanel)) {
			if (this.addEditCondAssessPanel.canSave()) {
				//we set the activity_log.act_quest value before we save the panel.
				this.setActivitylogActQuestValue();
				
				var record = this.addEditCondAssessPanel.getRecord();
				if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning'){
					record.setValue('activity_log.location', this.addEditCondAssessPanel.getFieldValue("location_ca"));
				}else if(this.view.taskInfo.activityId == 'AbRiskES'){
					record.setValue('activity_log.location', this.addEditCondAssessPanel.getFieldValue("location_es"));
				}
				//Set the questionnaire id of the activity_log record.
				this.setActivitylogQuestionnaireId(record);
				try{
					this.dsAddEditCondAssess.saveRecord(record);
					View.closeThisDialog();
					// refresh the opener view
					if (this.view.parameters.callback != undefined) 
						this.view.parameters.callback();
				}catch (e){
					Workflow.handleError(e);
				}
			}
		}
    },
	/**
	 * validate building code against site code
	 */
	validateBlAndSite: function(panel){
		var bl_id = panel.getFieldValue('activity_log.bl_id');
		var site_id = panel.getFieldValue('activity_log.site_id');
		if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(site_id)){
			var parameters = {
				tableName: 'bl',
		        fieldNames: toJSON(['bl.bl_id', 'bl.site_id']),
		        restriction: toJSON(new Ab.view.Restriction({'bl.bl_id':bl_id, 'bl.site_id':site_id}))
			};
		    try {
		        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
		        if (result.data.records.length == 0){
					View.showMessage(getMessage('no_match_bl_site'));
					return false;
				}
		    } catch (e) {
		        Workflow.handleError(e);
				return false;
		    }
		}
		return true;
	},
    
    /**
     * Replace the SPAN with a text node in order to keep the text in the td cell
     */
    setClassifDescriptionText: function(selectedValue){
        var fieldElement = this.addEditCondAssessPanel.getFieldElement('activity_log.csi_description');
        if (fieldElement == undefined) 
            return;
        
        var td = fieldElement.parentNode;
        if (td == undefined) 
            return;
        
        var span = fieldElement.nextSibling;
        if (span != undefined) {
            if (selectedValue == null && span.childNodes[0] != undefined) {
                selectedValue = span.childNodes[0].nodeValue;
            }
            td.removeChild(span);
        }
        if (selectedValue != null) {
            var textNode = document.createTextNode(selectedValue);
            td.appendChild(textNode);
        }
    },
    
    /**
     * Adds the "Add Standard Description" button after the Description text area
     */
    setAddStdDescButton: function(){
        var descElement = this.addEditCondAssessPanel.getFieldElement('activity_log.description');
        if (descElement == undefined) 
            return;
        
        var brNode = document.createElement("br");
        descElement.parentNode.appendChild(brNode);
        
        var buttonNode = document.createElement("input");
        buttonNode.setAttribute("type", "button");
        buttonNode.setAttribute("class", "button");
        buttonNode.setAttribute("value", getMessage("addStdDesc"));
        buttonNode.onclick = addStdDesc;
        descElement.parentNode.appendChild(buttonNode);
    },
    
    /**
     * Sets some fields values from the view's parameters
     */
    setDefaultValues: function(){
        var panel = this.addEditCondAssessPanel;
        var params = this.view.parameters;
        
        if (params.copyRecord != undefined && params.copyRecord != null) {
            var rec = params.copyRecord;
            
			panel.setFieldValue("activity_log.action_title", rec.getValue("activity_log.action_title"));
            panel.setFieldValue("activity_log.project_id", params.selectedProject);
            panel.setFieldValue("activity_log.site_id", rec.getValue("activity_log.site_id"));
            panel.setFieldValue("activity_log.csi_id", rec.getValue("activity_log.csi_id"));
            panel.setFieldValue("activity_log.bl_id", rec.getValue("activity_log.bl_id"));
            panel.setFieldValue("activity_log.csi_description", rec.getValue("csi.description"));
            panel.setFieldValue("activity_log.fl_id", rec.getValue("activity_log.fl_id"));
            panel.setFieldValue("activity_log.rm_id", rec.getValue("activity_log.rm_id"));
            panel.setFieldValue("activity_log.date_assessed", rec.getValue("activity_log.date_assessed"));
            panel.setFieldValue("activity_log.eq_id", rec.getValue("activity_log.eq_id"));
            panel.setFieldValue("activity_log.cond_priority", rec.getValue("activity_log.cond_priority"));
			panel.setFieldValue("activity_log.sust_priority", rec.getValue("activity_log.sust_priority"));
 			panel.setFieldValue("location_ca", rec.getValue("activity_log.location"));
			panel.setFieldValue("location_es", rec.getValue("activity_log.location"));
            panel.setFieldValue("activity_log.cond_value", rec.getValue("activity_log.cond_value"));
            panel.setFieldValue("activity_log.status", rec.getValue("activity_log.status"));
            panel.setFieldValue("activity_log.rec_action", rec.getValue("activity_log.rec_action"));
            panel.setFieldValue("activity_log.description", rec.getValue("activity_log.description"));
        }
        else 
            if (params.defaultValues != undefined && params.defaultValues != null) {
                panel.setFieldValue("activity_log.project_id", params.selectedProject);
                panel.setFieldValue("activity_log.site_id", params.defaultValues["activity_log.site_id"]);
                panel.setFieldValue("activity_log.bl_id", params.defaultValues["activity_log.bl_id"]);
                panel.setFieldValue("activity_log.fl_id", params.defaultValues["activity_log.fl_id"]);
                panel.setFieldValue("activity_log.csi_id", params.defaultValues["activity_log.csi_id"]);
                this.setClassifDescWithWFR(params.defaultValues["activity_log.csi_id"]);
            }
    },
    
    /**
     * Sets the classification description for the given classification code,
     * using WFR
     * @param {Object} csiCode
     */
    setClassifDescWithWFR: function(csiCode){
        // call WFR to get the classification description for the classification code
        if (csiCode != '') {
            var parameters = {
                tableName: 'csi',
                fieldNames: toJSON(['csi.description']),
                restriction: toJSON("csi_id='" + csiCode + "'")
            };
            try {
                var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
                
                for (var i = 0; i < result.data.records.length; i++) {
                    var record = result.data.records[i];
                    var description = record['csi.description'];
                    this.setClassifDescriptionText(description);
                }
            } 
            catch (e) {
                Workflow.handleError(e);
            }
        }
    },
    
	setQuestionnairePanel: function() {
		var showQuestions = false;
		var actQuest = this.addEditCondAssessPanel.getFieldValue('activity_log.act_quest');
		var questionnaireId = this.addEditCondAssessPanel.getFieldValue('activity_log.questionnaire_id');
		if(actQuest && actQuest != '') {
			this.quest = new Ab.questionnaire.Quest(questionnaireId, "addEditCondAssessPanel",false);
			showQuestions = true;
		} else {
			// this line is for testing only //  var questionnaireId = 'Action - CA - Asset - Pump';
			if(questionnaireId && questionnaireId != '') {
				this.quest = new Ab.questionnaire.Quest(questionnaireId, "addEditCondAssessPanel");
				showQuestions = true;
			}
		}
		if(showQuestions) {
			this.quest.showQuestions();
		}
	},
	
	setActivitylogActQuestValue: function() {
		if(this.quest) {
			this.quest.beforeSaveQuestionnaire();
		}
	},
	
	setActivitylogQuestionnaireId: function(record) {
		var activityId = this.view.taskInfo.activityId;
		var projectType;
		if (activityId == 'AbCapitalPlanningCA') {
			projectType = 'ASSESSMENT';
		}else if(activityId == 'AbRiskES'){
			projectType = 'ASSESSMENT - ENVIRONMENTAL';
		}else if(activityId == 'AbProjCommissioning'){
			projectType = 'COMMISSIONING';
		}
		
		// reg_program field is used to store eq_std value from eq_id select field
		// req_program is just for reference; no data is stored in the db
		var eqStd = record.getValue('activity_log.reg_program');
		record.setValue('activity_log.reg_program', '');
		
		if(eqStd) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('questionnaire_map.eq_std', eqStd,'=');
			restriction.addClause('questionnaire_map.project_type', projectType, '=');
			var qmRecords = this.questionnaireMapPopulateDs.getRecords(restriction);
			if(qmRecords.length > 0) {
				var questionnaireId = qmRecords[0].getValue('questionnaire_map.questionnaire_id');
				record.setValue('activity_log.questionnaire_id', questionnaireId);
			}
		}
	},

	
	getQuestionnaireId: function(equipmentId, projectType) {
		
	}	
});

/**
 * Replaces the label of Classification Description field (the SPAN element)
 * Called by the custom Select Value for Classification dialog after the value is selected,
 * but before it is saved to the form field.
 * The function can return false to prevent the value from being selected.
 *
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectClassif(fieldName, selectedValue, previousValue){
    //alert(fieldName + ": " + previousValue + " --> " + selectedValue);
    
    // the selected value can be copied to the form field
    if (fieldName == 'activity_log.csi_id') {
        View.controllers.get('addEditCaMyItemCtrl').setClassifDescWithWFR(selectedValue);
    }
    
    
    return true;
}

/**
 * Adds the selected problem description at the end of the activity item description
 *
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectStdDesc(fieldName, selectedValue, previousValue){
    //alert(fieldName + ": " + previousValue + " --> " + selectedValue);
    
    var panel = View.panels.get("addEditCondAssessPanel");
    
    var value = panel.getFieldValue('activity_log.description');
    if (value == undefined) 
        return;
    
    value += "\n" + selectedValue;
    panel.setFieldValue('activity_log.description', value);
}

/**
 * Opens the Select Value View, to select a Problem Description
 */
function addStdDesc(){
    Ab.view.View.selectValue('formPanelSelVal_form', getMessage("problemDescCodes"), ['dummyField'], 'pd', ['pd.pd_description'], ['pd.pd_id', 'pd.pd_description'], "", "afterSelectStdDesc");
}
