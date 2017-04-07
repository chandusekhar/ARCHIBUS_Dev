
/**
 * Hides or shows two of the toolbar buttons
 */
function onShowToolbarButtons() {
    // view-specific hide/show flag (it is undefined on the first call)
	var buttonsShown = window.top.rmReportToolbarButtonsShown;

	if (typeof buttonsShown == 'undefined') {
		// set first time
		buttonsShown = true;
	}

	// set the named toolbar button visibile (or invisble)
	// currently available toolbar button ids are:
	// {'alterButton','favoritesButton','printButton','emailButton','helpButton'}
	Ab.view.View.setToolbarButtonVisible('emailButton', !buttonsShown);
	Ab.view.View.setToolbarButtonVisible('favoritesButton', !buttonsShown);

    // toggle the flag
	window.top.rmReportToolbarButtonsShown = !buttonsShown;
}