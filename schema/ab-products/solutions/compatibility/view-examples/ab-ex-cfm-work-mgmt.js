 /******************************************************************************
	ab-ex-cfm-work-mgmt.js for ab-ex-cfm-work-mgmt.xsl
 ********************************************************************************/
 function openNoneAXVWFile()
 {
	 var urlLink = "http://www.archibus.com/afm/reports/webtbbof.cfm";
	 var newWindowName		= "newWindow";
	 var newWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450";
	 var newWindowObject = window.open(urlLink, newWindowName,newWindowSettings);
 }