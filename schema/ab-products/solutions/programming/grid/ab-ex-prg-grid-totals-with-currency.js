var abExGridTotalsWithCurrencyCtrl = View.createController('abExGridTotalsWithCurrencyCtrl', {
	
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
		fields:['cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.amount_income_vat_payment', 'cost_tran_recur.amount_income_total_payment',
		        'cost_tran_recur.amount_expense_base_payment', 'cost_tran_recur.amount_expense_vat_payment', 'cost_tran_recur.amount_expense_total_payment'],
		currencyCode: '',
		exchangeRateType: '',
		currencyFields: []
	},
	
	afterViewLoad: function(){
		
		this.isMcAndVatEnabled = (valueExists(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) 
											&&  parseInt(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) == 1);
		if (this.isMcAndVatEnabled) {
			this.displayCurrency.type = 'user';
			this.displayCurrency.code = View.user.userCurrency.code; 
			this.displayCurrency.exchangeRateType = 'Payment';
			
			this.statisticAttibutes.currencyCode = this.displayCurrency.code;
			this.statisticAttibutes.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutes.currencyFields = ['cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.amount_income_vat_payment', 'cost_tran_recur.amount_income_total_payment',
			                          		        'cost_tran_recur.amount_expense_base_payment', 'cost_tran_recur.amount_expense_vat_payment', 'cost_tran_recur.amount_expense_total_payment'];

			this.abCostTranRecur.displayCurrency = this.displayCurrency;
		}
		
		this.setParameters('abCostTranRecur', this.statisticAttibutes);
	},
	
	abCostTranRecur_onRefresh: function(){
		if (valueExists(this.abCostTranRecur.displayCurrency)) {
			this.displayCurrency.type = this.abCostTranRecur.displayCurrency.type;
			this.displayCurrency.code = this.abCostTranRecur.displayCurrency.code; 
			this.displayCurrency.exchangeRateType = this.abCostTranRecur.displayCurrency.exchangeRateType;
			
			this.statisticAttibutes.currencyCode = this.displayCurrency.code;
			this.statisticAttibutes.exchangeRateType = this.displayCurrency.exchangeRateType;

			this.setParameters('abCostTranRecur', this.statisticAttibutes);
			
		}
		
		this.abCostTranRecur.refresh();
		
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