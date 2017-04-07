/**********************************************************
 ab-navigator-all-levels.js
 It's used in ab-navigator-all-levels.xsl(navigator tree model)
**********************************************************/

//will be overwritten in XSL
var strSchemaPath   = "/archibus/schema";
var abSchemaSystemGraphicsFolder = "";

var arrParentNodes	= new Array();
var iCounterParentNodes = 0;
var previouSelectedNodeImgID		= "";
var strPreviousSelectedIcon			= "ab-icon-tree-deselected.gif";
var strParentBeingOpenIcon			= "ab-icon-tree-exp.gif";
var strParentNotBeingOpenIcon		= "ab-icon-tree-norm.gif";
var strLeafBeingSelectectedIcon		= "ab-icon-tree-selected.gif";
var strLeafNotBeingSelectectedIcon	= "ab-icon-tree-task.gif";

/*****************************************************************/
//used by another frame(detail frame) for storing some information
//in client-side
var arrReferredByAnotherFrame1 = new Array();
var arrReferredByAnotherFrame2 = new Array();
/*****************************************************************/


//adding all nodes with clidren nodes into one array
function AddParentNodeToArray(ParentNodeName)
{
	arrParentNodes[iCounterParentNodes++] = ParentNodeName;
}

//Used in <A onclick="HiddenIt(this, '...') ..."> ...</A>
function HiddenIt(obj,elemName)
{

	abSchemaSystemGraphicsFolder = abSchemaSystemGraphicsFolder + "/";
	var objElement	= document.getElementById(elemName);
	var imgObj1		= document.getElementById("IMG_1_"+elemName);
	
	if(objElement.style.display	==	'')
	{
		objElement.style.display	=	"none";
		imgObj1.src =	abSchemaSystemGraphicsFolder + strParentNotBeingOpenIcon;
	}
	else
	{
		objElement.style.display	=	"";
		imgObj1.src = abSchemaSystemGraphicsFolder + strParentBeingOpenIcon;	
	}
	
}

//when document Item is clicked, this function is called to
//change the image with this item to indicate it is selected. 
function ChangeItToActiveItem(tableName, strUrl, strXML, strTarget)
{

	abSchemaSystemGraphicsFolder = abSchemaSystemGraphicsFolder + "/";
	//sending request to server
	sendingDataFromHiddenForm(strUrl, strXML, strTarget, "", false,"");
	if(previouSelectedNodeImgID != "")
	{
		var previousImgObj = document.getElementById(previouSelectedNodeImgID);
		if(previousImgObj != null)
			previousImgObj.src = abSchemaSystemGraphicsFolder + strPreviousSelectedIcon;
			previousImgObj.alt = "Task Previously Selected";
			previousImgObj.title = "Task Previously Selected";
	}

    if(tableName != "")
	{
		var strIMGName = "IMG_"+tableName;
		var imgObj = document.getElementById(strIMGName);
		if(imgObj!=null)
		{
			imgObj.src = abSchemaSystemGraphicsFolder + strLeafBeingSelectectedIcon;
			imgObj.alt = "Task Selected";
			imgObj.title = "Task Selected";
		}
		previouSelectedNodeImgID = strIMGName;
	}

}

//all nodes with chirldren nodes will be shrinked by default
//when navigator is loaded
function ShrinkAllParentNodes()
{

	abSchemaSystemGraphicsFolder = abSchemaSystemGraphicsFolder + "/";
	for (var i = 0; i < arrParentNodes.length; i++)
	{
		var parentNodeName	= arrParentNodes[i];
		var parentNodeObj	= document.getElementById(parentNodeName);
		var imgObj1			= document.getElementById("IMG_1_"+parentNodeName);
		parentNodeObj.style.display	=	"none";
		imgObj1.src		=	abSchemaSystemGraphicsFolder + strParentNotBeingOpenIcon;
	}

}

