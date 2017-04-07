/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-view-tabs.axvw' target='main'>ab-helpdesk-request-view-tabs.axvw</a>
 */

/**
 * Called when form is loaded
 * <div class='detailHead'>Pseudo-code:</div>
*	<ol>
*		<li>Check if url contains activity_log_id</li>
* 		<li>If so, check if current user is allowed to view request</li>
* 		<li>Call WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#checkUserForRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-checkUserForRequest</a></li>
*	</ol> 
*/
View.createController('requestTabs', {
	
    afterInitialDataFetch: function() {	
        this.tabs.setTabEnabled('view', false);
        this.tabs.setTabEnabled('viewArchived', false);
	
		//check URL
		if (top)
			temp = unescape(top.location.search);
		else
			temp = unescape(document.location.search);
	
		//url + ?activity_log_id=xxx
		if(temp != ""){
			//check if current user may view the request details
			var activity_log_id = temp.substr(temp.indexOf("=")+1, temp.length);
			 
			try {
			    var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-checkUserForRequest',activity_log_id,'view');
				if (result.data.check){
					var restriction = new AFM.view.Restriction();
					restriction.addClause("activity_log.activity_log_id", result.data.activity_log_id, "=");
					this.tabs.selectTab('view', restriction);
				} 
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	}
});