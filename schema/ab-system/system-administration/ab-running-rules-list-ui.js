/**********************************************
   Yong Shao
   4-4-2005
***********************************************/

function loadRunningJobs(strXML)
{
	if(objErrorMsgWindow == null || objErrorMsgWindow.closed){
		sendingDataFromHiddenForm('',strXML, '_self', '', false, '');
	}
}
