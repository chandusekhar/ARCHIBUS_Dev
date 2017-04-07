/**
 * Ensure that the first tab (Summary Characteristics) will be displayed.
 *
 * @param 	None
 * @return	None
 *
 */
function afterRefreshCharTab(){
    var charTabsFrame = View.panels.get('charTabs');
    charTabsFrame.selectTab('page4a');
}
