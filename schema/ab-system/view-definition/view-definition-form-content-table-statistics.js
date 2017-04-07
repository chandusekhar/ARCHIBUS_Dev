/******************************************************************
	Javascript Api to handle statistics form in Tgrp.
 ******************************************************************/
var arrSatistics = new Array();
//following variables holding the properties of currently selected item
var currentItemTitle = "";
var currentItemField = "";
var currentItemOperator = "";
var currentItemSQL   = "";
var currentItemSQLBApply = "";


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
var sqlName			= "sql";
var bApplyName		= "bApply";
var EditOKButtonName= "EditOKButton";
var EditCancelButtonName="EditCancelButton";
var countNumericField = 0;

//called by XSLT to save items and their properties to array
/**************************************************
	arrSatistics['item1'][0]:title(string)
	arrSatistics['item1'][1]:operator(string)
	arrSatistics['item1'][2]:field(as rm.rm_id or rm. or .)(string)
	arrSatistics['item1'][3]:sql(string)
	arrSatistics['item1'][4]:applyAllRestrictions(string)
	name::"itemX"; value::new Array(title, operator, field, sql,
	applyAllRestrictions)
***************************************************/
function setUpArrSatistics(name, value)
{
	arrSatistics[name] = value;
}

//delete selected item
function onItemDelete()
{
	var objForm		= document.forms[afmInputsFormName];
	var objItems	= null;

	if(objForm != null)
	{
		objItems = objForm.elements[itemsName];
	}
	if(objItems != null)
	{
		for(var i =	0; i < objItems.length; i++)
		{
			if(objItems[i].selected)
			{
				//last item is dump to keep select box's size
				if(i != objItems.length-1)
					objItems.options[i] = null;
				//disable inputs in "Edit form"
				enableOrDisableAll(false);
				break;
			}
		}
	}
}
//add new item
//normal statistic as default with a field selection
function onAdd()
{
	var objForm		= document.forms[afmInputsFormName];
	var objTitle	= null;
	var objBApply	= null;
	var objEditOKButton		= null;
	var objEditCancelButton	= null;
	var objItems	= null;

	if(objForm != null)
	{
		objItems = objForm.elements[itemsName];
		objTitle = objForm.elements[titleName];
		objBApply = objForm.elements[bApplyName];
		objEditOKButton		= document.getElementById(EditOKButtonName);
		objEditCancelButton	= document.getElementById(EditCancelButtonName);
	}

	if(objItems != null)
	{
		//last item (dump item) is selected in items list
		objItems[objItems.length-1].selected			= 1;
		objForm.elements[titleName].value				= "";
		if(objForm.elements[fieldsName].length >0 )
			objForm.elements[fieldsName][0].selected	= 1;
		objForm.elements[operatorsName][0].selected		= 1;
		objForm.elements[bApplyName].checked			= 0;
		showOrHideHTMLArea(true, OperatorAreaID);
		showOrHideHTMLArea(false, SQLAreaID);
		objTitle.onfocus = DisableReadOnly;
		objBApply.disabled = 0;
		objEditOKButton.disabled = 0;
		objEditCancelButton.disabled = 0;
		if(countNumericField > 0)
		{
			showOrHideHTMLArea(true, FieldAreaID);
			showOrHideHTMLArea(false, TableAreaID);
		}
		else
		{
			showOrHideHTMLArea(false, FieldAreaID);
			showOrHideHTMLArea(true, TableAreaID);
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
	var objForm		= document.forms[afmInputsFormName];
	var objEditArea = document.getElementById(EditAreaID);
	if(objForm != null)
	{
		if(bEnable)
		{
			objForm.elements[titleName].disabled		= 0;
			objForm.elements[fieldsName].disabled		= 0;
			objForm.elements[tablesName].disabled		= 0;
			objForm.elements[operatorsName].disabled	= 0;
			objForm.elements[sqlName].disabled			= 0;
			objEditArea.disabled						= 0;

		}
		else
		{
			objForm.elements[titleName].disabled		= 1;
			objForm.elements[fieldsName].disabled		= 1;
			objForm.elements[tablesName].disabled		= 1;
			objForm.elements[operatorsName].disabled	= 1;
			objForm.elements[sqlName].disabled			= 1;
			objEditArea.disabled						= 1;
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
			showOrHideHTMLArea(true, TableAreaID);
			showOrHideHTMLArea(false, SQLAreaID);
		}
		else
		{
			//COUNT on selected field
			showOrHideHTMLArea(true, FieldAreaID);
			showOrHideHTMLArea(true, OperatorAreaID);
			showOrHideHTMLArea(false, TableAreaID);
			showOrHideHTMLArea(false, SQLAreaID);
		}
	}
}

//using functions to make form's inputs readonly true or false
function MeReadOnly(){this.blur()}
function DisableReadOnly(){return false;}
/////////////////////////////////////////////////////
//handle page's load and item's selection action
function checkOnLoad(bLoaded,countNumericFieldFromServer)
{
	countNumericField = countNumericFieldFromServer;
	var objForm			= document.forms[afmInputsFormName];
	var objTitle		= objForm.elements[titleName];
	var objFields		= objForm.elements[fieldsName];
	var objTables		= objForm.elements[tablesName];
	var objOperators	= objForm.elements[operatorsName];
	var objBApply		= objForm.elements[bApplyName];
	var objItems		= objForm.elements[itemsName];
	var objSql			= objForm.elements[sqlName];
	var objEditOKButton		= document.getElementById(EditOKButtonName);
	var objEditCancelButton	= document.getElementById(EditCancelButtonName);
	var objEditArea		= document.getElementById(EditAreaID);
	var bNoField = false;
	var temp_array = new Array();

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
		for(var i = 0; i < objItems.length -1; i++)
		{
			if(objItems[i].selected)
			{
				arrItemIndex = objItems[i].value;
				currentItemTitle	= arrSatistics[arrItemIndex][0];
				currentItemOperator = arrSatistics[arrItemIndex][1];
				currentItemField	= arrSatistics[arrItemIndex][2];
				currentItemSQL		= arrSatistics[arrItemIndex][3];
				currentItemSQLBApply	= arrSatistics[arrItemIndex][4];
				//if(currentItemSQLBApply == "")
				//	currentItemSQLBApply = "false";
				break;
			}
		}
	}
	//set up "applyAllRestrictions" check box
	if(currentItemSQLBApply=="true")
		objBApply.checked = 1;
	else if(currentItemSQLBApply == "false")
		objBApply.checked = 0;
	
	if(currentItemSQLBApply=="")
	{
		objBApply.checked = 1;
		currentItemSQLBApply = "true";
	}
	objBApply.disabled = 0;

	//check if there is db field with currentItemField like
	//"rm.rm_id"
	temp_array = currentItemField.split(".");
	//suppose that temp_array[1] = "rm";
	//and temp_array[1] = "rm_id";
	if(temp_array[0] != null && temp_array[1] == null)
		bNoField = true;

	//set up operator list
	for(var i = 0; i < objOperators.length; i++)
	{
		if((bNoField && objOperators[i].value == "COUNT-TABLE") || (!bNoField && objOperators[i].value == currentItemOperator))
		{
			objOperators[i].selected = 1;
			break;
		}
	}

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
				showOrHideHTMLArea(false, FieldAreaID);
				showOrHideHTMLArea(true, TableAreaID);
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
				showOrHideHTMLArea(true, FieldAreaID);
				showOrHideHTMLArea(false, TableAreaID);

				for(var i = 0; i < objFields.length -1; i++)
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
			showOrHideHTMLArea(false, FieldAreaID);
			showOrHideHTMLArea(false, TableAreaID);
			showOrHideHTMLArea(false, OperatorAreaID);
			//set up SQL input
			objSql.value					= currentItemSQL;
			objTitle.onfocus				= MeReadOnly;
			objSql.onfocus					= MeReadOnly;
			objBApply.disabled				= 1;
			objEditOKButton.disabled		= 1;
			objEditCancelButton.disabled	= 1;
		}
	}
	else
	{
		//there is no real item in items list
		//then enable "edit area" for a normal one
		showOrHideHTMLArea(false, SQLAreaID);
		showOrHideHTMLArea(true, FieldAreaID);
		showOrHideHTMLArea(true, OperatorAreaID);
		showOrHideHTMLArea(false, TableAreaID);
		//first field in fields list is default
		//????
		if(objFields.length > 0)
			objFields[0].selected = 1;
		//first operator is selected
		objOperators[0].selected = 1;
	}
	//check if (at least one real item) + (!bLoad) +
	//(last item is selected) is true, then disable "edit"
	if(!bLoaded && (objItems[objItems.length -1].selected) && (objItems.length != 1))
	{
		enableOrDisableAll(false);
	}
	//if there is no unmeric fields at all, hide selecting fields but
	//show selecting tables
	if(countNumericField <= 0)
	{
		showOrHideHTMLArea(false, FieldAreaID);
		showOrHideHTMLArea(true, TableAreaID);
	}

}
//"Cancel" button action in "edit area"
function resetEditArea()
{
	var objEditCancelButton	= document.getElementById(EditCancelButtonName);
	if(!objEditCancelButton.disabled)
	{
		var objForm			= document.forms[afmInputsFormName];
		var objItems		= objForm.elements[itemsName];
		var currentItemIndex = "";
		//according to current title variable, find its array item index
		for(var index in arrSatistics)
		{
			if(arrSatistics[index][0] == currentItemTitle)
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
		checkOnLoad(false, countNumericField);
	}
}

//when users click on "OK" button in "edit area"
function onEditOK()
{
	var objEditOKButton	= document.getElementById(EditOKButtonName);
	if(!objEditOKButton.disabled)
	{
		var objForm			= document.forms[afmInputsFormName];
		var objTitle		= objForm.elements[titleName];
		var objFields		= objForm.elements[fieldsName];
		var objTables		= objForm.elements[tablesName];
		var objOperators	= objForm.elements[operatorsName];
		var objBApply		= objForm.elements[bApplyName];
		var objItems		= objForm.elements[itemsName];
		var objSql			= objForm.elements[sqlName];
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
			//set up operator variable
			if(strSelectedOperator == "COUNT-TABLE")
				currentItemOperator = "COUNT";
			else
				currentItemOperator = strSelectedOperator;
			//set applyAllRestrictions variable
			if(objBApply.checked)
				currentItemSQLBApply = "true";
			else
				currentItemSQLBApply = "false";

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

			//update "items" list and array arrSatistics
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
				objItems[temp_length] = new Option("                                     ","");
				//adding item's values into array arrSatistics
				arrSatistics[temp_index] = new Array(currentItemTitle,currentItemOperator,currentItemField,currentItemSQL,currentItemSQLBApply);
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
					//adding item's values into array arrSatistics
					arrSatistics[selectedItemIndex] = new Array(currentItemTitle,currentItemOperator,currentItemField,currentItemSQL,currentItemSQLBApply);
				}
			}
		}
	}
}
//this function will be called by sendingDataFromHiddenForm() in common.js
//arrSatistics['item1'][0]:title(string)
//arrSatistics['item1'][1]:operator(string)
//arrSatistics['item1'][2]:field(as rm.rm_id or rm. or .)(string)
//arrSatistics['item1'][3]:sql(string)
//arrSatistics['item1'][4]:applyAllRestrictions(string)
function gettingRecordsData()
{
	var objForm			= document.forms[afmInputsFormName];
	var objItems		= objForm.elements[itemsName];
	var xml = "";
	var tem_title = "";
	var temp_operator = "";
	var temp_field = "";
	var temp_sql = "";
	var temp_bApply = false;
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
			temp_title		= arrSatistics[selectedItem][0] ;
			temp_operator	= arrSatistics[selectedItem][1] ;
			temp_field		= arrSatistics[selectedItem][2] ;
			temp_sql		= arrSatistics[selectedItem][3] ;
			temp_bApply		= arrSatistics[selectedItem][4] ;
			if(temp_bApply == "")
				temp_bApply = "false";

			tem_array = temp_field.split(".");
			if(tem_array[0] != null)
				strTableName = tem_array[0];
			else
				strTableName = "";
			if(tem_array[1] != null)
				strFieldName = tem_array[1];
			else
				strFieldName = "";

			xml	= xml+ "<statistic";
			if(temp_sql == "")
			{
				//normal
				xml = xml + ' op="'+temp_operator+'" applyAllRestrictions="'+temp_bApply+'">';
				xml = xml + '<field name="'+strFieldName+'" table="'+strTableName+'"/>';
			}
			else
			{
				//SQL??sending it to server??
				xml = xml + ' op="'+temp_operator+'" applyAllRestrictions="'+temp_bApply+'" ';
				xml = xml + ' sql="'+temp_sql+'">';
				xml = xml + ' <field table="'+strTableName+'"/>';
			}
			xml = xml + '<title translatable="true" >'+temp_title+'</title>';
			xml = xml + '</statistic>';
		}
	}
	//if(xml != "")
	xml = '<userInputRecordsFlag><statistics>'+ xml + '</statistics></userInputRecordsFlag>';
	return xml;
}
