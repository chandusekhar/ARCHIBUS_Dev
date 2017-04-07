/**
 * @author AD
 * @date March 11, 2016
 */
var abManageNumericIDController = View.createController('abManageNumericIDController', {

    afterViewLoad: function(){
        
        // Set translatable checkbox titles in console
        var displayFormat = document.getElementsByName('abNumericIdManage_consolePanel_displayFormat');
        displayFormat[0].nextSibling.innerHTML = displayFormat[0].nextSibling.innerHTML.replace("[0]", getMessage('displayFormatIdFormat'));
        displayFormat[1].nextSibling.innerHTML = displayFormat[1].nextSibling.innerHTML.replace("[0]", getMessage('displayFormatLookupFormat'));

        var orderBy = document.getElementsByName('abNumericIdManage_consolePanel_orderBy');
        orderBy[0].nextSibling.innerHTML = orderBy[0].nextSibling.innerHTML.replace("[0]", getMessage('orderByIdFirst'));
        orderBy[1].nextSibling.innerHTML = orderBy[1].nextSibling.innerHTML.replace("[0]", getMessage('orderByLookupFirst'));

        var displayType = document.getElementsByName('abNumericIdManage_consolePanel_displayType');
        displayType[0].nextSibling.innerHTML = displayType[0].nextSibling.innerHTML.replace("[0]", getMessage('displayTypeId'));
        displayType[1].nextSibling.innerHTML = displayType[1].nextSibling.innerHTML.replace("[0]", getMessage('displayTypeLookup'));
        displayType[2].nextSibling.innerHTML = displayType[2].nextSibling.innerHTML.replace("[0]", getMessage('displayTypeBoth'));
        displayType[3].nextSibling.innerHTML = displayType[3].nextSibling.innerHTML.replace("[0]", getMessage('displayTypeConcat'));
        displayType[4].nextSibling.innerHTML = displayType[4].nextSibling.innerHTML.replace("[0]", getMessage('displayTypeTranslate'));
        
        // Set Enable/Disable ID lookup action title
        var enableIdLookup = View.activityParameters["AbSystemAdministration-EnableIdLookup"];
        if (valueExistsNotEmpty(enableIdLookup) && enableIdLookup=='1') {
            this.abNumericIdManage_consolePanel.actions.get('toggleNumId').setTitle(getMessage('disableNumericIDs'));
        }
        
        // Set translatable strings in form
        var fieldAttributesFormat = document.getElementById('fieldAttributesFormat');
        fieldAttributesFormat.innerHTML = getMessage('fieldAttributesFormat');
        var placeHolders = document.getElementById('placeHolders');
        placeHolders.innerHTML = getMessage('placeHolders');        
        
    },

    afterInitialDataFetch: function(){
        
        var fieldAttributes = document.getElementsByName('abNumericIdManage_consolePanel_fieldAttributes');
        fieldAttributes[0].checked = true;                
        this.abNumericIdManage_consolePanel_onShow();
    },

    /**
     * filter console show button click.
     */
    abNumericIdManage_consolePanel_onShow: function(){
        var inputRestriction = this.abNumericIdManage_consolePanel.getFieldRestriction();

        this.abNumericIdManage_gridPanel.addParameter('translatablePK', "1=1");
        
        var fieldAttributes = this.abNumericIdManage_consolePanel.getCheckboxValues('fieldAttributes');
        if (fieldAttributes.indexOf('lookupAttr') != -1) {
             inputRestriction.addClause('afm_flds.attributes', '%lookup%', 'LIKE');
        }
        if (fieldAttributes.indexOf('primaryKeyAttr') != -1) {
             inputRestriction.addClause('afm_flds.primary_key', '0', '>');
        }
        if (fieldAttributes.indexOf('translatablePKAttr') != -1) {
             var translatablePK = "REPLACE((SELECT preferences FROM afm_scmpref),' ','') \
                                   LIKE '%table=\"'+RTRIM(afm_flds.table_name)+'\"field=\"'+RTRIM(afm_flds.field_name)+'\"%' \
                                   AND afm_flds.primary_key>0";
             this.abNumericIdManage_gridPanel.addParameter('translatablePK', translatablePK);
        }                       

        var displayFormat = this.abNumericIdManage_consolePanel.getCheckboxValues('displayFormat');
        if (displayFormat.indexOf('idFormat') != -1) {
             inputRestriction.addClause('afm_flds.attributes', '%displayFormat%[{]0}%', 'LIKE');
        }
        if (displayFormat.indexOf('lookupFormat') != -1) {
             inputRestriction.addClause('afm_flds.attributes', '%displayFormat%[{]1}%', 'LIKE');
        }

        var displayType = this.abNumericIdManage_consolePanel.getCheckboxValues('displayType');
        var relop = ')AND(';
        for (var i=0; i<displayType.length; i++) {
             inputRestriction.addClause('afm_flds.attributes', '%displayType=\"' + displayType[i] + '\"%', 'LIKE', relop); 
             relop = 'OR';             
        }

        var orderBy = this.abNumericIdManage_consolePanel.getCheckboxValues('orderBy');
        var relop = ')AND(';
        for (var i=0; i<orderBy.length; i++) {
             inputRestriction.addClause('afm_flds.attributes', '%orderBy=\"' + orderBy[i] + '\"%', 'LIKE', relop); 
             relop = 'OR';             
        }
        
        this.abNumericIdManage_gridPanel.refresh(inputRestriction);        
    }, 
    
    /**
     * Toggle Numeric ID activity parameter, create it if doesn't exist.
     */
    abNumericIdManage_consolePanel_onToggleNumId: function(){
        var enableIdLookup = View.activityParameters["AbSystemAdministration-EnableIdLookup"];
		var record;
        if (enableIdLookup == undefined) {
            record = new Ab.data.Record({
                    'afm_activity_params.activity_id': 'AbSystemAdministration',
                    'afm_activity_params.param_id': 'EnableIdLookup',
                    'afm_activity_params.param_value': '1',
                    'afm_activity_params.description': getMessage('activityParameterDesc')
                }, true);
        }
        else {  //get activity parameter by id            
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_activity_params.activity_id", "AbSystemAdministration", "=");
            restriction.addClause("afm_activity_params.param_id", 'EnableIdLookup', "=");
            record = this.afm_activity_params_ds.getRecord(restriction);
            enableIdLookup = record.getValue( 'afm_activity_params.param_value');
			record.setValue( 'afm_activity_params.param_value', '1') ;                 
        }
        
        var toggleNumIdAction = this.abNumericIdManage_consolePanel.actions.get('toggleNumId');
        toggleNumIdAction.setTitle(getMessage('disableNumericIDs'));
        
        if (valueExistsNotEmpty(enableIdLookup) && enableIdLookup=='1') {
			record.setValue( 'afm_activity_params.param_value', '0') ;                 
            toggleNumIdAction.setTitle(getMessage('enableNumericIDs'));
        }
        
        try {
            this.afm_activity_params_ds.saveRecord(record); 
            // reloads activity parameters on the server so that the new setting is used immediately
            Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
            View.showMessage(getMessage('activityParametersReloaded'));
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    /**
     * Enable Translated Primary Keys.  
     * Clear lookups for default standard tables.
     * Add lookups to Translated Primary Keys.
     */
    abNumericIdManage_consolePanel_onEnableTranslatedPK: function(){
        this.abNumericIdManage_consolePanel.clear();
        var fieldAttributes = document.getElementsByName('abNumericIdManage_consolePanel_fieldAttributes');
        fieldAttributes[2].checked = true;
        this.abNumericIdManage_gridPanel.update();
        this.abNumericIdManage_consolePanel_onShow();
        
        View.confirm(getMessage('enableTranslatedPK1'), function(button){
            if (button == 'yes') { 
                setTranslatablePKattributes();

                abManageNumericIDController.abNumericIdManage_gridPanel.addParameter('translatablePK', "1=1");
                abManageNumericIDController.abNumericIdManage_gridPanel.refresh("afm_flds.table_name in \
                          ('ac','bl','bu','city','cost_cat','cost_class','county','ctry','dp','dv','emstd','geo_region', \
                           'org','property','regn','rmcat','rmstd','rmtype','site','state') \
                           AND afm_flds.attributes LIKE '%lookup%'");
                if (abManageNumericIDController.abNumericIdManage_gridPanel.gridRows.length==0) {
                    finishEnableTranslatedPK();
                    return;
                }          
                View.confirm(getMessage('enableTranslatedPK2'), function(button){
                    if (button == 'yes') {
                        clearLookupAttributes();
                        finishEnableTranslatedPK();
                    }
                });                                          
            }
        });
    },
    
    /**
     * Add default lookup attribute for all grid records.  
     */
    abNumericIdManage_gridPanel_onInsertLookupAttr: function(){
        View.confirm(getMessage('enableTranslatedPK1'), function(button){
            if (button == 'yes') { 
                setLookupAttributes();
                abManageNumericIDController.abNumericIdManage_gridPanel.refresh();                           
            }
        });
    },

    /**
     * Clear lookup attribute for all grid records.  
     */
    abNumericIdManage_gridPanel_onClearLookupAttr: function(){
        View.confirm(getMessage('enableTranslatedPK2'), function(button){
            if (button == 'yes') { 
                clearLookupAttributes();
                abManageNumericIDController.abNumericIdManage_gridPanel.refresh();                           
            }
        });
    }    
    
});    

/**
 * Finish Enabling Translated Primary Keys action by enabling Numeric ID,
 * show success message, and refresh grid. 
 */
function finishEnableTranslatedPK() {
    var enableIdLookup = View.activityParameters["AbSystemAdministration-EnableIdLookup"];
    if (enableIdLookup != 1) {
        abManageNumericIDController.abNumericIdManage_consolePanel_onToggleNumId();
    }
    View.showMessage(getMessage('enableTranslatedPK3'));
    abManageNumericIDController.abNumericIdManage_consolePanel_onShow();
}

/*
 * Fill default lookup entry in afm_flds.attributes
 */
function setLookupAttributes() {
    abManageNumericIDController.abNumericIdManage_gridPanel.gridRows.each(function(row) {
        if (!valueExistsNotEmpty(row.record['afm_flds.attributes'])) {
            var record = row.getRecord();
            record.setValue("afm_flds.attributes", "<root> <lookup/> </root>");
            abManageNumericIDController.abNumericIdManage_ds_0.saveRecord(record); 
        }
    });
}

/*
 * Fill lookup entry in afm_flds.attributes for translatable PK fields in grid
 */
function setTranslatablePKattributes() {
    abManageNumericIDController.abNumericIdManage_gridPanel.gridRows.each(function(row) {
        if (!valueExistsNotEmpty(row.record['afm_flds.attributes'])) {
            var record = row.getRecord();
            record.setValue("afm_flds.attributes", "<root> <lookup displayType=\"translate\"/> </root>");
            abManageNumericIDController.abNumericIdManage_ds_0.saveRecord(record); 
        }
    });
}

/*
 * Clear afm_flds.attributes for all grid fields
 */
function clearLookupAttributes() {
    abManageNumericIDController.abNumericIdManage_gridPanel.gridRows.each(function(row) {
        if (valueExistsNotEmpty(row.record['afm_flds.attributes'])) {
            var record = row.getRecord();
            if (record.getValue('afm_flds.attributes').indexOf('lookup') != -1) {
              record.setValue("afm_flds.attributes", "");
              abManageNumericIDController.abNumericIdManage_ds_0.saveRecord(record); 
            }
        }
    }); 
}
      
