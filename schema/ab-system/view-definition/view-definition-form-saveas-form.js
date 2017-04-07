/*************************************************************
viw-definition-form-saveas-form.js
process "Save As" Form in View Definition Forms
**************************************************************/
//afmInputsForm's element names and overwritten by
//view-definition-form-saveas-form.xsl
var titleName = "title";
var fileName = "file";
var accessName = "access";
var groupName = "group";
var afmViewExtensionUppercase = ".AXVW";
var illegalFileNameCharacterReplacedBy = "-";
var originalViewTitle = "";
						
var arrIllegalCharactersForAfmViewFileNames = Array();
/////non-file-system characters:\/*?"<>|:
arrIllegalCharactersForAfmViewFileNames[0]=" "; //white space
arrIllegalCharactersForAfmViewFileNames[1]="\"";
arrIllegalCharactersForAfmViewFileNames[2]="/";
arrIllegalCharactersForAfmViewFileNames[3]="\\";
arrIllegalCharactersForAfmViewFileNames[4]="<";
arrIllegalCharactersForAfmViewFileNames[5]=">";
arrIllegalCharactersForAfmViewFileNames[6]="*";
arrIllegalCharactersForAfmViewFileNames[7]="|";
arrIllegalCharactersForAfmViewFileNames[8]="?";
arrIllegalCharactersForAfmViewFileNames[9]=":";
//& and ' are not allowed ????????????????
arrIllegalCharactersForAfmViewFileNames[10]="&";
arrIllegalCharactersForAfmViewFileNames[11]="'";

//used by sendingDataFromHiddenForm() in common.js to send data to
//server
function onOKAction(serialized, parentFrame,subFrameName, actionMessage)
{
	//check if title is changed???
	var formObject = document.forms[afmInputsFormName];
	var viewTitle = "";
	if(formObject != null)
	{
		
		viewTitle = formObject.elements[titleName].value;
		viewTitle = viewTitle.toLowerCase();
		viewTitle = trim(viewTitle);
		originalViewTitle = trim(originalViewTitle);
		/*if(checkingInValidAfmCharacters(viewTitle))
		{
			
		}*/
		//if(originalViewTitle == viewTitle)
		//{
		//	alert(actionMessage);
		//	return true;
		//}
		//else
		{
			bAutoCloseWindow = false;
			//sending request to server
			sendingDataFromHiddenForm("",serialized,parentFrame,subFrameName,true);
			return false;
		}
		
	}
	else
	{
		return true;
	}
	
}
function gettingRecordsData()
{
	var formObject = document.forms[afmInputsFormName];
	var viewTitle = "";
	var viewName  = "";
	var access = "";
	var selectedGroup ="";
	var strReturnedXML = "";
	if(formObject != null)
	{
		viewTitle = formObject.elements[titleName].value;	
		viewName = formObject.elements[fileName].value;	

		if(formObject.elements[accessName] != null)
		{
			for(var i = 0; i < formObject.elements[accessName].length; i++)
			{
				if(formObject.elements[accessName][i].checked)
				{
					access = formObject.elements[accessName][i].value;
					break;
				}
			}
		}
		if(access == 'group')
			 selectedGroup = formObject.elements[groupName].value;
		//& causes error in java ?????????????
		viewTitle = removingAllSpecifiedCharacterFromString(viewTitle, "&", "");
		viewTitle = convert2validXMLValue(viewTitle);
		strReturnedXML = 'viewTitle="'+viewTitle+'" ';
		strReturnedXML = strReturnedXML + 'viewName="'+viewName+'" ';
		strReturnedXML = strReturnedXML + 'access="'+access+'" ';
		strReturnedXML = strReturnedXML + 'selectedGroup="'+selectedGroup+'" ';
		strReturnedXML = '<record ' + strReturnedXML + '/>';
		return strReturnedXML;
	}				
}
//called in XSLT to remove all illegal characters in title
function transformingViewFileName(strFormName, strTitle)
{
	var formObject = document.forms[strFormName];
	var objFileName = formObject.elements[fileName];
	var newFileName = "";
	var strLast5Characters = "";
	newFileName = removingNonFileCharactersFromString(strTitle);
	strLast5Characters = newFileName.substring(newFileName.length-5);
	strLast5Characters = strLast5Characters.toUpperCase();
	if(strLast5Characters!=afmViewExtensionUppercase)
		newFileName = newFileName + afmViewExtensionUppercase.toLowerCase();
	newFileName = newFileName.toLowerCase();
	objFileName.value = newFileName;
}

function removingNonFileCharactersFromString(strInput)
{
	//non-file-system characters:\/*?"<>|
	var strReturned = strInput;
	for(var i = 0; i < arrIllegalCharactersForAfmViewFileNames.length; i++)
	{
		strReturned = removingAllSpecifiedCharacterFromString(strReturned, arrIllegalCharactersForAfmViewFileNames[i], illegalFileNameCharacterReplacedBy);
	}
	return strReturned;
}
function removingAllSpecifiedCharacterFromString(strInput, strSpecifiedCharacter, strByCharacter)
{
	var strReturned = strInput;
	var flag = -1;
	flag = strReturned.indexOf(strSpecifiedCharacter);
	while(flag != -1)
	{
		//replaced by dishs
		strReturned = strReturned.replace(strSpecifiedCharacter, strByCharacter);
		flag = strReturned.indexOf(strSpecifiedCharacter);
	}
	return strReturned;
}
//control the visibilty of groups combox 
function showSelectedGroupArea(strAreaID, bShow)
{
	var strSelectedGroupAreaID = strAreaID;
	var objSelectedGroupArea = document.getElementById(strSelectedGroupAreaID);
	if(objSelectedGroupArea!=null)
	{
		if(bShow)
		{
			if(objSelectedGroupArea.style.display=="none")
				objSelectedGroupArea.style.display = "";
		}
		else
		{
			if(objSelectedGroupArea.style.display=="")
				objSelectedGroupArea.style.display = "none";

		}
	}
}
//called when html body is onload 
function initializingForm(strAreaID, strFormName, strOriginalViewTitleHiddenInputName)
{
	//XXX:
	var fileNameArea1Obj = document.getElementById("fileNameArea1");
	var fileNameArea2Obj = document.getElementById("fileNameArea2");
	if(opener.bShowSaveAsFileName=="true")
	{
		fileNameArea1Obj.style.display="";
		fileNameArea2Obj.style.display="";
	}
	
	var formObject = document.forms[strFormName];
	if(formObject.elements[strOriginalViewTitleHiddenInputName]!=null && formObject.elements[strOriginalViewTitleHiddenInputName].value!="")
		originalViewTitle = (formObject.elements[strOriginalViewTitleHiddenInputName].value).toLowerCase();
	var access = "";
	var title = "";
	if(formObject.elements[titleName] != null && formObject.elements[fileName] != null)
	{
		title = formObject.elements[titleName].value;
		if(title != "")
		{
			//transforming title to valid axvw file name
			transformingViewFileName(strFormName, title);
		}
	}
	if(formObject.elements[accessName] != null)
	{
		for(var i = 0; i < formObject.elements[accessName].length; i++)
		{
			if(formObject.elements[accessName][i].checked)
			{
				access = formObject.elements[accessName][i].value;
				break;
			}
		}
	}
	if(access == "group")
		showSelectedGroupArea(strAreaID, true);
	else
		showSelectedGroupArea(strAreaID, false);
}				
