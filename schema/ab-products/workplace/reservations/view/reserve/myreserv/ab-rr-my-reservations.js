/**
 * Controls the tabbed views
 * ab-rr-my-reservations.axvw
 * ../rmres/ab-rr-add-room-reservation.axvw
 * ../rmres/ab-rr-add-resource-reservation.axvw
 */
var reservationTabsController = View.createController("reservationTabsController",{
	
	selectRoomTab: "selectRoomReservation",
	selectResourceTab: "selectResourceReservation",
	previousTab: null,
	
	afterViewLoad: function() {
		this.tabs.addEventListener('beforeTabChange', this.tabs_beforeTabChange.createDelegate(this));
		this.tabs.addEventListener('beforeTabClose', this.tabs_beforeTabClose.createDelegate(this));
	},
	
	tabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		var proceed = true;
		if (newTabName == this.selectRoomTab) {
			if (currentTabName != this.selectResourceTab) {
				tabPanel.closeTab(currentTabName);
				if (this.selectResourceTab == this.previousTab) {
					this.previousTab = null;
					/* 
					 * When closing the New Resource Reservation tab (using close button),
					 * switch to the Select Resource Reservation tab.
					 */
					tabPanel.selectTab(this.selectResourceTab);
					proceed = false;
				}
			}
		} else if (newTabName == this.selectResourceTab) {
			if (currentTabName != this.selectRoomTab) {
				tabPanel.closeTab(currentTabName);
			}
		} else if (currentTabName == this.selectRoomTab) {
			this.previousTab = currentTabName;
			var newTab = tabPanel.findTab(newTabName);
			newTab.setTitle(getMessage("roomReservation"));
			tabPanel.disableTab(this.selectRoomTab);
			tabPanel.disableTab(this.selectResourceTab);
		} else {
			this.previousTab = currentTabName;
			var newTab = tabPanel.findTab(newTabName);
			newTab.setTitle(getMessage("resourceReservation"));
			tabPanel.disableTab(this.selectRoomTab);
			tabPanel.disableTab(this.selectResourceTab);
		}
		return proceed;
	},

	tabs_beforeTabClose: function(tabPanel, tabName) {
		tabPanel.enableTab(this.selectRoomTab);
		tabPanel.enableTab(this.selectResourceTab);
		return true;
	}

});
