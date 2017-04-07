function getURLParams(){
		var strHref = window.location.href;
  		//find out if there are any 
  		if ( strHref.indexOf("?") > -1 ){
    		var strQueryString = strHref.substr(strHref.indexOf("?")+1);
    		var aQueryString = strQueryString.split("&");
    		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
     			if (aQueryString[iParam].indexOf("=") > -1 ){
        			var aParam = aQueryString[iParam].split("=");
        			if(aParam[0].toLowerCase() == String('blFlId').toLowerCase() || aParam[0].toLowerCase() == String('blId').toLowerCase() ){
        				return unescape(aParam[1]);
        			} 
        		}
      		}
    	}
		return null;
}
