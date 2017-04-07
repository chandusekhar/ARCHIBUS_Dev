
/**
 * URL parameters:
 * - fieldName: restriction field name;
 * - fieldValue: restriction field value;
 * - viewName: AXVW file name.
 * 
 * Example: 
 * http://localhost:8080/archibus/schema/ab-system/html/url-proxy.htm?viewName=ab-rr-reservations-details-grid.axvw&fieldName=reserve.res_parent&fieldValue=59
 * Use the fieldValue2 and fieldValue3 parameters for multi-part restrictions (as for room numbers).
 */

window.onload = function() {
    window.top.fieldName = getUrlParameter('fieldName');
    window.top.fieldValue = getUrlParameter('fieldValue');
    window.top.fieldName2 = getUrlParameter('fieldName2'); 
    window.top.fieldValue2 = getUrlParameter('fieldValue2'); 
    window.top.fieldName3 = getUrlParameter('fieldName3'); 
    window.top.fieldValue3 = getUrlParameter('fieldValue3'); 

    var viewName = getUrlParameter('viewName');
	var viewPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
	var url = window.location.protocol + '//' + window.location.host + viewPath + '/' + viewName;
    window.top.view.location = url;
}

/**
 * Get URL parameter by name.
 */
function getUrlParameter(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.top.location.href;
    var results = regex.exec(tmpURL);
    if (results == null)
        return "";
    else
        return results[1];
}