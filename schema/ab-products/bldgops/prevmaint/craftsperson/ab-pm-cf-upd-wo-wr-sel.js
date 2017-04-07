var updateSelectController = View.createController('updateSelectController', {

    afterInitialDataFetch: function(){
        var tabs = View.parentTab.parentPanel;
        tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        tabs.isCfUpdate = true;
        tabs.disableTab('updateWrLabor');
        tabs.disableTab('resources');
        tabs.disableTab('updateWr');
        this.cf_upd_wo_sel_wr_report.restriction = "wr.wr_id = -1";
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        var tabs = View.parentTab.parentPanel;
        if (newTabName == 'select') {
            this.cf_upd_wo_sel_wo_report.refresh();
			this.cf_upd_wo_sel_wr_report.clear();
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWrLabor') {
            tabs.disableTab('resources');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'resources') {
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('updateWr');
        }
        if (newTabName == 'updateWr') {
            tabs.disableTab('updateWrLabor');
            tabs.disableTab('resources');
        }
    }
});
