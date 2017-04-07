var abExGridWithCustomTotalCtrl = View.createController('abExGridWithCustomTotalCtrl', {
	currencyCode: null,
	
	exchangeRateType: null,
	
	isMcAndVatEnabled: false,
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: 'Budget'
	},
	
	statisticAttibutes:{
		formulas:['sum'],
		fields:['property.vf_area_bl_gross_int', 'property.vf_yearly_cost_total', 'property.vf_yrly_cost_tot_gross_area'],
//		currencyCode: '',
//		exchangeRateType: '',
//		currencyFields: [],
		formulaFields: ['property.vf_yrly_cost_tot_gross_area'],
		formulaValues: ['property.vf_yearly_cost_total/property.vf_area_bl_gross_int']
	},
	
	afterViewLoad: function(){
		
//		this.isMcAndVatEnabled = (valueExists(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) 
//											&&  parseInt(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) == 1);
//		if (this.isMcAndVatEnabled) {
//			this.displayCurrency.type = 'user';
//			this.displayCurrency.code = View.user.userCurrency.code; 
//			this.displayCurrency.exchangeRateType = 'Payment';
//			
//			this.statisticAttibutes.currencyCode = this.displayCurrency.code;
//			this.statisticAttibutes.exchangeRateType = this.displayCurrency.exchangeRateType;
//			this.statisticAttibutes.currencyFields = [];
//
//			this.abExGridWithCustomTotal_grid.displayCurrency = this.displayCurrency;
//		}
		this.statisticAttibutes.formulaFields = ['property.vf_yrly_cost_tot_gross_area'];
		this.statisticAttibutes.formulaValues = ['property.vf_yearly_cost_total/property.vf_area_bl_gross_int'];
		
		this.setParameters('abExGridWithCustomTotal_grid', this.statisticAttibutes);
	},
	
	abCostTranRecur_onRefresh: function(){
		if (valueExists(this.abExGridWithCustomTotal_grid.displayCurrency)) {
			this.displayCurrency.type = this.abExGridWithCustomTotal_grid.displayCurrency.type;
			this.displayCurrency.code = this.abExGridWithCustomTotal_grid.displayCurrency.code; 
			this.displayCurrency.exchangeRateType = this.abExGridWithCustomTotal_grid.displayCurrency.exchangeRateType;
			
			this.statisticAttibutes.currencyCode = this.displayCurrency.code;
			this.statisticAttibutes.exchangeRateType = this.displayCurrency.exchangeRateType;

			this.setParameters('abExGridWithCustomTotal_grid', this.statisticAttibutes);
			
		}
		
		this.abExGridWithCustomTotal_grid.refresh();
		
	},
	
	/**
	 * Set statistic attributes to grid object.
	 */
	setParameters: function(panelId, configObject) {
		var objPanel = View.panels.get(panelId);
		if (objPanel) {
			objPanel.setStatisticAttributes(configObject);
		}
	}
	
});