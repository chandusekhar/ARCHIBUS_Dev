//@lei
var abOndemandManageTabsController = View.createController("abOndemandManageTabsController", {

    afterInitialDataFetch: function(){
        this.inherit();
        var abHpdWorkOrderMngTabs = View.panels.get("abHpdWorkOrderMngTabs");
        abHpdWorkOrderMngTabs.addEventListener('afterTabChange', this.onTabsChange);
        var view = abHpdWorkOrderMngTabs.findTab("details");
        view.enable(false);
        var view = abHpdWorkOrderMngTabs.findTab("editWorkrequest");
        view.enable(false);
        var view = abHpdWorkOrderMngTabs.findTab("editDocuments");
        view.enable(false);
    },
    // control the tab show when the tabs change
    onTabsChange: function(tabPanel, selectedTabName, newTabName){
        //disable the view tabs.
        var abHpdWorkOrderMngTabs = View.panels.get("abHpdWorkOrderMngTabs");
        if (selectedTabName == 'select') {
            var view = abHpdWorkOrderMngTabs.findTab("details");
            view.enable(false);
            var view = abHpdWorkOrderMngTabs.findTab("editWorkrequest");
            view.enable(false);
            var view = abHpdWorkOrderMngTabs.findTab("editDocuments");
            view.enable(false);
            abHpdWorkOrderMngTabs.refreshTab('select');
            
        }
        if (selectedTabName == 'details') {
            var view = abHpdWorkOrderMngTabs.findTab("editWorkrequest");
            view.enable(false);
            var view = abHpdWorkOrderMngTabs.findTab("editDocuments");
            view.enable(false);
            
        }
        if (selectedTabName == 'editWorkrequest') {
            var view = abHpdWorkOrderMngTabs.findTab("details");
            view.enable(false);
            var view = abHpdWorkOrderMngTabs.findTab("editDocuments");
            view.enable(false);
            abHpdWorkOrderMngTabs.refreshTab('editWorkrequest');
            
        }
        if (selectedTabName == 'editDocuments') {
            var view = abHpdWorkOrderMngTabs.findTab("details");
            view.enable(false);
            var view = abHpdWorkOrderMngTabs.findTab("editWorkrequest");
            view.enable(false);
            
        }
        if (selectedTabName) {
            var view = abHpdWorkOrderMngTabs.findTab("select");
            view.enable(true);
            
            
        }
    }
});

