/**
 * Controller for the Operation Console Filter Recent Search
 */
var opsConsoleRecentSearchController = View.createController('opsConsoleRecentSearchController', {

	/**
	 * Recent munu Ext.menu.Menu object
	 */
	recentMenu : null,

	/**
	 * When the 'Recent Search Menu' button is pressed in the 'Easy Filter'
	 */
	wrFilter_onRecentSearchMenu : function() {
		this.displayRecentSearches();
	},

	/**
	 * Displays the recent searches list.
	 */
	displayRecentSearches : function() {
		var controller = this;

		if (!this.recentMenu) {
			this.recentMenu = new Ext.menu.Menu({ autoWidth: function() {
	            // KB 3043295, 3041580: override Ext.menu.Menu method that does not work well on IE
	            var el = this.el;
	            if (!el) {
	                return;
	            }
	            var w = this.width;
	            if (w) {
	                el.setWidth(w);
	            }
	        } });
		}
		this.recentMenu.removeAll();

		// add recent items from side car
		var sidecar = this.wrFilter.getSidecar();
		_.each(sidecar.get('searchValues'), function(oriSearchValue, index) {
			var searchValue = [];
			
			var fieldNames = sidecar.get('searchFieldNames')[index];
			for(var i=0;i<fieldNames.length;i++){
				
				searchValue.push(_.clone(oriSearchValue[i]));
				
				if(fieldNames[i] == 'bigBadFilter_wr.status'){
					var enums = View.dataSources.get('wrDetailsDS').fieldDefs.get('wr.status').enumValues;
					for ( var m = 0; m < searchValue[i].length; m++) {
						if(searchValue[i][m] == 'H'){
							searchValue[i][m] = getMessage('onHold');
						}else{
							searchValue[i][m] = enums[searchValue[i][m]];
						}
					}
				}if(fieldNames[i] == 'bigBadFilter_wrpt.status'){
					for ( var m = 0; m < searchValue[i].length; m++) {
						if(searchValue[i][m] == 'NR'){
							searchValue[i][m] = getMessage('NR');
						}else if(searchValue[i][m] == 'NI'){
							searchValue[i][m] = getMessage('NI');
						}else if(searchValue[i][m] == 'R'){
							searchValue[i][m] = getMessage('R');
						}
					}
				}else if(fieldNames[i] == 'bigBadFilter_wr.returned'){
					if(searchValue[i] == true){
						searchValue[i] = getMessage('returned');
					}
					
				}else if(fieldNames[i] == 'bigBadFilter_wr.escalated'){
					if(searchValue[i] == true){
						searchValue[i] = getMessage('escalatedTrue');
					}
					
				}else if(fieldNames[i] == 'bigBadFilter_operator'){
					searchValue[i] = getMessage('EstimatedCost')+searchValue[i]+oriSearchValue[i+1];
				}else if(fieldNames[i] == 'bigBadFilter_worktype'){
					if(searchValue[i] == 'OD'){
						searchValue[i] = getMessage('OD');
					}else if(searchValue[i] == 'PM'){
						searchValue[i] = getMessage('PM');
					}
				}else if(fieldNames[i] == 'bigBadFilter_wr.cost_est_total'){
					searchValue[i] = '';
				}
			}
				
			var text = searchValue.toString().replace(',,',',');
			controller.recentMenu.addItem(new Ext.menu.Item({
				text : text,
				listeners : {
					click : controller.onSelectRecentSearch.createDelegate(controller, [ index ])
				}
			}));
		});

		//KB3050063 - Ops Console/Recent filter: An extra symbol is shown next to 'Recent' button when there is no value in the dropdown list.
		jQuery('.x-shadow').hide();
		jQuery('.x-menu').hide();
		if (this.recentMenu.items.length > 0) {
			this.recentMenu.show(Ext.get('recentSearchMenu'),
					'tl-bl?');
		}
		
	},

	/**
	 * Adds new search to the recent searches sidecar.
	 */
	addRecentSearch : function() {
		// get current search field names and values
		var search = this.getCurrentSearch();

		// add current search to side car
		this.addSearchToSideCar(search);

	},

	/**
	 * get selected field names and values in the filter
	 */
	getCurrentSearch : function() {
		// all the fields in the filter
		var allFieldNames = [ 'wr.description','wr.site_id','wr.bl_id', 'wr.fl_id', 'wr.rm_id', 'wr.prob_type', 'wr.dv_id', 'wr.dp_id', 'wr.requestor', 'eq.eq_std', 'wr.eq_id', 
		                      'wr.pmp_id','wr.pms_id','wrtr.tr_id', 'wrpt.part_id', 'wrcf.cf_id', 'wr.wr_id', 'wr.wo_id', 'wr.work_team_id', 'wr.date_requested.from', 'wr.date_requested.to', 
		                      'wr.date_assigned.from', 'wr.date_assigned.to', 'bigBadFilter_worktype', 'bigBadFilter_wr.escalated', 'bigBadFilter_wr.returned',
		                      'bigBadFilter_operator', 'bigBadFilter_wr.cost_est_total', 'bigBadFilter_wrpt.status','bigBadFilter_wr.status', 'bigBadFilter_wr.priority' ];

		// get not empty field name and values
		var searchFieldNames = [];
		var searchValues = [];
		var controller = this;
		_.each(allFieldNames, function(fieldName) {
			var fieldValue = controller.wrFilter.getFieldValue(fieldName);
			if (!valueExistsNotEmpty(fieldValue)) {
				fieldValue = controller.bigBadFilter.getFieldValue(fieldName);
				if ('bigBadFilter_worktype' == fieldName || 'bigBadFilter_operator' == fieldName) {
					fieldValue = opsConsoleFilterRestrictionController.getSelectBoxValue(fieldName);
				} else if ('bigBadFilter_wrpt.status' == fieldName || 'bigBadFilter_wr.status' == fieldName || 'bigBadFilter_wr.priority' == fieldName) {
					fieldValue = controller.bigBadFilter.getCheckboxValues(fieldName.replace('bigBadFilter_', ''));
					if (fieldValue.length == 0) {
						fieldValue = '';
					}
				} else if ('bigBadFilter_wr.returned' == fieldName) {
					fieldValue = Ext.get('bigBadFilter_wr.returned').dom.checked;
					if (fieldValue == false) {
						fieldValue = '';
					}
				}  else if ('bigBadFilter_wr.escalated' == fieldName) {
					fieldValue = Ext.get('bigBadFilter_wr.escalated').dom.checked;
					if (fieldValue == false) {
						fieldValue = '';
					}
				} else if ('bigBadFilter_wr.cost_est_total' == fieldName) {
					fieldValue = Ext.get('bigBadFilter_wr.cost_est_total').dom.value;
				}
			}

			if (valueExistsNotEmpty(fieldValue)) {
				searchFieldNames.push(fieldName);
				searchValues.push(fieldValue);
			}
		});

		var search = {};
		search['searchFieldNames'] = searchFieldNames;
		search['searchValues'] = searchValues;

		return search;
	},

	/**
	 * Add given search to side car
	 */
	addSearchToSideCar : function(search) {
		// if filter is not empty, add it to the side car
		if (search.searchFieldNames.length > 0) {
			// side cart
			var sidecar = this.wrFilter.getSidecar();

			// get search field names and values stored in the side car
			var searchFieldNames = valueExistsNotEmpty(sidecar.get('searchFieldNames')) ? sidecar.get('searchFieldNames') : [];
			var searchValues = valueExistsNotEmpty(sidecar.get('searchValues')) ? sidecar.get('searchValues') : [];

			// temp array used for eliminate duplicates and re-order
			var newSearchFieldNames = [];
			var newSearchValues = [];

			// eliminate duplicates from this list.
			for ( var i = 0; i < searchFieldNames.length; i++) {
				if (JSON.stringify(search.searchFieldNames) != JSON.stringify(searchFieldNames[i]) || JSON.stringify(search.searchValues) != JSON.stringify(searchValues[i])) {
					newSearchFieldNames.push(searchFieldNames[i]);
					newSearchValues.push(searchValues[i]);
				}
			}

			// put the most recent searches at the top of the list
			newSearchFieldNames.unshift(search.searchFieldNames);
			newSearchValues.unshift(search.searchValues);

			// save the new search the side car
			sidecar.set('searchFieldNames', newSearchFieldNames);
			sidecar.set('searchValues', newSearchValues);
			sidecar.save();
		}
	},

	/**
	 * Selects a recent search.
	 * 
	 * @param search
	 *            Ab.view.Restriction.
	 */
	onSelectRecentSearch : function(index) {
		// clear filter values
		opsExpressConsoleFilter.clearEasyFilterValue();

		// clear big filter values
		opsExpressConsoleFilter.clearBigFilter();

		// set selected recent search
		this.setSelectedRecentSearch(index);

		// refresh the result grid
		opsExpressConsoleFilter.wrFilter_onFilter();
	},

	/**
	 * Set the selected recent search values in the filter
	 */
	setSelectedRecentSearch : function(index) {
		// get stored search field names and field values
		var sidecar = this.wrFilter.getSidecar();
		var searchFieldNames = sidecar.get('searchFieldNames')[index];
		var searchValues = sidecar.get('searchValues')[index];

		// set the values in the filter
		var controller = this;
		_.each(searchFieldNames, function(fieldName, i) {
			
			if(fieldName!= 'wr.wr_id'){
				controller.wrFilter.setFieldValue(fieldName, searchValues[i], null, false);
			}
			
			controller.bigBadFilter.setFieldValue(fieldName, searchValues[i], null, false);

			if ('bigBadFilter_worktype' == fieldName || 'bigBadFilter_operator' == fieldName) {
				Ext.get(fieldName).dom.value = searchValues[i];
			} else if ('bigBadFilter_wr.status' == fieldName || 'bigBadFilter_wr.priority' == fieldName || 'bigBadFilter_wrpt.status' == fieldName) {

				for ( var m = 0; m < searchValues[i].length; m++) {
					var options = document.getElementsByName(fieldName);
					for ( var n = 0; n < options.length; n++) {
						if (options[n].value == searchValues[i][m]) {
							options[n].checked = true;
						}
					}
				}

			}else if ('bigBadFilter_wr.returned' == fieldName) {
				Ext.get('bigBadFilter_wr.returned').dom.checked = searchValues[i];
			} else if ('bigBadFilter_wr.escalated' == fieldName) {
				Ext.get('bigBadFilter_wr.escalated').dom.checked = searchValues[i];
			} else if ('bigBadFilter_wr.cost_est_total' == fieldName) {
				Ext.get('bigBadFilter_wr.cost_est_total').dom.value = searchValues[i];
			}
		});
	}
});