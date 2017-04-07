/**
 * @author Song
 */
/**
 * Select Vendor Code
 * @param {Object} consoleName
 * @param {Object} tableName
 * @param {Object} consoleFieldName
 * @param {Object} dialogTitle
 */
function selectVendorCode(){
    var console = View.panels.get("abWasteDefFacilitiesForm").getFieldValue("waste_facilities.vn_id");
    var restriction = null;
    if (console) {
        restriction = new Ab.view.Restriction();
    }
   var fieldNames=["waste_facilities.vn_id", "waste_facilities.address1", "waste_facilities.address2", "waste_facilities.fax", "waste_facilities.phone", "waste_facilities.email", "waste_facilities.zip", "waste_facilities.title", "waste_facilities.contact_name", "waste_facilities.ctry_id", "waste_facilities.state_id", "waste_facilities.city_id"]; 
   var selectFieldNames=["vn.vn_id", "vn.address1", "vn.address2", "vn.alt_fax", "vn.alt_phone", "vn.email", "vn.postal_code", "vn.title", "vn.contact", "vn.country", "vn.state", "vn.city"];
   var visibleFieldNames=["vn.vn_id", "vn.company"]; 
    View.selectValue("abWasteDefFacilitiesForm", getMessage("dialogTitle"), fieldNames, "vn", 
    		selectFieldNames, visibleFieldNames, restriction,null,false);
}