/******************************************************************
 ab-ex-load-ppt.js
 ******************************************************************/
 function openNoneAXVWFile(projectGraphicsFolder, referredFileName, bNewWindow)
 {
	 if(projectGraphicsFolder != "" && referredFileName != "")
	 {
		 window.location.href =  projectGraphicsFolder + "/" + referredFileName;
	 }
 }