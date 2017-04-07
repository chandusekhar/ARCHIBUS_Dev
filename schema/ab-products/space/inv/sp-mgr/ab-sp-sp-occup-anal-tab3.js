var abSpOccupAnalTab3Controller=abSpOccupAnalCommonController.extend({

	secondGroupByValueArray: new Array(
			"dp", "dv", "rmcat", "orate", "avAreaP", "avAreaS", "avAreaC", "headcount" 
	),
	secondGroupByTextArray: new Array(
	),

	groupByValueArray: new Array(
			"fl", "bl", "site", "dp", "rmcat" 
	),
	groupByTextArray: new Array(
	),
	
	dataAxixOptionValue: new Array(
			"area", "pct", "count" 
	),
	dataAxixOptionText: new Array(
	),
	
	localizeText: function(){
		this.secondGroupByTextArray.push(getMessage("dp"));
		this.secondGroupByTextArray.push(getMessage("dv"));
		this.secondGroupByTextArray.push(getMessage("rmcat"));
		this.secondGroupByTextArray.push(getMessage("orate"));
		this.secondGroupByTextArray.push(getMessage("avp"));
		this.secondGroupByTextArray.push(getMessage("avs"));
		this.secondGroupByTextArray.push(getMessage("avc"));
		this.secondGroupByTextArray.push(getMessage("hcount"));

		this.groupByTextArray.push(getMessage("fl"));
		this.groupByTextArray.push(getMessage("bl"));
		this.groupByTextArray.push(getMessage("site"));
		this.groupByTextArray.push(getMessage("dp"));
		this.groupByTextArray.push(getMessage("rmcat"));

		this.dataAxixOptionText.push(getMessage("area"));
		this.dataAxixOptionText.push(getMessage("pct"));
		this.dataAxixOptionText.push(getMessage("rcount"));
	},

	afterInitialDataFetch: function(){
		this.localizeText();
	
		this.initialView(this.abSpOccupAnalTab3Console);
		setTimeTitle(this.abSpOccupAnalTab3Console);
		this.initialDateRangeTitle();
	},

	showOccupancyRateChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAverageAreaChart.show(false);
		this.abRmpctHrmpctHeadCountChart.show(false);
		this.abRmpctHrmpctAverageAreaPerCatChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.addParameter('excludeVacant',	"Vacant Rate");
		this.showOccupancyRateChartCommon();
		this.abRmpctHrmpctOccupancyRateChart.setTitle(this.getTitleText());
	},

	showNormalStackPlanChart: function(){
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctAverageAreaChart.show(false);
		this.abRmpctHrmpctHeadCountChart.show(false);
		this.abRmpctHrmpctAverageAreaPerCatChart.show(false);
		this.showNormalStackPlanChartCommon();
		this.abRmpctHrmpctCalculationStackPlanChart.setTitle(this.getTitleText());
	},

	showNormalStackPlanAreaChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctAverageAreaChart.show(false);
		this.abRmpctHrmpctHeadCountChart.show(false);
		this.abRmpctHrmpctAverageAreaPerCatChart.show(false);
		this.showNormalStackPlanAreaChartCommon();
		this.abRmpctHrmpctAreaCalculationStackPlanChart.setTitle(this.getTitleText());
	},

	showAverageAreaChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctHeadCountChart.show(false);
		this.abRmpctHrmpctAverageAreaPerCatChart.show(false);
		this.showAverageAreaChartCommon();
		this.abRmpctHrmpctAverageAreaChart.setTitle(this.getTitleText());
	},

	showAverageAreaPerCatChart: function(){
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctHeadCountChart.show(false);
		this.abRmpctHrmpctAverageAreaChart.show(false);
		this.showAverageAreaPerCatChartCommon();
		this.abRmpctHrmpctAverageAreaPerCatChart.setTitle(this.getTitleText());
	},

	showHeadCountChart: function(){
		this.abRmpctHrmpctAverageAreaChart.show(false);
		this.abRmpctHrmpctCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(false);
		this.abRmpctHrmpctOccupancyRateChart.show(false);
		this.abRmpctHrmpctAverageAreaPerCatChart.show(false);
		this.showHeadCountChartCommon();
		this.abRmpctHrmpctHeadCountChart.setTitle(this.getTitleText());
	},

	groupChange: function(){
		var dataAxis = document.getElementById("dataAxis");
		var secondGroupBy = document.getElementById("secondGroupBy");
		var groupBy = document.getElementById("groupBy");
		var checkDateType = document.getElementsByName("dateType");
		if(secondGroupBy.value=="headcount"){
			if(groupBy.value=="dp"){
				checkDateType[0].checked = true;
				checkDateType[1].disabled = true;
				this.dateType="s";
			}
			else {
				checkDateType[1].disabled = false;
			}
		}
	}

})

function onBarChartClick(obj){
	var controller = abSpOccupAnalTab3Controller;

	var res = "";

	if(obj.selectedChartData['rmpct.groupValue']){
		 res = res + controller.groupOption+ "='"+ obj.selectedChartData['rmpct.groupValue']+"' ";
		if(controller.secondGroupOption=='avAreaP'){
			res =  res + " AND rmpct.em_id is not null ";
		} else if(controller.secondGroupOption=='avAreaS') {
			res =  res + " AND rm.cap_em &gt; 0 ";			
		}else if ( controller.secondGroupOption=='avAreaC' ){
			res =  res + " AND rmpct.rm_cat='"+obj.selectedChartData['rmpct.rm_cat']+"' ";
		} else if ( controller.secondGroupOption=='headcount' ){
			res =  res + " AND rmpct.em_id is not null ";
			if("s"==controller.dateType){
				var dateValue = controller.console.getFieldValue("rmpct.date_created");
				res = res + " 	AND ( rmpct.date_start is null or ${sql.yearMonthDayOf('rmpct.date_start')}  &lt;='" + dateValue + "' ) ";
				res = res + "  AND ( rmpct.date_end is null or ${sql.yearMonthDayOf('rmpct.date_end')}  &gt;='" + dateValue + "' ) ";
			} 
		}

	} else if(obj.selectedChartData['rmcat.rm_cat']){
		 res = res + " rmpct.rm_cat='"+ obj.selectedChartData['rmcat.rm_cat']+"' ";
		 res = res + " AND " + controller.groupOption+ "='"+ obj.selectedChartData['rmpct.secondGroupValue']+"' ";
	}

	if(obj.selectedChartData['rmpct.secondGroupValue'] && res && !obj.selectedChartData['rmcat.rm_cat'] ){
		if( controller.secondGroupOption=="occup"){
			res =  res + " AND " + getSecondGroupRestriction(controller, "occup", obj.selectedChartData['rmpct.secondGroupValue']) ;
		}
		else{
			res = res + " AND " + controller.secondGroupOption+ "='"+ obj.selectedChartData['rmpct.secondGroupValue']+"' ";
		}
	}

	if(controller.secondGroupOption=="orate"){
		if (obj.selectedChartData['rm.rateType'].indexOf("Occupancy Rate")==0){
			res =  res + " and rmpct.em_id is not null ";
		}
		else{
			res =  res + " and rmpct.em_id is null ";
		}
	}

	if(res){
		controller.detailsRes = controller.consoleRes + " AND "+ res;
	}

	View.openDialog('ab-sp-sp-occup-anal-pop-up-details.axvw');
}


function getSecondGroupRestriction(controller, option, value){

	var res = "";
	var resForOccup = controller.occupRes;
	
	if (option=='occup'){

		if(value=='Non-occupiable'){
			res = " rmcat.occupiable=0 ";
		} ;
			
		if(controller.dateType =='s'){
			var selectStr = " rmcat.occupiable=1 and (select count(1) from rmpct  ${sql.as} rp1 left outer join rm  ${sql.as} rm1 on rm1.bl_id=rp1.bl_id and rm1.fl_id=rp1.fl_id and rm1.rm_id=rp1.rm_id 	left outer join bl ${sql.as}  bl1 on bl1.bl_id=rp1.bl_id left outer join rmcat  ${sql.as}  rc1 on rc1.rm_cat=rp1.rm_cat where rp1.bl_id=rmpct.bl_id and rp1.fl_id=rmpct.fl_id and rp1.rm_id=rmpct.rm_id  AND ";
			if( value=='Vacant' ){
				res = selectStr + resForOccup +")=0  ";
			}else if( value=='Available' ){
				res = selectStr + resForOccup +") &lt; rm.cap_em";
			}else if( value=='At Capacity' ){
				res = selectStr + resForOccup +")=rm.cap_em ";
			}else if( value=='Exceeds Capacity' ){
				res = selectStr + resForOccup +") &gt; rm.cap_em ";
			}
		} else if( controller.dateType =='r' ){

			if( value=='Vacant' ){
				res = " rmpct.em_id is null  and rmcat.occupiable=1 and rm.count_em=0  ";
			}else if( value=='Available' ){
				res = " rmpct.em_id is not null   and rmcat.occupiable=1 and rm.count_em &lt; rm.cap_em ";
			}else if( value=='At Capacity' ){
				res = "rmpct.em_id is not null  and rmcat.occupiable=1 and rm.count_em=rm.cap_em ";
			}else if( value=='Exceeds Capacity' ){
				res = " rmpct.em_id is not null  and rmcat.occupiable=1 and rm.count_em &gt; rm.cap_em ";
			}
		}
	}	

	return res;
}