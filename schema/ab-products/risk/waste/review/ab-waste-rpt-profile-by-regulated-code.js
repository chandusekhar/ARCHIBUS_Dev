/**

* @author xianchao

*/
var abWasteRptProByReguCodeController = View.createController('abWasteRptProByReguCodeController',
{
	//after view load,get dropdown list and fill it
	afterViewLoad: function(){
		var recs = this.abWasteRptProByReguCodeConsoleDS.getRecords();
		// get dropdown list by itemSelectId
		var itemSelect = $('code');
		populateTypeSelectLists(recs,itemSelect,'waste_regulated_codes.regulated_code','All');
	},
	
	//Click show button 
	abWasteRptProByReguCodeConsole_onShow : function() {
		var code=$('code').value;
		var codeType=this.abWasteRptProByReguCodeConsole.getFieldValue('waste_regulated_codes.regulated_code_type');
		var res=new Ab.view.Restriction();
		if(code!='All'){
			res.addClause('waste_regulated_codes.regulated_code', code+ '%', "LIKE");
		}
		if(codeType!=''){
			res.addClause('waste_regulated_codes.regulated_code_type', codeType);
		}
		this.abWasteRptProByReguCodeGrid.refresh(res);
	},
	abWasteRptProByReguCodeConsole_onClear: function(){
		var itemSelect = $('code');
		itemSelect.options[0].setAttribute('selected', true);
		this.abWasteRptProByReguCodeConsole.clear();
		
	}
});
/**
* populate select items to dropdown list and set default value
*/
function populateTypeSelectLists(recs, itemSelect,fieldName,defaultValue) {
	itemSelect.innerHTML = '';
	var option1 = document.createElement('option');
	option1.value = 'All';
	option1.appendChild(document.createTextNode(getMessage("optionAll")));
	itemSelect.appendChild(option1);
	var array = new Array() ;
	for (var i = 0; i < recs.length; i++) {
		var item = recs[i].values[fieldName];
		array.push(item.substr(0,1));
	}
	var items=array.delRepeat();
	for (var i = 0; i < items.length; i++) {
		var option = document.createElement('option');
		option.value = items[i];
		option.appendChild(document.createTextNode(items[i]));
		itemSelect.appendChild(option);
	}
	var optionIndexType = null;
	optionIndexType = getOptionIndex(itemSelect, defaultValue);
	itemSelect.options[optionIndexType].setAttribute('selected', true);
	itemSelect.value = defaultValue;
}
// Get option Index 
function getOptionIndex(select, value) {
	if(!select.options) return -1;
	for(var oNum = 0; oNum != select.options.length; oNum++) {
		if(select.options[oNum].value == value) return oNum;
	}
	return -1;
}
//Removal of duplication
Array.prototype.delRepeat=function(){
	var newArray=[];
	var provisionalTable = {};
	for (var i = 0, item; (item= this[i]) != null; i++) {
		if (!provisionalTable[item]) {
			newArray.push(item);
			provisionalTable[item] = true;
		}
	}
	return newArray;
}
//when click abWasteRptProByReguCodeGrid record field,call this function
function clickCode(){
	var grid = abWasteRptProByReguCodeController.abWasteRptProByReguCodeGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var code = rows[num]['waste_regulated_codes.regulated_code'];
	var codeType = rows[num]['waste_regulated_codes.regulated_code_type'];
	var res=new Ab.view.Restriction();
	res.addClause('waste_profile_reg_codes.regulated_code', code);
	res.addClause('waste_profile_reg_codes.regulated_code_type', codeType);
	abWasteRptProByReguCodeController.abWasteRptProByReguCodeDetailGrid.refresh(res);
	
}
