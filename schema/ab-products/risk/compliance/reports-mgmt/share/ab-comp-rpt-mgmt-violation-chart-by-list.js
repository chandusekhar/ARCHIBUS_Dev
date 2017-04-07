/**
 * @author Guo Jiangtao
 */

ManageReportVialationChartByList = Base.extend({
	control : '', // ManageReportControl object
	panel : '', // related panel
	locList: '',
	abCompRptCommManController: null,//common chart controller
	
	constructor : function(control, panel, locList, abCompRptCommManController) {
		this.control = control;
		this.panel = panel;
		this.abCompRptCommManController = abCompRptCommManController;
		
		this.locList = locList;
		this.locList.dropDownDom.disabled = true;
		this.locList.lableDom.innerHTML = '<p>'+getMessage('locationLevel')+'</p>';
		var cell = Ext.DomHelper.insertBefore(this.locList.lableDom, {
			tag : 'td',
			id : 'chartByList'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('CHARTBY_LIST_CHART_BY') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.insertAfter(cell, {
			tag : 'td',
			id : 'chartByList_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'chartByList_options'
		}, true);

		options.dom.options[0] = new Option(getMessage('CHARTBY_LIST_REQUIREMENT_PRIORITY'), 'priority');
		options.dom.options[1] = new Option(getMessage('CHARTBY_LIST_REGULATION_RANK'), 'reg_rank');
		options.dom.options[2] = new Option(getMessage('CHARTBY_LIST_REGULATION'), 'regulation');
		options.dom.options[3] = new Option(getMessage('CHARTBY_LIST_LOCATION'), 'location');
		options.dom.options[4] = new Option(getMessage('CHARTBY_LIST_REGULATION_LOCATION'), 'regulation+location');
		options.dom.options[5] = new Option(getMessage('CHARTBY_LIST_LOCATION_REGULATION'), 'location+regulation');
		options.dom.options[6] = new Option(getMessage('CHARTBY_LIST_COMPLIANCE_PROGRAM'), '(regulation${sql.concat}\'-\'${sql.concat}reg_program)');
		//expired view doesn't need this option.
		if(!control.mainTable||control.mainTable!="regrequirement" && control.mainTable!="activity_log"){
			options.dom.options[7] = new Option(getMessage('CHARTBY_LIST_YEAR_Assessed'), "${sql.yearOf('date_assessed')}");
		}
		options.dom.selectedIndex = 0;
		options.on('change', this.onChangeChartBy, this, {
			delay : 100,
			single : false
		});

		var currentOption = options.dom.options[options.dom.selectedIndex];
		this.setFirstGroupFieldDef(currentOption);
				
		if(currentOption.value =='location' ){
			this.locList.dropDownDom.disabled = false;
			var location = this.locList.dropDownDom.options[this.locList.dropDownDom.selectedIndex];
			this.control.firstGroupField = {
				name : location.value,
				title : location.innerHTML
			}
			
			this.control.firstGroupSortField = {
				name : location.value,
				title : location.innerHTML
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
		
		this.panel.addParameter('firstGroupField', this.control.firstGroupField.name);
		this.panel.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		this.panel.addParameter('locationISNotNULL', " 1=1 ");
	},

	onChangeChartBy : function(e, selectEl) {
		var option = selectEl[selectEl.selectedIndex];
		this.setFirstGroupFieldDef(option);
					
    	if(option.value =='location' || option.value =='regulation+location'  || option.value =='location+regulation' ){
			this.locList.dropDownDom.disabled = false;
			//set isSecondGroupBy to false default
			this.locList.isSecondGroupBy = false;
			var location = this.locList.dropDownDom.options[this.locList.dropDownDom.selectedIndex];
			if(option.value =='location'){
				this.control.firstGroupField = {
						name : location.value,
						title : location.innerHTML
					}
					
				this.control.firstGroupSortField = {
					name : location.value,
					title : location.innerHTML
				}
				
				this.panel.addParameter('locationISNotNULL', this.control.firstGroupField.name+" IS NOT NULL ");
			}else if(option.value == 'regulation+location'){
				//set isSecondGroupBy to true for option regulation+location to set location as second group by field
				this.locList.isSecondGroupBy = true;
				this.control.firstGroupField = {
					name : 'regulation',
					title : getMessage('CHARTBY_LIST_REGULATION')
				}
				this.control.firstGroupSortField = this.control.firstGroupField;
				
				this.control.secondGroupField = {
						name : location.value,
						title : location.innerHTML
					}
					
				this.control.secondGroupSortField = this.control.secondGroupField
				
				this.panel.addParameter('locationISNotNULL', this.control.secondGroupField.name+" IS NOT NULL ");
				
			}else if(option.value == 'location+regulation'){

				this.control.secondGroupField = {
					name : 'regulation',
					title : getMessage('CHARTBY_LIST_REGULATION')
				}
				this.control.firstGroupField = {
						name : location.value,
						title : location.innerHTML
				}
					
				this.control.firstGroupSortField = this.control.firstGroupField;
				this.control.secondGroupSortField = this.control.secondGroupField
				
				this.panel.addParameter('locationISNotNULL', this.control.firstGroupField.name+" IS NOT NULL ");
			}
			
		}else{
			this.locList.dropDownDom.disabled = true;
			this.control.firstGroupField = {
				name : option.value,
				title : option.innerHTML
			}
			
			this.control.firstGroupSortField = {
				name : option.value,
				title : option.innerHTML
			}
			
			this.control.secondGroupField = {
					'name' : 'severity',
					'title' : getMessage('secondGroupFieldTitle')
			};
			this.control.secondGroupSortField = this.control.secondGroupField;
			this.panel.addParameter('locationISNotNULL', " 1=1 ");//clear this parameter.
		}

		this.panel.addParameter('firstGroupField', this.control.firstGroupField.name);
		this.panel.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		this.setParameterForChartType(option.value);	
		
		//call this method for expired and missed overdue view.
		if(this.control.mainTable){
			if(this.control.mainTable=="regrequirement"){
				this.handleMainTableRegrequirement(option, this.control.mainTable);
			}else if(this.control.mainTable=="activity_log"){
				this.handleMainActivityLog(option, this.control.mainTable);
			}
		}
		
		if (this.control.type == 'chart') {
			//reset the chart axis title and chart type when switch the chart ty drop down list
			this.panel.configObj.groupingAxis[0].title = this.control.firstGroupField.title;
			this.panel.checkChartType();

			//reload the chart to active the chart type and chart axis tile change
			this.panel.initialDataFetch();
			this.panel.isLoadComplete = false;
			//refresh the chart
			this.abCompRptCommManController.refreshFromConsole();
			
		} else if (this.control.type == 'crossTable') {
			//reset the cross table axis title when switch the chart ty drop down list
			this.panel.groupByFields[0].title = this.control.firstGroupField.title;
			this.panel.groupByFields[1].title = this.control.secondGroupField.title;
			this.abCompRptCommManController.refreshFromConsole();
		}
	},
	
	/**
	 * for main table 'regrequirement',View: Expired License/Permit Count, set different parameter.
	 */
	handleMainTableRegrequirement: function(option, mainTable){
		
    	if(option.value =='regulation+location'  || option.value =='location+regulation' ){
    		abCompRptProLvlRegtController.isRegulationLocation=true;
    	}else{
    		abCompRptProLvlRegtController.isRegulationLocation=false;
    	}
    	
    	if(option.value =='location' || option.value =='regulation+location'  || option.value =='location+regulation' ){
    		this.control.byLocation = true;// only when the mainController didn't set this attribute.
    	}else{
    		this.control.byLocation = false;// only when the mainController didn't set this attribute.
			this.control.secondGroupField = {
					'name' : 'comp_level',
					'title' : getMessage('secondGroupFieldTitle')
			};
    	}    	
    	
    	//change 'secondGroupField'.
		this.control.secondGroupFieldDef = '';
		this.panel.addParameter('secondGroupField', this.control.secondGroupField.name);
		this.panel.addParameter('secondGroupSortField', this.control.secondGroupField.name);
    	
    	this.abCompRptCommManController.setQuery();
	},
	
	/**
	 * for main table 'activity_log', View: Missed and Overdue Events Count, set different parameter.
	 */
	handleMainActivityLog: function(option, mainTable){
		
    	if(option.value =='location' || option.value =='regulation+location'  || option.value =='location+regulation' ){
    		this.control.byLocation = true;// only when the mainController didn't set this attribute.
    		
    		//need to consider if null was show by group by.
    		this.panel.addParameter('locationISNotNULL', " compliance_locations."+this.control.firstGroupField.name+" IS NOT NULL ");
    		if(option.value =='regulation+location'){
    			this.panel.addParameter('locationISNotNULL', " compliance_locations."+this.control.secondGroupField.name+" IS NOT NULL ");
    		}
    		this.panel.addParameter('firstGroupField', "location_"+this.control.firstGroupField.name);
    		this.panel.addParameter('firstGroupSortField', "location_"+this.control.firstGroupSortField.name);
    		this.panel.addParameter('secondGroupField', "location_"+this.control.secondGroupField.name);
    		
    	}else{
    		this.control.byLocation = false;// only when the mainController didn't set this attribute.
			this.control.secondGroupField = {
					'name' : 'comp_level',
					'title' : getMessage('secondGroupFieldTitle')
			};
			
    		this.panel.addParameter('secondGroupField', this.control.secondGroupField.name);
    	} 
    	
    	if(this.control.secondGroupField.name=='comp_level'){
			this.panel.addParameter('secondGroupSortField', "level_number");
		}else{
			this.panel.addParameter('secondGroupSortField', this.control.secondGroupField.name);
		}
    	
    	//change 'secondGroupField'. show legend value.
		this.control.secondGroupFieldDef = '';
    	this.abCompRptCommManController.setQuery();
	},
	
	setFirstGroupFieldDef: function(option) {
		this.control.firstGroupFieldDef = '';
		if(option.value =='priority' ){
			 this.control.firstGroupFieldDef = 'priorityFiledDef'
		}else if(option.value =='reg_rank' ){
			this.control.firstGroupFieldDef = 'rankFiledDef'
		}
	},	
		
	setParameterForChartType: function(option) {
		this.control.chartType = Ab.chart.ChartControl.prototype.CHARTTYPE_STACKEDBAR;
		var location = this.locList.dropDownDom.options[this.locList.dropDownDom.selectedIndex];
		this.control.secondGroupFieldDef = 'severityFiledDef';
		this.panel.addParameter('secondGroupField', 'severity');
		this.panel.addParameter('secondGroupSortField', 'severity');
		if(option =='regulation+location' ){
			this.control.chartType = Ab.chart.ChartControl.prototype.CHARTTYPE_COLUMN;
			this.panel.addParameter('firstGroupField', 'regulation');
			this.panel.addParameter('firstGroupSortField', 'regulation');
			this.panel.addParameter('secondGroupField', location.value);
			this.panel.addParameter('secondGroupSortField', location.value);
			this.control.secondGroupFieldDef = '';
		}else if(option =='location+regulation' ){
			this.control.chartType = Ab.chart.ChartControl.prototype.CHARTTYPE_COLUMN;
			this.panel.addParameter('secondGroupField', 'regulation');
			this.panel.addParameter('secondGroupSortField', 'regulation');
			this.panel.addParameter('firstGroupField', location.value);
			this.panel.addParameter('firstGroupSortField', location.value);
			this.control.secondGroupFieldDef = '';
		}
	}

});
