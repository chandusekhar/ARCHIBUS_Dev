function createNewRequest()
{
// clear/reload the create tabs and change to the "My Information" tab
			
	View.getControl('', 'my_info_form').refresh();
	View.getControl('', 'wr_create_details').refresh();
	View.panels.get('wr_create_tabs').selectTab('create_wr_info');
}