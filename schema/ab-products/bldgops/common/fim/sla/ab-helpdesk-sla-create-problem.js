/**
 * Controller Manage Service Level Agreements - Request Parameters tab
 * @author Guo Jiangtao
 */
var createSlaRequestParametersTabController = View.createController('createSlaRequestParametersTabController', {

    // top tabs objects
    tabs: null,
    
    //default visible fields of the form
    defaultFields: ['activity_type', 'prob_type'],
    
    //visible fields of the form if it is not a pm sla
    requestParameterFileds: ['activity_type', 'prob_type', 'site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_std', 'eq_id', 'requestor', 'em_std', 'dv_id', 'dp_id'],
    
    //visible fields of the form if it is a the pm sla
    pmRequestParameterFileds: ['activity_type', 'prob_type', 'site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_std', 'eq_id', 'pmp_id'],
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
    },
    
    /**
     * after the form refreshed, show correct fileds according the value of fields 'helpdesk_sla_request.activity_type'
     * and 'helpdesk_sla_request.prob_type'
     */
    abHelpdeskSlaCreateProblemForm_afterRefresh: function(){
    
        //get the value of fields 'helpdesk_sla_request.activity_type' and  'helpdesk_sla_request.prob_type'
        var activityType = this.abHelpdeskSlaCreateProblemForm.getFieldValue('helpdesk_sla_request.activity_type');
        var probType = this.abHelpdeskSlaCreateProblemForm.getFieldValue('helpdesk_sla_request.prob_type');
        
        //new added only show default fields
        if (!activityType) {
            this.showFields(this.defaultFields);
            return;
        }
        
        //pm sla show fields in array 'this.pmRequestParameterFileds'
        //not pm sla show fields in array 'this.requestParameterFileds'
        if (probType == 'PREVENTIVE MAINT') {
            this.showFields(this.pmRequestParameterFileds);
        }
        else {
            this.showFields(this.requestParameterFileds);
        }
        
    },
    
    /**
     * show specified in the fieldArray on the form
     * @param fieldArray {Array} fields array.
     */
    showFields: function(fieldArray){
    
        //get the datasource    
        var ds = this.abHelpdeskSlaCreateProblemFormDS;
        
        //hide all fields in the form firstly
        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
            var fieldDef = ds.fieldDefs.items[i];
            this.abHelpdeskSlaCreateProblemForm.showField(fieldDef.id, false);
        }
        
        //show fields in the fieldArray
        for (var j = 0; j < fieldArray.length; j++) {
            this.abHelpdeskSlaCreateProblemForm.showField("helpdesk_sla_request." + fieldArray[j], true);
        }
        
    },
    
    /**
     * the onclick event for the button 'Next>>'
     * check validity of the form input and then save the request parameter and select the next tab
     */
    abHelpdeskSlaCreateProblemForm_onNext: function(){
    
        //check the form input 
        if (!this.abHelpdeskSlaCreateProblemForm_checkRequiredFields()) {
            return;
        }
        
        //save request parameters
        var isOK = this.saveSLAProblemParameters();
        
        //if save sucessfully then select the next tab
        if (isOK) {
            this.selectNextTab();
        }
        
    },
    
    /**
     * check validity of the form input
     */
    abHelpdeskSlaCreateProblemForm_checkRequiredFields: function(){
    
        //clear the validation result first
        var form = this.abHelpdeskSlaCreateProblemForm;
        form.clearValidationResult();
        
        //check the field 'helpdesk_sla_request.activity_type'
        var activity_type = form.getFieldValue('helpdesk_sla_request.activity_type');
        
        if (activity_type == "" || activity_type.indexOf("SERVICE DESK") < 0) {
            form.addInvalidField('helpdesk_sla_request.activity_type', getMessage('requestTypeRequired'));
            form.displayValidationResult();
            return false;
        }
        
        if (activity_type != 'SERVICE DESK - MAINTENANCE') {
            form.setFieldValue('helpdesk_sla_request.prob_type', '');
        }
        
        
        //check the field 'helpdesk_sla_request.bl_id' and 'helpdesk_sla_request.fl_id' and 'helpdesk_sla_request.rm_id'
        var blId = form.getFieldValue('helpdesk_sla_request.bl_id');
        var flId = form.getFieldValue('helpdesk_sla_request.fl_id');
        var rmId = form.getFieldValue('helpdesk_sla_request.rm_id');
        
        if (rmId) {
            if (!blId || !flId) {
                View.alert(getMessage("rmNoBlFl"));
                return false;
            }
            
        }
        else {
            if (flId) {
                if (!blId) {
                    View.alert(getMessage("flNoBl"));
                    return false;
                }
            }
        }
        
        return true;
        
    },
    
    /**
     * save request parameters
     */
    saveSLAProblemParameters: function(){
    
        var isOK = true;
        
        //prepare the wfr parameters
        var form = this.abHelpdeskSlaCreateProblemForm;
        var recordValues = ABHDC_getDataRecord2(form);
        var activity_type_copy = null;
        var ordering_seq_copy = null;
        
        var result = {};
        if (this.tabs.makeCopy) {
            activity_type_copy = this.tabs.activity_type_copy;
            ordering_seq_copy = this.tabs.ordering_seq_copy;
        }
        
        try {
            //call wfr to check and save all request paremeters
            result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAProblemParameters', recordValues, activity_type_copy, ordering_seq_copy);
            var res = eval("(" + result.jsonExpression + ")");
            
            if (res.found == 1) {
                if (this.tabs.adding) {
                    View.confirm(getMessage("confirmDelete"), function(button){
                        if (button == 'yes') {
                            createSlaRequestParametersTabController.tabs.existing = true;
                        }
                        else {
                            isOK = false;
                        }
                    });
                }
                else {
                    if (res.conflict == 1) {
                        isOK = false;
                        var message = "";
                        if (this.tabs.makeCopy) {
                            this.tabs.makeCopy = false;
                            message = getMessage('copyConflict');
                        }
                        else {
                            message = getMessage('editConflict');
                        }
                        
                        View.showMessage('message', message, null, null, function(){
                            createSlaRequestParametersTabController.tabs.selectTab('select', null);
                        });
                    }
                    else {
                        this.tabs.existing = true;
                    }
                }
            }
            else 
                if (res.found == 0) {
                    this.tabs.existing = false;
                }
            
            this.tabs.activity_type = res.activity_type;
            this.tabs.ordering_seq = res.ordering_seq;
        } 
        catch (e) {
            isOK = false;
            Workflow.handleError(e);
        }
        
        return isOK;
        
    },
    
    /**
     * select the next tab
     */
    selectNextTab: function(){
    
        var responseTab = this.tabs.findTab('response');
        var probType = this.abHelpdeskSlaCreateProblemForm.getFieldValue('helpdesk_sla_request.prob_type');
        
        //if pm sla, first save default priority level and then load view 'ab-helpdesk-sla-create-pm-res-para.axvw'
        //if not pm sla, load view 'ab-helpdesk-sla-create-priority-level.axvw' to define or edit the priority level
        if (this.tabs.activity_type == 'SERVICE DESK - MAINTENANCE' && probType == 'PREVENTIVE MAINT') {
            insertDefaultPriority(this.tabs.activity_type, this.tabs.ordering_seq);
            responseTab.fileName = 'ab-helpdesk-sla-create-pm-res-para.axvw';
			//fix KB3030767 - set useFrame to false to avoid blank page when probType == 'PREVENTIVE MAINT' in Win7+tomcat6(Guo 2011/06/29)
            responseTab.useFrame = false;
            responseTab.loadView();
            this.tabs.selectTab('response', null, false, false, true);
        } else {
            responseTab.fileName = 'ab-helpdesk-sla-create-priority-level.axvw';
			var reqRest = new Ab.view.Restriction();
            reqRest.addClause('helpdesk_sla_request.ordering_seq', this.tabs.ordering_seq);
            reqRest.addClause('helpdesk_sla_request.activity_type', this.tabs.activity_type);
            this.tabs.selectTab('priority', reqRest);
        }
    }
});

function selectBuidingCode(){
    var siteCode = View.panels.get('abHelpdeskSlaCreateProblemForm').getFieldValue('helpdesk_sla_request.site_id');
    var restriction = null;
    if (siteCode) {
        restriction = new Ab.view.Restriction();
        restriction.addClause("bl.site_id", siteCode + "%", "LIKE");
    }
    View.selectValue("abHelpdeskSlaCreateProblemForm", getMessage('buidingCode'), ["helpdesk_sla_request.bl_id", "helpdesk_sla_request.site_id"], "bl", ["bl.bl_id", "bl.site_id"], ["bl.bl_id", "bl.name", "bl.site_id"], restriction);
}


function selectActivityType(){
    var restriction = "activitytype.activity_type LIKE 'SERVICE DESK%'";
    View.selectValue("abHelpdeskSlaCreateProblemForm", getMessage('requestType'), ["helpdesk_sla_request.activity_type"], "activitytype", ["activitytype.activity_type"], ['activitytype.activity_type', 'activitytype.description'], restriction, onChangeActivityType);
}

function selectProbType(){
    View.selectValue("abHelpdeskSlaCreateProblemForm", getMessage('probType'), ["helpdesk_sla_request.prob_type"], "probtype", ["probtype.prob_type"], ['probtype.prob_type', 'probtype.description'], null, onChangeProbType,true, true, null, null, null,"hierTree");
}

/**
 * Called if activity_type is changed<br />
 * If activity_type is SERVICE DESK - MAINTENANCE, enable field for problem type, else disable
 * @param {String} fieldName name of updated field
 * @param {String} newValue new value
 * @param {String} oldValue old value
 */
function onChangeActivityType(fieldName, newValue, oldValue){
    var controller = createSlaRequestParametersTabController;
    var form = controller.abHelpdeskSlaCreateProblemForm;
    
    if (newValue == 'SERVICE DESK - MAINTENANCE') {
        form.enableField("helpdesk_sla_request.prob_type", true);
    }
    else {
        form.enableField("helpdesk_sla_request.prob_type", false);
        form.setFieldValue("helpdesk_sla_request.prob_type", "");
    }
    
    var probType = form.getFieldValue('helpdesk_sla_request.prob_type');
    if (probType == 'PREVENTIVE MAINT') {
        controller.showFields(createSlaRequestParametersTabController.pmRequestParameterFileds);
    }
    else {
        controller.showFields(createSlaRequestParametersTabController.requestParameterFileds);
    }
}

function onChangeProbType(fieldName, newValue, oldValue){
    var controller = createSlaRequestParametersTabController;
    var form = controller.abHelpdeskSlaCreateProblemForm;
    var probType = newValue;
    if (probType == 'PREVENTIVE MAINT') {
        controller.showFields(createSlaRequestParametersTabController.pmRequestParameterFileds);
    }
    else {
        controller.showFields(createSlaRequestParametersTabController.requestParameterFileds);
    }
}


function insertDefaultPriority(activityType, orderingSeq){
    var isOK = true;
    var prioritiesJSON = "[{priority : 1,label:'Default'}]";
    var record = new Object();
    record['helpdesk_sla_request.activity_type'] = activityType;
    record['helpdesk_sla_request.ordering_seq'] = orderingSeq;
    
    var parameters = {
        fields: toJSON(record),
        priorities: prioritiesJSON
    };
    var result = {};
    //Save response parameters for a priority level of an SLA,file='ServiceLevelAgreementHandler.java'
    try {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAPriorityLevels', record, prioritiesJSON);
        setDefaultResponseParameter(activityType, orderingSeq);
    } 
    catch (e) {
        isOK = false;
        Workflow.handleError(e);
    }
    return isOK;
}

function setDefaultResponseParameter(activityType, orderingSeq){
    var record = new Ab.data.Record();
    record.isNew = false;
    record.setValue("helpdesk_sla_response.activity_type", activityType);
    record.setValue("helpdesk_sla_response.ordering_seq", orderingSeq);
    record.setValue("helpdesk_sla_response.priority", 1);
    record.setValue('helpdesk_sla_response.autocreate_wr', 1);
    record.setValue('helpdesk_sla_response.autocreate_wo', 1);
    record.setValue('helpdesk_sla_response.notify_requestor', 0);
    
    record.oldValues = new Object();
    record.oldValues["helpdesk_sla_response.activity_type"] = activityType;
    record.oldValues["helpdesk_sla_response.ordering_seq"] = orderingSeq;
    record.oldValues["helpdesk_sla_response.priority"] = 1;
    View.dataSources.get("abHelpdeskSlaCreateProblem_helpdesk_sla_responseDS").saveRecord(record);
}
