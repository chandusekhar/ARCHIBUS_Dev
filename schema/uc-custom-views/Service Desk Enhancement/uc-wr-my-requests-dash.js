var ucWrWebSiteController = View.createController('ucWrWebSiteController', {
	afterViewLoad: function() {
/* 		var websiteDisplay = View.panels.get("websiteDisplay");
		websiteDisplay.loadView('http://wcmprod2.ucalgary.ca/fmd/archibus/faqs');
		var test = 1; */
	},
	
	afterInitialDataFetch: function() {
		var websiteDisplay = View.panels.get("websiteDisplay");
		websiteDisplay.show(true);
		websiteDisplay.loadView('uc-wr-my-requests.axvw');
	}
});

function backHome() {
	var topViewContentPanel = top.View.panels.get('viewContent');
	var contentViewName = topViewContentPanel.fileName.substring(topViewContentPanel.fileName.lastIndexOf('/') + 1);
	topViewContentPanel.loadView('/archibus/schema/uc-custom-views/Service Desk Enhancement/'+contentViewName);
}

function openMyInfo() {
	var vw = "uc-my-info.axvw";
	View.openDialog(vw, '', false, {
		width: 550,
		height: 500,
		closeButton: true
	});
}