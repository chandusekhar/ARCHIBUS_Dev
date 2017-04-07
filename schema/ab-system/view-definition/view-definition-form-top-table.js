/******************************************************************
 ******************************************************************/
var display_regular_view = "true";
var warningMessage = "";
var isAllowedEditViewAnalysis = "true";
function setUpType(isRegularView, xml, target, isAllowedEditVA)
{
	isAllowedEditViewAnalysis = isAllowedEditVA;
	var obj_RV =  document.getElementById("RV");
	var obj_VA =  document.getElementById("VA");
	var obj_RV_VA_AREA =  document.getElementById("RV_VA_AREA");
	
	
	if(isRegularView=="true" || isRegularView==""){
		obj_RV.checked=1;
		obj_VA.checked=0;
	}else{
		obj_VA.checked=1;
		obj_RV.checked=0;
	}
	
	if(isAllowedEditViewAnalysis=="false")
	{
		obj_VA.disabled=1;
		obj_RV.disabled=1;
		obj_RV_VA_AREA.style.display="none";
		
	}
	
	if(xml!=null && xml!="")
	{
		if(target==null || target=="")
			target="_self";
		sendingDataFromHiddenForm("", xml, target, "" ,true, "");
	}
	
	if(isRegularView=="false" && isAllowedEditViewAnalysis=="false")
	{
		var objTargetFrame = getFrameObject(window, "contentFrame");
		if(objTargetFrame!=null)
			objTargetFrame.location.href="view-definition-form-top-table-message.axvw";
	}
}

function onSelectRV(elemObj, xml)
{
	if(!elemObj.disabled && xml!="")
	{
		if(isAllowedEditViewAnalysis=="true")
		{
			var bConfirm = confirm(warningMessage);
			if(bConfirm)
			{
				sendingDataFromHiddenForm("", xml, "_self", "" ,true, "");
			}else{
				var obj_VA =  document.getElementById("VA");
				obj_VA.checked=1;
			}
		}else{
			sendingDataFromHiddenForm("", xml, "_self", "" ,true, "");
		}
	}
}

function onSelectVA(elemObj, xml)
{
	if(!elemObj.disabled && xml!="")
	{
		display_regular_view = "false";
		sendingDataFromHiddenForm("", xml, "_self", "" ,true, "");
	}
}

function gettingRecordsData()
{
	var strReturned = "<display isRegularView='"+display_regular_view+"'/>";
	return strReturned;
}