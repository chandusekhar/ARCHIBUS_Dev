var reviewRequestTabsController = View.createController("reviewRequestTabsController", {

    afterInitialDataFetch: function(){
        this.inherit();
        var tabs = View.getControl('', 'reviewRequestTabs');
        tabs.addEventListener('afterTabChange', this.onTabsChange);
        
        var detailsTab = tabs.findTab("details");
        detailsTab.enable(false);
        var WRdetailsTab = tabs.findTab("WRdetails");
        WRdetailsTab.enable(false);
    },
    
    onTabsChange: function(tabPanel, selectedTabName, newTabName){
        //disable the view tabs.
        var tabs = View.getControl('', 'reviewRequestTabs');
        
        if (selectedTabName == 'select') {
            var detailsTab = tabs.findTab("details");
            detailsTab.enable(false);
            var WRdetailsTab = tabs.findTab("WRdetails");
            WRdetailsTab.enable(false);
        }
        else 
            if (selectedTabName == 'details') {
                var WRdetailsTab = tabs.findTab("WRdetails");
                WRdetailsTab.enable(false);
                var selectTab = tabs.findTab("select");
                selectTab.enable(true);
            }
            else 
                if (selectedTabName == 'WRdetails') {
                    var detailsTab = tabs.findTab("details");
                    detailsTab.enable(false);
                    var selectTab = tabs.findTab("select");
                    selectTab.enable(true);
                }
    }
});
