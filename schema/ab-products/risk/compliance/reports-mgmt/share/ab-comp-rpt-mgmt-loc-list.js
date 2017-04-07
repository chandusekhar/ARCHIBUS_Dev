/**
 * @author Guo Jiangtao
 */

ManageReportLocList = Base.extend({
	control : '', // ManageReportControl object
	panel : '', // related panel
	lableDom : '', // dom of this lable
	dropDownDom : '', // dom of this dropdown list
	isSecondGroupBy : '', // is second group by field
	controlController: null, // the control controller of the chart or cross table or scoreboard

	constructor : function(control, panel,controlController,isSecondGroupBy) {
		this.control = control;
		this.panel = panel;
		this.isSecondGroupBy = isSecondGroupBy;
		this.controlController = controlController;

		var panelTitleNode = this.panel.getTitleEl().dom.parentNode.parentNode;
		var cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'locList'
		});
		
		this.lableDom = cell;

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('LOC_LIST_GROUP_BY') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'locList_options_td'
		});
		
		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'locList_options'
		}, true);
		
		this.dropDownDom = options.dom;

		options.dom.options[0] = new Option(getMessage('LOC_LIST_COUNTRY'), 'ctry_id');
		options.dom.options[1] = new Option(getMessage('LOC_LIST_STATE'), 'state_id');
		options.dom.options[2] = new Option(getMessage('LOC_LIST_REGION'), 'regn_id');
		options.dom.options[3] = new Option(getMessage('LOC_LIST_CITY'), 'city_id');
		options.dom.options[4] = new Option(getMessage('LOC_LIST_COUNTY'), 'county_id');
		options.dom.options[5] = new Option(getMessage('LOC_LIST_SITE'), 'site_id');
		options.dom.options[6] = new Option(getMessage('LOC_LIST_PROPERTY'), 'pr_id');
		options.dom.options[7] = new Option(getMessage('LOC_LIST_BUILDING'), 'bl_id');
		options.dom.selectedIndex = 5;
		options.on('change', this.onChangeLoc, this, {
			delay : 100,
			single : false
		});

		var currentOption = options.dom.options[options.dom.selectedIndex];
		if(this.isSecondGroupBy){
			this.control.secondGroupField = {
					name : currentOption.value,
					title : currentOption.innerHTML
				}
				
			this.control.secondGroupSortField = {
				name : currentOption.value,
				title : currentOption.innerHTML
			}
		}else{
			this.control.firstGroupField = {
					name : currentOption.value,
					title : currentOption.innerHTML
				}
				
			this.control.firstGroupSortField = {
				name : currentOption.value,
				title : currentOption.innerHTML
			}
		}
		
		
		this.panel.addParameter('locationISNotNULL', this.control.firstGroupField.name+" IS NOT NULL ");
	},

	onChangeLoc : function(e, selectEl) {
		
		var option = selectEl[selectEl.selectedIndex];
		if(this.isSecondGroupBy){
			this.control.secondGroupField = {
					name : option.value,
					title : option.innerHTML
				}
				
			this.control.secondGroupSortField = {
					name : option.value,
					title : option.innerHTML
				}
			this.panel.addParameter('locationISNotNULL', this.control.secondGroupField.name+" IS NOT NULL ");
			this.panel.addParameter('secondGroupField', this.control.secondGroupField.name);
			this.panel.addParameter('secondGroupSortField', this.control.secondGroupField.name);
		}else{
			this.control.firstGroupField = {
					name : option.value,
					title : option.innerHTML
				}
				
			this.control.firstGroupSortField = {
					name : option.value,
					title : option.innerHTML
				}
			
			this.panel.addParameter('locationISNotNULL', this.control.firstGroupField.name+" IS NOT NULL ");
			this.panel.addParameter('firstGroupField', this.control.firstGroupField.name);
			this.panel.addParameter('firstGroupSortField', this.control.firstGroupField.name);
		}

		//call this method for missed overdue view.
		if(this.control.mainTable&&this.control.mainTable=="activity_log"){
			this.handleDiffMainTable(option, this.control.mainTable);
		}
		
		if (this.control.type == 'chart') {
			this.panel.configObj.groupingAxis[0].title = this.control.firstGroupField.title;
			this.panel.initialDataFetch();
			
			this.panel.isLoadComplete = false;
			this.controlController.refreshFromConsole();
		} else if (this.control.type == 'crossTable') {
			this.panel.groupByFields[0].title = this.control.firstGroupField.title;
			this.controlController.refreshFromConsole();
		}else if (this.control.type == 'lineChart') {
			this.panel.initialDataFetch();
			this.controlController.refreshFromConsole();
		}
	},
	
	/**
	 * for different main table, like expired View, set different parameter.
	 */
	handleDiffMainTable: function(option, mainTable){
		if(this.control.byLocation){
			this.panel.addParameter('firstGroupField', "location_"+this.control.firstGroupField.name);
    		this.panel.addParameter('firstGroupSortField', "location_"+this.control.firstGroupSortField.name);
    		this.panel.addParameter('secondGroupField', "location_"+this.control.secondGroupField.name);
    		this.panel.addParameter('secondGroupSortField', "level_number");
    		//need to consider if null was show by group by.
    		this.panel.addParameter('locationISNotNULL', "compliance_locations."+this.control.firstGroupField.name+" IS NOT NULL ");
    		if(this.isSecondGroupBy){
    			this.panel.addParameter('locationISNotNULL', "compliance_locations."+this.control.secondGroupField.name+" IS NOT NULL ");
    		}
		}
	}
});
