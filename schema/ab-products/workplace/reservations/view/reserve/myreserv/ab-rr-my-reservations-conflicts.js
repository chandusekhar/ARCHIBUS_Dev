/**
 * Controls the tabbed view
 * ab-rr-my-reservations-conflicts.axvw
 */
var reservationConflictsTabsController = View.createController("reservationConflictsTabsController",{
	
	selectRoomTab: "selectRoomReservation",
	previousTab: null,
	
	afterViewLoad: function() {
		this.tabs.addEventListener('beforeTabChange', this.tabs_beforeTabChange.createDelegate(this));
		this.tabs.addEventListener('beforeTabClose', this.tabs_beforeTabClose.createDelegate(this));
	},
	
	tabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		var proceed = true;
		if (newTabName == this.selectRoomTab) {
			tabPanel.closeTab(currentTabName);
		} else {
			this.previousTab = currentTabName;
			var newTab = tabPanel.findTab(newTabName);
			newTab.setTitle(getMessage("roomReservation"));
			tabPanel.disableTab(this.selectRoomTab);
		}
		return proceed;
	},

	tabs_beforeTabClose: function(tabPanel, tabName) {
		tabPanel.enableTab(this.selectRoomTab);
		return true;
	}

});
