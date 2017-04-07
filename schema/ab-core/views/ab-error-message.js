
function user_form_onload() {
    $('backgroundImage').src = View.contextPath + '/schema/ab-system/graphics/ab-pnav-opener.gif';
}

/**
 * This function should only be called for errors in 1.0 views. It navigates back to the view.
 * Errors in 2.0 views are displayed using Ajax call, so it is not neccessary to navigate back.
 */
function afterMessageClose() {
	history.back();
}
