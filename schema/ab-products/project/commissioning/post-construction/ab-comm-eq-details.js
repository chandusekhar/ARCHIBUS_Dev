var commEqDetailsController = View.createController('commEqDetails', {
	commEqDetailsConsole_onShow:function(){
		var consoleRestriction = this.commEqDetailsConsole.getFieldRestriction();
		this.commEqDetailsForm.refresh(consoleRestriction);
	    this.commEqDetailsForm.show(true);
	    var eq_id = this.commEqDetailsForm.getFieldValue('eq.eq_id');
	    if (valueExists(eq_id)) {
	    	var restriction = new Ab.view.Restriction();
	    	restriction.addClause('eq.eq_id', eq_id, '=');
		    var tabPanel = this.commEqDetailsTabs;
		    tabPanel.findTab('commEqDetailsTabsPage1').restriction = restriction;
		    tabPanel.findTab('commEqDetailsTabsPage2').restriction = restriction;
		    tabPanel.findTab('commEqDetailsTabsPage3').restriction = restriction;
		    tabPanel.findTab('commEqDetailsTabsPage4').restriction = restriction;
		    tabPanel.findTab('commEqDetailsTabsPage5').restriction = restriction;
		    tabPanel.findTab('commEqDetailsTabsPage6').restriction = restriction;
		    tabPanel.selectTab('commEqDetailsTabsPage3');
	    }
	    
	}
});

