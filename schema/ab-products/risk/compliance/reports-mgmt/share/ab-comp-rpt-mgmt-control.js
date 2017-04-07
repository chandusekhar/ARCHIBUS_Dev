/**
 * @author Guo Jiangtao
 */

ManageReportControl = Base.extend({
	type : '', // chart|crossTable|scoreBoard
	title : '', // control title
	
	chartType: Ab.chart.ChartControl.prototype.CHARTTYPE_STACKEDBAR,

	firstGroupField : '', // datasource first group field
	secondGroupField : '', // datasource second group field

	firstGroupSortField : '', // datasource first group sort field
	secondGroupSortField : '', // datasource second sort group field

	firstCalcField : '', // datasource first calculation field
	secondCalcField : '', // datasource second calculation field

	isLoad : false, // flag of whether is loading
	
	showOnLoad: true, // flag of whether is show control after load

	constructor : function(type, title, showOnLoad) {
		this.type = type;
		this.title = title;
		
		if(typeof showOnLoad != 'undefined'){
			this.showOnLoad = showOnLoad;
		}
	}
});
