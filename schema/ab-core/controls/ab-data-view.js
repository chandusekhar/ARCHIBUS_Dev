
/**
 * Describes a single level in the DataView. 
 */
Ab.view.DataViewLevel = Base.extend({

    // id of the DataSource
    dataSourceId: '',
    
    // HTML template DOM element ids
    bodyTemplate: 'bodyTemplate',
    
    // Ext.XTemplate objects that generates the content
    bodyXTemplate: null,
    
    // optional callbacks that prepares the data for template evaluation
    getData: null,
    
    getNextLevelRestriction: null,
    
    // reference to the next (child) level
    nextLevel: null,
    
    // parent Ab.view.DataView control
    dataView: null,
    
    /**
     * Constructor.
     * @param {Object} config
     */
    constructor: function(config) {
        Ext.apply(this, config);
        
        this.bodyXTemplate = Ab.view.DataView.getTemplate(this.bodyTemplate);
    },
    
    /**
     * Returns DataSource instance. 
     */
    getDataSource: function() {
        return View.dataSources.get(this.dataSourceId);
    },

    /**
     * Refreshes the DataView from DataSource specified in the configuration.
     * @param {Object} restriction
     */
    refresh: function(restriction) {
        var ds = this.getDataSource();
        if (ds) {
            var records = ds.getRecords(restriction);
            this.setRecords(records);
        }
    },

    /**
     * Displays a list of records in the data view.
     * @param {Object} record
     */
    setRecords: function(records) {
        for (var i = 0; i < records.length; i++) {
            // render this level record
            this.dataView.renderRecord(
                records[i], this.getDataSource(), this.getData, this.bodyXTemplate);
        
            if (this.nextLevel) {
                // render next level records restricted by this record
                var restrictionForNextLevel = null;
                if (valueExists(this.getNextLevelRestriction)) {
                    restrictionForNextLevel = this.getNextLevelRestriction(records[i]);
                } else {
                    restrictionForNextLevel = records[i].toRestriction();
                }
                this.nextLevel.refresh(restrictionForNextLevel);
            }
        }
    }
});

/**
 * DataView is a control that can build a custom report from data records
 * using specified HTML templates to format the header (optional), records, and the footer (optional).
 */
Ab.view.DataView = Base.extend({
    
    // Ext.Panel that displays the control
    panel: null,
    
    // Ext.Panel that displays the content
    body: null,
    
    // id of the parent HTML panel
    id: '',
    
    // id of the DataSource
    dataSourceId: '',
    
    // array of Ab.view.DataViewLevel objects
    levels: null,
    
	// buffer where we build the HTML content
	buffer: null,
    
    // parent AXVW panel
    parentPanel: null,
    
    // expression evaluation context
    evaluationContext: null,
    
    // HTML template DOM element ids
    headerTemplate: 'headerTemplate',
    footerTemplate: 'footerTemplate',
    
    // Ext.XTemplate objects that generates the content
    headerXTemplate: null,
    footerXTemplate: null,
    
    // optional callbacks that prepares the data for template evaluation
    getHeaderData: null,
    getFooterData: null,
    
    /**
     * Constructor.
     * @param {parentPanelId} id of the parent HTML panel in AXVW.
     * @param {config} Configuration object.
     */
    constructor: function(id, config) {
        this.id = id;
        Ext.apply(this, config);
        
        this.levels = [];
        if (valueExists(config.levels) && config.levels.length > 0) {
            // create levels
            for (var i = 0; i < config.levels.length; i++) {
                var level = new Ab.view.DataViewLevel(config.levels[i]);
                level.dataView = this;
                this.levels.push(level);
            }
            // set nextLevel references for all but the last level
            for (var i = 0; i < this.levels.length - 1; i++) {
                var level = this.levels[i];
                var nextLevel = this.levels[i + 1];
                level.nextLevel = nextLevel;
            }
        } else {
            // if levels are not specified in config, create default single level
            var level = new Ab.view.DataViewLevel(config);
            level.dataView = this;
            this.levels.push(level);
        }

        if (valueExistsNotEmpty(this.headerTemplate)) {
            this.headerXTemplate = Ab.view.DataView.getTemplate(this.headerTemplate);
        }

        if (valueExistsNotEmpty(this.footerTemplate)) {
            this.footerXTemplate = Ab.view.DataView.getTemplate(this.footerTemplate);
        }
       
        this.body = new Ext.Panel({
            border: false
        });
        this.panel = new Ext.Panel({
            border: false,
            renderTo: this.id,
            autoHeight: true,
            autoWidth: true,
            autoScroll: true,
            items: [this.body]
        });

        this.parentPanel = View.panels.get(this.id);
        if (this.parentPanel && this.parentPanel.setContentPanel) {
            this.parentPanel.setContentPanel(this.panel);
        }
    },
    
    /**
     * Returns content HTML buffer.
     */
    getContentBuffer: function() {
        return this.buffer;
    },
    
    /**
     * Refreshes the DataView from DataSource specified in the configuration
     * @param {Object} restriction
     */
    refresh: function(restriction) {
        this.renderBegin();
        this.levels[0].refresh(restriction);
        this.renderEnd();
    },
    
    /**
     * Displays a list of records in the data view.
     * @param {Object} record
     */
    setRecords: function(records) {
        this.renderBegin();
        this.levels[0].setRecords(records);
        this.renderEnd();
    },
    
    // ----------------------- implementation -----------------------------------------------------
    
    /**
     * Clears the buffer, prepares the rendering context and renders the header. 
     */
    renderBegin: function() {
        this.evaluationContext = {};
        if (this.parentPanel) {
            this.evaluationContext = this.parentPanel.createEvaluationContext();
        }
        
        this.buffer = '<table cellspacing="0" class="dataView">';
		
        if (this.headerTemplate) {

            // if custom callback is provided, call it
            var data = {};            
            if (this.getHeaderData) {
                data = this.getHeaderData();
            }
            
            // evaluate Ext.XTemplate {} expressions 
            var html = this.headerXTemplate.apply(data);
			
            // evaluate WebCentral ${} expressions
            html = View.evaluateString(html, this.evaluationContext);
        
            this.buffer = this.buffer + html;
		}
    },
    
    renderRecord: function(record, dataSource, getData, bodyXTemplate) {
        // add record values to the evaluation context
        var recordValues = record.values;
        if (dataSource) {
            // if DataSource is available, format record values
            recordValues = dataSource.formatValues(recordValues, true);
        }
        this.evaluationContext.record = recordValues;
        
        // if custom callback is provided, call it
        var data = record;
        if (getData) {
            data = getData(data);
        }
        
        // evaluate Ext.XTemplate {} expressions 
        var html = bodyXTemplate.apply(data);
        
        // evaluate WebCentral ${} expressions
        html = View.evaluateString(html, this.evaluationContext);
        
        this.buffer = this.buffer + html;
    },
    
    /**
     * Renders the footer and finalizes the rendering process.
     */
    renderEnd: function() {
        if (this.footerTemplate) {

            // if custom callback is provided, call it
            var data = {};            
            if (this.getFooterData) {
                data = this.getFooterData();
            }
            
            // evaluate Ext.XTemplate {} expressions 
            var html = this.footerXTemplate.apply(data);
            
            // evaluate WebCentral ${} expressions
            html = View.evaluateString(html, this.evaluationContext);
        
            this.buffer = this.buffer + html;
        }

		this.buffer = this.buffer + '</table>';
		this.body.body.dom.innerHTML = '';
		Ext.DomHelper.append(this.body.body, this.buffer);
    },
    
    renderClear: function() {
        this.body.body.dom.innerHTML = '';
    }
}, {
    
    /**
     * Creates XTemplate from specified template element and removes the element from DOM.
     * @param {Object} id
     * @return Ext.XTemplate
     */ 
    getTemplate: function(id) {
        var html = '';
        var templateEl = Ext.get(id);
        if (templateEl) {
            var templateTableEl = templateEl.child('table');
            if (templateTableEl) {
                html = templateTableEl.dom.innerHTML;
            }
            else {
                html = templateEl.dom.innerHTML;
            }
            templateEl.remove();
        }
        return new Ext.XTemplate(html);
    }
});


/**
 * Standard panel that manages DataView control.
 */
Ab.view.DataViewPanel = Ab.view.Component.extend({
    
    // Ab.view.DataView
    dataView: null,
    
    /**
     * Constructor.
     * @param {Object} id
     * @param {Object} config
     */
    constructor: function(id, config) {
        this.inherit(id, 'dataView', config);
        
        this.showOnLoad = config.getConfigParameter('showOnLoad', false);

        this.dataView = new Ab.view.DataView(id, config);
    },
    
    /**
     * Performs initial data fetch from the server to display the panel after the view is loaded. 
     */
    initialDataFetch: function() {
        if (this.showOnLoad || this.restriction != null) {
            this.refresh();
            this.show(true);
        }
    },
    
    /**
     * Refreshes the panel.
     */
    doRefresh: function() {
        this.dataView.refresh(this.restriction);
    },
    
    /**
     * Clears the panel content.
     */
    clear: function() {
        this.dataView.renderClear();
    }
});
