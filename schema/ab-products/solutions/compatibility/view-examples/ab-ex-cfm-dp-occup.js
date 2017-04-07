 /******************************************************************************
	 ab-ex-cfm-dp-occup.js for ab-ex-cfm-dp-occup.xsl
 ********************************************************************************/
 function openNoneAXVWFile()
 {
	 var urlLink = "http://www.archibus.com/afm/reports/dwg_highlightroomsbydepartmentbyfloor.cfm?SuperCat=6%29%20Hot%20Stuff&Cat=a%2E%20Hotpicks";
	 var newWindowName		= "newWindow";
	 var newWindowSettings	= "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450";
	 var newWindowObject = window.open(urlLink, newWindowName,newWindowSettings);
 }