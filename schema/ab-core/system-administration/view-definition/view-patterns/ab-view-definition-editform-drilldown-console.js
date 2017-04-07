// ab-view-definition-editform-drilldown-console.js

function afterViewLoad(){
	var consolePrefix = 'abViewdefEditformDrilldownConsole_consolePanel_';
    /*--EnumList-Onload-Template-Begin--*/
    setup_enum_field(consolePrefix, 'wr', 'status');    
    /*--EnumList-Onload-Template-End--*/           
}


function setFilterAndRender() {
	var restriction = new Ab.view.Restriction();
    var console = View.panels.get('abViewdefEditformDrilldownConsole_consolePanel');

    /*--Filter-Template-Begin--*/
	/*--Char-Filter-Template-Begin--*/
    var location = console.getFieldValue('wr.location');
    if (location != '') {
		restriction.addClause('wr.location', location + '%', 'LIKE');
	}

    /*--Char-Filter-Template-End--*/

    /*--Numeric-Filter-Template-Begin--*/
    var wr_id = console.getFieldValue('wr.wr_id');
    if (wr_id != '') {
		restriction.addClause('wr.wr_id',  wr_id);
    }   
    /*--Numeric-Filter-Template-End--*/                     
                            
    /*--EnumList-Filter-Template-Begin--*/
    var status = console.getFieldValue('wr.status');
    if (status != '') {
		restriction.addClause('wr.status', status, '=');
    }
    /*--EnumList-Filter-Template-End--*/
	
	/*--Date-Filter-Template-Begin--*/
    add_restriction_clause_for_date_field('wr', 'date_requested', console, restriction);
    /*--Date-Filter-Template-End--*/    
                           
    /*--Memo-Filter-Template-Begin--*/
    var description = console.getFieldValue('wr.description');
    if (description != '') {
		restriction.addClause('wr.description', '%' + description + '%', 'LIKE');
	}
    /*--Memo-Filter-Template-End--*/
    /*--Filter-Template-End--*/

    var report = View.panels.get('abViewdefEditformDrilldownConsole_treePanel');
    report.refresh(restriction);

    report.show(true);
}                            
  

