/******************************************************************
	Javascript Api used in sort and visible fields forms.
 ******************************************************************/
//arrVisibleFieldPK will be initialized by view-definition-form-content-table-visiblefields.js
//or view-definition-form-content-table-sort.js
var arrVisibleFieldPK = null;
//tgrpFormat is set up in view-definition-form-content-table-visiblefields.xsl
var tgrpFormat = "";


//if strTarget = "VisibleFields" and strSource="AvailableAll", show
//"selected" or "All", otherwise, hide "selected" or "All".
//if bSelected=true, show or hide selected
//if bSelected=false, show or hide all
//bFlag: if enabling or disabling the field properties section in
//corresponding forms
function ShowOrHideFields(strTarget, strSource, bSelected, bFlag)
{
	if(tgrpFormat!=null && tgrpFormat!="")
		tgrpFormat = tgrpFormat.toUpperCase();
	
	var objTarget = document.getElementById(strTarget);
	var objSource = document.getElementById(strSource);
	var arrMultiSelected = new Array();
	if(objTarget != null && objSource != null)
	{
		if(bSelected)
		{
			for(var i = 0, j = 0; i < objSource.length; i++)
			{
				if(objSource[i] != null && objSource[i].selected)
				{
					//???????????????????????????????????
					//arrVisibleFieldPK is only set up for visible
					//fields form
					if(arrVisibleFieldPK!=null && tgrpFormat=='EDITFORM')
					{
						if(strSource=='VisibleFields')
						{
							if(arrVisibleFieldPK[objSource[i].value]!='true')
							{
								arrMultiSelected[j++] = i;
							}
						}
						else
						{
							arrMultiSelected[j++] = i;
						}
					}
					else
					{
						arrMultiSelected[j++] = i;
					}
				}
			}
		}
		else
		{
			for(var i = 0, j=0;i < objSource.length; i++)
			{
				//???????????????????????????????????
				if(arrVisibleFieldPK!=null && tgrpFormat=='EDITFORM')
				{
					if(strSource=='VisibleFields')
					{
						if(arrVisibleFieldPK[objSource[i].value]!='true')
							arrMultiSelected[j++] = i;
					}
					else
					{
						arrMultiSelected[j++] = i;
					}
				}
				else
				{
					arrMultiSelected[j++] = i;
				}
			}
		}
	}
	//calling MoveSelectedItems() to move selected items
	MoveSelectedItems(strTarget, objTarget , strSource , objSource , arrMultiSelected );
	//set up moved field's properties in the form
	//setupMovedFieldProperties() is defined in
	//view-definition-form-content-table-sort.js and view-definition-form-content-table-visiblefields.js
	setupMovedFieldProperties(bFlag, objTarget);
}

//which function will execute the action to move items from one form into another.
//strTarget: string name of target form
//objTarget: object of target form
//strSource: string name of soure form
//objSource: object of source form
//arrMultiSelected: array of selected items
function MoveSelectedItems(strTarget, objTarget, strSource , objSource , arrMultiSelected)
{
	//set last item (dump value to maintain Form's fixed size) in target form to null
	//objTarget[objTarget.length-1] = null;
	//creating selected items in target form
	var option_value	= "";
	var option_text		= "";
	var option_element	= ""; 
	for(var i = 0, j = 0; i < arrMultiSelected.length ; i++)
	{
		j = arrMultiSelected[i];	
		option_value	=	objSource[j].value;
		option_text		=	objSource[j].innerHTML;
		option_element	=	document.createElement('option');  
		option_element.value		=	option_value;
		//option_element.id			=	strTarget + '_' + option_value;
		option_element.innerHTML	=	option_text;
		objTarget.appendChild(option_element); 		
	}
	//set moved items in source form to null
	for(var i = arrMultiSelected.length-1,j = 0; i >= 0; i--)
	{
		j = arrMultiSelected[i]
			  objSource[j] = null;	
	}
}

//move selected item up or down by one position
//bUp: if moving the item up
//itemName: the name of moved element item
function MoveUpOrDOwnItems(bUp, itemName)
{
	var objForm		= document.forms[afmInputsFormName];
	var objItems	= objForm.elements[itemName];
	var selectedItem_index	= "";
	var selectedItem_position = 0;
	var selectedItem_text	= "";
	var temp_index	  = "";
	var temp_position = 0;
	var temp_text = "";
	var bMove = false;
	for(var i = 0; i < objItems.length; i++)
	{
		if(objItems[i].selected)
		{
			selectedItem_position = i;
			selectedItem_index = objItems[i].value;
			selectedItem_text = objItems[i].innerHTML;
			//don't remove break here ==> loop must be stopped as
			//soon as selected item position is found
			break;
		}
	}
	if(selectedItem_index != "")
	{
		if(bUp)
		{
			temp_position = selectedItem_position - 1;
			if(temp_position >=0 )
				bMove = true;
			else
				bMove = false;
		}
		else
		{
			temp_position = selectedItem_position + 1;
			if(temp_position < objItems.length)
				bMove = true;
			else
				bMove = false;		
		}
		if(bMove)
		{
			if(objItems[temp_position].value != null && objItems[temp_position].value != "")
			{
				temp_index = objItems[temp_position].value;
				temp_text = objItems[temp_position].innerHTML;
				//exhanging items
				objItems[temp_position] = new Option(selectedItem_text,selectedItem_index);
				objItems[selectedItem_position] = new Option(temp_text,temp_index);
				//mark moved item in new position as selected item
				objItems[temp_position].selected = 1;
			}
		}
	}
}
