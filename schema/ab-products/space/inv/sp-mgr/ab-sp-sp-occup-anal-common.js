var abSpOccupAnalCommonController = View.createController('abSpOccupAnalCommonController', {

	consoleRes: " 1=1 ",
	detailsRes: " 1=1 ",
	occupRes: " 1=1 ",
	secondGroupOption: "RTRIM(rmpct.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.fl_id)", 
	groupOption: "RTRIM(rmpct.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.fl_id)", 
	calculationType:'',
	dateType:'s', 
	dateAction:null, 
	console:null, 

	dateToAddField:"rmpct.date_created",
	dateToUpdateField:"rmpct.date_created",

	fieldsArraysForRestriction: new Array(
			['bl.site_id',,'bl.site_id'], 
			['rmpct.bl_id',,'rmpct.bl_id'], 
			['rmpct.fl_id',,'rmpct.fl_id'], 
			['rmpct.dv_id',,'rmpct.dv_id'], 
			['rmpct.dp_id',,'rmpct.dp_id'], 
			['rmpct.rm_cat',,'rmpct.rm_cat']
	),

	isIncludeGroup: false,
	consoleResForGp: " 1=1 ",
	fieldsArraysForGp: new Array(
			['bl.site_id',,'bl.site_id'], 
			['rmpct.bl_id',,'gp.bl_id'], 
			['rmpct.fl_id',,'gp.fl_id'], 
			['rmpct.dv_id',,'gp.dv_id'], 
			['rmpct.dp_id',,'gp.dp_id'] 
	),

	dateRangeTitleText:"",

	initialView: function(console){
		this.console = console;
		this.initialAllDropdownList();
		//set default date to current date
		this.date = getCurrentDate();
		console.setFieldValue('rmpct.date_created', this.date);
		this.dateAction = console.actions.get('currentDate');
		this.dateAction.setTitle(console.getFieldElement('rmpct.date_created').value);
	},

	initialDateRangeTitle: function(){
		var dateStart ="";
		var dateStartParam = this.abAfmActivityParamsDS.getRecord("param_id='AreaTotalsStartDate'");
		if(dateStartParam){
			dateStart = dateStartParam.getValue("afm_activity_params.param_value");
		}
		var dateEnd="";
		var dateEndParam = this.abAfmActivityParamsDS.getRecord("param_id='AreaTotalsEndDate'");
		if(dateEndParam){
			dateEnd = dateEndParam.getValue("afm_activity_params.param_value");
		}
		this.	dateRangeTitleText = dateStart+" to "+dateEnd;

		$("rangeTitle").innerText = $("rangeTitle").innerText+": "+this.dateRangeTitleText;
	},
	/**
     * event handler when click show
     */
    onShow: function(){
		this.consoleRes = getRestrictionStrFromConsole(this.console, this.fieldsArraysForRestriction);
		var dateValue = this.console.getFieldValue("rmpct.date_created");
		if( this.dateType=='s' ){
			if( dateValue ){
				this.consoleRes= this.consoleRes + " and 	( rmpct.date_start is null or ${sql.yearMonthDayOf('rmpct.date_start')}  &lt;='" + dateValue + "' ) ";
				this.consoleRes= this.consoleRes + " and 	( rmpct.date_end is null or ${sql.yearMonthDayOf('rmpct.date_end')}  &gt;='" + dateValue + "' ) ";
			}
			else{
				View.showMessage(getMessage("nullDate"));
				return;
			}
		} else if(this.dateType=='r'){
			this.consoleRes= this.consoleRes + " and rmpct.area_rm>0 ";			
		}

		var isGroup = document.getElementById("isGroup");
		if(isGroup.checked){
			this.consoleResForGp = getRestrictionStrFromConsole(this.console, this.fieldsArraysForGp);			
		} 
		else{
			this.consoleResForGp = " 1=0 ";
		}

		var excludeHotelable = document.getElementById("isHotelable");
		if(excludeHotelable.checked){
			this.consoleRes = this.consoleRes+" and rm.hotelable=0 ";
		}

		var isUsable = document.getElementById("isUsable");
		if(isUsable.checked){
			this.consoleRes = this.consoleRes+" and rmcat.supercat='USBL' ";
		}
		
		this.groupOption = this.getGroupOption();
		this.secondGroupOption = this.getSecondGroupOption();
		this.calculationType = this.getCalculationType();

		//kb#3035216: set custom fill color when group by Occupancy
		if(	document.getElementById("secondGroupBy").value=="op"){
			this.abRmpctHrmpctCalculationStackPlanChart.setSolidFillColors(this.customOccupancyFillColors);
		} 
		else {
			this.abRmpctHrmpctCalculationStackPlanChart.setSolidFillColors([]);
		};

		if(!this.groupOption || !this.secondGroupOption || !this.calculationType){
			View.showMessage(getMessage('nullGroup'));
		}
		else{
			if(this.secondGroupOption=="orate"){
				this.showOccupancyRateChart();
			}
			else if(this.secondGroupOption=="dplus"){
				if( this.calculationType=="S_AREA" ||  this.calculationType=="R_AREA" ){
					this.showDepartmentPlusAreaChart();
				} else {
					this.showDepartmentPlusCountChart();
				}
			}
			else if( this.secondGroupOption.indexOf ("avArea")!=-1 ){
				if(this.secondGroupOption=="avAreaC"){
					this.showAverageAreaPerCatChart();
				}
				else{
					this.showAverageAreaChart();
				}
			}
			else if( this.secondGroupOption=="headcount" ){
				this.showHeadCountChart();
			}
			else{
				if( this.calculationType=="S_AREA" ||  this.calculationType=="R_AREA" ){
					this.showNormalStackPlanAreaChart();
				}				
				else { 
					this.showNormalStackPlanChart();
				}
			}
		}

		//kb#3036556: refresh timeline button title and set selected date value
		this.dateAction.setTitle(this.console.getFieldElement(this.dateToAddField).value);
		this.date=this.console.getFieldValue('rmpct.date_created');
	},

	/**
     * event handler when click clear
     */
    onClear: function(){
		//set default date to current date
		this.date = getCurrentDate();
		this.console.setFieldValue('rmpct.date_created', this.date);
		this.dateAction.setTitle(this.date);
	},

	showOccupancyRateChartCommon: function(){
		this.abRmpctHrmpctOccupancyRateChart.addParameter('dateType', this.dateType);
		this.abRmpctHrmpctOccupancyRateChart.addParameter('groupOptionForHrmpct', this.groupOption.replace(/rmpct/g, "rm"));
		this.abRmpctHrmpctOccupancyRateChart.addParameter('groupOptionForRmpct', this.groupOption.replace(/rmpct/g, "rm"));
		this.abRmpctHrmpctOccupancyRateChart.addParameter('consoleResForRmpct',	this.consoleRes);
		this.abRmpctHrmpctOccupancyRateChart.addParameter('consoleResForHrmpct',	this.consoleRes.replace(/rmpct/g, "hrmpct"));
		this.abRmpctHrmpctOccupancyRateChart.refresh();
		this.abRmpctHrmpctOccupancyRateChart.show(true);
		//TODO: according to selected group by option and calculation type, set proper titles to chart.
	},

	showNormalStackPlanChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctCalculationStackPlanChart);
		this.abRmpctHrmpctCalculationStackPlanChart.refresh();
		this.abRmpctHrmpctCalculationStackPlanChart.show(true);				 
		//TODO: according to selected group by option and calculation type, set proper titles to chart.
	},

	showNormalStackPlanAreaChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctAreaCalculationStackPlanChart);
		this.abRmpctHrmpctAreaCalculationStackPlanChart.refresh();
		this.abRmpctHrmpctAreaCalculationStackPlanChart.show(true);				 
		//TODO: according to selected group by option and calculation type, set proper titles to chart.
	},

	showDepartmentPlusCountChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctDepartmentPlusCountChart);
		this.abRmpctHrmpctDepartmentPlusCountChart.refresh();
		this.abRmpctHrmpctDepartmentPlusCountChart.show(true);
		//TODO: according to selected group by option and calculation type, set proper titles to chart.
	},

	showDepartmentPlusAreaChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctDepartmentPlusAreaChart);
		this.abRmpctHrmpctDepartmentPlusAreaChart.refresh();
		this.abRmpctHrmpctDepartmentPlusAreaChart.show(true);
		//TODO: according to selected group by option and calculation type, set proper titles to chart.
	},

	showAverageAreaChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctAverageAreaChart);
		this.abRmpctHrmpctAverageAreaChart.addParameter('consoleResForRp1',	this.consoleRes.replace(/rmpct./g, "rp1.").replace(/rmcat./g, "rc1.").replace(/bl.site_id/g, "bl1.site_id").replace(/rm./g, "rm1.").replace(/area_rm1.0/g, "area_rm>0"));
		this.abRmpctHrmpctAverageAreaChart.addParameter('consoleResForHrp1',	this.consoleRes.replace(/rmpct./g, "hrp1.").replace(/rmcat./g, "rc1.").replace(/bl.site_id/g, "bl1.site_id").replace(/rm./g,"rm1.").replace(/area_rm1.0/g, "area_rm>0"));
		if(this.secondGroupOption=="avAreaP"){
			this.abRmpctHrmpctAverageAreaChart.addParameter('showBench',	"yes");
		}
		else{
			this.abRmpctHrmpctAverageAreaChart.addParameter('showBench',	"no");
		}
		this.abRmpctHrmpctAverageAreaChart.refresh();
		this.abRmpctHrmpctAverageAreaChart.show(true);
	},

	showAverageAreaPerCatChartCommon: function(){
		this.setParameters(this.abRmpctHrmpctAverageAreaPerCatChart);
		this.abRmpctHrmpctAverageAreaPerCatChart.refresh();
		this.abRmpctHrmpctAverageAreaPerCatChart.show(true);
	},

	showHeadCountChartCommon: function(){
		//this.setParameters(this.abRmpctHrmpctHeadCountChart);
		var groupBy=document.getElementById("groupBy").value;
		var checkDateType = document.getElementsByName("dateType");
		if(groupBy.value=="count" && secondGroupBy.value!="op"){
			checkDateType[0].checked = true;
			checkDateType[1].disabled = true;
			this.dateType="s";
		}

		var countType = "";
		if(groupBy=="dp" || checkDateType[1].checked){
			countType =  groupBy; 
		} else {
			countType =  "opcount"; 
		} 
		this.abRmpctHrmpctHeadCountChart.addParameter('countOption',	countType);
		this.abRmpctHrmpctHeadCountChart.addParameter('countTable',	groupBy);
		this.abRmpctHrmpctHeadCountChart.addParameter('consoleResForRmpct',	this.consoleRes);
		this.abRmpctHrmpctHeadCountChart.addParameter('consoleResForHrmpct',	this.consoleRes.replace(/rmpct./g, "hrmpct."));
		this.abRmpctHrmpctHeadCountChart.addParameter('groupOptionForRmpct',	this.groupOption);
		this.abRmpctHrmpctHeadCountChart.addParameter('groupValue',	this.groupOption.replace(/bl.site_id/g, "rmpct.site_id"));
		this.abRmpctHrmpctHeadCountChart.addParameter('groupOptionForHrmpct',	this.groupOption.replace(/rmpct./g, "hrmpct."));
		this.abRmpctHrmpctHeadCountChart.addParameter('groupOption',	this.groupOption.replace(/rmpct./g, groupBy+".").replace(/bl.site_id/g, "site.site_id"));

		this.abRmpctHrmpctHeadCountChart.refresh();
		this.abRmpctHrmpctHeadCountChart.show(true);
	},

	getSecondGroupOption: function(group){
		var secondGroupBy=null;
		if(group){
			secondGroupBy = group;
		} else {
			 secondGroupBy=document.getElementById("secondGroupBy").value;
		}
		switch (secondGroupBy){
			case "dp":
				return "RTRIM(rmpct.dv_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.dp_id)";
			break;
			case "dplus":
				return "dplus";
			break;
			case "dv":
				return "RTRIM(rmpct.dv_id)";
			break;
			case "rmcat":
				return "RTRIM(rmpct.rm_cat)";
			break;
			case "srmcat":
				return "RTRIM(rmcat.supercat)";
			break;
			case "op":
				return "occup";
			case "orate":
				return "orate";
			case "avAreaP":
				return "avAreaP";
			break;
			case "avAreaS":
				return "avAreaS";
			break;
			case "avAreaC":
				return "avAreaC";
			break;
			case "headcount":
				return "headcount";
			break;
		}
		return null;
	},
	
	getGroupOption: function(){
		var groupBy=document.getElementById("groupBy").value;
		switch (groupBy){
			case "fl":
				return "RTRIM(rmpct.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.fl_id)";
			break;
			case "bl":
				return "RTRIM(rmpct.bl_id)";
			break;
			case "site":
				return "RTRIM(bl.site_id)";
			break;
			case "rmcat":
				return "RTRIM(rmpct.rm_cat)";
			break;
			case "dp":
				return "RTRIM(rmpct.dv_id)${sql.concat}'-'${sql.concat}RTRIM(rmpct.dp_id)";
			break;
		}
		return null;
	},
	
	getCalculationType: function(){
		var cType=document.getElementById("dataAxis").value;
		if(!cType){
			return null;
		}
		else{
			if(cType=='count'){
				return "COUNT";
			}
			else if(cType=='pct'){
				return "PCT";
			}
			else if(this.dateType=='s' && cType=='area'){
				return "S_AREA";
			}
			else if(this.dateType=='r' && cType=='area'){
				return "R_AREA";
			}
		}
		return null;
	},
	
	setParameters: function(chartPanel){
		var resForHrmpct = this.consoleRes.replace(/rmpct./g, "hrmpct.");
		var groupOptionForHrmpct = this.groupOption.replace(/rmpct/g, "hrmpct");
		var groupOptionForGp = this.groupOption.replace(/rmpct/g, "gp").replace(/gp.rm_cat/g, "gp.gp_std").replace(/rmcat.supercat/g, "gp.gp_std");
		var secGroupOptionForHrmpct = this.secondGroupOption.replace(/rmpct/g, "hrmpct");
		var secGroupOptionForGp = this.secondGroupOption.replace(/rmpct/g, "gp").replace(/gp.rm_cat/g, "gp.gp_std").replace(/rmcat.supercat/g, "gp.gp_std").replace(/rm.hotelable/g, "null");

		chartPanel.addParameter('groupOptionForRmpct',	this.groupOption);
		chartPanel.addParameter('groupOptionForHrmpct',	groupOptionForHrmpct);
		chartPanel.addParameter('groupOptionForGp',	groupOptionForGp);
		chartPanel.addParameter('secondGroupOptionForRmpct',	this.secondGroupOption);
		chartPanel.addParameter('secondGroupOptionForHrmpct',	secGroupOptionForHrmpct);
		chartPanel.addParameter('secondGroupOptionForGp',	secGroupOptionForGp);
		chartPanel.addParameter('consoleResForRmpct',	this.consoleRes);
		chartPanel.addParameter('consoleResForHrmpct',	resForHrmpct);
		chartPanel.addParameter('consoleResForGp',	this.consoleResForGp);
		chartPanel.addParameter('calculationType',	this.calculationType);
		chartPanel.addParameter('dateType',	this.dateType);
		if(this.secondGroupOption=='occup'){
			chartPanel.addParameter('isOccu',	'yes');
			chartPanel.addParameter('secondGroupOptionForRmpct',	'rmpct.rm_id');
			chartPanel.addParameter('secondGroupOptionForHrmpct',	'hrmpct.rm_id');
			chartPanel.addParameter('secondGroupOptionForGp',	'gp.fl_id');
			this.occupRes = this.consoleRes.replace(/rmpct./g, "rp1.").replace(/rmcat./g, "rc1.").replace(/rm.hotelable/g, "rm1.hotelable").replace(/bl.site/g, "bl1.site");
			chartPanel.addParameter('occupRes',	this.occupRes);
			chartPanel.addParameter('nonOccup',	getMessage("nonOccup"));
			chartPanel.addParameter('vacant',	getMessage("vacant"));
			chartPanel.addParameter('avail',	getMessage("avail"));
			chartPanel.addParameter('atCap',	getMessage("atCap"));
			chartPanel.addParameter('excCap',	getMessage("excCap"));
		}
		else{
			chartPanel.addParameter('isOccu',	'no');
			chartPanel.addParameter('secondGroupOption',	this.secondGroupOption);
		}
		if(this.secondGroupOption=='dplus'){
			chartPanel.addParameter('vert',	getMessage("vert"));
			chartPanel.addParameter('serv',	getMessage("serv"));
			chartPanel.addParameter('prorate',	getMessage("prorate"));
			chartPanel.addParameter('other',	getMessage("other"));
		}
	},

	secondGroupChange: function (){
		//Change select options according to pre-set rules in spec
		var cValue=document.getElementById("dataAxis").value;
		var gValue=document.getElementById("groupBy").value;

		initialDropdownList("dataAxis", this.dataAxixOptionValue,this.dataAxixOptionText);
		initialDropdownList("groupBy", this.groupByValueArray, this.groupByTextArray);

		var secondGroupByValue=document.getElementById("secondGroupBy").value;

		if(secondGroupByValue.indexOf ("avArea")!=-1 ){
				removeSelectOption("dataAxis", "count");
				removeSelectOption("dataAxis", "pct");
		} 
		else if(secondGroupByValue=="headcount"){
				initialDropdownList("dataAxis", new Array("count"), new Array("Count"));
		} 
		else if(secondGroupByValue=="op"){
				initialDropdownList("dataAxis", new Array("count"), new Array("Room Count"));
		}
		else if(secondGroupByValue=="orate"){
				removeSelectOption("dataAxis", "area");
				removeSelectOption("dataAxis", "count");
		}
		else if(secondGroupByValue=="rmcat"){
				removeSelectOption("groupBy", "rmcat");
				removeSelectOption("dataAxis", "pct");
		}
		else{
				removeSelectOption("dataAxis", "pct");
		}
		
		if(secondGroupByValue=="avAreaC"){
				removeSelectOption("groupBy", "rmcat");
		}

		
		this.changeDropdownListByIsIncludeGroup();
		restoreOriginalValue("dataAxis", cValue);
		restoreOriginalValue("groupBy", gValue);
		this.dataAxisChange();
		if(this.groupChange){
			this.groupChange();
		}

		this.onDateOptionChange();
	},

	changeDropdownListByIsIncludeGroup: function(){
		var includeGroup = document.getElementById("isGroup");
		this.isIncludeGroup = includeGroup.checked;
		if(includeGroup.checked){
			removeSelectOption("secondGroupBy", "srmcat");
			removeSelectOption("secondGroupBy", "dplus");
			removeSelectOption("secondGroupBy", "rmcat");
			removeSelectOption("secondGroupBy", "op");
			removeSelectOption("secondGroupBy", "orate");
			removeSelectOption("secondGroupBy", "avAreaP");
			removeSelectOption("secondGroupBy", "avAreaS");
			removeSelectOption("secondGroupBy", "avAreaC");
			removeSelectOption("secondGroupBy", "headcount");
			removeSelectOption("groupBy", "rmcat");
			removeSelectOption("groupBy", "dp");
			removeSelectOption("dataAxis", "count");
			removeSelectOption("dataAxis", "pct");
		}
	},

	dataAxisChange: function(){
		var dataAxis = document.getElementById("dataAxis");
		var secondGroupBy = document.getElementById("secondGroupBy");
		var checkDateType = document.getElementsByName("dateType");
		if(dataAxis.value=="count" && secondGroupBy.value!="op"){
			checkDateType[0].checked = true;
			checkDateType[1].disabled = true;
			this.dateType="s";
		}
		else {
			checkDateType[1].disabled = false;
		}
		//this.console.enableField('rmpct.date_created',true);

		this.onDateOptionChange();
	},

	changeDropdownList: function(){
		var cValue=document.getElementById("dataAxis").value;
		var gValue=document.getElementById("groupBy").value;
		var sgValue=document.getElementById("secondGroupBy").value;
		this.initialAllDropdownList();

		var isUsable = document.getElementById("isUsable");
		if(isUsable.checked){
			removeSelectOption("secondGroupBy", "srmcat");
		}

		this.changeDropdownListByIsIncludeGroup();
		restoreOriginalValue("dataAxis", cValue);
		restoreOriginalValue("groupBy", gValue);
		restoreOriginalValue("secondGroupBy", sgValue);
		this.secondGroupChange();
		this.dataAxisChange();
		if(this.groupChange){
			this.groupChange();
		}
	},

	onDateOptionChange: function(){
		var checkDateType = document.getElementsByName("dateType");
		for(i=0; i<checkDateType.length; ++i)
		{
			objRadio = checkDateType[i];
			if (objRadio.checked && objRadio.value == "range"){
				this.console.enableField('rmpct.date_created',false);
				this.dateType="r";
				enableTimeline(this.console, false);
			}
			if(objRadio.checked && objRadio.value == "single"){
				this.console.enableField('rmpct.date_created',true);
				this.dateType="s";
				enableTimeline(this.console, true);
			}
		}   
	},

	initialAllDropdownList:function(){
		initialDropdownList("groupBy", this.groupByValueArray,this.groupByTextArray);
		initialDropdownList("dataAxis", this.dataAxixOptionValue,this.dataAxixOptionText);
		initialDropdownList("secondGroupBy",this.secondGroupByValueArray, this.secondGroupByTextArray);	
		removeSelectOption("dataAxis", "pct");
	},
	/**
	 * Choose previous year
	 */
	onPreviousYear : function() {
		addPeriod("YEAR", -1, this);
		this.onShow();
	},

	/**
	 *  Choose previous month
	 */
	onPreviousMonth : function() {
		addPeriod("MONTH", -1, this);
		this.onShow();
	},
			
	/**
	 * Choose previous week
	 */
	onPreviousWeek : function() {
		addPeriod("WEEK", -7, this);
		this.onShow();
	},

	/**
	 * Choose Current Date
	 */
	onBackToCurrentDate : function() {
		backToCurrentDate(this);
		this.onShow();
	},

	/**
	 * Choose next Year
	 */
	onNextYear : function() {
		addPeriod("YEAR", 1, this);
		this.onShow();
	},

	/**
	 * Choose next month
	 */
	onNextMonth : function() {
		addPeriod("MONTH", 1, this);
		this.onShow();
	},

	/**
	 * Choose next week
	 */
	onNextWeek : function() {
		addPeriod("WEEK", 7, this);
		this.onShow();
	},

	/**
	 * Return title text based on group by, second group by and calculation
	 */
	getTitleText : function() {
		var secondGroupByValue=document.getElementById("secondGroupBy").value;
		var dataValue=document.getElementById("dataAxis").value;

		var messageText;
		if(secondGroupByValue=="headcount"){
			messageText = getMessage("hcount"+"_"+this.dateType);
		}
		else if(secondGroupByValue.indexOf ("avArea")!=-1){
			messageText= getMessage(secondGroupByValue);
		}
		else if(secondGroupByValue=="op"){
			messageText = getMessage("opcount"+"_"+this.dateType);
		}
		else if(secondGroupByValue=="orate"){
			messageText = getMessage(secondGroupByValue)+": "+ getMessage(secondGroupByValue +'_'+this.dateType);
		}
		else if(secondGroupByValue=="dplus"){
			if(dataValue=="count")
				messageText = getMessage(secondGroupByValue)+": "+ getMessage(secondGroupByValue +'_'+dataValue);
			else 
				messageText = getMessage(secondGroupByValue)+": "+ getMessage(secondGroupByValue +'_'+dataValue+'_'+this.dateType);
		}
		else {
			if(dataValue=="count")
				messageText = getMessage(secondGroupByValue+"_"+dataValue+"_s");
			else 
				messageText = getMessage(secondGroupByValue+"_"+dataValue+'_'+this.dateType);
		}

		if(this.dateType=="r"){
			messageText = messageText+", "+this.dateRangeTitleText;
		}
		
		return messageText;
	}
})

function initialDropdownList(selectId, valueArray, textArray){
	// get dropdown list by itemSelectId
	var itemSelect = $(selectId);
	//populate select items to dropdown list and set default value
	itemSelect.innerHTML = '';
    for (var i = 0; i < valueArray.length; i++) {
        var item = valueArray[i];
        var option = document.createElement('option');
        option.value = item;
        option.appendChild(document.createTextNode(textArray[i]));
        itemSelect.appendChild(option);
    }
    //set default value to dropdown list
	itemSelect.options[0].setAttribute('selected', true);
}

function removeSelectOption(selectId, value){
	var itemSelect = $(selectId);
	for (var i = 0; i < itemSelect.options.length; i++) {
		var option = itemSelect.options[i];
		if (option.value==value) {
			itemSelect.removeChild(option);
			break;
		}
	}
}

function restoreOriginalValue(selectId, value){
		// get dropdown list by itemSelectId
		var itemSelect = $(selectId);
		// select given value as selected in dropdown list 
		var index = 0;
		for (var i = 0; i < itemSelect.options.length; i++) {
			var option = itemSelect.options[i];
			if(option.value==value){
				index = i;
				break;
			}
		}
		//set  value to dropdown list
		itemSelect.options[index].setAttribute('selected', true);
	}

function enableTimeline(panel, enabled){
	panel.actions.get('previousYear').enable(enabled);
	panel.actions.get('previousMonth').enable(enabled);
	panel.actions.get('previousWeek').enable(enabled);
	panel.actions.get('currentDate').enable(enabled);
	panel.actions.get('nextYear').enable(enabled);
	panel.actions.get('nextMonth').enable(enabled);
	panel.actions.get('nextWeek').enable(enabled);
}

