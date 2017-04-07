/**********************************************************
 ab-solution-explorer.js
**********************************************************/
// will be overwritten in XSL
var strSchemaPath   = "/archibus/schema";
var abSchemaSystemGraphicsFolder = "";

var strIMGDirectory	= "";
var previouSelectedNodeImgID	= "";
var strPreviousSelectedIcon		= "ab-icon-tree-deselected.gif";
var strBeingSelectedIcon		= "ab-icon-tree-selected.gif";
var strNotBeingSelectedIcon		= "ab-icon-tree-task.gif";

function preparingLoad()
{
	
	//setting javascript variable navigatorFrameSize in main-view-title-bar.js
	var objTreeFrameset;
	if(window.top.frames[0] != null)
	{
			objTreeFrameset = window.top.frames[1].frames[0].parent;
			if(objTreeFrameset != null)
			{
				//javascript variable strDetailsFrameName in main title bar frame
				//window.top.frames[0]:titleBarFrame
				//window.top.frames[1].frames[1]:detailFrame object
				if(window.top.frames[0].strDetailsFrameName == "")
					window.top.frames[0].strDetailsFrameName = window.top.frames[1].frames[1].name;
				
				if(objTreeFrameset.document.body != null)
				{
					if(window.top.frames[0].navigatorFrameSize != null)
						window.top.frames[0].navigatorFrameSize = objTreeFrameset.document.body.cols;
				}
			}
			if(window.top.frames[0].bDisabledResizeNavigatorFrame!=null)
			{
				window.top.frames[0].bDisabledResizeNavigatorFrame=true;
			}
	}
}

//when document Item is clicked, this function is called to
//change the image with this item to indicate it is selected. 
function ChangeItToActiveItem(strIMGName, strUrl, strXML, strTarget)
{
	strIMGDirectory = abSchemaSystemGraphicsFolder+"/";
	//shrinking navigator frame size
	//resizingNavigatorFrame("25");
	//send out request to server
	sendingDataFromHiddenForm(strUrl, strXML, strTarget, "", false,"");
	//change previous active node icon as selected
	if(previouSelectedNodeImgID != "")
	{
		var previousSelectedImgObj = document.getElementById(previouSelectedNodeImgID);
		if(previousSelectedImgObj != null)
			previousSelectedImgObj.src = strIMGDirectory + strPreviousSelectedIcon;;
	}
	if(strIMGName != "")
	{
		//change icon to indicate active link
		//assign strIMGName to previouSelectedNodeImgID for next time use 
		previouSelectedNodeImgID = strIMGName;

		var imgObj = document.getElementById(strIMGName);
		if(imgObj!=null)
			imgObj.src = strIMGDirectory + strBeingSelectedIcon;
	}
}
//navigatorFrameSize(percentage)
function resizingNavigatorFrame(navigatorFrameSize)
{
	//must get navigator's frameset object
	var objFrames = window.top.frames[1];
	if(objFrames!=null)
	{
		var objTreeFrameset = objFrames.frames[0].parent;
		if(objTreeFrameset != null)
		{
			if(objTreeFrameset.document.body != null)
			{
				objTreeFrameset.document.body.cols = navigatorFrameSize+'%,*';
			}
		}
	}
	//??????????
	preparingLoad();
}


