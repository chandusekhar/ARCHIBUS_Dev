/**
 * modified to avoid 0 value as default for numeric fields
 * @param {Object} tempObj
 * @param {Object} decimal
 * @param {Object} bShow
 */
function validationNumeric(tempObj,decimal, bShow)
{
	var bReturned = true;
	var value	= tempObj.value;	
	var  warning_message_invalid_input = "";	
	if(typeof value != 'undefined' && value != null && value != ""){
		value = trim(value);
		//check if value is ".33", then changing it into "0.33"
		if(value.charAt(0)==strDecimalSeparator){
			value = "0" + value;
			tempObj.value = value;
		}
		//changing "+33" into "33" for the purpose of the size validation
		if(value.charAt(0)=="+" && value.length>1){
			value = value.substring(1);
			tempObj.value = value;
		}
		value = removeCurrencySign(value);
		value = removeGroupingSeparator(value);
		if(!isNumeric(value)){
			if(bShow)
			{
				warning_message_invalid_input = Ab.view.View.getLocalizedString("general_invalid_input_warning_message_numeric");
				alert(warning_message_invalid_input);
				if(!mozillaFireFoxBrowser)
					tempObj.focus();
			}
			bReturned = false;
		}else{
			//strDecimalSeparator is defined by locale.js
			var objRegExp  = "";
			if(parseInt(decimal+"")>=1){
				objRegExp = "/(^-?\\d\\d*\\"+strDecimalSeparator+"\\d{1,"+decimal+"}$)|(^-?\\d\\d*$)|(^-?\\"+strDecimalSeparator+"\\r\\d\\d{1,"+decimal+"}$)/";
			}else{
				objRegExp = "/(^-?\\d\\d*\\"+strDecimalSeparator+"\\d$)|(^-?\\d\\d*$)|(^-?\\"+strDecimalSeparator+"\\r\\d\\d$)/";
			}
			objRegExp = eval(objRegExp);
			value = removeGroupingSeparator(value);
			//value = removeCurrencySign(value);
			//if last character in input string is decimal separator, adding a zero to
			//it for validation purpose

			//if(value.charAt(value.length-1) == strDecimalSeparator)
			//	value = value + "0";


			if(!objRegExp.test(value)){
				if(bShow){
					//localized?????
					var numeric_decimal_warning_message1 = Ab.view.View.getLocalizedString("field_validation_warning_message_numeric_decimal1");
					var numeric_decimal_warning_message2 = Ab.view.View.getLocalizedString("field_validation_warning_message_numeric_decimal2");

					alert(numeric_decimal_warning_message1 + " " + decimal + " " + numeric_decimal_warning_message2 + "!");
					if(!mozillaFireFoxBrowser)
						tempObj.focus();
				}
				//removing extra decimals
				//var pos = value.indexOf(strDecimalSeparator);
				//if(pos>=0)
				//{
					//value = value.substring(0, pos+parseInt(decimal,10)+1);
					//tempObj.value = value;
					//bReturned = true;
				//}
				//else
				//{
					//tempObj.value = "";//tempObj.value.substring(0, tempObj.value.length-1);
					bReturned = false;
				//}
			}
		}
	}else{
		/*
		 * IOAN 27-10-2008
		 */
		//tempObj.value=0;
		tempObj.value=value;
	}

	return bReturned;
}
var abRplmBldgPropController = View.createController('abRplmBldgProp',{
	
	filterType : null,
	
	filter : {
		city_id:'',
		state_id:'',
		ctry_id:'',
		su_manual_area_max:'',
		su_manual_area_min:'',
		su_usable_area_max:'',
		su_usable_area_min:'',
		manual_area_max:'',
		manual_area_min:'',
		cad_area_max:'',
		cad_area_min:'',
		purchasing_cost_max:'',
		purchasing_cost_min:'',
		book_value_min:'',
		book_value_max:'',
		market_value_min:'',
		market_value_max:''
	},
	
	afterViewLoad: function(){
		// read input parameters
		if(this.view.parameters.filterType){
			this.filterType = this.view.parameters.filterType;
		}
		if(this.view.parameters.filter){
			this.filter = this.view.parameters.filter;
		}
	},
	
	afterInitialDataFetch: function(){
		if(this.filterType.toLowerCase() == 'building'){
			this.fltBldgPropManualArea.show(false, true);
			this.fltBldgPropCADArea.show(false, true);
		}else{
			this.fltBldgPropSuManualArea.show(false, true);
			this.fltBldgPropSuUsableArea.show(false, true);
		}
		this.initializeView();
	},
	
	initializeView: function(){
		var filter = this.filter;
		this.fltBldgPropGeography.setFieldValue('bl.city_id', ( valueExistsNotEmpty(filter['city_id']) ? filter['city_id'] : '') );
		this.fltBldgPropGeography.setFieldValue('bl.state_id', ( valueExistsNotEmpty(filter['state_id']) ? filter['state_id'] : '') );
		this.fltBldgPropGeography.setFieldValue('bl.ctry_id', ( valueExistsNotEmpty(filter['ctry_id']) ? filter['ctry_id'] : ''));

		this.fltBldgPropSuManualArea.setFieldValue('su_manual_area_max', ( valueExistsNotEmpty(filter['su_manual_area_max']) ? filter['su_manual_area_max'] : ''));
		this.fltBldgPropSuManualArea.setFieldValue('su_manual_area_min', ( valueExistsNotEmpty(filter['su_manual_area_min']) ? filter['su_manual_area_min'] : ''));

		this.fltBldgPropSuUsableArea.setFieldValue('su_usable_area_max', ( valueExistsNotEmpty(filter['su_usable_area_max']) ? filter['su_usable_area_max'] : ''));
		this.fltBldgPropSuUsableArea.setFieldValue('su_usable_area_min', ( valueExistsNotEmpty(filter['su_usable_area_min']) ? filter['su_usable_area_min'] : ''));

		this.fltBldgPropManualArea.setFieldValue('manual_area_max', ( valueExistsNotEmpty(filter['manual_area_max']) ? filter['manual_area_max'] : ''));
		this.fltBldgPropManualArea.setFieldValue('manual_area_min', ( valueExistsNotEmpty(filter['manual_area_min']) ? filter['manual_area_min'] : ''));
		
		this.fltBldgPropCADArea.setFieldValue('cad_area_max', ( valueExistsNotEmpty(filter['cad_area_max']) ? filter['cad_area_max'] : ''));
		this.fltBldgPropCADArea.setFieldValue('cad_area_min', ( valueExistsNotEmpty(filter['cad_area_min']) ? filter['cad_area_min'] : ''));

		this.fltBldgPropPurchasingCost.setFieldValue('purchasing_cost_max', ( valueExistsNotEmpty(filter['purchasing_cost_max']) ? filter['purchasing_cost_max'] : ''));
		this.fltBldgPropPurchasingCost.setFieldValue('purchasing_cost_min', ( valueExistsNotEmpty(filter['purchasing_cost_min']) ? filter['purchasing_cost_min'] : ''));

		this.fltBldgPropBookValue.setFieldValue('book_value_max', ( valueExistsNotEmpty(filter['book_value_max']) ? filter['book_value_max'] : ''));
		this.fltBldgPropBookValue.setFieldValue('book_value_min', ( valueExistsNotEmpty(filter['book_value_min']) ? filter['book_value_min'] : ''));

		this.fltBldgPropMarketValue.setFieldValue('market_value_max', ( valueExistsNotEmpty(filter['market_value_max']) ? filter['market_value_max'] : ''));
		this.fltBldgPropMarketValue.setFieldValue('market_value_min', ( valueExistsNotEmpty(filter['market_value_min']) ? filter['market_value_min'] : ''));

		//display UOM and Currency
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
			this.fltBldgPropSuManualArea.setFieldLabel("su_manual_area_min",getMessage("higherThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropSuManualArea.setFieldLabel("su_manual_area_max",getMessage("lowerThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropSuUsableArea.setFieldLabel("su_usable_area_min",getMessage("higherThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropSuUsableArea.setFieldLabel("su_usable_area_max",getMessage("lowerThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropManualArea.setFieldLabel("manual_area_min",getMessage("higherThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropManualArea.setFieldLabel("manual_area_max",getMessage("lowerThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropCADArea.setFieldLabel("cad_area_min",getMessage("higherThanTitle") + ", " + View.user.areaUnits.title);
    		this.fltBldgPropCADArea.setFieldLabel("cad_area_max",getMessage("lowerThanTitle") + ", " + View.user.areaUnits.title);
    	}
		
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.fltBldgPropPurchasingCost.setFieldLabel("purchasing_cost_min",getMessage("higherThanTitle") + ", " + View.user.userCurrency.description);
    		this.fltBldgPropPurchasingCost.setFieldLabel("purchasing_cost_max",getMessage("lowerThanTitle") + ", " + View.user.userCurrency.description);
    		this.fltBldgPropBookValue.setFieldLabel("book_value_min",getMessage("higherThanTitle") + ", " + View.user.userCurrency.description);
    		this.fltBldgPropBookValue.setFieldLabel("book_value_max",getMessage("lowerThanTitle") + ", " + View.user.userCurrency.description);
    		this.fltBldgPropMarketValue.setFieldLabel("market_value_min",getMessage("higherThanTitle") + ", " + View.user.userCurrency.description);
    		this.fltBldgPropMarketValue.setFieldLabel("market_value_max",getMessage("lowerThanTitle") + ", " + View.user.userCurrency.description);
    	}
		
	},
	
	fltBldgPropAction_onApply: function(){
		if(this.readFilter()){
			// check if callback function exists
			if(this.view.parameters.callback && typeof(this.view.parameters.callback) == "function"){
				this.view.parameters.callback(this.filter);
			}

			View.closeThisDialog();
		}
	},
	readFilter: function(){
		/*
		 * geography
		 */
		this.filter['city_id'] = this.fltBldgPropGeography.getFieldValue('bl.city_id');
		this.filter['state_id'] = this.fltBldgPropGeography.getFieldValue('bl.state_id');
		this.filter['ctry_id'] = this.fltBldgPropGeography.getFieldValue('bl.ctry_id');
		
		if (this.fltBldgPropSuManualArea.getFieldValue('su_manual_area_max').length > 0) {
			if (this.fltBldgPropSuManualArea.validateField('su_manual_area_max')) {
				this.filter['su_manual_area_max'] = this.fltBldgPropSuManualArea.getFieldValue('su_manual_area_max');
			}
			else {
				return false;
			}
		}else
			this.filter['su_manual_area_max'] ='';
		if (this.fltBldgPropSuManualArea.getFieldValue('su_manual_area_min').length > 0) {
			if (this.fltBldgPropSuManualArea.validateField('su_manual_area_min')) {
				this.filter['su_manual_area_min'] = this.fltBldgPropSuManualArea.getFieldValue('su_manual_area_min');
			}
			else {
				return false;
			}
		}else
			this.filter['su_manual_area_min'] ='';
		if (this.fltBldgPropSuUsableArea.getFieldValue('su_usable_area_max').length > 0) {
			if (this.fltBldgPropSuUsableArea.validateField('su_usable_area_max')) {
				this.filter['su_usable_area_max'] = this.fltBldgPropSuUsableArea.getFieldValue('su_usable_area_max');
			}
			else {
				return false;
			}
		}else
			this.filter['su_usable_area_max'] ='';
		if (this.fltBldgPropSuUsableArea.getFieldValue('su_usable_area_min').length > 0) {
			if (this.fltBldgPropSuUsableArea.validateField('su_manual_area_min')) {
				this.filter['su_usable_area_min'] = this.fltBldgPropSuUsableArea.getFieldValue('su_usable_area_min');
			}
			else {
				return false;
			}
		}else
			this.filter['su_usable_area_min'] ='';
		if (this.fltBldgPropManualArea.getFieldValue('manual_area_max').length > 0) {
			if (this.fltBldgPropManualArea.validateField('manual_area_max')) {
				this.filter['manual_area_max'] = this.fltBldgPropManualArea.getFieldValue('manual_area_max');
			}
			else {
				return false;
			}
		}else
			this.filter['manual_area_max'] ='';
		if (this.fltBldgPropManualArea.getFieldValue('manual_area_min').length > 0) {
			if (this.fltBldgPropManualArea.validateField('manual_area_min')) {
				this.filter['manual_area_min'] = this.fltBldgPropManualArea.getFieldValue('manual_area_min');
			}
			else {
				return false;
			}
		}else
			this.filter['manual_area_min'] ='';
		if (this.fltBldgPropCADArea.getFieldValue('cad_area_max').length > 0) {
			if (this.fltBldgPropCADArea.validateField('cad_area_max')) {
				this.filter['cad_area_max'] = this.fltBldgPropCADArea.getFieldValue('cad_area_max');
			}
			else {
				return false;
			}
		}else
			this.filter['cad_area_max'] ='';
		if (this.fltBldgPropCADArea.getFieldValue('cad_area_min').length > 0) {
			if (this.fltBldgPropCADArea.validateField('cad_area_min')) {
				this.filter['cad_area_min'] = this.fltBldgPropCADArea.getFieldValue('cad_area_min');
			}
			else {
				return false;
			}
		}else
			this.filter['cad_area_min'] ='';
		if (this.fltBldgPropPurchasingCost.getFieldValue('purchasing_cost_max').length > 0) {
			if (this.fltBldgPropPurchasingCost.validateField('purchasing_cost_max')) {
				this.filter['purchasing_cost_max'] = this.fltBldgPropPurchasingCost.getFieldValue('purchasing_cost_max');
			}
			else {
				return false;
			}
		}else
			this.filter['purchasing_cost_max'] ='';
		if (this.fltBldgPropPurchasingCost.getFieldValue('purchasing_cost_min').length > 0) {
			if (this.fltBldgPropPurchasingCost.validateField('purchasing_cost_min')) {
				this.filter['purchasing_cost_min'] = this.fltBldgPropPurchasingCost.getFieldValue('purchasing_cost_min');
			}
			else {
				return false;
			}
		}else
			this.filter['purchasing_cost_min'] ='';
		if (this.fltBldgPropBookValue.getFieldValue('book_value_max').length > 0) {
			if (this.fltBldgPropBookValue.validateField('book_value_max')) {
				this.filter['book_value_max'] = this.fltBldgPropBookValue.getFieldValue('book_value_max');
			}
			else {
				return false;
			}
		}else
			this.filter['book_value_max'] ='';
		if (this.fltBldgPropBookValue.getFieldValue('book_value_min').length > 0) {
			if (this.fltBldgPropBookValue.validateField('book_value_min')) {
				this.filter['book_value_min'] = this.fltBldgPropBookValue.getFieldValue('book_value_min');
			}
			else {
				return false;
			}
		}else
			this.filter['book_value_min'] ='';
		if (this.fltBldgPropMarketValue.getFieldValue('market_value_max').length > 0) {
			if (this.fltBldgPropMarketValue.validateField('market_value_max')) {
				this.filter['market_value_max'] = this.fltBldgPropMarketValue.getFieldValue('market_value_max');
			}
			else {
				return false;
			}
		}else
			this.filter['market_value_max'] ='';
		if (this.fltBldgPropMarketValue.getFieldValue('market_value_min').length > 0) {
			if (this.fltBldgPropMarketValue.validateField('market_value_min')) {
				this.filter['market_value_min'] = this.fltBldgPropMarketValue.getFieldValue('market_value_min');
			}
			else {
				return false;
			}
		}else
			this.filter['market_value_min'] ='';
		return true;
	}
})
