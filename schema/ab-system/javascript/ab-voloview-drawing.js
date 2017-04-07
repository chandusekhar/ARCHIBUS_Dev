/**********************************************************
  ab-voloview-drawing.js
  Event handler functions for the Autodesk Volo View
  plugin.

  Requires the following variables to be defined externally:
  strTargetView, strTargetFrame, strTargetTable
  strLayersOn, strLayersOff
  strCADEmail, strEmailSubjct, strEmailBody

  For the email function to work correctly, the default IE
  security settings must be changed.

  If FM Web Central is on the local intranet (i.e. can be accessed
  via unqualified hostname, e.g. http://papercity:8080/archibus):

	  In IE, go to Tools menu -> Internet Options
	  	- Security tab
	  	- Select Local Intranet
	  	- Click Custom Level
	  	- Under ActiveX controls and plug-ins
	  	- Set Initialize and script ActiveX controls not marked as safe
	  		to Enable or Prompt
	  	- Click OK in Security Settings and Internet Options

  If FM Web Central is accessed across the internet:

	  In IE, go to Tools menu -> Internet Options
	  	- Security tab
	  	- Select Trusted sites
	  	- Click on the Sites button and add the FM Web Central
	  	  hostname
	  	- Un-check the 'Require server verification' box
	  	- Click OK
	  	- Click Custom Level
	  	- Under ActiveX controls and plug-ins
	  	- Set Initialize and script ActiveX controls not marked as safe
	  		to Enable or Prompt
	  	- Click OK in Security Settings and Internet Options

	If security was set to prompt, the user will get a warning dialog
	every time the view loads.

**********************************************************/

// Other settings
// XSL will overwrite these with correct values
var strCADEmail = "";
var strEmailSubject = "";
var strEmailBody = "";

// AddTableToExpressViewerURL()
// Desc:  Takes a list of primary keys and a table name
//        and inserts the table name into the PK list
// Params:
//   strPKList - string containing primary key list in a URL parameter formate, e.g.:
//               &bl_id=XX&fl_id=YY&rm_id=ZZ
//   strTable -  table name to insert
// Returns: new primary key list with table name spliced in, e.g.:
//            &em.bl_id=XX&em.fl_id=YY&em.rm_id=ZZ

function AddTableToExpressViewerURL(strPKList, strTable)
{
  // get only the parameter list - strip anything before ?
  var iPos = strPKList.indexOf("?");
  if(iPos > 0)
    strPKList = strPKList.substring(iPos+1);


  // The & character separates the PK list
  arrStrings = strPKList.split("&");

  // declare strResult as empty string so we can add to it below
  var strResult = "";
  // iterate through the array containing PK value pairs
  for(nLayer in arrStrings)
  {
    // first string in array will be empty, make sure to check length
    if (arrStrings[nLayer].length > 0)
      strResult += "&" + strTable + "." + arrStrings[nLayer];

  }

  return strResult;
}


// OpenExpressViewerURL()
// Desc:  Constructs a 14i style URL and opens in the indicated frame
// Params:
//  strViewFile - View file name, e.g.: room-details.axvw
//  strFrame    - Name of the target frame, or empty to open in new window
//  strPKLIst   - String holding primary key values in URL parameter format, e.g.:
//                &em.bl_id=XX&em.fl_id=YY&em.rm_id=ZZ

function OpenExpressViewerURL(strViewFile, strFrame, strPKList)
{
  // If the view file name is blank, assume this is a drawing view
  // that is not supposed to launch another view
  if (strViewFile == "") return;

  // Build the 14i link, containing the view file, handler action and primary key list
  var strLink = strViewFile + "?handler=com.archibus.config.ActionHandlerDrawing" + strPKList;

  // Check if we have been supplied a target frame
  if(strFrame == "")
  {
    // No frame supplied, just launch in a new window
    newWindow = openNewContent(strLink, strFrame);
    if (newWindow) newWindow.focus();
  }
  else
  {
    // Call the getFrameObject API to find the correct frame object
    var objTargetFrame = getFrameObject(window, strFrame);
    if(objTargetFrame != null)
    {
      // If we found it, tell that frame to launch the URL
      objTargetFrame.location.href = strLink;
    }
    else
    {
      // couldn't find the frame object, launch in new window
    newWindow = openNewContent(strLink, strFrame);
    if (newWindow) newWindow.focus();
    }
  }
}


// OnExecuteURL()
// Desc:  Function to handle the OnExecuteURL event of the Autodesk Express Viewer
//    Gets the primary keys from the DWF URL, builds a 14i URL and launches it.
//    This should be called from the Express Viewer event handler in the final HTML file
// Parameters:  objLink, nIndex, objHandled, as defined in Express Viewer API
function OnSelectObject(objNode, objHandled){}
function OnExecuteURL(objLink, nIndex, objHandled)
{
  // tell browser we are handling the event
  objHandled.State = true;

  if(strDynamicHighlight != "true")
  {
    // Build real URL here and send browser to it
    var strLink = objLink.Link(nIndex);
    // Add table specifier to primary key names: rm_id becomes em.rm_id
    strLink = AddTableToExpressViewerURL(strLink, strTargetTable);
    // strTargetView and strTargetFrame should be provided by the XSL stylesheet
    OpenExpressViewerURL(strTargetView, strTargetFrame, strLink);
    // Setting the handled state to true tells Express Viewer not to perform
    // its default action (launching URL in new browser window)
    objHandled.State = true;
  }
}


/* Code to handle emailing redlines.  Requirements:
	Outlook (tested with OL 2002 on Windows XP)
	IE (tested with IE 6.0)
	IE security settings:  for the internet zone where the FM Web Central,
			IE must be set to allow running ActiveX controls that aren't marked as safe
*/

// DoEmailRedmarks()
// Save the markup and email it as an attachment
function DoEmailRedmarks()
{
  // Add rml extension onto drawing name
  var strNewFile = strBaseDrawingName;
  var numPos = strBaseDrawingName.indexOf("?");
  if(numPos > 0)
    strNewFile = strBaseDrawingName.substring(0, numPos-1);

  // !!! The SaveAsMarkup interface is no longer supported in Express Viewer Composer.
  // (though it worked nicely with Volo view to save the markup with API)
  // User can use the interface to save the drawing manually with the red markups,
  // then when the email window show, pick the dwf files that just saved and send.

  // in Express Viewer Composer, the saved file will have dwf as extension
  /*if(strBaseDrawingName.substring(strBaseDrawingName.length-4) == ".dwf")
    strNewFile = strBaseDrawingName.substring(0,strBaseDrawingName.length-4) + ".rml";
  else
    strNewFile = strBaseDrawingName + ".rml";

  // Construct full file path for markup file
  strNewFile = "C:\\TEMP\\" + strNewFile;

  objViewer.Save(strNewFile);
  */
  //objViewer.SaveMarkup(strNewFile);

  // Send an email (user need to pick the markups they saved as an attachment)
  sendMail(strNewFile);


}

//sendMail()
// Send an email with the specified file as an attachment
function sendMail(strAttachmentPath)
{
        var objOutlook, objOutlookMsg, objOutlookAttach;

	try
	{
          // Create the Outlook session
	  var objOutlook = new ActiveXObject("Outlook.Application");

	  // Create the message.
  	  var objOutlookMsg  = objOutlook.CreateItem(0);

  	  // Add the To recipient
	    objOutlookMsg.To = strCADEmail;

    	  // Set the Subject, Body, and Importance of the message.
	  objOutlookMsg.Subject = strEmailSubject;

  	  objOutlookMsg.Body = strEmailBody + strBaseDrawingName + "\n";

  	  // Add attachments to the message.
	  // This is comment out due to SaveAsMarkup interface is not support in Express Viewer Composer
          //var objOutlookAttach = objOutlookMsg.Attachments.Add(strAttachmentPath);

	  // Display the message
	  objOutlookMsg.Display();
  }
  catch(e)
  {
    alert("An exception occurred in the script: " + e.message + ".\n Please check your Outlook security setting to see if ActiveX automation is allowed.");
    return false;
  }

	objOutlook = null;
	objOutlookMsg = null;
	objOutlookAttach = null;
	return true;
}
