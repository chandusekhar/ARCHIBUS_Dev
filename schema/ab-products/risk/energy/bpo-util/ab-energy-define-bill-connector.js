/**
 * @author AD
 * @created September 5, 2014
 */
 
/**
 * Process the filter console for bill connector
 * @param {Object} consolePanelId
 * @param {Object} targetPanelId
 */
function abEnergyBillConnector_applyFilter(consolePanelId, targetPanelId){

   var restriction = new Ab.view.Restriction();
   var console = View.panels.get(consolePanelId);

   var vn_ac_id = console.getFieldValue('bill_connector.vn_ac_id');
   if (vn_ac_id != '') {
       restriction.addClause('bill_connector.vn_ac_id', vn_ac_id + '%', 'LIKE');
   }
    
   var vn_id = console.getFieldValue('bill_connector.vn_id');
   if (vn_id != '') {
       restriction.addClause('bill_connector.vn_id', vn_id + '%', 'LIKE');
   }
    
   var auto_approve = console.getFieldValue('bill_connector.auto_approve');
   if (auto_approve != '') {
       restriction.addClause('bill_connector.auto_approve', auto_approve, '=');
   }
   
   var bill_file_type = console.getFieldValue('bill_connector.bill_file_type');
   if (bill_file_type != '') {
       restriction.addClause('bill_connector.bill_file_type', bill_file_type, '=');
   }
   
   var bill_type_id = console.getFieldValue('bill_connector.bill_type_id');
   if (bill_type_id != '') {
       restriction.addClause('bill_connector.bill_type_id', bill_type_id + '%', 'LIKE');
   }
    
   var connector_version = console.getFieldValue('bill_connector.connector_version');
   if (connector_version != '') {
       restriction.addClause('bill_connector.connector_version', connector_version + '%', 'LIKE');
   }
    
   add_restriction_clause_for_date_field('bill_connector', 'date_effective_end', console, restriction);
   
   add_restriction_clause_for_date_field('bill_connector', 'date_effective_start', console, restriction);
 
   var report = View.panels.get(targetPanelId);
   report.refresh(restriction);

   report.show(true);
}

// Enable/Disable the to and from fields for a date field
function abEnergyBillConnector_checkDateRange(console_name, table, field){
    var field_value = document.getElementsByName(field)[0].value;
    var enabled = (field_value == 'Date Range');
    var fromField = table + "." + field + ".from";
    var toField = table + "." + field + ".to";
    
    var console = View.panels.get(console_name);
    console.enableField(fromField, enabled);
    console.enableField(toField, enabled);
    
    if (field_value != 'Date Range') {
      console.setFieldValue(fromField, "");
      console.setFieldValue(toField, "");
    }
}


