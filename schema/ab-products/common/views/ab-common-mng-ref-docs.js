var abMngReferenceDocCtrl = View.createController('abMngReferenceDocCtrl', {
    propertyTypes: [],
    buildingUses: [],
    
    afterViewLoad: function () {
        // bind custom listener of doc button to refresh documents grid when any doc change happens
        this.abMngReferenceDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN, refreshDocumentsTab, this);
        this.abMngReferenceDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_CHECKIN_NEW_VERSION, refreshDocumentsTab, this);
        this.abMngReferenceDocForm.addFieldEventListener('docs_assigned.doc', Ab.form.Form.DOC_EVENT_DELETE, refreshDocumentsTab, this);
    },

    afterInitialDataFetch: function () {
        var propTypeHtml = "";
        var propTypeDef = this.abCommonDocGrid.getFieldDef("docs_assigned.property_type");
        for (var key in propTypeDef.enumValues) {
            var value = propTypeDef.enumValues[key];
            propTypeHtml += "<li class='link'><a href='javascript: //'>" + value + "</a></li>";
            this.propertyTypes.push(key);
        }
        $('propertyType').innerHTML = "<ul>" + propTypeHtml + "</ul>";
        var nodes = $('propertyType').childNodes[0].childNodes;
        for (var i = 0; i < nodes.length; i++) {
            Ext.get(nodes[i]).addListener("click", this.selectPropertyType.createDelegate(this, [i]));
        }
        var blUseHtml = "";
        var blUseDef = this.abCommonDocGrid.getFieldDef("docs_assigned.bl_use1");
        for (var key in blUseDef.enumValues) {
            var value = blUseDef.enumValues[key];
            blUseHtml += "<li class='link'><a href='javascript: //'>" + value + "</a></li>";
            this.buildingUses.push(key);
        }
        $('buildingUse').innerHTML = "<ul>" + blUseHtml + "</ul>";
        var nodes = $('buildingUse').childNodes[0].childNodes;
        for (var i = 0; i < nodes.length; i++) {
            Ext.get(nodes[i]).addListener("click", this.selectBuildingUse.createDelegate(this, [i]));
        }
        this.mainTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
    },

    selectPropertyType: function (rowIndex) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("docs_assigned.property_type", this.propertyTypes[rowIndex]);
        this.abCommonDocGrid.refresh(restriction);
        this.abMngReferenceDocForm.show(false);
    },

    selectBuildingUse: function (rowIndex) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("docs_assigned.bl_use1", this.buildingUses[rowIndex]);
        this.abCommonDocGrid.refresh(restriction);
        this.abMngReferenceDocForm.show(false);
    },

    abCommonDocGrid_afterRefresh: function () {
        var layout = View.getLayoutManager('documentLayout');
        if (layout.isRegionCollapsed('north')) {
            layout.expandRegion('north');
        }
    },

    abMngReferenceDocForm_afterRefresh: function (docForm) {
        if (docForm.newRecord) {
            if (docForm.getFieldValue("docs_assigned.pmp_id") != '') {
                docForm.setFieldValue("docs_assigned.prob_type", "PREVENTIVE MAINT");
                docForm.setFieldValue("docs_assigned.activity_type", "SERVICE DESK - MAINTENANCE");
                docForm.setFieldValue("docs_assigned.activity_id", "AbBldgOpsOnDemandWork");
            } else if (docForm.getFieldValue("docs_assigned.prob_type") != '') {
                docForm.setFieldValue("docs_assigned.activity_type", "SERVICE DESK - MAINTENANCE");
                docForm.setFieldValue("docs_assigned.activity_id", "AbBldgOpsOnDemandWork");
            } else if (docForm.getFieldValue("docs_assigned.project_type") != '') {
                docForm.setFieldValue("docs_assigned.activity_id", "AbProjectManagement");
            }
        }
        // KB3049787 - The "Save add Add New" button should be hidden on the documents edit form on the Documents tab
        var isDocumentTab = ('document' === this.mainTabs.getSelectedTabName());
        docForm.actions.get('saveAddNew').show(!isDocumentTab);
        // KB3049786 - The "Copy as New" button should be hidden on the documents edit form on the Documents tab
        docForm.actions.get('copyAsNew').show(!isDocumentTab);
        // KB3049786 - The "Copy as New" should be disabled if there is no document file, in the doc field, associated with the Document record.
        docForm.actions.get('copyAsNew').enabled = !(docForm.newRecord || !valueExistsNotEmpty(docForm.getFieldValue("docs_assigned.doc")));
        // KB3049787 & 3049940 - Show only doc form and expand
        var isUrlTab = ('url' === this.mainTabs.getSelectedTabName());
        if (isDocumentTab || isUrlTab) {
            // expand doc form
            var layout = View.getLayoutManager('documentLayout');
            layout.collapseRegion('north');
        }
    },

    abMngReferenceDocForm_onSaveAddNew: function () {
        var saved = this.abMngReferenceDocForm.save();
        if (saved) {
        	this.abMngReferenceDocForm.newRecord = true;
        	this.abMngReferenceDocForm.restriction=null;
        	
        	this.abMngReferenceDocForm.refresh(this.abCommonDocGrid.restriction);
        	if ('document' !== this.mainTabs.getSelectedTabName() && 'url' !== this.mainTabs.getSelectedTabName()){
        		this.abCommonDocGrid.refresh();
        	}
            refreshDocumentsTab();
        }
    },

    abMngReferenceDocForm_onCopyAsNew: function () {
    	var docFieldValue = this.abMngReferenceDocForm.getFieldValue("docs_assigned.doc");
        if(valueExistsNotEmpty(docFieldValue)) {
	        var initialDocId = this.abMngReferenceDocForm.getFieldValue("docs_assigned.doc_id");
	        this.abMngReferenceDocForm.setFieldValue("docs_assigned.doc_id", "");
	        this.abMngReferenceDocForm.setFieldValue("docs_assigned.name", this.abMngReferenceDocForm.getFieldValue("docs_assigned.name") + " (" + getMessage("copyMsg") + ")");
	        this.abMngReferenceDocForm.newRecord = true;
	        this.abMngReferenceDocForm.save();
	        var finalDocId = this.abMngReferenceDocForm.getFieldValue("docs_assigned.doc_id");
        
        	try {
                Workflow.callMethod('AbAssetEAM-ProjectRequirementsService-copyDocuments', initialDocId, finalDocId);
            } catch (e) {
                Workflow.handleError(e);
            }
            
            this.abCommonDocGrid.refresh();
            refreshDocumentsTab();
            
        } else {
        	View.showMessage(getMessage('docNotFound'));
        }
    },
    
    abMngReferenceDocForm_onDelete: function(){
    	var record = this.abMngReferenceDocForm.getRecord();
    	this.abCommonDocGridDs.deleteRecord(record);
    	this.abMngReferenceDocForm.show(false);
    	this.abCommonDocGrid.refresh(this.abCommonDocGrid.restriction);
    	refreshDocumentsTab();
    },
    
    abCommonDocGrid_afterRefresh: function(){
    	isDocumentOrUrlTab = 'document' === this.mainTabs.getSelectedTabName() || 'url' === this.mainTabs.getSelectedTabName();
    	addNewButton = this.abCommonDocGrid.actions.get('addNew');
    	if(addNewButton){
    		addNewButton.show(!isDocumentOrUrlTab);
    	}
    },

    afterTabChange: function () {
    	if ('document' !== this.mainTabs.getSelectedTabName() && 'url' !== this.mainTabs.getSelectedTabName()) {
            // expand doc list region
            var layout = View.getLayoutManager('documentLayout');
            layout.expandRegion('north');
        }
        this.abCommonDocGrid.show(false);
        this.abMngReferenceDocForm.show(false);
    }
});

function refreshDocumentsTab() {
    View.controllers.get('abMngReferenceDocCtrl').mainTabs.refreshTab('document');
    View.controllers.get('abMngReferenceDocCtrl').mainTabs.refreshTab('url');
}

