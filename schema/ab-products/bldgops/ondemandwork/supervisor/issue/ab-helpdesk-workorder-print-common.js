
/**
 * Controller of the Print Work Orders common
 * @author Guo Jiangtao
 */
var abHdWoPrintCommonControllert = View.createController("abHdWoPrintCommonControllert", {

    //main controller that defined in the print button view
    mainController: null,
    
    //print button HTML object
    printButton: null,
    
    /**
     * create selection menu under print button
     * @param mainController {Object} main controller that defined in the print button view.
     * @param buttonId {String} print button HTML id.
     */
    createMenuOfPrintButton: function(mainController, buttonId){
        this.mainController = mainController;
        this.printButton = Ext.get(buttonId);
        this.printButton.on('click', this.showMenu, this, null);
    },
    
    /**
     * The click event of the print button
     * show menu when click the print button
     */
    showMenu: function(e, item){
        var menuItems = [];
        menuItems.push({
            text: getMessage("DOCX"),
            handler: this.printWO.createDelegate(this, ['DOCX'])
        });
        menuItems.push({
            text: getMessage("DOCXDRAWING"),
            handler: this.printWO.createDelegate(this, ['DOCXDRAWING'])
        });
        menuItems.push({
            text: getMessage("PDF"),
            handler: this.printWO.createDelegate(this, ['PDF'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.show(this.printButton, 'tl-bl?');
    },
    
    /**
     * print work order according the selected print type
     * @param type {String} print type.
     */
    printWO: function(type){
        var restriction = this.mainController.getPrintRestriction();
        
        if (!valueExists(restriction)) {
            return;
        }
        
        if (type == 'DOCX') {
			//ER 10/27/11: add different report to print when using requests only view
			if(restriction.indexOf("wr_id")>0){
				View.openPaginatedReportDialog("ab-helpdesk-workrequest-print.axvw", {
					'wrDS': restriction
				});
			}
			else{
				View.openPaginatedReportDialog("ab-helpdesk-workorder-print.axvw", {
					'woDS': restriction
				});
			}
        }
        
        if (type == 'DOCXDRAWING') {
            View.openPaginatedReportDialog("ab-helpdesk-workorder-print-with-fl-plan.axvw", null, {
                'woRes': restriction
            });
        }
        
        if (type == 'PDF') {
            var parameters = {};
            parameters.target = 'opener';
            parameters.type = 'openLiveCycleDialog';
            parameters.viewName = 'ab-helpdesk-workrequest-print-pdf.axvw';
            parameters.dataSourceId = 'abHelpdeskWorkRequestPrintPdfDS';
            parameters.restrictions = restriction;
            parameters.fieldNames = "wr.wr_id;wr.bl_id;wr.fl_id;wr.rm_id;wr.prob_type;wr.status;wr.date_requested;wr.time_requested;wr.allow_work_on_holidays;wr.serv_window_days;wr.msg_delivery_status;wr.description";
            parameters.pdfFieldNames = "form1[0].wrForm[0].wr_wr_id[0];form1[0].wrForm[0].wr_bl_id[0];form1[0].wrForm[0].wr_fl_id[0];form1[0].wrForm[0].wr_rm_id[0];form1[0].wrForm[0].wr_prob_type[0];form1[0].wrForm[0].wr_status[0];form1[0].wrForm[0].wr_date_requested[0];form1[0].wrForm[0].wr_time_requested[0];form1[0].wrForm[0].wr_allow_work_on_holidays[0];form1[0].wrForm[0].wr_serv_window_days[0];form1[0].wrForm[0].wr_msg_delivery_status[0];form1[0].wrForm[0].wr_description[0]";
            parameters.pdfControlTypes = "TextField;ListBox;ListBox;ListBox;ListBox;DropdownList;TextField;TextField;RadioBox;CheckBox[Sun|Mon|Tues|Wed|Thurs|Fri|Sat];CheckBoxEnum;TextField";
            parameters.pdfTemplate = "work_request.pdf";
            var command = new Ab.command.openLiveCycleDialog(parameters);
            command.handle();
        }
    }
});
