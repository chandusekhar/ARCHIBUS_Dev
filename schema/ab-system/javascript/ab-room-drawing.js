/******************************************************************
	ab-room-drawing.js
	Autodesk's View Express container
 ******************************************************************/
//array to hold all layers and visible information
//arrDrawingLayers['RMXDP-HL']=true;
//arrDrawingLayers['BL*']=false;
var arrDrawingLayers = new Array();

//called when drawing object container page is loaded
function setupDrawingLayers()
{
	//WaitForPageLoaded() must be called first to totally loaded
	objViewer.Viewer.WaitForPageLoaded();
	//objViewer.Viewer.BackColor= 250 * 65536 + 128 * 256 + 114; 
	var count = objViewer.Viewer.Layers.count;
	if(arrDrawingLayers != null)
	{
		//arrDrawingLayers is associate array(string as index)
		for(var layerName in arrDrawingLayers)
		{
			for(var i = 1; i< count; i++)
			{
				var layer = objViewer.Viewer.Layers.Item(i);
				//if they are match, turn layer on/off
				if(layerName == layer.name)
				{
					layer.Visible  = arrDrawingLayers[layerName];
					break;
					//break and go to first loop
				}
			}
		}

	}
}