var ContactByBldgController = View.createController('ContactByBldgController', {
	form_ContactByBldg_bldg_afterRefresh: function(){
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
    		this.form_ContactByBldg_bldg.setFieldLabel("bl.total_suite_manual_area",getMessage("total_suite_manual_area_title") + " " + View.user.areaUnits.title);
    		this.form_ContactByBldg_bldg.setFieldLabel("bl.total_suite_usable_area",getMessage("total_suite_usable_area_title") + " " + View.user.areaUnits.title);
    	}else{
    		this.form_ContactByBldg_bldg.setFieldLabel("bl.total_suite_manual_area",getMessage("total_suite_manual_area_title"));
    		this.form_ContactByBldg_bldg.setFieldLabel("bl.total_suite_usable_area",getMessage("total_suite_usable_area_title"));
    	}
		formatCurrency(this.form_ContactByBldg_bldg);
	}
});
