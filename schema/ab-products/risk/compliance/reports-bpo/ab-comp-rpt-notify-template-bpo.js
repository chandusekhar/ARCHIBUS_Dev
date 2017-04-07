/**
* Added for 20.1 Compliance  BPO Report: Notification Templates
*
* @author Zhang Yi
*/
var bpoRptNotifyTemplateController = rptNotifyTemplateController.extend(
{

	afterInitialDataFetch:function(){
		this.notifyTemplateTabs.hideTab("assignedTemplates");
		this.abCompNotifyTemplateColumnRpt.show(false);
	}

});