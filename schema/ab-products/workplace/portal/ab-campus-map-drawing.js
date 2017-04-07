/**********************************************************
  ab-campus-map-drawing.js
  Yong Shao
  12/14/2006
**********************************************************/
DWF_showCloseButton=false;
strLayersOn = 'BL$;BL$TXT;SI-MISC;SI-TREE;SI-WALK;PARKING;PARKING$;PARKING$TXT;PARCEL;PARCEL$;PARCEL$TXT;Z-BL-DHL';
strLayersOff = '';
function setUpDWFFileLink(){
	if(strDrawingName!=""){
		strDrawingName = strDrawingName.toLowerCase();
		if(strDrawingName.lastIndexOf(".dwf")<0)
			strDrawingName = projectDrawingsFolder+'/'+ strDrawingName + '-abrplmblinventory.dwf';
	}
}
function loadDwfViewer(width, height, path, version7){
	doLoadDwfViewer(400, 350, path, version7);
}
function OnSelectObject(){}