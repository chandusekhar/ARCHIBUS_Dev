/**
 * @author Guo Jiangtao
 */

ManageReportVialationLineChartByList = Base.extend({
	control : '', // ManageReportControl object
	panel : '', // related panel
	locList: '',
	secondaryGroupingAxis: [],//keep the second group axis definition of line chart to support switch between 1D and 2D.

	constructor : function(control, panel, locList) {
		this.control = control;
		this.panel = panel;
		this.locList = locList;
		this.locList.dropDownDom.disabled = true;
		this.locList.lableDom.innerHTML = '<p>'+getMessage('locationLevel')+'</p>';
		var cell = Ext.DomHelper.insertBefore(this.locList.lableDom, {
			tag : 'td',
			id : 'chartByList'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('VIOLATION_LINECHART_BY_LIST_GROUP_BY') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.insertAfter(cell, {
			tag : 'td',
			id : 'chartByList_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'chartByList_options'
		}, true);

		//add chart by option list
		options.dom.options[0] = new Option(getMessage('VIOLATION_LINECHART_BY_LIST_ALL'), 'all');
		options.dom.options[1] = new Option(getMessage('VIOLATION_LINECHART_BY_LIST_SEVERITY'), 'severity');
		options.dom.options[2] = new Option(getMessage('VIOLATION_LINECHART_BY_LIST_REGULATION'), 'regulation');
		options.dom.options[3] = new Option(getMessage('VIOLATION_LINECHART_BY_LIST_LOCATION'), 'location');
		options.dom.options[4] = new Option(getMessage('VIOLATION_LINECHART_BY_LIST_PROGRAM'), '(regulation${sql.concat}\'-\'${sql.concat}reg_program)');
		options.dom.selectedIndex = 1;
		options.on('change', this.onChangeChartBy, this, {
			delay : 100,
			single : false
		});

		//stored the secondary grouping axis 
		this.secondaryGroupingAxis = this.panel.secondaryGroupingAxis;
		
		//set control properties base on the current option
		var currentOption = options.dom.options[options.dom.selectedIndex];
		this.setSecondGroupFieldDef(currentOption);
		if(currentOption.value =='all' ){
			//for 'all' option, set the secondary grouping axis to empty array
			this.panel.secondaryGroupingAxis = new Array();
			this.panel.configObj.secondaryGroupingAxis = new Array();
			this.panel.configObj.getConfigParameter('groupingAxis')[0].dataSourceId  = 'abCompRptCommManChart_DataAxis_DS_1D';
			this.panel.configObj.getConfigParameter('dataAxis')[0].dataSourceId  = 'abCompRptCommManChart_DataAxis_DS_1D';
			
		}else if(currentOption.value =='location' ){
			this.locList.dropDownDom.disabled = false;
			var location = this.locList.dropDownDom.options[this.locList.dropDownDom.selectedIndex];
			this.control.secondGroupField = {
				name : location.value,
				title : location.innerHTML
			}
			
			this.control.secondGroupSortField = {
				name : location.value,
				title : location.innerHTML
			}
		}else{
			this.control.secondGroupField = {
				name : currentOption.value,
				title : currentOption.innerHTML
			}
			
			this.control.secondGroupSortField = {
				name : currentOption.value,
				title : currentOption.innerHTML
			}
		}
		
		this.panel.addParameter('secondGroupField', this.control.secondGroupField.name);
		this.panel.addParameter('secondGroupSortField', this.control.secondGroupSortField.name);
		this.panel.addParameter('locationISNotNULL', " 1=1 ");
	},

	onChangeChartBy : function(e, selectEl) {
		var option = selectEl[selectEl.selectedIndex];
		this.setSecondGroupFieldDef(option);
		
		//restore the secondary grouping axis, make the line chart 2D by default 
		this.panel.secondaryGroupingAxis = this.secondaryGroupingAxis;
		this.panel.configObj.secondaryGroupingAxis = this.secondaryGroupingAxis;
		this.panel.configObj.getConfigParameter('groupingAxis')[0].dataSourceId  = 'abCompRptCommManChart_GroupAxis_DS';
		this.panel.configObj.getConfigParameter('dataAxis')[0].dataSourceId  = 'abCompRptCommManChart_DataAxis_DS_2D';
		this.panel.addParameter('locationISNotNULL', " 1=1 ");
		
		if(option.value =='all' ){
			//for 'all' option, set the secondary grouping axis to empty array, make the line chart 1D
			this.panel.secondaryGroupingAxis = new Array();
			this.panel.configObj.secondaryGroupingAxis = new Array();
			this.panel.configObj.getConfigParameter('groupingAxis')[0].dataSourceId  = 'abCompRptCommManChart_DataAxis_DS_1D';
			this.panel.configObj.getConfigParameter('dataAxis')[0].dataSourceId  = 'abCompRptCommManChart_DataAxis_DS_1D';
			this.panel.configObj.getConfigParameter('dataAxis')[0].title  = this.panel.configObj.getConfigParameter('dataAxisTitle');
			
			this.locList.dropDownDom.disabled = true;
			
		}else if(option.value =='location' ){
			this.locList.dropDownDom.disabled = false;
			var location = this.locList.dropDownDom.options[this.locList.dropDownDom.selectedIndex];
			this.control.secondGroupField = {
				name : location.value,
				title : location.innerHTML
			}
			
			this.control.secondGroupSortField = {
				name : location.value,
				title : location.innerHTML
			}
			
			this.panel.addParameter('locationISNotNULL', this.control.secondGroupField.name+" IS NOT NULL ");
		}else{
			this.locList.dropDownDom.disabled = true;
			this.control.secondGroupField = {
				name : option.value,
				title : option.innerHTML
			}
			
			this.control.secondGroupSortField = {
				name : option.value,
				title : option.innerHTML
			}
		}

		this.panel.addParameter('secondGroupField', this.control.secondGroupField.name);
		this.panel.addParameter('secondGroupSortField', this.control.secondGroupSortField.name);
		this.panel.initialDataFetch();
		this.panel.refresh();
	},
	
	setSecondGroupFieldDef: function(option) {
		if(option.value =='severity' ){
			 this.control.secondGroupFieldDef = 'severityFiledDef'
		}else{
			this.control.secondGroupFieldDef = ''
		}
	}

});
