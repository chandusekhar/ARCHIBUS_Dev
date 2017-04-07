/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workrequest-review.axvw' target='main'>ab-helpdesk-workrequest-review.axvw</a>
 */
var wrreviewController = View.createController('wrreview', {

    /**
     * Called when loading the form<br />
     * Show workflow step history<br />
     */
	locArray:[],
    panelRequest_afterRefresh: function(){
        if (!valueExists(this.panelRequest.restriction)) {
            return;
        }
        this.loadPanelsRecord();
        var step = this.panelRequest.getFieldValue("wr_step_waiting.step_type").toLowerCase();
        if (step != 'estimation') 
            $("estimate").style.display = 'none';
        if (step != 'scheduling') 
            $("schedule").style.display = 'none';
		ABODC_showPriorityLevel('wr', 'wr_id', 'priority', this.panelDesc, 'wr.priority');	
        ABODC_getStepInformation('wr', 'wr_id', this.panelRequest.getFieldValue("wr.wr_id"), this.panel_history, 'history', true);
    },
    
    loadPanelsRecord: function(){
        var loadedRecord = this.panelRequest.getRecord();
        this.panelLocation.setRecord(loadedRecord);
        this.panelEquip.setRecord(loadedRecord);
        this.panelDesc.setRecord(loadedRecord);
        this.panelDocs.setRecord(loadedRecord);
    },
	
	panel_history_afterRefresh: function(){
		ABODC_reloadHistoryPanel(this.panel_history);
    }
})
