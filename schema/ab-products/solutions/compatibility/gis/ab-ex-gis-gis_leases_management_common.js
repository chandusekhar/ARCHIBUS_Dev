/**
 * Sets specified panel title.
 * @param {panelName} Name attribute of panel or afmTableGroup elements in AXVW.
 * @param {title}     Title text.
 */
function setPanelTitle(panelName, title) {
    var panelTitleTD = $(panelName + '_title');
    if (panelTitleTD != null) {
        panelTitleTD.innerHTML = title;
    }
    else {
    	panelTitleTD = $(panelName + '_head');
	    if (panelTitleTD != null) {
	        panelTitleTD.firstChild.firstChild.firstChild.innerHTML = title;
	    }
    }
}

/**
 * Returns specified panel title.
 * @param {panelName} Name attribute of panel or afmTableGroup elements in AXVW.
 * @return            Title text.
 */
function getPanelTitle(panelName) {
    var title = '';
    var panelTitleTD = $(panelName + '_title');
    if (panelTitleTD != null) {
        title = panelTitleTD.innerHTML;
    }
    else {
    	panelTitleTD = $(panelName + '_head');
	    if (panelTitleTD != null) {
	        title = panelTitleTD.firstChild.firstChild.firstChild.innerHTML;
	    }
    }
    return title;
}