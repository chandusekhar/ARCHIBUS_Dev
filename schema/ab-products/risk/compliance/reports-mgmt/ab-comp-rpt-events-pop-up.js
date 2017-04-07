/**
* @author Song
*/
var eventFinderRptPopUpController = eventFinderRptController.extend( {
	 /**
	  * this parameter determine the pop-up behavior which different from View 'report event finder'.below from spec.
	  *  Show in popup dialog the Compliance Event Finder report with restriction applied,
	  *  but remove Tabs 3 and 4 (Documents and Comm. Logs), and in Tab 1, remove the filter console.
	  */
	 isPopUpEvents: true
	 
});