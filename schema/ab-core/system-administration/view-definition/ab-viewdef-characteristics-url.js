function user_form_onload(){  
	var view = tabsFrame.newView;
	if(valueExists(view.viewURL)){
		$('viewURL').value = view.viewURL;
	}
	if(valueExists(view.title)){
		$('viewTitle').value = view.title;
	}	
}


/**
 * Navigate to "Preview" tab.
 *
 * @param	None
 * @return	None
 *
 */
function saveAndPreview(){  
	var url = $('viewURL').value;
	if(checkURL(url)){
		saveURL();
		tabsFrame.selectTab('page5');
	}
}


function checkURL(url){  
	var urlPattern= /https?:\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{2,3}/;
	if(urlPattern.test(url)){
		return true;
	} else {
		alert(getMessage('invalidURL'));
		return false;
	}

}


function saveURL(){
	var view = tabsFrame.newView;
	var viewURL = $('viewURL').value;
	view.viewURL = viewURL;
	tabsFrame.newView = view; 
}
