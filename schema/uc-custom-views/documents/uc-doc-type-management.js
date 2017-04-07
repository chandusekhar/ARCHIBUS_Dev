var tableNameClassLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };
		
var docTypeCntrl = View.createController("docTypeCntrl", {
	tableName:"",
	doc_type_form_afterRefresh: function() {
		BRG.UI.addNameField('uc_doc_type_info', this.doc_type_form, 'uc_doc_type.table_name', 'afm_tbls', ['title'], {'afm_tbls.table_name' : 'uc_doc_type.table_name'}, tableNameClassLabelConfig);
	},
	afterViewLoad: function() {

		var strHref = window.location.href;
  		
  		//find out if there are any 
  		if ( strHref.indexOf("?") > -1 ){
    		var strQueryString = strHref.substr(strHref.indexOf("?")+1);
    		var aQueryString = strQueryString.split("&");
    		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
     			if (aQueryString[iParam].indexOf("=") > -1 ){
        			var aParam = aQueryString[iParam].split("=");
        			if(aParam[0].toLowerCase() == String('table_name').toLowerCase()){
        				this.tableName = unescape(aParam[1]);
						this.doc_types_grid.restriction="uc_doc_type.table_name='"+this.tableName+"'";
						//set the config value 
						this.doc_type_form.fields.get('uc_doc_type.table_name').config.value=this.tableName
					}
        		}
      		}
    	}

	}

});

function saveDocType(){
	var doc_type_form = View.panels.get('doc_type_form');
	
	doc_type_form.setFieldValue('uc_doc_type.modified_by',View.user.name);
	doc_type_form.setFieldValue('uc_doc_type.date_modified','${sql.currentDate}');
	doc_type_form.save();
}


