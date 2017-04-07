/**
 * Controller.
 */
var helpdeskRequestorController = View.createController('helpdeskRequestorController', {
    
    /**
     * Recent problem records.
     */
    record: null,
    
    /**
     * How many records to display.
     */
    recordsToDisplay: 10,

    /**
     * Called after the view is loaded, but before initial data fetch.
     * Initializes the DataView control.
     */
    afterViewLoad: function() {
        // set localized titles and add event listeners to custom buttons
        this.prgDataViewCustom_mainPanel.addCustomAction({
            id: 'reportNewProblem',
            title: getMessage('reportNewProblemTitle'),
            listener: this.onReportNewProblem.createDelegate(this)
        });
        this.prgDataViewCustom_mainPanel.addCustomAction({
            id: 'checkProblemStatus',
            title: getMessage('checkProblemStatusTitle'),
            listener: this.onCheckProblemStatus.createDelegate(this)
        });
        
        // create data view
        var dataSource = this.prgDataViewCustom_mainDataSource;
        var controller = this;
        this.recentItemsList = new Ab.view.DataView('recentItems', {
            
            // HTML template text
            headerTemplate: 'headerTemplate',
            bodyTemplate: 'bodyTemplate',
            footerTemplate: 'footerTemplate',
            
            // function that returns JS object evaluated by the DataView control for each record
            getData: function(record) {
                var status = record.getValue('activity_log.status');
                return {
                    title: record.getValue('activity_log.action_title'),
                    summary: record.getValue('activity_log.description'),
                    status: status,
                    view: getMessage('view'),
                    edit: (status == 'REQUESTED') ? getMessage('edit') : '',
                    withdraw: (status != 'CANCELLED' && status != 'COMPLETED') ? getMessage('withdraw') : ''
                };
            },
            // function that returns JS object evaluated by the DataView control for the header
            getHeaderData: function() {
                var header = View.user.isGuest ? getMessage('recentItemsHeaderGuest') 
                                               : getMessage('recentItemsHeader'); 
                if (!controller.hasRecentItems()) {
                    header = getMessage('recentItemsHeaderNone');
                }
                return {
                    recentItemsHeader: header,
                    refresh: getMessage('refresh')};
            },
            // function that returns JS object evaluated by the DataView control for the footer
            getFooterData: function() {
                var moreRecords = controller.records.length - controller.recordsToDisplay;
                var footer = (moreRecords > 0) ? '' + moreRecords + ' ' + getMessage('recentItemsFooter') : '';
                return {recentItemsFooter: footer};
            }
        });
        
        // override the main panel refresh() method to refresh the DataView control 
        this.prgDataViewCustom_mainPanel.refresh = function(restriction) {
            controller.refresh(restriction);
        };
    },
    
    /**
     * Initial data fetch.
     */
    afterInitialDataFetch: function() {
        this.prgDataViewCustom_mainPanel.refresh();
    },
    
    /**
     * Gets data records from the data source and refreshes the DataView control.
     */
    refresh: function(restriction) {
        this.records = this.prgDataViewCustom_mainDataSource.getRecords(restriction);
        this.onModelUpdate();
    },
    
    /**
     * Refreshes the DataView control.
     */
    onModelUpdate: function() {
        // let DataView control display records
        this.recentItemsList.setRecords(this.records.slice(0, this.recordsToDisplay));

        var controller = this;
        
        // set status colors
        var cells = Ext.get('recentItems').select('td.status');
        cells.each(function (cell, scope, index) {
            var record = controller.records[index];
            
            // map status to color
            var status = record.getValue('activity_log.status');
            var color = '#707070';
            switch (status) {
                case 'APPROVED': color = '#32cd32'; break;  
                case 'COMPLETED': color = '#4040f0'; break;  
                case 'REJECTED': color = '#f04040'; break;  
            };
            
            cell.setStyle('color', color);
        });

        // add event listeners to row links
        Ext.get('recentItems').select('td a.view').each(function (link, scope, index) {
            link.addListener('click', controller.onView.createDelegate(controller, [index]));
        });
        Ext.get('recentItems').select('td a.edit').each(function (link, scope, index) {
            link.addListener('click', controller.onEdit.createDelegate(controller, [index]));
        });
        Ext.get('recentItems').select('td a.withdraw').each(function (link, scope, index) {
            link.addListener('click', controller.onWithdraw.createDelegate(controller, [index]));
        });
        
        Ext.get('refresh').addListener('click', this.afterInitialDataFetch, this);
        Ext.get('viewAll').addListener('click', this.onCheckProblemStatus, this);

        this.prgDataViewCustom_mainPanel.actions.get('checkProblemStatus').forceHidden(!this.hasRecentItems());
    },
    
    /**
     * Returns true if there are records returns by the data source.
     */
    hasRecentItems: function() {
        return (this.records.length > 0);
    },
    
    /**
     * Event handler for the View Details link.
     * Opens work request read-only report in a dialog window.
     */
    onView: function(index) {
        var record = this.records[index];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', record.getValue('activity_log.activity_log_id'));
        View.openDialog('ab-ex-helpdesk-manager-view.axvw', restriction, false, {width:600, height:400});
    },
    
    /**
     * Event handler for the Edit Details link.
     * Opens work request edit form in a dialog window.
     */
    onEdit: function(index) {
        var record = this.records[index];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', record.getValue('activity_log.activity_log_id'));
        View.openDialog('ab-ex-helpdesk-manager-edit.axvw', restriction, false, {width:600, height:500, closeButton:false});
    },
    
    /**
     * Event handler for the Withdraw link.
     */
    onWithdraw: function(index) {
        var controller = this;

        var record = this.records[index];
        var actionId = record.getValue('activity_log.activity_log_id');
        var description = record.getValue('activity_log.description');

        var message = String.format(getMessage('confirmWithdraw'), actionId, description);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    controller.withdraw(record);
                    controller.refresh();
                } catch (e) {
                    var message = String.format(getMessage('errorWithdraw'), actionId);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },
    
    /**
     * Event handler for the Report New Problem button.
     */
    onReportNewProblem: function() {
        View.openDialog('ab-ex-helpdesk-request.axvw', null, false, {closeButton:false});
        View.dialog.maximize();
    },

    /**
     * Event handler for the Check Problem Status button.
     */
    onCheckProblemStatus: function() {
        View.openDialog('ab-ex-helpdesk-requestor.axvw');
        View.dialog.maximize();
    },
    
    /**
     * Withdraws problem report.
     */
    withdraw: function(record) {
        record.isNew = false;
        record.setValue('activity_log.status', 'CANCELLED');
        this.prgDataViewCustom_mainDataSource.saveRecord(record);  
    }
});
