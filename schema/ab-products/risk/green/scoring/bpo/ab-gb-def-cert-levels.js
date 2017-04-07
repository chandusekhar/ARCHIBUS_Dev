var abGbDefCertLevelsController = View.createController('abGbDefCertLevelsController',
{
					//Current Selected Node 
					curTreeNode : null,
					certStd : '',
					parentNode : '',
					selectedLevel:'',	
					

					// Control add new button status after refreshed
					afterInitialDataFetch : function() {
						this.abGbDefCertLevTreePanel.actions.get('addNew')
								.forceDisable(true);
						this.abGbDefCertLevDetailsPanel.setMinValue('gb_cert_levels.min_score',0);
						this.abGbDefCertLevDetailsPanel.setMinValue('gb_cert_levels.max_score',0);
					},

					//Process delete action
					abGbDefCertLevDetailsPanel_onDelete: function(){
						//If new record, do nothing
						if(this.abGbDefCertLevDetailsPanel.newRecord){
							return;
						}
						//Else retrieve pk value and pop confirm window 
						var certLevelDS = this.abGbDefCertLevDetailsDS;
						var record = this.abGbDefCertLevDetailsPanel.getRecord();
						var certStdPK = record.getValue('gb_cert_levels.cert_std');
						var certLevelPK = record.getValue('gb_cert_levels.cert_level');
						var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', certStdPK).replace('{1}', certLevelPK);
						//fix KB#3030770:The Tree level 2 will pull back automatically after delete any Certification Level
						var controller = this;
						View.confirm(confirmMessage, function(button){
							if (button == 'yes') {
								try {
									//confirm to delete: delete record and refresh panels
									certLevelDS.deleteRecord(record);
									abGbDefCertLevelsController.abGbDefCertLevDetailsPanel.show(false);
									//fix KB#3030770:The Tree level 2 will pull back automatically after delete any Certification Level
									//abGbDefCertLevelsController.abGbDefCertLevTreePanel.refresh();
								} 
								catch (e) {
									var errMessage = getMessage("errorDelete");
									View.showMessage('error', errMessage, e.message, e.data);
									return;
								}
								//fix KB#3030770:The Tree level 2 will pull back automatically after delete any Certification Level
								controller.refreshTree();
							}
						})
				},

					// set the edit panel's "gb_cert_levels.cert_std" field
					// values be the same with lastNodeClicked
					abGbDefCertLevTreePanel_onAddNew : function() {
						this.abGbDefCertLevDetailsPanel.clear();
						
						this.abGbDefCertLevDetailsPanel.newRecord = true;
				     	this.abGbDefCertLevDetailsPanel.show(true);
				     	this.abGbDefCertLevDetailsPanel.refresh();
						this.abGbDefCertLevDetailsPanel.setFieldValue("gb_cert_levels.cert_std", this.certStd);
					},
					/**
					 * Update or save property record
					 */
                    abGbDefCertLevDetailsPanel_onSave: function(){
                       if (this.abGbDefCertLevDetailsPanel.canSave()) {
                            if (this.validateScore()) {
                                this.abGbDefCertLevDetailsPanel.save();
                                this.refreshTree();
								this.selectedLevel = this.abGbDefCertLevDetailsPanel.getFieldValue("gb_cert_levels.cert_level");
                            }
                        }
                    },
					/**
					 * Refresh Tree after save and delete property record.
					 */
					 refreshTree:function(){
				    	if (this.curTreeNode) {
				    		if (this.curTreeNode.parent=="RootNode") {
				    			var currentNode=this.curTreeNode;
				    			this.abGbDefCertLevTreePanel.refreshNode(currentNode);
				    			currentNode.expand();
				    		}else {
				    			if(this.curTreeNode.parent){
				    				this.parentNode=this.curTreeNode.parent;
				    			}
				    			this.abGbDefCertLevTreePanel.refreshNode(this.parentNode);
				    			this.parentNode.expand();
				    		}
				    	}
				    },
					
                    abGbDefCertLevDetailsPanel_afterRefresh: function(){
                        this.selectedLevel = this.abGbDefCertLevDetailsPanel.getFieldValue("gb_cert_levels.cert_level");
                    },
					
				    /**
					 * Validate Minimum Score and Maximum Score
					 */
				    validateScore:function(){
						var minScore=parseInt(this.abGbDefCertLevDetailsPanel.getFieldValue("gb_cert_levels.min_score"),10);
						var maxScore=parseInt(this.abGbDefCertLevDetailsPanel.getFieldValue("gb_cert_levels.max_score"),10);
							if (minScore > maxScore) {
								View.showMessage(getMessage("valueValidateMessage"));
								return false;
							}
							else {
								return this.checkScoreRange(minScore, maxScore);
							}
				    },
				 /**
					 * check Score Range
					 */
				    checkScoreRange:function(minScore,maxScore){
				    		var level = this.abGbDefCertLevDetailsPanel.getFieldValue("gb_cert_levels.cert_level");
							var ds=this.abGbDefCertLevDetailsDS;
							var res="gb_cert_levels.cert_std='"+this.certStd+"' and "  + "((gb_cert_levels.min_score&gt;=" + minScore+ " and gb_cert_levels.max_score&lt;= "+maxScore+ ") or ( gb_cert_levels.min_score&lt;="+minScore+" and gb_cert_levels.max_score&gt;="+minScore+") or (gb_cert_levels.min_score&lt;="+maxScore+" and gb_cert_levels.max_score&gt;="+maxScore+")) and gb_cert_levels.cert_level!='"+level+"'"; 
								if(ds.getRecords(res).length>0){
									View.showMessage(getMessage("scoreConflict"));
				    		    return false;
							}else{
								return true;
							}		
				    }

});

// set addNew button enable when any Tree level 1 node be clicked
function selectValueFromTreeStdLev() {
	var curTreeNode = View.panels.get("abGbDefCertLevTreePanel").lastNodeClicked;
	curTreeNode.expand();
	abGbDefCertLevelsController.certStd = curTreeNode.data['gb_cert_std.cert_std'];
	abGbDefCertLevelsController.abGbDefCertLevTreePanel.actions.get('addNew').forceDisable(false);
	abGbDefCertLevelsController.curTreeNode = curTreeNode;
	
}
// set addNew button disable when any Tree level 2 node be clicked
function setAddNewButtonStatus() {
	var curTreeNode = View.panels.get("abGbDefCertLevTreePanel").lastNodeClicked;
	var detailFrom=abGbDefCertLevelsController.abGbDefCertLevDetailsPanel;
	abGbDefCertLevelsController.certStd = curTreeNode.parent.data['gb_cert_std.cert_std'];
	abGbDefCertLevelsController.abGbDefCertLevTreePanel.actions.get('addNew').forceDisable(false);
	abGbDefCertLevelsController.curTreeNode = curTreeNode;
	
	detailFrom.clear();
	detailFrom.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel 
	restriction.addClause('gb_cert_cat.cert_std', curTreeNode.parent.data['gb_cert_std.cert_std']);
	restriction.addClause('gb_cert_levels.cert_level', curTreeNode.data['gb_cert_levels.cert_level']);
	detailFrom.refresh(restriction);
	
}