
function filterWorkRequests() {
	var console = View.panels.get('exTabsWizardFindFilter_wrConsole');
    var restriction = console.getFieldRestriction();
    
    // apply restriction to the tabbed view and select the second page
    var tabPanel = View.getView('parent').panels.get('exTabsWizardFind_tabs');
    tabPanel.findTab('exTabsWizardFind_page2').restriction = restriction;
    tabPanel.findTab('exTabsWizardFind_page3').restriction = restriction;
    tabPanel.selectTab('exTabsWizardFind_page2');
}

function clearFilter() {
	var tabPanel = View.getView('parent').panels.get('exTabsWizardFind_tabs');
	var restriction = "";
    tabPanel.findTab('exTabsWizardFind_page2').restriction = restriction;
    tabPanel.findTab('exTabsWizardFind_page3').restriction = restriction;
    tabPanel.selectTab('exTabsWizardFind_page2');
}