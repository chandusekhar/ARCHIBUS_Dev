var abMoveCommonCtrl = View.createController('abMoveCommonCtrl',{
	afterViewLoad: function(){
		if(this.tabs_abMoveReview){
			hideMoveAndActionTabs(this.tabs_abMoveReview);
		} 
		if(this.tabs_abMoveReviewData){
			hideMoveAndActionTabs(this.tabs_abMoveReviewData);
		} 
		if(this.tabs_abMoveReviewVoice){
			hideMoveAndActionTabs(this.tabs_abMoveReviewVoice);
		} 
		if(this.tabs_abMoveRoute){
			hideMoveAndActionTabs(this.tabs_abMoveRoute);
		}
		if(this.tabs_abMoveIssue){
			hideMoveAndActionTabs(this.tabs_abMoveIssue);
		}
		if(this.tabs_abMoveComplete){
			hideMoveAndActionTabs(this.tabs_abMoveComplete);
		}
	}
});

// Used to hide the move and action tabs when starting the Edit Moves view

function hideMoveAndActionTabs(tabs)
{
	if (tabs != null) {
		tabs.hideTab("page1");
		tabs.hideTab("page2");
		tabs.hideTab("page3");
		tabs.hideTab("page4");
		tabs.hideTab("page5");
		tabs.hideTab("page6");
	}
}
