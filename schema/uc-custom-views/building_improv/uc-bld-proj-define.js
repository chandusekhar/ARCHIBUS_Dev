var savingsType= {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",textColor : "#000000", defaultValue : "", raw : false };

var ucBldProjDefineController = View.createController('ucBldProjDefineCntrl', {

afterViewLoad: function() {
	View.setToolbarButtonVisible('printButton', false); 
	View.setToolbarButtonVisible('emailButton', false); 
	View.setToolbarButtonVisible('alterButton', false); 
	View.setToolbarButtonVisible('favoritesButton', false);

    docCntrl.docTable='uc_bl_improvements';
    docCntrl.docPkeyLabel = ['uc_bl_improvements','Building Improvements'];
	docCntrl.docPdf=false;
},

bldProjDefine_eastPanel_afterRefresh: function() {
	BRG.UI.addNameField('savings_type', this.bldProjDefine_eastPanel, 'uc_bl_improvements.category', 'uc_bl_workcat', ['savings_type'], {'uc_bl_workcat.category': 'uc_bl_improvements.category'}, savingsType);

	if (this.bldProjDefine_eastPanel.newRecord) {
		docCntrl.docAdd = false;
	} else {
		docCntrl.docAdd = true;
	}

   	docCntrl.docTable='uc_bl_improvements';
    docCntrl.docPkey= this.bldProjDefine_eastPanel.getFieldValue("uc_bl_improvements.seq");
    
	var rest = "(uc_docs_extension.table_name='"+docCntrl.docTable+"' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "')"
    View.panels.get('doc_grid').show(true);
	View.panels.get('doc_grid').refresh(rest);
},

bldProjDefine_westPanel_onAddNew: function() {
	this.bldProjDefine_eastPanel.refresh('', true);
},

bldProjDefine_westPanel_onProjSel: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
},

bldProjDefine_westPanel_onProjSel2: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
},

bldProjDefine_westPanel_onProjSel3: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
},

bldProjDefine_westPanel_onProjSel4: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
},

bldProjDefine_westPanel_onProjSel5: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
}

/* projSel6: function(row, action) {
	var request = row.getRecord();
	var seqId = request.values['uc_bl_improvements.seq'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	this.bldProjDefine_eastPanel.refresh(restriction, false);
} */
});


function refreshWestPanel() {
	View.panels.get("bldProjDefine_westPanel").refresh();
}

function closeEastPanel() {
	View.panels.get("bldProjDefine_eastPanel").show(false);
	var seqId = View.panels.get("bldProjDefine_eastPanel").getFieldValue("uc_bl_improvements.seq");
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("uc_bl_improvements.seq", seqId, "=");
	
	View.panels.get("bldProjDefine_eastPanel").refresh(restriction, false);
}

function addSavingsTypeLabel(commandObject)
 {
	var rest = "uc_bl_workcat.status <> 'I'";
	var form = commandObject.getParentPanel();
	View.selectValue(form.id, getMessage('workCategory'),
					['uc_bl_improvements.category'], 'uc_bl_workcat', ['uc_bl_workcat.category'], ['uc_bl_workcat.category'],
					rest, 'afterWorkCatSelect', true);
}

function afterWorkCatSelect(targetFieldName, selectedValue, previousValue) {
	BRG.UI.addNameField('savings_type', View.panels.get("bldProjDefine_eastPanel"), 'uc_bl_improvements.category', 'uc_bl_workcat', ['savings_type'], {'uc_bl_workcat.category': 'uc_bl_improvements.category'}, savingsType);
} 
//
function baseSavingsChange() {
	var savings = View.panels.get('bldProjDefine_eastPanel').getFieldValue('uc_bl_improvements.savings');
	var area = View.panels.get('bldProjDefine_eastPanel').getFieldValue('uc_bl_improvements.area');
	var newBaseSavings = '';
	
	if (savings != '' && area != '') {
		newBaseSavings = savings / area;
	} 
	
	if (savings == 0 && area == 0) {
		newBaseSavings = '';
	} 
	
	if (savings != 0 && savings != '' && area == 0) {
		newBaseSavings = '';
	}
	
	View.panels.get('bldProjDefine_eastPanel').setFieldValue('uc_bl_improvements.vf_savingsqft', newBaseSavings);
}