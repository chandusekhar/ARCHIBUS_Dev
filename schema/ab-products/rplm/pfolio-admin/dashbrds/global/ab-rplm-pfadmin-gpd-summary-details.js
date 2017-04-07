var abRplmGpdSummaryDetailsController = View.createController('abRplmGpdSummaryDetailsController', {
	
	restriction: null,
	
	
	afterInitialDataFetch: function(){
		this.restriction =  this.view.restriction;
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
			var columns = this.abRplmGpdSummaryDetails.columns;
			var fieldDefs = this.abRplmGpdSummaryDetails.fieldDefs;
			for(var index in columns){
				if(columns[index].id=="bl.area_gross_int"){
					columns[index].name = getMessage("area_gross_int_title") + " " + View.user.areaUnits.title;
				}
				if(columns[index].id=="bl.area_avg_em"){
					columns[index].name = getMessage("area_avg_em_title") + " " + View.user.areaUnits.title;
				}
				if(columns[index].id=="bl.cost_sqft"){
					columns[index].name = getMessage("cost_sqft_title") + " " + View.user.areaUnits.title;
				}
			}
			for(var index in fieldDefs){
				if(fieldDefs[index].id=="bl.area_gross_int"){
					fieldDefs[index].title = getMessage("area_gross_int_title") + " " + View.user.areaUnits.title;
				}
				if(fieldDefs[index].id=="bl.area_avg_em"){
					fieldDefs[index].title = getMessage("area_avg_em_title") + " " + View.user.areaUnits.title;
				}
				if(fieldDefs[index].id=="bl.cost_sqft"){
					fieldDefs[index].title = getMessage("cost_sqft_title") + " " + View.user.areaUnits.title;
				}
			}
    	}else{
    		var columns = this.abRplmGpdSummaryDetails.columns;
    		var fieldDefs = this.abRplmGpdSummaryDetails.fieldDefs;
			for(var index in columns){
				if(columns[index].id=="bl.area_gross_int"){
					columns[index].name = getMessage("area_gross_int_title");
				}
				if(columns[index].id=="bl.area_avg_em"){
					columns[index].name = getMessage("area_avg_em_title");
				}
				if(columns[index].id=="bl.cost_sqft"){
					columns[index].name = getMessage("cost_sqft_title");
				}
			}
			for(var index in fieldDefs){
				if(fieldDefs[index].id=="bl.area_gross_int"){
					fieldDefs[index].title = getMessage("area_gross_int_title");
				}
				if(fieldDefs[index].id=="bl.area_avg_em"){
					fieldDefs[index].title = getMessage("area_avg_em_title");
				}
				if(fieldDefs[index].id=="bl.cost_sqft"){
					fieldDefs[index].title = getMessage("cost_sqft_title");
				}
			}
    	}
		this.abRplmGpdSummaryDetails.addParameter("status_owned", getMessage("option_status_owned"));
		this.abRplmGpdSummaryDetails.addParameter("status_leased", getMessage("option_status_leased"));
		this.abRplmGpdSummaryDetails.refresh(this.restriction);
	}
});	