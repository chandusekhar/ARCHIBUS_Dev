
View.createController('aboutAndLicense', {
	
	// true of this window was opened from the License Wizard to print the license
	openedFromLicenseWizard: false,

	/**
	 * After initial data fetch get the program license and evaluation info from server
	 * for each server call define a callback that injects the data into the dataView panels
	 */
    afterInitialDataFetch: function() {
	    // check if the view is loaded from the License Program, to print the custom license
	    var openerView = typeof(View.getOpenerView) == 'function' ? View.getOpenerView() : false;
	    if (!openerView && opener) {
	    	openerView = opener.View;
	    }
	    if (openerView) {
	        var parentController = openerView.controllers.get('licenseWizard');
	        if (parentController) {
	        	this.openedFromLicenseWizard = true;
	        	
	        	View.setTitle(getMessage('licenseViewTitle'));
	        	// display the custom license stored in the parent controller
	        	var license = parentController.license;
                this.displayCustomerInfo(license);
                this.displayLicenses(license);
                // hide the Refresh License Information button
                this.customerInfoPanel.actions.get('refresh').forceHidden();
	        	return;
	        }
	    }

	    // load the server license
        var controller = this;
		AdminService.getProgramLicense({
            callback: function(license) {
			    // display the license
                controller.displayCustomerInfo(license);
                controller.displayLicenses(license);
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    },
    
    customerInfoPanel_onRefresh: function() {
    	this.afterInitialDataFetch();
    },
    
    customerInfoPanel_onPrint: function() {
    	var html = '<html>\n';
    	html = html + document.documentElement.firstChild.innerHTML;
    	html = html + '<body>\n';
    	html = html + '<h2 class="panelToolbar">' + View.title + '</h2>\n';
    	html = html + $('customerInfoPanel').innerHTML;
    	html = html + $('concurrentUsersPanel').innerHTML;
    	html = html + $('namedUsersPanel').innerHTML;
    	html = html + $('otherOptionsPanel').innerHTML;
    	html = html + $('domainsPanel').innerHTML;
    	html = html + $('activitiesPanel').innerHTML;
    	html = html + '</body></html>';
    	
    	var printWindow = window.open();
    	printWindow.document.open();
    	printWindow.document.write(html);
    	printWindow.document.close();
    	printWindow.print();
    	printWindow.close();
    },
    
	/**
	 * Displays the customer information.
	 */
    displayCustomerInfo: function(license) {
    	var customerInfo = valueExists(license.customerInfoDto) ? license.customerInfoDto : license.customerInfo;

        // remove existing rows
        var table = Ext.get('customerInfoTable');
        this.clearTableRows(table);
    	
    	this.addTableRowLabelValue(table, getMessage('licensedVersion'), 'V.' + customerInfo.licensedVersion + '.' + customerInfo.licensedRevision);
    	this.addTableRowLabelValue(table, getMessage('licensedTo'), customerInfo.licensedTo);
    	this.addTableRowLabelValue(table, getMessage('serialNumber'), customerInfo.serialNumber);
    	if (valueExists(customerInfo.version) &&
    		valueExists(license.licenses[0].concurrentLicenseCounter)) {
    	    this.addTableRowLabelValue(table, getMessage('buildNumber'), customerInfo.version);
    	}
    	
    	var expirationDate = customerInfo.expirationDate;
		if (valueExistsNotEmpty(expirationDate)) {
	    	this.addTableRowLabelValue(table, getMessage('expirationDate'), getMessage('evaluationLicense') + expirationDate.format('F j, Y'));
        }
		this.addTableRowLabelValue(table, getMessage('copyrightTitle'), getMessage('copyrightValue'));
		this.addTableRowMessage(table, getMessage('eulaMessage') + ' <a href="http://www.archibus.com/licenses">http://www.archibus.com/licenses</a>.', 2);
		
        // this.coreLicensesPanel.setInstructions(getMessage('contactMessage') + ' [' + customerInfo.adminEmail + ']');
    },

    /**
     * Displays the licenses.
     */
    displayLicenses: function(licenseDTO) {
        var concurrentUsers = [];
        var namedUsers = [];
        var otherOptions = [];
        var domains = [];
        var activities = [];

        var domainsById = {};
        var activitiesById = {};
        for (var i = 0; i < licenseDTO.licenses.length; i++) {
        	var license = licenseDTO.licenses[i];
    		if (license.enabled) {
        	    if (license.group === 'domain') {
        		    domainsById[license.id] = license;
        		} else if (license.concurrentUsers > 0 || license.concurrentUsers + license.namedUsers > 0) {
        		    activitiesById[license.id] = license;
        		}
        	}        		
        }
        
        var addDomain = function(id) {
        	var domain = domainsById[id]; 
        	if (valueExists(domain)) {
        		domains.push(domain);
        	}
        };
        
        var addActivity = function(id) {
        	var activity = activitiesById[id]; 
        	if (valueExists(activity)) {
        		activities.push(activity);
        	}
        };
        
        var addBlankActivity = function(title) {
        	var previousActivity = activities[activities.length - 1];
        	// do not allow duplicates
        	if (valueExists(previousActivity) && previousActivity.title != title) { 
	    		activities.push({ 
	    			title: title,
	    			concurrentUsers: '',
	    			addIn: false,
	    			concurrentLicenseCounter: {
						available: '',
						inUse: '',
						totalPerServer: ''
					}
	    		});
        	}
        };
        
        addDomain('AbRPLM');
        addDomain('AbProject');
        addDomain('AbSpace');
        addDomain('AbMove');
        addDomain('AbAsset');
        addDomain('AbBldgOps');
        addDomain('AbRisk');
        addDomain('AbWorkplaceServices');
        addDomain('AbDashboards');
        addDomain('AbSolutionTemplates');
        addDomain('AbSystem');

        addActivity('AbRPLMPortfolioAdministration');
        addActivity('AbRPLMLeaseAdministration');
        addActivity('AbRPLMCosts');
        addActivity('AbRPLMChargebackInvoice');
        addActivity('AbRPLMGovPropertyRegistry');
        addActivity('AbRPLMGroupSpaceAllocation');
        addActivity('AbRPLMPortfolioForecasting');
        addActivity('AbRPLMStrategicFinancialAnalysis');
        addBlankActivity('');
        addActivity('AbCapitalBudgeting');
        addActivity('AbProjectManagement');
        addActivity('AbProjCommissioning');
        addBlankActivity('');
        addActivity('AbSpaceRoomInventoryBAR');
        addActivity('AbSpaceRoomChargebackAR');
        addActivity('AbSpacePersonnelInventory');
        addActivity('AbSpacePlanning');
        addBlankActivity('');
        addActivity('AbMoveManagement');
        addActivity('AbAssetManagement');
        addActivity('AbAssetAM');
        addActivity('AbAssetEAM');
        addActivity('AbAssetTAM');
        addBlankActivity('');
        addActivity('AbBldgOpsOnDemandWork');
        addActivity('AbBldgOpsPM');
        addActivity('AbCapitalPlanningCA');
        addBlankActivity('');
        addActivity('AbRiskEmergencyPreparedness');
        addActivity('AbRiskES');
        addActivity('AbRiskEnergyManagement');
        addActivity('AbRiskGreenBuilding');
        addActivity('AbRiskCleanBuilding');
        addActivity('AbRiskWasteMgmt');
        addActivity('AbRiskCompliance');
        addActivity('AbRiskEHS');
        addActivity('AbRiskMSDS');
        addActivity('AbRiskMonitoring');
        addBlankActivity('');
        addActivity('AbBldgOpsHelpDesk');
        addActivity('AbWorkplaceReservations');
        addActivity('AbSpaceHotelling');

        for (var i = 0; i < licenseDTO.licenses.length; i++) {
        	var license = licenseDTO.licenses[i];
        	
        	var group = license.group;
        	var id = license.id;
        	
        	if (id === 'AbCorePDA' || id === 'AbEnterpriseAccessLicenses' || id === 'AbRPLMEsriExtensions' ||
                id === 'AbPerformanceMetricsFramework' || id === 'AbReservationsExchangeExtension' || id === 'AbWebCentral3DNavigator') {
	        	otherOptions.push(license);

            } else if (id === 'AbMobileFrameworkLicenses') {
                otherOptions.push({
                    title: license.title,
                    concurrentUsers: license.concurrentUsers,
                    namedUsers: getMessage('NA')
                });

        	} else if (group == 'option' && this.openedFromLicenseWizard) {
	        	otherOptions.push(license);
        		
        	} else if (group === 'level' || group == 'option') {
            	
            	if (id == 'AbCoreLevel4Activity') {
            		license.title = getMessage('applicationConnectionPoint');
            		
                    concurrentUsers.push(license);
                    namedUsers.push(license);

                    otherOptions.push({
                        title: getMessage('numberOfCores'),
                        concurrentUsers: license.numberOfCores,
                        namedUsers: getMessage('NA')
                    });
            	} else {
            		// do not display AbCoreLevel1, AbCoreLevel2, AbCoreLevel3, AbCoreLevel4, AbCoreLevel4System licenses if
            		// (a) this is an Application Control Point license and 
            		// (b) their concurrent + named counts are zero
            		if (id.indexOf('AbCoreLevel') == 0 && (license.concurrentUsers + license.namedUsers == 0)) {
            			continue;
            		}
            		
            		// do not display System Administrator level for concurrent users
                	if (id != 'AbCoreLevel4System') {
        	        	concurrentUsers.push(license);
                	}
    	        	namedUsers.push(license);
            	}
        	}
        }
        this.ensureLicenseOrder(namedUsers, 'AbCoreLevel4System', 'AbCoreLevel4Activity');
        
        // if the license file does not contain EALs, add fake license before ESRI extensions
        var enterpriseAccessLicensesIndex = -1;
        var esriIndex = -1;
        for (var i = 0; i < otherOptions.length; i++) {
        	if (otherOptions[i].id === 'AbEnterpriseAccessLicenses') {
        		enterpriseAccessLicensesIndex = i;
        	}
        	if (otherOptions[i].id === 'AbRPLMEsriExtensions') {
        		esriIndex = i;
        	}
        }
        if (enterpriseAccessLicensesIndex == -1) {
        	// EAL license does not exist - add
        	var enterpriseAccessLicenses = {
        		title: getMessage('numberOfEALs'),
        		concurrentUsers: 0,
        		namedUsers: 0
        	};
        	if (esriIndex == -1) {
        		otherOptions.push(enterpriseAccessLicenses);
        	} else {
        		otherOptions.splice(esriIndex, 0, enterpriseAccessLicenses);
        	}
        } else {
        	// EAL license does exist - move to be before ESRI
        	var enterpriseAccessLicenses = otherOptions.splice(enterpriseAccessLicensesIndex, 1);
    		otherOptions.splice(esriIndex, 0, enterpriseAccessLicenses[0]);
        }
        
        // starter pack
        if (this.findLicense(licenseDTO.licenses, 'AbBuildingOperations').enabled &&
            this.findLicense(licenseDTO.licenses, 'AbRealPropertyAndLease').enabled &&
            this.findLicense(licenseDTO.licenses, 'AbWorkplacePortal').enabled &&
            this.findLicense(licenseDTO.licenses, 'AbSpaceOccupancy').enabled &&
            this.findLicense(licenseDTO.licenses, 'AbSpaceAllocation').enabled) {
            addBlankActivity('');

            // display the number of Starter Pack licenses (from the Building Operations activity)
            //addBlankActivity(getMessage('starterPack'));
            var activity = this.findLicense(licenseDTO.licenses, 'AbBuildingOperations');
    		activities.push({ 
    			title: getMessage('starterPack'),
    			concurrentUsers: activity.concurrentUsers,
    			addIn: false,
    			concurrentLicenseCounter: activity.concurrentLicenseCounter
    		});
        }
        
        // add-in licenses
        for (var i = 0; i < licenseDTO.licenses.length; i++) {
        	var license = licenseDTO.licenses[i];
        	
	    	if (valueExists(license.addIn) && license.addIn) {
	    		addActivity(license.id);
	    	}
        }
        
        this.displayConcurrentUserLicenses(concurrentUsers);
        this.displayNamedUserLicenses(namedUsers);
        this.displayOtherOptions(otherOptions);
        this.displayDomains(domains);
        this.displayActivities(activities, false);
    },
    
    displayConcurrentUserLicenses: function(records) {
        var table = Ext.get('concurrentUsersTable');
        this.clearTableRows(table);
        
        var titles = [
            getMessage('licenseLevel'),
            getMessage('concurrentUsers')
        ];
        if (!this.openedFromLicenseWizard) {
        	titles.push(getMessage('inUse'));
        	titles.push(getMessage('available'));
        	titles.push(getMessage('totalPerServer'));
        } else {
        	titles.push('');
        }
        this.addTableRow(table, titles, 'title');
        
        for (var i = 0; i < records.length; i++) {
        	var values = [ 
        	    records[i].title, 
        	    records[i].concurrentUsers 
        	];
        	if (!this.openedFromLicenseWizard) {
        	    values.push(records[i].concurrentLicenseCounter.inUse);
        	    values.push(records[i].concurrentLicenseCounter.available);
        	    values.push(records[i].concurrentLicenseCounter.totalPerServer);
            } else {
            	values.push('');
        	}
            this.addTableRow(table, values);
        }
    },

    displayNamedUserLicenses: function(records) {
        var table = Ext.get('namedUsersTable');
        this.clearTableRows(table);
        
        var titles = [
            getMessage('licenseLevel'),
            getMessage('namedUsers')
        ];
        if (!this.openedFromLicenseWizard) {
          	titles.push(getMessage('inUse'));
          	titles.push(getMessage('available'));
          	titles.push(getMessage('totalPerServer'));
        } else {
        	titles.push('');
        }
        this.addTableRow(table, titles, 'title');
        
        for (var i = 0; i < records.length; i++) {
        	var values = [ 
        	    records[i].title, 
        	    records[i].namedUsers 
        	];
        	if (!this.openedFromLicenseWizard) {
        	    values.push(records[i].namedLicenseCounter.inUse);
        	    values.push(records[i].namedLicenseCounter.available);
        	    values.push(records[i].namedLicenseCounter.totalPerServer);
            } else {
            	values.push('');
        	}
            this.addTableRow(table, values);
        }
    },

    displayOtherOptions: function(records) {
        var table = Ext.get('otherOptionsTable');
        this.clearTableRows(table);
        
        var titles = [
            getMessage('otherOptions'),
            getMessage('concurrentUsers'),
            getMessage('namedUsers')
        ];
        if (!this.openedFromLicenseWizard) {
        	titles.push('');
        	titles.push('');
        }
        this.addTableRow(table, titles, 'title');
        
        for (var i = 0; i < records.length; i++) {
        	var concurrentUsers = records[i].concurrentUsers;
        	var namedUsers = records[i].namedUsers;
        	
        	if (records[i].id === 'AbRPLMEsriExtensions' || records[i].id === 'AbPerformanceMetricsFramework'
                || records[i].id === 'AbReservationsExchangeExtension' || records[i].id === 'AbWebCentral3DNavigator') {
        		concurrentUsers = records[i].enabled ? getMessage('yes') : getMessage('no');
        		namedUsers = getMessage('NA');
        	}

            if (records[i].id === 'AbRPLMEsriExtensions') {
                records[i].title = 'Geospatial Extensions for Esri';

            } else if (records[i].id === 'AbReservationsExchangeExtension') {
                records[i].title = 'Reservation Extension for Microsoft Exchange';

            } else if (records[i].title === 'Mobile Framework Licenses') {
                records[i].title = 'Mobile Framework';
                concurrentUsers = concurrentUsers > 0 ? getMessage('yes') : getMessage('no');
                namedUsers = getMessage('NA');
            }

            var values = [
                records[i].title,
                concurrentUsers,
                namedUsers
            ];
            if (!this.openedFromLicenseWizard) {
            	values.push('');
            	values.push('');
            }
            this.addTableRow(table, values);
        }
    },
    
    displayActivities: function(records, addInsOnly) {
        var table = Ext.get('activitiesTable');
        this.clearTableRows(table);
        
        var titles = [
            getMessage('activities'),
            getMessage('totalUsers')
        ];
        if (!this.openedFromLicenseWizard) {
        	titles.push(getMessage('inUse'));
        	titles.push(getMessage('available'));
        	titles.push(getMessage('totalPerServer'));
        } else {
        	titles.push('');
        }

        this.addTableRow(table, titles, 'title');
        
        var addInFound = false;
        var activityRecords = this.ds_activities.getRecords();
        
        for (var i = 0; i < records.length; i++) {
        	var activity = records[i];

        	var title = activity.title;
        	if (valueExists(activity.addIn) && activity.addIn) {
        		title = title + ' **';
        		addInFound = true;
        	} else {
        		if (addInsOnly == true) {
        			continue;
        		}
        	}

        	var values = [ 
        	    this.getLocalizedTitle(true, activityRecords, activity.id, activity.title), 
        	    activity.concurrentUsers 
        	];
        	if (!this.openedFromLicenseWizard && valueExists(activity.concurrentLicenseCounter)) {
        	    values.push(activity.concurrentLicenseCounter.inUse);
        	    values.push(activity.concurrentLicenseCounter.available);
        	    values.push(activity.concurrentLicenseCounter.totalPerServer);
            } else {
            	values.push('');
        	}
            this.addTableRow(table, values);
        }
        
        if (addInFound) {
        	this.addTableRowMessage(table, getMessage('addIn'), this.openedFromLicenseWizard ? 2 : 4);
        }
    },
    
    displayDomains: function(domains) {
        var table = Ext.get('domainsTable');
        this.clearTableRows(table);
        
        var titles = [ getMessage('domains') ];
        this.addTableRow(table, titles, 'title');
        
        var records = this.ds_domains.getRecords();
        for (var i = 0; i < domains.length; i++) {
        		var localizedTitle = this.getLocalizedTitle(false, records, domains[i].id, domains[i].title);

            //var values = [ domains[i].title ];
            var values = [ localizedTitle ];
            this.addTableRow(table, values);
        }
    },

    // ----------------------- helper methods ----------------------------------------------------- 
    
    getLocalizedTitle: function(bActivity, records, id, engTitle) {       
        var idFieldName = 'afm_products.product_id';
        var titleFieldName = 'afm_products.title';
        
        if(bActivity){
        	idFieldName = 'afm_activities.activity_id';
        	titleFieldName = 'afm_activities.title';
        }
        
        for(var j=0; j<records.length; j++){
        	var record = records[j];
        	if(records[j].values[idFieldName] == id){
        		return records[j].values[titleFieldName];
        	}
        }
        
        return engTitle;
    },
            
    clearTableRows: function(table, rowsToKeep) {
    	if (!valueExists(rowsToKeep)) {
    		rowsToKeep = 0;
    	}
        var rows = table.select('tr').elements;
	    for (var i = rowsToKeep; i < rows.length; i++) {
	    	Ext.removeNode(rows[i]);
        }
    },
    
    addTableRowLabelValue: function(table, label, value) {
    	var html = '<tr>';
    	html += '<td width="20%"><span class="title">' + label + '</span></td>';
    	html += '<td><span>' + value + '</span></td>';
    	html += '</tr>';
    	Ext.DomHelper.append(table, html);
    },

    addTableRowMessage: function(table, message, colspan) {
    	var html = '<tr>';
    	html += '<td colspan="' + colspan + '"><span>' + message + '</span></td>';
    	html += '</tr>';
    	Ext.DomHelper.append(table, html);
    },

    addTableRow: function(table, values, clazz) {
    	if (!valueExists(clazz)) {
    		clazz = '';
    	}
    	var html = '<tr>';
    	for (var i = 0; i < values.length; i++) {
    	    html += '<td width="20%"><span class="' + clazz + '">' + values[i] + '</span></td>';
    	}
    	html += '</tr>';
    	Ext.DomHelper.append(table, html);
    },
    
    /**
     * Finds loaded license by ID.
     */
    findLicense: function(licenses, id) {
        for (var i = 0; i < licenses.length; i++) {
        	var license = licenses[i];
        	if (license.id == id) {
        		return license;
        	}
        }
        
	    return null;
    },
    
    /**
     * If both licenses exist in the array, reorders them so that the first license is before the second license.
     */
    ensureLicenseOrder: function(licenses, firstLicenseId, secondLicenseId) {
        var firstLicenseIndex = -1;
        var secondLicenseIndex = -1;
        for (var i = 0; i < licenses.length; i++) {
        	if (licenses[i].id === firstLicenseId) {
        		firstLicenseIndex = i;
        	}
        	if (licenses[i].id === secondLicenseId) {
        		secondLicenseIndex = i;
        	}
        }
        if (firstLicenseIndex != -1 && secondLicenseIndex != -1) {
        	var firstLicense = licenses.splice(firstLicenseIndex, 1)[0];
    		licenses.splice(secondLicenseIndex, 0, firstLicense);
        }
    }
});

