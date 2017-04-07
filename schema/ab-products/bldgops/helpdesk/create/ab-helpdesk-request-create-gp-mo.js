var abOndReqCreateController = View.createController("abOndReqCreateController",{
	basicRestriction: null,
	
	afterInitialDataFetch: function() {
	      this.helpDeskRequestTabs.selectTab('basic',{"activitytype.activity_type": 'SERVICE DESK - GROUP MOVE'}, true);
	}
});