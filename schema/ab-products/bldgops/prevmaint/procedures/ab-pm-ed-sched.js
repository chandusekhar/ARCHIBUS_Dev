/**
 * @author keven.xi
 */
var editPMSchedController = View.createController('editPMSched', {

    /**
     * pmp_type : 'EQ' or 'HK'
     */
    pmpType: "",
    
    afterInitialDataFetch: function(){
        this.showInformationInForm(this, this.pms_info, "");
        var openerController = View.getOpenerView().controllers.get("assignPM");
        this.pmpType = openerController.pmpType;
        if (this.pmpType == 'EQ') {
            this.pms_rm_basic.show(false);
        }
        if (this.pmpType == 'HK') {
            this.pms_eq_basic.show(false);
            updateIntervalTypeOptions();
        }
        setTaskPriorityOptions();
        $("taskPriority").value = this.pms_other.getFieldValue("pms.priority");
    },
    
    pms_info_onSave: function(){
        //get the syncronized record
        var pmsRecord = this.syncPanelPmsRecord();
        pmsRecord.setValue("pms.priority", $("taskPriority").value);
        var pmsDS = View.dataSources.get("ds_ab-pm-ed-sched_edit_pms");
        try {
            pmsDS.saveRecord(pmsRecord);
        } 
        catch (e) {
            var message = getMessage('errorSave');
            View.showException(e, message);
            return;
        }
        //get message from view file			 
        var message = getMessage('formSaved');
        //show text message in the form
        this.pms_info.displayTemporaryMessage(message);
    },
    
    /**
     * syncronize records of multi panels while in same DataSource to one record.
     * @param {ab.data.record} kbItem
     */
    syncPanelPmsRecord: function(){
        var item = this.pms_info.getRecord();
        
        View.panels.each(function(panel){
            if ((panel.getRecord) && (panel.visible)) {
                panel.getRecord();
                panel.fields.each(function(field){
                    item.setValue(field.getFullName(), field.getStoredValue());
                });
            }
        });
        return item;
    },
    
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    }
});

function updateIntervalTypeOptions(){
    var intervalType = View.panels.get("pms_schedule").getFieldElement("pms.interval_type");
    var options = intervalType.options;
    intervalType.remove(getIndexofValue("i", options));
    intervalType.remove(getIndexofValue("h", options));
    intervalType.remove(getIndexofValue("e", options));
}

function getIndexofValue(value, options){
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == value) {
            return i;
        }
    }
    return -1;
}
