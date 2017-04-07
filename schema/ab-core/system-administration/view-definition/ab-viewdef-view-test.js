/*
 * Test functions for ViewDef view object: ab-viewdef-view.js
 */
/* Pattern test. */

function applyPattern(){

    //   convertFilePerform( "C:\\Program Files\\Afm16\\tools\\tomcat\\webapps\\archibus\\schema\\ab-system\\convert\\test-views\\resttest.avw" ) ; 
    convertFilePerform("C:\\Program Files\\Afm16\\tools\\tomcat\\webapps\\archibus\\schema\\ab-system\\convert\\test-views\\ab-bl-val.axvw");
}

function convertAxvwFile(){
    convertFilePerform("i:\\schema\\ab-products\\solutions\\views\\view-examples\\ab-ex-rm-rest.axvw");
}


function convertAvwFile(){
    // convertFilePerform( "i:\\schema\\ab-system\\convert\\test-views\\resttest.avw" ) ; 
    convertFilePerform("i:\\schema\\ab-system\\convert\\test-views\\Copyawrhqxeq.avw");
}


function convertFilePerform(fileToConvert){

    //  Show filename on test .htm form.
    $('convertFileDiv').innerHTML = fileToConvert;
    
    //  Read the file.    
    var myReader = new AFM.ViewDef.Reader();
    myReader.readFile(fileToConvert);
    
    //  Convert the file and evaluate it into a view object named
    //  AFM.ViewDef.myView.
    var myView = new AFM.ViewDef.View();
    
    
    var myConverter = new AFM.ViewDef.Convert(myReader.fileContents, "myView");
    
    myConverter.convertDo();
    
    eval(myConverter.getConvertedContentsAsJavascript());
    
    var datasources = "";
    for (i = 0; i < myView.tableGroups.length; i++) {
        datasources = datasources + "======================" + i + "/n" + myView.listTableGroupAsDataSourceXml(i);
    }
    
    alert(datasources);
    var myPattern = new AFM.ViewDef.Pattern(myView, "ab-viewdef-report-drilldown", myView.tableGroups.length, 2);
    //    var myPattern = new AFM.ViewDef.Pattern( myView, "ab-viewdef-report", myView.tableGroups.length, 1);    
    //    var myPattern = new AFM.ViewDef.Pattern( myView, "ab-viewdef-report-drilldown", 2, 2);
    myPattern.applyPattern();
    
    var writeFileName = "i:\\schema\\ab-system\\convert\\test-views\\newview.axvw";
    myReader.writeFile(writeFileName, myPattern.getConvertedView());
    
}



/* File reading and writing tests */

function readFile(){
    var readFileName = "i:\\schema\\ab-system\\convert\\test-views\\resttest.avw";
    //  Show filename on test .htm form.
    $('readFileDiv').innerHTML = readFileName;
    //  Read file.
    var myReader = new AFM.ViewDef.Reader();
    myReader.readFile(readFileName);
    alert("File Contents: \n" + myReader.fileContents);
}




function writeFile(){
    var writeFileName = "i:\\schema\\ab-system\\convert\\test-views\\newview.avw";
    //  Show filename on test .htm form.
    $('writeFileDiv').innerHTML = writeFileName;
    //  Write file.
    var fileContents = "New contents of file written.\nSecond line of contents.\n";
    var myReader = new AFM.ViewDef.Reader();
    myReader.writeFile(writeFileName, fileContents);
    //  Read what was just written.
    myReader.readFile(writeFileName);
    alert(myReader.fileContents);
    
}


/* View definition tests */

function defineView(){

    var myView = new AFM.ViewDef.View();
    
    myView.addTitle("Rooms by Floor");
    
    //  Verify that two tablegroups get created.
    myView.addTable("fl", AFM.ViewDef.Table.MAIN_TABLE);
    myView.addTable("rm", AFM.ViewDef.Table.MAIN_TABLE);
    myView.addTable("rmstd", AFM.ViewDef.Table.STANDARD_TABLE);
    
    //  Verify that fields are added to the right tgrp.
    myView.addField("fl", "bl_id");
    myView.addField("fl", "fl_id");
    myView.addField("rm", "rm_id");
    myView.addField("rm", "area");
    myView.addField("rmstd", "rm_std");
    
    //  Verify that fields are added to the right tgrp.
    myView.addSortField("rm", "area", true);
    myView.addSortField("fl", "area", true);
    
    //  Verify that restrictions are added to the right tgrp.
    myView.addParsedRestrictionClause("", "rm", "rm_std", "NOT LIKE", "CONF%");
    myView.addParsedRestrictionClause(" )AND( ", "rm", "area", "<>", "100.00");
    myView.addSqlRestriction("fl", " WHERE fl.bl_id IN ( 'HQ', 'HCN' ) ");
    myView.addSqlRestriction("rm", " WHERE rm.area < 100.00 ");
    
    //  List 1st drill-down tgrp.
    alert("defineView: 1st drill-down tgrp: " + myView.listTableGroupAsDataSourceXml(0));
    //  List data tgrp.    
    alert("defineView: data tgrp: " + myView.listTableGroupAsDataSourceXml(1));
}


/*
 * We actually build the script that defines the view dynamically when
 * loading the older .avw or .axvw, so we evaluate it to define the
 * view object.
 */
function defineViewUsingEval(){

    var myView = new AFM.ViewDef.View();
    
    eval('myView.addTitle( "Rooms by Floor" ) ;' +
    'myView.addTable( "fl", AFM.ViewDef.Table.MAIN_TABLE ) ;' +
    'myView.addField( "fl", "bl_id" ) ;' +
    'myView.addField( "fl", "fl_id" ) ;');
    
    
    alert("defineViewUsingEval " + myView.listTableGroupAsDataSourceXml(0));
}


/* Test the constructors */

function fieldDef(){

    var fld = new AFM.ViewDef.Field("bl", "bl_id");
    
    alert("fieldDef " + toJSON(fld));
}




function sortFieldDef(){

    var sortFld = new AFM.ViewDef.SortField("bl", "bl_id");
    
    alert("sortFieldDef " + toJSON(sortFld));
}




function tableDef(){

    var tbl = new AFM.ViewDef.Table("rmstd", AFM.ViewDef.Table.STANDARD_TABLE);
    
    alert("tableDef " + toJSON(tbl));
}


function restDef(){

    var rest = new AFM.ViewDef.ParsedRestriction(" )AND( ", " LIKE ", "bl", "bl_id", "HQ%");
    
    alert("rest " + toJSON(rest));
}



function sqlRestDef(){

    var sqlRest = new AFM.ViewDef.SqlRestriction("rmstd", " rmstd.rm_std LIKE 'EXEC%' ");
    
    alert("tableDef " + toJSON(sqlRest));
}


