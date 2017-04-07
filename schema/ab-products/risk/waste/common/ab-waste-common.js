/**
    * fill items to dropdown list. 
	* @param {dataSourceId}  String: dataSource id
	* @param {itemSelectId}  String: dropdown list id
	* @param {fieldName}  String: field name
	* @param {defaultValue}  String: default value
	* @param {res}  String: restriction
 */
function fillList(dataSourceId,selectId,fieldName,defaultValue,res){
	// get records from datasource by dataSourceId 
	var recs = View.dataSources.get(dataSourceId).getRecords(res);
	// get dropdown list by itemSelectId
	var itemSelect = $(selectId);
	//populate select items to dropdown list and set default value
	itemSelect.innerHTML = '';
	if(selectId=='unitsType'||selectId=='unitsType1'){
		var option1 = document.createElement('option');
	    option1.value = '';
	    option1.appendChild(document.createTextNode(''));
	    itemSelect.appendChild(option1);
	}
    for (var i = 0; i < recs.length; i++) {
        var item = recs[i].values[fieldName];
        
        var option = document.createElement('option');
        option.value = item;
        option.appendChild(document.createTextNode(item));
        itemSelect.appendChild(option);
    }
    //set default value to dropdown list
    var optionIndexType = null;
	optionIndexType = getOptionIndex(itemSelect, defaultValue);
	if(optionIndexType!=-1){
	itemSelect.options[optionIndexType].setAttribute('selected', true);
	}
}
//get option index
function getOptionIndex(select, value) {
	if(!select.options||select.options.length==0) return -1;
	if(''==value) return 0;
	for(var oNum = 0; oNum != select.options.length; oNum++) {
		if(select.options[oNum].value == value) return oNum;
	}
	return -1;
}

/**
 * Validate if field is legality in validate table.
 * @param fieldArray
 * @param validateMessage
 * @returns {Boolean}
 */
function validate(fieldArray,validateMessage){
	var result='';
	var isValidate=true;
	try{  
		result = Workflow.callMethod("AbRiskWasteMgmt-WasteService-checkFieldVlauesExist", fieldArray);
	}catch(e){
		Workflow.handleError(e);
	}  
	var str="";
	var validateArray = eval("(" + result.jsonExpression + ")");
	for(var i=0;i<validateArray.length;i++){
		if(validateArray[i]=='false'){
			str=str+","+fieldArray[i].fieldTitle;
			isValidate=false;
		}
		
	}
	
	if(!isValidate){
		str=validateMessage+" "+str.substring(1)+".";
		View.alert(str);
	}
	return isValidate;
	
}
/**
 * 
 * @param form,form object
 * @param ds,afm_flds table data source with table_name,field_name,validate_data field
 * @param validateMessage, show validate message when there are legality field value 
 * @returns return alert information for user when there are legality field value 
 */
function  validateFields(form,validateMessage){
	
	var bl_id=form.getFieldValue("waste_out.bl_id");
	var dp_id=form.getFieldValue("waste_out.dp_id");
	var dv_id=form.getFieldValue("waste_out.dv_id");
	var eq_id=form.getFieldValue("waste_out.eq_id");
	var fl_id=form.getFieldValue("waste_out.fl_id");
	var pr_id=form.getFieldValue("waste_out.pr_id");
	var rm_id=form.getFieldValue("waste_out.rm_id");
	var site_id=form.getFieldValue("waste_out.site_id");
	var em_id=form.getFieldValue("waste_out.em_id");
	var contact_id=form.getFieldValue("waste_out.contact_id");
	
	var messageArray=[
	                  getMessage('blIdMsg'),
	                  getMessage('dpIdMsg'),
	                  getMessage('dvIdMsg'),
	                  getMessage('eqIdMsg'),
	                  getMessage('flIdMsg'),
	                  getMessage('prIdMsg'),
	                  getMessage('rmIdMsg'),
	                  getMessage('siteIdMsg'),
	                  getMessage('emIdMsg'),
	                  getMessage('contactIdMsg')
	                  ];
	
	var	keyValue= new Array(
				['bl','bl_id',bl_id,messageArray[0]], 
				['dp','dp_id',dp_id,messageArray[1]], 
				['dv','dv_id',dv_id,messageArray[2]], 
				['eq','eq_id',eq_id,messageArray[3]], 
				['fl','fl_id',fl_id,messageArray[4]], 
				['property','pr_id',pr_id,messageArray[5]], 
				['rm','rm_id',rm_id,messageArray[6]], 
				['site','site_id',site_id,messageArray[7]], 
				['em','em_id',em_id,messageArray[8]], 
				['contact','contact_id',contact_id,messageArray[9]]
		)
	var fieldArray = [];
	
	for(var i = 0;i<keyValue.length;i++){
	
	if(valueExistsNotEmpty(keyValue[i][2])){
			var field = new Object();
			field.tableName = keyValue[i][0];
			field.fieldName = keyValue[i][1];
			field.fieldValue = keyValue[i][2];
			field.fieldTitle = keyValue[i][3];
			fieldArray.push(field);
			
		}
	}
	return validate(fieldArray,validateMessage);
}

/**
 * Show or hide button and control layout hide or show
 * @param mainlayOutName
 * @param sonLayOutName
 * @param tag
 * @param {Object} panelObject array
 * @param {Object} buttonArr array 
 * @param {Object} showArr boolean array
 */
function hideOrShowActionButton(mainlayOutName, sonLayOutName, tag,panelObject, buttonArr, showArr) {
	if (mainlayOutName != '' && sonLayOutName != '' && sonLayOutName != '') {
		var main = View.getLayoutManager(mainlayOutName);
		if (tag == "collapse") {
			main.collapseRegion(sonLayOutName);
		}
		if (tag == "expand") {
			main.expandRegion(sonLayOutName);
		}
	}
	for ( var i = 0; i < buttonArr.length; i++) {
		panelObject[i].actions.get(buttonArr[i]).show(showArr[i]);
	}
}

/**
 * Add restriction for exported of pdf panel
 * @param panel1 first ,with multipleSelectionEnabled panel name
 * @param panel2 ,export panel name
 * @param messageName ,alert message when no records are selected before print
 * @returns {Boolean}
 */
function setExportRestriction(panel1,panel2,messageName,actionId){
	
	var gridForm=View.panels.get(panel1);
	var command = gridForm.actions.get(actionId).command.commands[0];
	var reportForm=View.panels.get(panel2);
	var records = gridForm.getPrimaryKeysForSelectedRows();
	if(records.length<1){
		//set return value for command chain,
		command.result = false;
		View.alert(getMessage(messageName));
		return;
	}
	var restriction = new Ab.view.Restriction();
	var wasteIdArr=[];
	
	for(i=0;i<records.length;i++){
		wasteIdArr[i]=records[i]['waste_out.waste_id'];
	}
	if(records.length!=0){
		restriction.addClause('waste_out.waste_id',wasteIdArr,'IN');
	}else{
		restriction.addClause('waste_out.waste_id','','is null');
	}
	reportForm.restriction = restriction;
	command.result = true;
}
/**
 * Validate if units and unit type field list is null,true:''|false:not null
 * @param unitType
 * @param unit
 * @param message
 * @returns {Boolean}
 */
function validateUnitAndUnittype(unitType,unit,message){
	var unitType = $(unitType).value;
	var unit = $(unit).value;
	if(unitType==''||unit==''){
		View.alert(getMessage(message));
		return true;
	}
	return false;
}

/**
 * Validate if field is minus.if the field value is minus ,return true,else false.
 * @param formObject,form object
 * @param fieldArray,needed validate field name and message name for field title
 * @param messageName1,value is and connect sign.
 * @param messageName2,alert part message.
 * @returns {Boolean}
 */
function minusCanNotSaved(formObject,fieldArray,messageName1,messageName2){
	var str='';
	for(var i=0;i<fieldArray.length;i++){
		var fieldValue=formObject.getFieldValue(fieldArray[i][0]);
		if(fieldValue<0&&str==''){
			str=getMessage(fieldArray[i][1]);
		}else if(fieldValue<0&&str!=''){
			str=str+' '+getMessage(messageName1)+' '+getMessage(fieldArray[i][1]);
		}
	}
	if(str!=''){
		str=str+" "+getMessage(messageName2);
		View.alert(str);
		return true;
	}
	return false;
}
/**
 * check area and site
 * @param formObject,form object
 * @param fieldArray,needed validate field name and message name for field title
 * @param messageName1,value is and connect sign.
 * @param messageName2,alert part message.
 * @returns {Boolean}
 */
function checkAreaAndSite(form,areaDs){
	var area=form.getFieldValue('waste_out.storage_location');
	var site=form.getFieldValue('waste_out.site_id');
	if(area!=""&&site!=""){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('waste_areas.storage_location', area);
	restriction.addClause('waste_areas.site_id', site);
	var records=areaDs.getRecords(restriction);
	return records.length>0;
	}else{
		return true;
	}
}
