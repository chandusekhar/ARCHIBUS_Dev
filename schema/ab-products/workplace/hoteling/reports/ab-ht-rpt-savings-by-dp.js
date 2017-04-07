var htSavingByDpController = View.createController(' htSavingByDpController', {

	chartPael: null,

    afterViewLoad: function(){
		this.htSavingSeatByDpChart.show(false);
		this.htSavingAreaByDpChart.show(false);
	},
	/**
	 * Show chart by restriction
	 */
    htSavingByDpConsole_onSearch: function(){
		var filterConsole = this.htSavingByDpConsole;
        var siteId = filterConsole.getFieldValue("bl.site_id");
		var blId = filterConsole.getFieldValue("rmpct.bl_id");
		var dvId = filterConsole.getFieldValue("rmpct.dv_id");
		var dpId = filterConsole.getFieldValue("rmpct.dp_id");
		var dateStart = filterConsole.getFieldValue("rmpct.date_start");
		var dateEnd = filterConsole.getFieldValue("rmpct.date_end");

		var selectedEL = document.getElementById("sum_type");
		var sumType = selectedEL.options[selectedEL.selectedIndex].value;
        if (sumType == 'seat') {
			this.htSavingAreaByDpChart.show(false);
			this.chartPanel = this.htSavingSeatByDpChart;
        }
        else  if (sumType == 'area') {
			this.htSavingSeatByDpChart.show(false);
			this.chartPanel = this.htSavingAreaByDpChart;
         } 

        if (siteId) {
            this.chartPanel.addParameter('siteId', "='" + siteId+"'");
        }
        else {
            this.chartPanel.addParameter('siteId', 'IS NOT NULL');
        }
        if (blId) {
            this.chartPanel.addParameter('blId', "='" + blId+"'");
        }
        else {
            this.chartPanel.addParameter('blId', 'IS NOT NULL');
        }
        if (dvId) {
            this.chartPanel.addParameter('dvId', "='" + dvId+"'");
        }
        else {
            this.chartPanel.addParameter('dvId', 'IS NOT NULL');
        }
        if (dpId) {
            this.chartPanel.addParameter('dpId', "='" + dpId+"'");
        }
        else {
            this.chartPanel.addParameter('dpId', 'IS NOT NULL');
        }

        if (dateStart != '') {
			this.chartPanel.addParameter('dateStart', dateStart);
        }else{
			this.chartPanel.addParameter('dateStart', '1900-12-15');
		}
        if (dateEnd != '') {
			this.chartPanel.addParameter('dateEnd', dateEnd);
        }else{
		    this.chartPanel.addParameter('dateEnd', '2200-12-15');
		}
		 this.chartPanel.refresh();
		 this.chartPanel.show(true);
    },
	/**
	 * Clear restriction of console
	 */
    htSavingByDpConsole_onClear: function(){
		var filterConsole = this.htSavingByDpConsole;
        filterConsole.clear();
        if(this.chartPanel){
			this.chartPanel.show(false);
		}
    }
})