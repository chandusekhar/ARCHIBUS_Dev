/******************************************************************
	message-as-popup.js
	Yong Shao
	3-30-2005
 ******************************************************************/
var objMessagePopupWindow;

function openPopupMessageWindow(message)
{
	
	if(objMessagePopupWindow == null || objMessagePopupWindow.closed)
	{
		objMessagePopupWindow = window.open("","messagePopupWindow","menubar=no,scrollbars=yes,resizable=yes,status=yes,width=300,height=300");
	}

	var temp_string = '<html><head><title>Message Popup Dialog<\/title>';
	temp_string = temp_string + '<script language="JavaScript">self.moveTo(0,0); setInterval("popupItself()",100); self.focus(); function popupItself(){self.focus();};<\/script>';
	temp_string = temp_string + '<\/head><body  leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">';
	temp_string = temp_string + '<div><table  bgcolor="cornsilk" border="0" cellspacing="0" align="center" valign="top"><tr aligh="center"><td align="center"><b>'+message+'</b></td></tr></table></div>';
	temp_string = temp_string + '<div><table border="0" cellspacing="0" align="center" valign="top"><tr align="center"><td align="center"><input style="cursor:hand; background-color: #E0E0E0 ;border: border-style; font-size: 9pt ;vertical-align: middle ;border-style: outset ; border-width: 1px 2px 2px 1px ;  border-color: #91B3D0 #000000 #000000 #91B3D0 ;font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;" type="button" value="Close" onclick="window.close()"></td></tr></table></div>';
	temp_string = temp_string + '<\/body><\/html>';

	objMessagePopupWindow.document.write(temp_string);
	
	window.history.go(-1);
}

