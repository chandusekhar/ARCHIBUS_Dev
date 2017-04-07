 /******************************************************************************
	ab-ex-cfm-emerge-prep.js for ab-ex-cfm-emerge-prep.xsl
 ********************************************************************************/
 function openNoneAXVWFile()
 {
	 var urlLink = "http://www.archibus.com/afm/reports/ep-intranet-page-r00.cfm?SuperCat=2%29%20Space&Cat=f%2E%20Emergency%20Preparedness";
	 var newWindowName		= "newWindow";
	 var newWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450";
	 var newWindowObject = window.open(urlLink, newWindowName,newWindowSettings);
 }