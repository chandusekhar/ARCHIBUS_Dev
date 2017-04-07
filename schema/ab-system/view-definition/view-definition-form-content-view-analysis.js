/******************************************************************
	Javascript Api to handle View Analysis form in Tgrp.
	Yong Shao
	3-03-2005
 ******************************************************************/
var arrMDX = new Array();
//following variables holding the properties of currently selected item
var currentItemTitle = "";
var currentItemField = "";
var currentItemOperator = "";
var currentItemSQL   = "";
var currentItemSQLBApply = "";
var arrDisplayFormAsPieCharts = new Array();
var display_format = "off";


/*****************************************************************
 HTML form's names and DIV's id and form's element's names will be
 overwritten in XSLT by XSLT's defined variables
 *****************************************************************/
//Four HTML DIV IDs
var EditAreaID	= "EditArea";
var FieldAreaID = "FieldArea";
var TableAreaID = "TableArea";
var SQLAreaID	= "SQLArea";
var OperatorAreaID = "OperatorArea";
//afmInputsForm's element names
var itemsName		= "items";
var titleName       = "title";
var fieldsName		= "fields";
var tablesName		= "tables";
var operatorsName	= "operators";
var sqlName		= "sql";
var bApplyName		= "bApply";
var EditOKButtonName= "EditOKButton";
var EditCancelButtonName="EditCancelButton";
var countNumericField = 0;
var warningMessage1 = "";
var warningMessage2 = "";
var temp_total_dimensions = 0;

///////////////////////////
var chart_type  = "";
//var chart_title = "";
var chart_cat_label="";
var chart_val_label="";
var chart_width = "";
var chart_height = "";
var chart_orientation = "";
var chart_show_cat_gridline="";
var chart_show_val_gridline="";
var chart_show_item_tooltip="";
var chart_show_item_label="";
var chart_show_cat_label_by_way="";
var chart_show_legend="";
var chart_show_Title="";
var chart_config_view_file = "";

///////////////////////////
//hold all operators: arrOperatorObject["count-percent"]="Count Percentage";
var arrOperatorObject = new Array();

///////////////////////////////
var currentSelectedShowFormattingIndex = 0;

//called by XSLT to save items and their properties to array
/**************************************************
	arrMDX['item1'][0]:title(string)
	arrMDX['item1'][1]:operator(string)
	arrMDX['item1'][2]:field(as rm.rm_id or rm. or .)(string)
	arrMDX['item1'][3]:applyAllRestrictions(string)
	name::"itemX"; value::new Array(title, operator, field, applyAllRestrictions)
***************************************************/
function setUpArrMDX(name, value)
{
	arrMDX[name] = value;
}

//delete selected item
function onItemDelete()
{
	var objForm	= document.forms[afmInputsFormName];
	var objItems	= null;

	if(objForm != null)
	{
		objItems = objForm.elements[itemsName];
	}
	if(objItems != null && !objItems.disabled)
	{
		objForm.elements[titleName].value="";
		
		for(var i = 0; i < objItems.length; i++)
		{
			if(objItems[i].selected)
			{
				//last item is dump to keep select box's size
				if(i != objItems.length-1)
					objItems.options[i] = null;
				//disable inputs in "Edit form"
				//enableOrDisableAll(false);
				break;
			}
		}
		//focus the first item????
		objItems[0].selected=1;
		objItems[0].focus();
		
		if(objItems.length > 1)
		{
			var arrItemIndex = objItems[0].value;
			var currentItemTitle	= arrMDX[arrItemIndex][0];
			objForm.elements[titleName].value=currentItemTitle;
			
			var currentItemOperator = arrMDX[arrItemIndex][1];
			var currentItemField	= arrMDX[arrItemIndex][2];
			
			var objFields		= objForm.elements[fieldsName];
			var objOperators	= objForm.elements[operatorsName];
			
			for(var i=0; i<objOperators.length; i++)
			{
				if(objOperators[i].value==currentItemOperator)
				{
					objOperators[i].selected = 1;
					break;
				}
			}
			for(var i=0; i<objFields.length; i++)
			{
				if(objFields[i].value==currentItemField)
				{
					objFields[i].selected = 1;
					break;
				}
			}	
		}
	}
	
	if(currentItemOperator != "count" && currentItemOperator != "count-percent" && countNumericField > 0)
	{
		showOrHideHTMLArea(true, FieldAreaID);		
	}else{
		showOrHideHTMLArea(false, FieldAreaID);	
	}
}
//add new item
//normal statistic as default with a field selection
function onAdd()
{
	var onAddButton = document.getElementById("onAddButton");
	if(!onAddButton.disabled)
	{
		var objForm	= document.forms[afmInputsFormName];
		var objTitle	= null;
		//var objBApply	= null;
		var objEditOKButton	= null;
		var objEditCancelButton	= null;
		var objItems	= null;

		if(objForm != null)
		{
			objItems = objForm.elements[itemsName];
			objTitle = objForm.elements[titleName];
			//objBApply = objForm.elements[bApplyName];
			objEditOKButton	= document.getElementById(EditOKButtonName);
			objEditCancelButton = document.getElementById(EditCancelButtonName);
		}

		if(objItems != null)
		{
			//last item (dump item) is selected in items list
			objItems[objItems.length-1].selected			= 1;
			objForm.elements[titleName].value				= "";
			if(objForm.elements[fieldsName].length >0 )
				objForm.elements[fieldsName][0].selected	= 1;
			objForm.elements[operatorsName][0].selected		= 1;
			//objForm.elements[bApplyName].checked			= 0;
			showOrHideHTMLArea(true, OperatorAreaID);
			showOrHideHTMLArea(false, SQLAreaID);
			objTitle.onfocus = DisableReadOnly;
			//objBApply.disabled = 0;
			objEditOKButton.disabled = 0;
			objEditCancelButton.disabled = 0;
			
			if(currentItemOperator != "count" && currentItemOperator != "count-percent" && countNumericField > 0)
			{
				showOrHideHTMLArea(true, FieldAreaID);
				//showOrHideHTMLArea(false, TableAreaID);
			}
			else
			{
				showOrHideHTMLArea(false, FieldAreaID);
				//showOrHideHTMLArea(true, TableAreaID);
			}
		}
	}
}
//handle visiblity of HTML area
//AreaID: "TableArea"||"FieldArea"||"SQLArea"
function showOrHideHTMLArea(bShow, AreaID)
{
	var objArea = document.getElementById(AreaID);
	if(objArea != null)
	{
		if(bShow)
		{
			objArea.style.display = "";
			enableOrDisableAll(true);
		}
		else
		{
			objArea.style.display = "none";
		}
	}
}

function enableOrDisableAll(bEnable)
{
	var objForm	= document.forms[afmInputsFormName];
	var objEditArea = document.getElementById(EditAreaID);
	var onAddButton = document.getElementById("onAddButton");
	var onItemDeleteButton = document.getElementById("onItemDeleteButton");
	var displayFormatObj = document.getElementById("displayFormat");
	var EditCancelButtonObj = document.getElementById(EditCancelButtonName);
	var objItems = objForm.elements[itemsName];
	if(objForm != null)
	{
		if(bEnable)
		{
			objForm.elements[titleName].disabled		= 0;
			objForm.elements[fieldsName].disabled		= 0;
			objForm.elements[tablesName].disabled		= 0;
			objForm.elements[operatorsName].disabled	= 0;
			objForm.elements[sqlName].disabled		= 0;
			objEditArea.disabled				= 0;
			onAddButton.disabled				= 0;
			onItemDeleteButton.disabled			= 0;
			displayFormatObj.disabled = 0;
			EditCancelButtonObj.disabled = 0;
			objItems.disabled = 0;
		}
		else
		{
			objForm.elements[titleName].disabled		= 1;
			objForm.elements[fieldsName].disabled		= 1;
			objForm.elements[tablesName].disabled		= 1;
			objForm.elements[operatorsName].disabled	= 1;
			objForm.elements[sqlName].disabled		= 1;
			objEditArea.disabled				= 1;
			onAddButton.disabled				= 1;
			onItemDeleteButton.disabled			= 1;
			displayFormatObj.disabled = 1;
			EditCancelButtonObj.disabled = 1;
			objItems.disabled = 1;
		}
	}
}

//called when users select "operator"
function setUpOperator(elemObj)
{
	var temp_selectedOperator = "";
	if(elemObj != null)
	{
		for(var i = 0; i < elemObj.length; i++)
		{
			if(elemObj[i].selected)
			{
				temp_selectedOperator = elemObj[i].value;
				break;
			}
		}
		/*if(temp_selectedOperator == "SQL")
		{
			//sql
			showOrHideHTMLArea(false, FieldAreaID);
			showOrHideHTMLArea(false, TableAreaID);
			showOrHideHTMLArea(true, SQLAreaID);
		}*/
		if(temp_selectedOperator == "COUNT-TABLE")
		{
			//COUNT(*)
			showOrHideHTMLArea(false, FieldAreaID);
			showOrHideHTMLArea(true, OperatorAreaID);
			//showOrHideHTMLArea(true, TableAreaID);
			showOrHideHTMLArea(false, SQLAreaID);
		}
		else
		{
			//COUNT on selected field
			showOrHideHTMLArea(true, FieldAreaID);
			showOrHideHTMLArea(true, OperatorAreaID);
			//showOrHideHTMLArea(false, TableAreaID);
			showOrHideHTMLArea(false, SQLAreaID);
		}
		if(temp_selectedOperator == "count" || temp_selectedOperator == "count-percent")
		{
			showOrHideHTMLArea(false, FieldAreaID);
		}
	}
}

//using functions to make form's inputs readonly true or false
function MeReadOnly(){this.blur()}
function DisableReadOnly(){return false;}
/////////////////////////////////////////////////////
//handle page's load and item's selection action
function checkOnLoad(bLoaded, total_dimensions)
{
	if(total_dimensions=="")
		total_dimensions="0";
	if(total_dimensions!="null")
		total_dimensions = parseInt(total_dimensions, 10);

	temp_total_dimensions = total_dimensions;

	filterPieChart(total_dimensions);
	{
		var displayFormatObj = document.getElementById("displayFormat");
		for(var i=0; i<displayFormatObj.length; i++)
		{
			if(displayFormatObj[i].value==display_format)
			{

				displayFormatObj[i].selected=1;
				break;
			}
		}

	}
	
	var objForm		= document.forms[afmInputsFormName];
	var objTitle		= objForm.elements[titleName];
	var objFields		= objForm.elements[fieldsName];
	var objTables		= objForm.elements[tablesName];
	var objOperators	= objForm.elements[operatorsName];
	//var objBApply		= objForm.elements[bApplyName];
	var objItems		= objForm.elements[itemsName];
	var objSql		= objForm.elements[sqlName];
	var objEditOKButton	= document.getElementById(EditOKButtonName);
	var objEditCancelButton	= document.getElementById(EditCancelButtonName);
	var objEditArea		= document.getElementById(EditAreaID);
	var bNoField = false;
	var temp_array = new Array();
	////
	var selectedShowFormattingObj = objForm.elements["dimensions"];
	if(selectedShowFormattingObj!=null && selectedShowFormattingObj.length!=null)
	{
		for(var i=0; i<selectedShowFormattingObj.length; i++)
		{
			if(selectedShowFormattingObj[i].selected)
			{
				currentSelectedShowFormattingIndex = i;
				break;
			}
		}
	}
	
	//called by page's load process
	if(bLoaded)
	{
		//first item is selected
		objItems[0].selected = 1;
	}

	//if there is real item, set up values for selected item
	if(!(objItems[objItems.length -1].selected))
	{
		var arrItemIndex = "";
		objEditOKButton.disabled		= 0;
		objEditCancelButton.disabled	= 0;
		//skip last item(dump)
		for(var i = 0; i < objItems.length-1; i++)
		{
			if(objItems[i].selected)
			{
				arrItemIndex = objItems[i].value;
				currentItemTitle	= arrMDX[arrItemIndex][0];
				currentItemOperator = arrMDX[arrItemIndex][1];
				currentItemField	= arrMDX[arrItemIndex][2];
				
				for(var i=0; i<objOperators.length; i++)
				{
					if(objOperators[i].value==currentItemOperator)
					{
						objOperators[i].selected = 1;
						break;
					}
				}	
				break;
			}
		}
	}
	
	if(currentItemSQLBApply=="")
	{
		currentItemSQLBApply = "true";
	}
	//objBApply.disabled = 0;

	//check if there is db field with currentItemField like
	//"rm.rm_id"
	//temp_array = currentItemField.split(".");
	//suppose that temp_array[1] = "rm";
	//and temp_array[1] = "rm_id";
	if(currentItemField=="")
		bNoField = true;

	

	if(currentItemTitle != "" && currentItemOperator != "")
	{
		//set up title input
		objTitle.value = currentItemTitle;
		objTitle.onfocus = DisableReadOnly;

		//edit for a normal one rather then SQL
		if(currentItemOperator != "SQL")
		{
			showOrHideHTMLArea(false, SQLAreaID);
			showOrHideHTMLArea(true, OperatorAreaID);
			//set up selected field in fields list
			if(bNoField)
			{
				//show selected table
				//showOrHideHTMLArea(false, FieldAreaID);
				//showOrHideHTMLArea(true, TableAreaID);
				for(var i = 0; i < objTables.length; i++)
				{
					if(objTables[i].value == currentItemField)
					{
						objTables[i].selected = 1;
						break;
					}
				}
			}
			else
			{
				//show selected field
				//showOrHideHTMLArea(true, FieldAreaID);
				//showOrHideHTMLArea(false, TableAreaID);

				for(var i = 0; i < objFields.length; i++)
				{
					if(objFields[i].value == currentItemField)
					{
						objFields[i].selected = 1;
						break;
					}
				}
			}
		}
		else
		{
			//advanced SQL statement case
			showOrHideHTMLArea(true, SQLAreaID);
			//showOrHideHTMLArea(false, FieldAreaID);
			
			//showOrHideHTMLArea(false, TableAreaID);
			showOrHideHTMLArea(false, OperatorAreaID);
			//set up SQL input
			objSql.value			= currentItemSQL;
			objTitle.onfocus		= MeReadOnly;
			objSql.onfocus			= MeReadOnly;
			//objBApply.disabled		= 1;
			objEditOKButton.disabled	= 1;
			objEditCancelButton.disabled	= 1;
		}
	}
	else
	{
		//there is no real item in items list
		//then enable "edit area" for a normal one
		showOrHideHTMLArea(false, SQLAreaID);
		//showOrHideHTMLArea(true, FieldAreaID);
		showOrHideHTMLArea(true, OperatorAreaID);
		//showOrHideHTMLArea(false, TableAreaID);
		//first field in fields list is default
		//????
		if(objFields.length > 0)
			objFields[0].selected = 1;
		//first operator is selected
		objOperators[0].selected = 1;
	}
	
	if(!bLoaded && (objItems[objItems.length -1].selected))
	{
		objTitle.value="";
	}

	//XXX:
	if(currentItemOperator == "count" || currentItemOperator == "count-percent" || countNumericField <= 0)
	{
		showOrHideHTMLArea(false, FieldAreaID);
	}

	if(currentItemOperator != "count" && currentItemOperator != "count-percent" && countNumericField > 0)
	{
		showOrHideHTMLArea(true, FieldAreaID);
	}

	///mdx chart
	var objChartConfigAction = document.getElementById("chartConfigAction");
	if(chart_type=="off" || chart_type=="table" || chart_type=="")
	{
		objChartConfigAction.disabled = 1;
	}else{
		objChartConfigAction.disabled = 0;
	}

	if(chart_type=="barChart" || chart_type=="barChart3D" || chart_type=="stackedBarChart" || chart_type=="stacked3DBarChart" || chart_type=="lineChart" || chart_type=="areaChart" || chart_type=="stackedAreaChart")
	{
		chart_config_view_file = "view-definition-form-content-view-analysis-chart-config.axvw";
	}else if(chart_type=="pieChart_Row" || chart_type=="pieChart_Col" || chart_type=="PieChart3D_Row" || chart_type=="PieChart3D_Col") {
		chart_config_view_file = "view-definition-form-content-view-analysis-chart-pie-config.axvw";
	}
	
	{
		chart_width = trim(chart_width);
		if(chart_width=="")
			chart_width = "600";
		chart_height = trim(chart_height);
		if(chart_height=="")
			chart_height = "500";
		chart_orientation = trim(chart_orientation);
		if(chart_orientation=="")
			chart_orientation="VERTICAL";
		chart_show_cat_gridline=trim(chart_show_cat_gridline);
		if(chart_show_cat_gridline=="")
			chart_show_cat_gridline="true";
		chart_show_val_gridline=trim(chart_show_val_gridline);
		if(chart_show_val_gridline=="")
			chart_show_val_gridline="true";
		chart_show_item_tooltip=trim(chart_show_item_tooltip);
		if(chart_show_item_tooltip=="")
			chart_show_item_tooltip="true";
		chart_show_item_label=trim(chart_show_item_label);
		if(chart_show_item_label=="")
			chart_show_item_label="false";
		chart_show_cat_label_by_way = trim(chart_show_cat_label_by_way);
		if(chart_show_cat_label_by_way=="")
			chart_show_cat_label_by_way="45";
		
		chart_show_legend = trim(chart_show_legend);
		if(chart_show_legend=="")
			chart_show_legend="true";
		
		chart_show_Title = trim(chart_show_Title);
		if(chart_show_Title=="")
			chart_show_Title="false";
	}

	{
		//set up operator list
		if(total_dimensions==2){
			removePercentageOperators();
		}else if(total_dimensions==0){
			enableOrDisableAll(false);
		}


	}

	if(chart_type=="off")
	{
		enableOrDisableAll(false);
	}

}
//"Cancel" button action in "edit area"
function resetEditArea()
{
	var EditCancelButtonObj	= document.getElementById(EditCancelButtonName);
	if(!EditCancelButtonObj.disabled)
	{
		var objForm		= document.forms[afmInputsFormName];
		var objItems		= objForm.elements[itemsName];
		var currentItemIndex = "";
		//according to current title variable, find its array item index
		for(var index in arrMDX)
		{
			if(arrMDX[index][0] == currentItemTitle)
			{
				currentItemIndex = index;
				break;
			}
		}
		//using currentItemIndex to set up selected item in item list
		for(var i = 0; i < objItems.length; i++)
		{
			if(objItems[i].value == currentItemIndex)
			{
				objItems[i].selected = 1;
				break;
			}
		}
		checkOnLoad(false, temp_total_dimensions);
	}
}

//when users click on "OK" button in "edit area"
function onEditOK()
{
	var objEditOKButton = document.getElementById(EditOKButtonName);
	if(!objEditOKButton.disabled)
	{
		var objForm		= document.forms[afmInputsFormName];
		var objTitle		= objForm.elements[titleName];
		var objFields		= objForm.elements[fieldsName];
		var objTables		= objForm.elements[tablesName];
		var objOperators	= objForm.elements[operatorsName];
		//var objBApply		= objForm.elements[bApplyName];
		var objItems		= objForm.elements[itemsName];
		var objSql		= objForm.elements[sqlName];
		var bAddNew  = false;
		var strSelectedOperator = "";
		var selectedItemIndex = "";
		//(when users push "Add" button, last item(dump) is always
		//selected) check if "Add new" is true
		if(objItems.length == 1 || objItems[objItems.length-1].selected)
		{
			bAddNew = true;
		}
		//getting operator in "edit area"
		for(var i = 0; i < objOperators.length; i++)
		{
			if(objOperators[i].selected)
				strSelectedOperator = objOperators[i].value;
		}

		//title input must have text or operator is "SQL" sql input is not
		//empty, otherwise do dothing
		objTitle.value = trim(objTitle.value);
		if((objTitle.value != "" && strSelectedOperator != "SQL") ||(objTitle.value != "" && strSelectedOperator == "SQL" && objForm.sql.value != "") )
		{
			//set up title variable
			currentItemTitle = objTitle.value;
			if(checkDuplicateMeasureName(currentItemTitle))
			{
				alert(warningMessage2);
				objTitle.focus();
				//Netscape?????
				objTitle.focus();
			}else{
			//set up operator variable
			if(strSelectedOperator == "COUNT-TABLE")
				currentItemOperator = "COUNT";
			else
				currentItemOperator = strSelectedOperator;
			

			if(strSelectedOperator != "SQL")
			{
				//normal
				if(strSelectedOperator == "COUNT-TABLE")
				{
					for(var i = 0; i < objTables.length; i++)
					{
						if(objTables[i].selected)
							currentItemField = objTables[i].value;
					}
				}
				else
				{
					for(var i = 0; i < objFields.length; i++)
					{
						if(objFields[i].selected)
							currentItemField = objFields[i].value;
					}
				}

				currentItemSQL = "";
			}
			else
			{
				currentItemField = "";
				currentItemSQL = objSql.value;
			}

			//update "items" list and array arrMDX
			if(bAddNew)
			{
				//create one new item
				var temp_length = objItems.length;
				var temp_index = "item" + temp_length;
				//add new option to select list
				//Option('interface string','value')
				objItems[temp_length-1] = new Option(currentItemTitle, temp_index);
				//select new item
				objItems[temp_length-1].selected = 1;
				//adding temp item as last one in items list
				//keeping white space, it'll keep select's size
				objItems[temp_length] = new Option("","");
				//adding item's values into array arrMDX
				arrMDX[temp_index] = new Array(currentItemTitle,currentItemOperator,currentItemField,currentItemSQLBApply);
			}
			else
			{
				//modify selected item
				//getting selected item's value
				for(var i = 0; i < objItems.length; i++)
				{
					if(objItems[i].selected)
					{
						selectedItemIndex = objItems[i].value;
						objItems[i].innerHTML = currentItemTitle;
						break;
					}
				}
				if(selectedItemIndex != "")
				{
					//adding item's values into array arrMDX
					arrMDX[selectedItemIndex] = new Array(currentItemTitle,currentItemOperator,currentItemField,currentItemSQLBApply);
				}
			}
		}
		}
	}
}
//this function will be called by sendingDataFromHiddenForm() in common.js
//arrMDX['item1'][0]:title(string)
//arrMDX['item1'][1]:operator(string)
//arrMDX['item1'][2]:field(as rm.rm_id or rm. or .)(string)
//arrSatistics['item1'][3]:applyAllRestrictions(string)
function gettingRecordsData()
{
	var objForm	= document.forms[afmInputsFormName];
	var objItems	= objForm.elements[itemsName];
	var xml = "";
	var tem_title = "";
	var temp_operator = "";
	var temp_field = "";
	var temp_sql = "";
	//var temp_bApply = false;
	var selectedItem = "";
	var strFieldName = "";
	var strTableName = "";
	var tem_array = new Array();

	if(objItems != null)
	{
		//excluding last item(it's a dump item to keep form's size)
		for(var i = 0; i < objItems.length - 1; i++)
		{
			selectedItem	= objItems[i].value;
			temp_title	= arrMDX[selectedItem][0] ;
			temp_title = convert2validXMLValue(temp_title);
			temp_operator	= arrMDX[selectedItem][1] ;
			temp_field	= arrMDX[selectedItem][2] ;
	
			xml	= xml+ '<measure';
			xml	= xml+ ' name="'+temp_title+'" ';
			xml	= xml+ ' aggregator="'+temp_operator+'" ';
			temp_field = trim(temp_field);
			
			xml	= xml+ ' column="'+temp_field+'" ';
			
			xml = xml + '/>';
		}
	}
	var chartProperties = '';
	if(!document.getElementById("chartConfigAction").disabled)
	{
		chartProperties = '<chartProperties width="'+chart_width+'" height="'+chart_height+'" orientation="'+chart_orientation+'" showCategoryGridline="'+chart_show_cat_gridline+'" showValueGridline="'+chart_show_val_gridline+'" showItemTooltip="'+chart_show_item_tooltip+'" showItemLabel="'+chart_show_item_label+'" showCategoryBy="'+chart_show_cat_label_by_way+'" chartShowLegend="'+chart_show_legend+'" chartShowTitle="'+chart_show_Title+'"/>'
	}
	var dimensions = objForm.elements["dimensions"].value;
	var displayFormat = objForm.elements["displayFormat"].value;
	//if(xml != "")
	xml = '<userInputRecordsFlag><preferences dimensions="'+dimensions+'" format="'+displayFormat+'">'+chartProperties+'<measures>'+ xml + '</measures></preferences></userInputRecordsFlag>';
	
	return xml;
}

function openChartConfig(elem)
{
	if(!elem.disabled)
	{
		openNewContent(chart_config_view_file, "_blank");
	}

}

function setChartConfig(elem)
{
	for(var i=0; i<elem.length; i++)
	{
		if(elem[i].selected)
		{
			chart_type=elem[i].innerHTML;
			break;
		}
	}
	var objChartConfigAction = document.getElementById("chartConfigAction");

	if(elem.value=="off" || elem.value=="table")
	{
		objChartConfigAction.disabled = 1;
	}else{
		objChartConfigAction.disabled = 0;
	}	
	
	if(elem.value=="barChart" || elem.value=="barChart3D" || elem.value=="stackedBarChart" || elem.value=="stacked3DBarChart" || elem.value=="lineChart" || elem.value=="areaChart" || elem.value=="stackedAreaChart")
	{
		chart_config_view_file = "view-definition-form-content-view-analysis-chart-config.axvw";
	}else if(elem.value=="pieChart_Row" || elem.value=="pieChart_Col" || elem.value=="PieChart3D_Row" || elem.value=="PieChart3D_Col") {
		chart_config_view_file = "view-definition-form-content-view-analysis-chart-pie-config.axvw";
	}
	display_format = elem.value;
}

function setUpAnalysisTypes()
{
	var temp_dimensions = 0;
	var dimensionsObj = document.getElementById("dimensions");
	for(var i=0; i<dimensionsObj.length; i++)
	{
		if(dimensionsObj[i].selected)
		{
			currentSelectedShowFormattingIndex = i;
			temp_dimensions = dimensionsObj[i].value;
			break;
		}
	}
	enableOrDisableAll(true);
	if(temp_dimensions==1){
		resetAllOperators();
		filterPieChart(1);
		
	}else if(temp_dimensions==2){
		var bConfirm = cleanUusupportedMeasures();
		if(bConfirm)
		{
			setSupportedOperators();
			filterPieChart(2);
		}
	}else{
		enableOrDisableAll(false);
	}
	
	var objChartConfigAction = document.getElementById("chartConfigAction");
	if(temp_dimensions==0)
	{
		objChartConfigAction.disabled=1;
	}
	var displayFormatObj = document.getElementById("displayFormat");
	for(var i=0; i<displayFormatObj.length; i++)
	{
		if(displayFormatObj[i].value==display_format)
		{

			displayFormatObj[i].selected=1;
			break;
		}
	}
}

function removePercentageOperators()
{
	var objOperators = document.getElementById(operatorsName);
	if(objOperators!=null && objOperators.length!=null)
	{
		var size = objOperators.length;
		for(var i=0; i<size; i++)
		{
			if(objOperators[i]!=null && (objOperators[i].value=="count-percent" || objOperators[i].value=="sum-percent"))
				objOperators[i] = null;
		}
	}
}

function setSupportedOperators()
{
	removeAllOPerators();
	var objOperators	= document.getElementById(operatorsName);
	if(objOperators!=null)
	{
		for(var name in arrOperatorObject)
		{
			if(name=="count"){
				objOperators[0]=new Option(arrOperatorObject[name], name);
			}else if(name=="sum"){
				objOperators[1]=new Option(arrOperatorObject[name], name);
			}
		}	
	}
}

function resetAllOperators()
{
	removeAllOPerators();
	var objForm		= document.forms[afmInputsFormName];
	var objOperators	= objForm.elements[operatorsName];
	for(var name in arrOperatorObject)
	{
		if(name=="count"){
			objOperators[0]=new Option(arrOperatorObject[name], name);
		}else if(name=="count-percent"){
			objOperators[1]=new Option(arrOperatorObject[name], name);
		}else if(name=="sum"){
			objOperators[2]=new Option(arrOperatorObject[name], name);
		}else if(name=="sum-percent"){
			objOperators[3]=new Option(arrOperatorObject[name], name);
		}

	}
	
	var objItems = document.getElementById(itemsName);
	objItems[0].selected=1;
	objItems[0].focus();
	
	var selectedItem = objItems[0].value;
	if(selectedItem!=null && selectedItem!="")
	{
		var operator = arrMDX[selectedItem][1];
		if(operator=="count-percent")
			objOperators[1].selected=1;
		else if(operator=="sum")
			objOperators[2].selected=1;
		else if(operator=="sum-percent")
			objOperators[2].selected=1;
		else
			objOperators[0].selected=1;
	}	
	
	
}

function removeAllOPerators()
{
	var objOperators = document.getElementById(operatorsName);
	if(objOperators.length!=null)
		objOperators.length = 0;
}

function cleanUusupportedMeasures()
{
	var objForm	= document.forms[afmInputsFormName];
	var objMeasures	= objForm.elements[itemsName];

	var bContainPercentageMeasures = false;
	var bConfirm = true;

	if(objMeasures != null && objMeasures.length != null)
	{
		for(var i = 0; i < objMeasures.length; i++)
		{
			var selectedItem = objMeasures[i].value;
			if(selectedItem!="")
			{
				var temp_operator = arrMDX[selectedItem][1] ;
				if(temp_operator == "count-percent" || temp_operator == "sum-percent")
				{
					bContainPercentageMeasures = true;
					break;
				}
			}
		}
	}

	if(bContainPercentageMeasures)
		bConfirm = confirm(warningMessage1);

	if(bConfirm)
	{
		if(objMeasures != null && objMeasures.length != null)
		{
			var tempMDXArray = new Array();

			for(var i = 0; i < objMeasures.length; i++)
			{
				var selectedItem = objMeasures[i].value;
				if(selectedItem!="")
				{
					var temp_title	= arrMDX[selectedItem][0] ;
					var temp_operator = arrMDX[selectedItem][1] ;
					var temp_field	= arrMDX[selectedItem][2] ;
					if(temp_operator != "count-percent" && temp_operator != "sum-percent")
					{
						tempMDXArray[selectedItem] = new Array();
						tempMDXArray[selectedItem][0] =  temp_title;
						tempMDXArray[selectedItem][1] =  temp_operator;
						tempMDXArray[selectedItem][2] =  temp_field;
					}
				}
			}

			//reset up supported measures in the box
			objMeasures.length=0
			var currentItemTitle	= "";
			var currentItemOperator = "";
			var currentItemField	= "";

			var tempCount = 0;
			for(var name in tempMDXArray)
			{
				if(tempCount==0)
				{
					currentItemTitle = tempMDXArray[name][0];
					currentItemOperator = tempMDXArray[name][1];
					currentItemField = tempMDXArray[name][2];
				}
				objMeasures[tempCount++]=new Option(tempMDXArray[name][0], name);

			}

			//just keep one as empty to add new measure
			if(objMeasures.length==0)
			{
				objForm.elements[titleName].value=""

			}

			objMeasures[objMeasures.length] = new Option("", "");


			if(objMeasures.length > 1)
			{
				var objFields		= objForm.elements[fieldsName];
				var objOperators	= objForm.elements[operatorsName];

				objForm.elements[titleName].value=currentItemTitle;
				for(var i=0; i<objOperators.length; i++)
				{
					if(objOperators[i].value==currentItemOperator)
					{
						objOperators[i].selected = 1;
						break;
					}
				}
				for(var i=0; i<objFields.length; i++)
				{
					if(objFields[i].value==currentItemField)
					{
						objFields[i].selected = 1;
						break;
					}
				}	
			}

			objMeasures[0].selected = 1;
			objMeasures[0].focus();
		}
	}else{
		var selectedShowFormattingObj = objForm.elements["dimensions"];
		selectedShowFormattingObj[currentSelectedShowFormattingIndex].selected=1;
		selectedShowFormattingObj[currentSelectedShowFormattingIndex].focus();
	}

	return bConfirm;
}

function checkDuplicateMeasureName(newName)
{
	var objForm	= document.forms[afmInputsFormName];
	var objMeasures	= objForm.elements[itemsName];
	var result = false;

	if(objMeasures != null && objMeasures.length != null)
	{
		var currentMeasureName = "";
		for(var i = 0; i < objMeasures.length; i++)
		{
			if(objMeasures[i].selected)
			{
				if(objMeasures[i]!=null && objMeasures[i].value!="")
					currentMeasureName = arrMDX[objMeasures[i].value][0] ;
				break;
			}
		}
		
		for(var i = 0; i < objMeasures.length; i++)
		{
			var selectedItem = objMeasures[i].value;
			if(selectedItem!="")
			{
				var name = arrMDX[selectedItem][0] ;
				if(currentMeasureName=="")
				{
					if(name==newName)
					{
						result = true;
						break;
					}
				}else{
					if(currentMeasureName!=name)
					{
						if(name==newName)
						{
							result = true;
							break;
						}
					}
				}
			}
		}
	}
	return result;
}

function validatingTitle(elem_obj)
{
	if(!elem_obj.disabled)
	{
		var strUserInput = elem_obj.value;
		strUserInput = trim(strUserInput);
		var arrIllegalCharactersFromInput = Array();
		arrIllegalCharactersFromInput[0]="[";
		arrIllegalCharactersFromInput[1]="\"";
		arrIllegalCharactersFromInput[2]="/";
		arrIllegalCharactersFromInput[3]="\\";
		arrIllegalCharactersFromInput[4]="<";
		arrIllegalCharactersFromInput[5]=">";
		arrIllegalCharactersFromInput[6]="*";
		arrIllegalCharactersFromInput[7]="|";
		arrIllegalCharactersFromInput[8]="?";
		arrIllegalCharactersFromInput[9]=":";
		arrIllegalCharactersFromInput[10]="&";
		arrIllegalCharactersFromInput[11]="'";
		arrIllegalCharactersFromInput[12]="]";
		arrIllegalCharactersFromInput[13]="{";
		arrIllegalCharactersFromInput[14]="}";
		if(strUserInput!="")
		{
			for(var i = 0; i < arrIllegalCharactersFromInput.length; i++)
			{
				strUserInput = removingAllSpecifiedCharacterFromString(strUserInput, arrIllegalCharactersFromInput[i]);
			}
			elem_obj.value = strUserInput;
		}
		
	}
}

function removingAllSpecifiedCharacterFromString(strInput, strSpecifiedCharacter)
{
	var strReturned = strInput;
	var flag = -1;
	flag = strReturned.indexOf(strSpecifiedCharacter);
	
	while(flag != -1)
	{
		strReturned = strReturned.replace(strSpecifiedCharacter, "");
		flag = strReturned.indexOf(strSpecifiedCharacter);
	}
	return strReturned;
}

function filterPieChart(dimension)
{
	var displayFormatObj = document.getElementById("displayFormat");
	for(var i=0; i<displayFormatObj.length; i++)
	{
		if(displayFormatObj[i].value=="PieChart3D_Col")
		{

			displayFormatObj[i]=null;
			break;
		}
	}
	for(var i=0; i<displayFormatObj.length; i++)
	{
		if(displayFormatObj[i].value=="PieChart3D_Row")
		{

			displayFormatObj[i]=null;
			break;
		}
	}
	for(var i=0; i<displayFormatObj.length; i++)
	{
		if(displayFormatObj[i].value=="pieChart_Col")
		{

			displayFormatObj[i]=null;
			break;
		}
	}
	for(var i=0; i<displayFormatObj.length; i++)
	{
		if(displayFormatObj[i].value=="pieChart_Row")
		{

			displayFormatObj[i]=null;
			break;
		}
	}
	if(dimension==1)
	{
		
		//adding others
		for(var name in arrDisplayFormAsPieCharts)
		{
			if(name=="PieChart3D_Row"
			   || name=="pieChart_Row")
			{
				
				displayFormatObj[displayFormatObj.length]=new Option(arrDisplayFormAsPieCharts[name], name);
			}

		}
	}
}



	