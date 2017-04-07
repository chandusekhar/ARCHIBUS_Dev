/**********************************************************
  ab-ex-load-visio-vsd.js for ab-ex-load-visio-vsd.xsl
**********************************************************/
//In MS Visio Viewer ActiveX control, SRC must be provided as
//http://..../..../*.vsd???????????????
function preparingLoad(relativePath2VSDFile)
{
	var strLocation = window.top.location.toString();
	var iPos = strLocation.indexOf("//");
	var strTemp = "";
	var strReturned = "";
	if(iPos > 0)
	{
		strReturned = strLocation.substring(0, iPos+2);
		strTemp = strLocation.substring(iPos+2, strLocation.length);
		iPos = strTemp.indexOf("/");
		strReturned = strReturned + strTemp.substring(0, iPos+1); 
	}
	if(VV_Viwer!=null && strReturned != "")
	{
		//alert(strReturned + relativePath2VSDFile);
		VV_Viwer.src = strReturned + relativePath2VSDFile;
	}
	
}

