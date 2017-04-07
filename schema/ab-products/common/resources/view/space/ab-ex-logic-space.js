
View.createController('spaceService', {
    
    selectYearFrom: null,
    
    selectYearTo: null,
    
    afterInitialDataFetch: function() {
        var yearRecords = View.dataSources.get("yearsDS").getRecords();
        this.selectYearFrom = $('selectYearFrom');
        this.selectYearTo = $('selectYearTo');
        this.populateYearSelectLists(yearRecords, this.selectYearFrom, 0);
        this.populateYearSelectLists(yearRecords, this.selectYearTo, 10);
    },
    
    populateYearSelectLists: function(records, selector, additionalYears) {
        selector.innerHTML = '';
        for (var i = 0; i < records.length; i++) {
            var year = records[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            selector.appendChild(option);
        }
        
        var year = this.getSystemYear() + additionalYears;
        var optionIndexCurrentYear = this.getOptionIndex(selector, year);
        selector.options[optionIndexCurrentYear].setAttribute('selected', true);
        selector.value = year;
    },
    
    getSystemYear: function() { 
        var systemYear = new Date().getYear() % 100;
        systemYear += (systemYear < 38) ? 2000 : 1900;
        return systemYear;  
    },

    getOptionIndex: function(selector, value) {
        var index = -1;
        if (selector.options) {
            for (var i = 0; i != selector.options.length; i++) {
                if (selector.options[i].value == value) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    },
    
    consoleAllRoom_onAddStandardRoomCategoriesAndTypes: function() {
        try {
            var result = Workflow.callMethod('AbCommonResources-SpaceService-addStandardRoomCategoriesAndTypes');
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    consoleAllRoom_onPerformChargebackAllRoom: function() {
        try {
            var jobId = Workflow.startJob('AbCommonResources-SpaceService-performChargebackAllRoom');
            View.openJobProgressBar('Updating area totals', jobId);
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    consoleSharedWorkspace_onSynchronizeSharedRooms: function() {
        try {
            var jobId = Workflow.startJob('AbCommonResources-SpaceService-synchronizeSharedRooms');
			if (valueExists(jobId)) {				
				// open the progress bar dialog
				View.openJobProgressBar(getMessage('reconcilingMessage'),  jobId, '', function(status) {
					if(status.jobFinished == true){						
						View.alert(getMessage("reconcileMessage"));
					}
				});
			}				
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    consoleSharedWorkspace_onUpdateAreaTotalsSpace: function() {
        try {
            var result = Workflow.callMethod('AbCommonResources-SpaceService-updateAreaTotalsSpace');
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    consoleSharedWorkspace_onUpdateAreaTotalsSpaceTime: function() {
        try {
            var dateFrom = this.selectYearFrom.value + '-01-01';
            var dateTo = this.selectYearTo.value + '-12-31';
            var result = Workflow.callMethod('AbCommonResources-SpaceService-updateAreaTotalsSpaceTime', dateFrom, dateTo);
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    consoleSharedWorkspace_onPerformChargebackSharedWorkspace: function() {
        try {
            var result = Workflow.callMethod('AbCommonResources-SpaceService-performChargebackSharedWorkspace');
            View.alert(result.message);
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});