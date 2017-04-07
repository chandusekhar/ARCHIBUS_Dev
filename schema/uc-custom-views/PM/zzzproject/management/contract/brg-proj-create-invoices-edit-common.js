function user_form_onload()
{
	var tabsFrame = getFrameObject(parent,'tabsFrame');
	var east_panel = AFM.view.View.getControl('','east_panel');
    east_panel.restriction = tabsFrame.restriction;
    east_panel.refresh();
    east_panel.show(true);
}
