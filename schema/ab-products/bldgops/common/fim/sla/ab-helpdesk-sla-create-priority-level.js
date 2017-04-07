var createSlaPriorityLevelTabsController = View.createController('createSlaPriorityLevelTabsController', {
	
    tabs: null,
	
    priorityLevelTabs: null,
    
    afterLayout: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.priorityLevelTabs = View.getControlsByType(self, 'tabs')[0];
        this.createSubTabs();
        this.priorityLevelTabs.addEventListener('afterTabChange', this.onTabsChange);
        this.priorityLevelTabs.selectTab("priority_tab_1",null, false, false, true);
		this.priorityLevelTabs.tabPanel.remove(0);
    },
    
    createSubTabs: function(){
        for (var i = 0; i < 5; i++) {
            var level = i + 1;
            if (this.tabs.priorities[i] != "") {
                var priorityLevelTitle = this.tabs.priorities[i];
                createPriorityLevelTab(level, priorityLevelTitle);
            }
        }
    },
    
    onTabsChange: function(tabPanel, selectedTabName, newTabName){
        var priorityLevelTabs = createSlaPriorityLevelTabsController.priorityLevelTabs;
        priorityLevelTabs.currentTab = priorityLevelTabs.findTab(selectedTabName);
        priorityLevelTabs.currentTab.loadView();
    }
});

function createPriorityLevelTab(level, priorityLevelTitle){
    // create Tab object
    var tab = new Ab.tabs.Tab({
        name: "priority_tab_" + level,
        title: priorityLevelTitle,
        fileName: 'ab-helpdesk-sla-create-priority-level-tab.axvw',
        selected: false,
        enabled: true,
        hidden: false,
        useParentRestriction: false,
        isDynamic: false,
        useFrame: false,
        createTabPanel: createPriorityLevelTabPanel
    });
    
    tab.priority = level;
    createSlaPriorityLevelTabsController.priorityLevelTabs.addTab(tab);
    tab.createTabPanel();
}

function createPriorityLevelTabPanel(){
    // create managed iframe
    this.frame = new Ext.ux.ManagedIFrame({
        autoCreate: {
            width: '100%',
            height: '100%'
        }
    });
    this.frame.setStyle('border', 'none');
    
    //this.loadView();
    
    // create Ext.Panel with the iframe as content
    var tabPanel = this.parentPanel.tabPanel.add({
        id: this.name,
        title: this.title,
        contentEl: this.frame,
        autoWidth: true,
        autoHeight: false,
        border: false,
        closable: false
    });
    this.tabPanel = tabPanel;
    this.id = this.name;
}
