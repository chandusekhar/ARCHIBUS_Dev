var ucWrOpenByCf =  View.createController("ucWrOpenByCf",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },
});

function apply_console_restriction() {
	var console = View.panels.get("requestConsole");
	var restParameter = "1=1 ";

	var days_old = $('wr.days_old').value;
	if (days_old != '') {
		restParameter = " DATEDIFF(d, wr.date_requested, GETDATE()) > "+days_old;
	}

	var reportView = View.panels.get("wr_details_panel");
    reportView.addParameter('days_old', restParameter);
    if (reportView.visible) {
        reportView.refresh();
    }
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}