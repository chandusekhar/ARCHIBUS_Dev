var ucWrWebSiteController = View.createController('ucWrWebSiteController', {
	afterViewLoad: function() {
/* 		var websiteDisplay = View.panels.get("websiteDisplay");
		websiteDisplay.loadView('http://wcmprod2.ucalgary.ca/fmd/archibus/faqs');
		var test = 1; */
	},
	
	afterInitialDataFetch: function() {
		var websiteDisplay = View.panels.get("websiteDisplay");
		websiteDisplay.show(true);
		websiteDisplay.loadView('http://wcmprod2.ucalgary.ca/fmd/archibus/faqs');
		//document.getElementById("websiteDisplay_iframe").style.visibility="visible";
		var test = 1;
	}
});

function backHome() {
	var topViewContentPanel = top.View.panels.get('viewContent');
	var contentViewName = topViewContentPanel.fileName.substring(topViewContentPanel.fileName.lastIndexOf('/') + 1);
	topViewContentPanel.loadView('/archibus/schema/uc-custom-views/Service Desk Enhancement/'+contentViewName);
}