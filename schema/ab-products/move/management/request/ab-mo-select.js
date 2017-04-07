// Selects which move form to display based on the selected move type

function selectMoveTab (row)
{
	var mo_type = row['mo.mo_type.raw'];

	if (mo_type == undefined) {
		mo_type = row['mo.mo_type'];
	}

	var restriction = row.grid.getPrimaryKeysForRow(row);
	
	var tabs = View.parentTab.parentPanel;

	switch (mo_type)
	{
    		case "Employee"  :
					tabs.showTab('page1')
					tabs.hideTab('page2')
					tabs.hideTab('page3')
					tabs.hideTab('page4')
					tabs.hideTab('page5')
					tabs.hideTab('page6')
					tabs.setTabsRestriction(restriction, 'page1');
					var tab = tabs.selectTab('page1');
					selectFirstVisibleTab(tab, "abMoEditEmContainer_tabs", restriction);
			     	break;
    		case "New Hire"  :
					tabs.showTab('page2')
					tabs.hideTab('page1')
					tabs.hideTab('page3')
					tabs.hideTab('page4')
					tabs.hideTab('page5')
					tabs.hideTab('page6')
					tabs.setTabsRestriction(restriction, 'page2'); 
					var tab = tabs.selectTab('page2');
					selectFirstVisibleTab(tab, "abMoEditHireContainer_tabs", restriction);
			     	break;
    		case "Leaving"   :
					tabs.showTab('page3')
					tabs.hideTab('page1')
					tabs.hideTab('page2')
					tabs.hideTab('page4')
					tabs.hideTab('page5')
					tabs.hideTab('page6')
					tabs.setTabsRestriction(restriction, 'page3'); 
					var tab = tabs.selectTab('page3');
					selectFirstVisibleTab(tab, "abMoEditLeavingContainer_tabs", restriction);
			     	break;
    		case "Equipment" :
					tabs.showTab('page4')
					tabs.hideTab('page1')
					tabs.hideTab('page2')
					tabs.hideTab('page3')
					tabs.hideTab('page5')
					tabs.hideTab('page6')
					tabs.setTabsRestriction(restriction, 'page4'); 
					tabs.selectTab('page4');
			     	break;
    		case "Asset"     :
					tabs.showTab('page5')
					tabs.hideTab('page1')
					tabs.hideTab('page2')
					tabs.hideTab('page3')
					tabs.hideTab('page4')
					tabs.hideTab('page6')
					tabs.setTabsRestriction(restriction, 'page5'); 
					tabs.selectTab('page5');
			     	break;
    		case "Room"      :
					tabs.showTab('page6')
					tabs.hideTab('page1')
					tabs.hideTab('page2')
					tabs.hideTab('page3')
					tabs.hideTab('page4')
					tabs.hideTab('page5')
					tabs.setTabsRestriction(restriction, 'page6'); 
					var tab = tabs.selectTab('page6');
					selectFirstVisibleTab(tab, "abMoEditRmContainer_tabs", restriction);
			     	break;
  	}
	
}

function selectFirstVisibleTab(tab, tabsName, restriction){
	var contentFrame = tab.getContentFrame();
	if (contentFrame.View) {
		var tabs = contentFrame.View.panels.get(tabsName);
		tabs.setTabsRestriction(restriction);
		tabs.selectFirstVisibleTab();
	}
}