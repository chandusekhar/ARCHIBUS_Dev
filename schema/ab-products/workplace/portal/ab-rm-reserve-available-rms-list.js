/**************************************************************************
ab-rm-reserve-available-rms-list.js

***************************************************************************/

function loadingAvailableRoomsList()
{
	//this.abSchemaSystemGraphicsFolder = abSchemaSystemGraphicsFolder;
	var strTarget = "treeFrame";
	var objTargetFrame = getFrameObject(window, strTarget);
	
	if(objTargetFrame != null)
	{
		 //highlight available rooms
		var temp_array_rms_perBLFL = objTargetFrame.arrHLRMPerFL;
		var temp_selected_bl_fl = objTargetFrame.currentSelectedFloorURLLink_bl_fl;
		if(temp_array_rms_perBLFL != null && temp_selected_bl_fl != null)
		{ 
			var temp_array_rms = temp_array_rms_perBLFL[temp_selected_bl_fl];
			if(temp_array_rms != null)
			{
				for(var i=0; i<temp_array_rms.length; i++)
				{
					var str_url_link = "";
					var str_available_rms = temp_selected_bl_fl;
					str_available_rms = str_available_rms + '-' + temp_array_rms[i];
					str_url_link = '<tr><td class="treeLeafNodeTitles">';
					str_url_link = str_url_link + '<a href="#" onclick=\'sendingRequestToServer("'+str_available_rms+'")\'>'+str_available_rms+'</a>';
					str_url_link = str_url_link + '</td></tr>';
					document.write(str_url_link);
				}
			}
		}
	}
	
}

function sendingRequestToServer(strPKValues)
{
	//var strTargetTable = "rm";
	var strTargetView  = "ab-rm-reserve-detail.axvw";
	var strTargetFrame = "assetDetailsFrame";
	strPKsList = "&";
	var array_temp = strPKValues.split("-");
	//strPKValues:HQ-17-107
	strPKsList = strPKsList + 'rm.bl_id=' + array_temp[0] + '&rm.fl_id='+array_temp[1]+'&rm.rm_id='+array_temp[2];
		
	var strLink = strTargetView + "?handler=com.archibus.config.ActionHandlerDrawing" + strPKsList;
	// Call the getFrameObject API to find the correct frame object
	var objTargetFrame = getFrameObject(window, strTargetFrame);
	if(objTargetFrame != null)
	{
	  // If we found it, tell that frame to launch the URL
		objTargetFrame.location.href = strLink;
	}
}