View.createController('abSpSuUnaccCtrl', {
	//Statistic config object.
	gridFlds_statConfig: {
		formulas: ["sum"],
		fields: ["su.area_usable", "su.area_rentable"]
	},
	
	afterViewLoad: function(){
		//add Totals row to grid
		this.abSpSuUnaccounted_detailsSu.setStatisticAttributes(this.gridFlds_statConfig);
	},
	
    abSpSuUnaccounted_detailsFl_afterRefresh: function(){
        var flPanel = this.abSpSuUnaccounted_detailsFl;
        if (flPanel.restriction != null) {
            flPanel.setTitle(getMessage('setTitleForFl') + ' ' + flPanel.restriction['bl.bl_id']);
        }
    },
    
    abSpSuUnaccounted_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuUnaccounted_detailsSu;
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + suPanel.restriction['fl.bl_id'] + "-" + suPanel.restriction['fl.fl_id']);
    }
})
