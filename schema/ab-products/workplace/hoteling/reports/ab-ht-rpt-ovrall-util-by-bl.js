var roomsUtilizationByBlController = View.createController('roomsUtilizationByBlController', {
	afterViewLoad: function(){
		this.rmUtilizationBlChart.show(false);
	},

	blFilterConsole_onSearch: function(){
		var siteId = this.blFilterConsole.getFieldValue('bl.site_id');
		var blId = this.blFilterConsole.getFieldValue('bl.bl_id');
        if (siteId) {
            this.rmUtilizationBlChart.addParameter('siteId', "='" + siteId+"'");
        }
        else {
           this.rmUtilizationBlChart.addParameter('siteId', 'IS NOT NULL');
        }

        if (blId) {
            this.rmUtilizationBlChart.addParameter('blId', "='" + blId+"'");
        }
        else {
            this.rmUtilizationBlChart.addParameter('blId', 'IS NOT NULL');
        }
		this.rmUtilizationBlChart.refresh();
		this.rmUtilizationBlChart.show(true);
    },

    blFilterConsole_onClear: function(){
		this.blFilterConsole.clear();
		this.rmUtilizationBlChart.show(false);
    }
})

function onBlBarChartClick(obj){
    var blId = obj.selectedChartData['rm.bl_id'];
	if(blId){
		var url = 'ab-ht-rpt-ovrall-util-by-bl-fl.axvw?blId=' + blId;
		window.open(url);
	}
}
