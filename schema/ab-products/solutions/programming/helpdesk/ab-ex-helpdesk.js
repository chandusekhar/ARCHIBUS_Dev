/**
 * Controller.
 */
var helpdeskRequestorController = View.createController('helpdeskRequestorController', {
    
    /**
     * True if auto-refresh is on.
     */
    autoRefreshEnabled: false,
    
    /**
     * Auto-refresh interval in seconds.
     */
    autoRefreshInterval: 60,
    
    afterViewLoad: function() {

        // if the calling view has a requestTabs panel, make it the main panel of the view
        // so that it will be refreshed during initialDataFetch
        // TODO: consider adding <panel ... mainPanel="true"> or <view mainPanel="..."> to AXVW format.
        if (this.requestTabs) {
            View.mainPanelId = this.requestTabs.id;
        }
    },
    
    afterInitialDataFetch: function() {
        this.inherit();
		
        if (this.mainPanel) {
			this.refreshView();
			
			Ext.get('autoRefreshMsg').dom.innerHTML = ' ' + getMessage('autoRefreshMessage');
			//Ext.get('autoRefresh').dom.nextSibling.innerHTML = ' ' + getMessage('autoRefreshMessage');
			Ext.get('autoRefresh').addListener('click', this.refreshPanel_onAutoRefresh, this);
			
			// start auto-refresh background task using Ext.util.TaskRunner
			var controller = this;
			var task = {
				run: function(){
					if (controller.autoRefreshEnabled) {
						// refresh the UI
						controller.refreshView();
					}
				},
				interval: 1000 * controller.autoRefreshInterval
			}
			var runner = new Ext.util.TaskRunner();
			runner.start(task);
		}
    },
	
    /**
     * Refreshes action items lists in all tabs.
     */
    refreshView: function() {
		this.mainPanel.refresh();
		
		var lastRefreshed = new Date().format('g:i:s A');
		Ext.get('lastRefresh').dom.innerHTML = getMessage('lastRefreshMessage') + ': ' + lastRefreshed;
    },
	
    // ----------------------- event handlers -----------------------------------------------------
    
    /**
     * User has changed the Auto Refresh checkbox value.
     * @param {Object} e
     * @param {Object} checkbox
     */
    refreshPanel_onAutoRefresh: function(e, checkbox) {
        this.autoRefreshEnabled = checkbox.checked;
    },
    
    /**
     * User has clicked on the Refresh button.
     */
    refreshPanel_onRefresh: function() {
        this.refreshView();
    },
	
	/**
	 * 
	 */
    mainPanel_afterRefresh: function() {
        // set the instruction message depending on the user identity
        var message = View.user.isGuest ? getMessage('recentItemsHeaderGuest') 
                                        : getMessage('recentItemsHeader');
        if (this.mainPanel.gridRows.getCount() == 0) {
            message = getMessage('recentItemsHeaderNone');
        }
        this.refreshPanel.setTitle(message);
        
        // highlight request status colors
        this.highlightStatusColors(this.mainPanel);
    },
    
    /**
     * Hightlights status codes with colors in all rows of a specified grid panel.
     */
    highlightStatusColors: function(grid) {
        grid.gridRows.each(function(row) {
            var status = row.getRecord().getValue('activity_log.status');
            var color = '#707070';
            switch (status) {
                case 'APPROVED': color = '#32cd32'; break;  
                case 'COMPLETED': color = '#4040f0'; break;  
                case 'REJECTED': color = '#f04040'; break;  
            };
            var cell = row.cells.get('activity_log.status');
            Ext.get(cell.dom).setStyle('color', color);
            Ext.get(cell.dom).setStyle('font-weight', 'bold');
        });
    },

    /**
     * Event handler for the Withdraw link.
     */
    requestReport_onWithdraw: function() {
        var record = this.requestReport.getOutboundRecord();
        
        var actionId = record.getValue('activity_log.activity_log_id');
        var actionTitle = record.getValue('activity_log.action_title');
        var description = record.getValue('activity_log.description');
    
        var message = String.format(getMessage('confirmWithdraw'), actionId, actionTitle, description);
    
        // ask user to confirm
        var controller = this;
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    record.setValue('activity_log.status', 'CANCELLED');
                    controller.mainDataSource.saveRecord(record);  

                    controller.requestReport.show(false);
                    controller.requestMessage.show(true);
                    controller.mainPanel.refresh();
                    
                    var message = String.format(getMessage('messageWithdraw'), record.getValue('activity_log.activity_log_id'));
                    controller.requestMessage.setInstructions(message);
                    
                } catch (e) {
                    var message = String.format(getMessage('errorWithdraw'), actionId);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },
    
    refreshPanel_onToggle: function() {
        var layout = View.getLayoutManager('mainLayout');
        if (layout.isRegionCollapsed('east')) {
            layout.expandRegion('east');
        } else {
            layout.collapseRegion('east');
        }
    }
});
