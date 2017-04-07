/**
 * creates asset(s) based on user selection (single, multiple)
 * @param type
 */
function createAsset(type) {
    View.openDialog("ab-eam-receipt-parameters.axvw", null, false, {
        width: 1024,
        height: 800,
        closeButton: false,
        afterInitialDataFetch: function (dialogView) {
            var dialogController = dialogView.controllers.get('abEamReceiptParamCtrl');
            dialogController.loadParameters(type);
        },
        callback: function (viewName, restriction, newRecord, eamReceiptParameters) {
            View.closeDialog();
            this.eamReceiptParameters = eamReceiptParameters;
            if ("single" === eamReceiptParameters.createMode) {
                _.extend(eamReceiptParameters, {
                    onClickActionEventHandler: function (form) {
                        var assetType = this.view.parameters.eamReceiptParameters.assetType;
                        var isEqAsset = ("eq" === assetType);
                        var formSaved = isEqAsset;
                        var afterSaveFunction = function(formSaved){
                        	if (formSaved) {
                                var pkFieldName = form.getPrimaryKeyFields()[0];
                                var lastId = form.getPrimaryKeyFieldValues()[pkFieldName];
                                    form.refresh({}, true);// new record
                                var nextId = getNextId(assetType, lastId);
                                form.setFieldValue(pkFieldName, nextId);
                            }
                        };
                        
                        if(assetType ==="eq"){
                    		if (typeof(this.abEqEditForm_General_onSave) =='function'){
                        		this.abEqEditForm_General_onSave(function(formSaved){
                        			afterSaveFunction(formSaved);
                        		});
                        	}
                    	}else if(assetType ==="ta"){
                        		if (typeof(this.abTaEditForm_General_onSave) =='function'){
                            		this.abTaEditForm_General_onSave(function(formSaved){
                            			afterSaveFunction(formSaved);
                            		});
                            	}
                        }else if(assetType ==="property"){
                        		if (typeof(this.abPropertiesDefineForm_general_onSave) =='function'){
                            		this.abPropertiesDefineForm_general_onSave(function(formSaved){
                            			afterSaveFunction(formSaved);
                            		});
                            	}
                        }else{
                        		formSaved = form.save();
                        		afterSaveFunction(formSaved);
                        	}
                    }
                });
            } else {
                _.extend(eamReceiptParameters, {
                    onClickActionEventHandler: function (form) {
                        var isEqAsset = ("eq" === this.view.parameters.eamReceiptParameters.assetType);
                        var formSaved = isEqAsset;
                        if (!isEqAsset) {
                            formSaved = form.save();
                        }
                        if (formSaved) {
                            var pkFieldName = form.getPrimaryKeyFields()[0];
                            var index = this.view.parameters.eamReceiptParameters.selectedRecordIndex;
                            index++;
                            var selectedRecords = this.view.parameters.eamReceiptParameters.selectedRecords;
                            var restriction = new Ab.view.Restriction();
                            var assetId = selectedRecords[index].getValue('bl.asset_id');
                            restriction.addClause(pkFieldName, assetId, '=');
                            
                            form.refresh(restriction);
                            
                            this.view.parameters.eamReceiptParameters.selectedRecordIndex = index;
                            if (index == selectedRecords.length - 1) {
                                form.actions.get('customActionCommand').show(false);
                            }
                        }

                    }
                });
            }

            var dialogConfig = {
                eamReceiptParameters: eamReceiptParameters
            };
            if ("single" === eamReceiptParameters.createMode) {
                _.extend(dialogConfig, {
                    width: 1024,
                    height: 800
                });
                if ("bl" === eamReceiptParameters.assetType) {
                    _.extend(dialogConfig, {
                        type: eamReceiptParameters.assetType,
                        hideTabs: true
                    });
                }
            }
            View.openDialog(viewName, restriction, newRecord, dialogConfig);
        }
    });
}
