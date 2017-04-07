/**
 * @author Guo Jiangtao
 */

function ABHDC_getTabsSharedParameters(isPopUpView) {
	var TAB_SHARED_PARAMETERS = {};
	var tabsPanel = null;

	var viewObject = null;
	if (isPopUpView) {
		viewObject = View.getOpenerView();
	} else {
		viewObject = View;
	}
	
	var parentWindow = parent;
	if(View.getOpenerView() && View.getOpenerView().dialogConfig && View.getOpenerView().dialogConfig.fromIncident){
		parentWindow = viewObject.getWindow();
	}
	var tabs = viewObject.getControlsByType(parentWindow, 'tabs');
	if (tabs.length > 0) {
		tabsPanel = viewObject.getControlsByType(parentWindow, 'tabs')[0];
	} else {
		tabs = viewObject.getControlsByType(self, 'tabs');
		if (tabs.length > 0) {
			tabsPanel = viewObject.getControlsByType(self, 'tabs')[0];
		}
	}

	if (tabsPanel) {
		if (!tabsPanel.TAB_SHARED_PARAMETERS) {
			tabsPanel.TAB_SHARED_PARAMETERS = {};
		}

		TAB_SHARED_PARAMETERS = tabsPanel.TAB_SHARED_PARAMETERS;
	}

	return TAB_SHARED_PARAMETERS;
}
