// ab-view-nav-switcher.js
// reloads a selected view into the viewContent frame 
// by calling Ab.view.ViewPanel.loadView()
//
var controller = View.createController('umbrellaSwitcher', {


	afterInitialDataFetch: function() {
		// get the Ab.view.ViewPanel for the navigator's content frame
		// 
		var topViewContentPanel = top.View.panels.get('viewContent');
		if (typeof topViewContentPanel == 'undefined' || topViewContentPanel == null) {
			alert('Please open this view from within the Process Navigator or the My Dashboard.');
			return;
		}
		// content view's viewName
		var contentViewName = topViewContentPanel.fileName.substring(topViewContentPanel.fileName.lastIndexOf('/') + 1);
		
		var topViewContentPanelSrc = topViewContentPanel.frame.src

		// form the desired view name from the day (formerly the closest week day)
		var weekdays = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
		var now = new Date();
		var displayDayIndex = Math.max(0, Math.min(6, now.getDay()));
		var displayDayName = weekdays[displayDayIndex].toLowerCase();

		var viewName = 'ab-view-nav-' + displayDayName + '.axvw';

		
		alert('Navigating to view for ' + weekdays[displayDayIndex] + ' now.');

		// switch top level view to the desired view
		if (contentViewName != viewName) {
			topViewContentPanel.loadView(viewName);
		}
	}
});