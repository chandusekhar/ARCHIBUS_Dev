/**
 * ab-viewdef-convert-avw.js
 * 03.24.2007
 *
 */
Ab.namespace('ViewDef');

/**
 * Class for regex'ing a Windows view into a series of .js statements
 * that will define a view object in JavaScript memory.
 *
 */
Ab.ViewDef.ConvertAvw = Base.extend({
    constructor: function(){
    },
    
    // text of file to convert.  Gets converted in-place in this variable.
    convertedTextOfFile: "",
    
    // string to hold the name of the variable which will hold the view definition after evaluation, e.g. "top.Ab.ViewDef.myView"
    myView: "",
    
    // true if the avw used server-dependent functions which will not convert.
    warningFlagServerDependentFunctions: false,
    
    // true if the avw used hand-hacked multi-line coding which will not convert.
    warningFlagMultilineCoding: false,
    
    // true if the avw contains custom functions
    warningFlagCustomProcedures: false,
    
    // true if the avw contains IF conditions
    warningFlagConditionalStatements: false,
    
    // false until the conversion has been run.
    fileIsConverted: false,
    
    // warning if values not yet valid. ??Localization.
    NOT_YET_CONVERTED_ERROR: "File not yet converted.",
       
    //  ---- Accessors ----------------  
	 
    /**
     * Return the avw file as a series of JavaScript statements that, when evaluated, will define a view object.
     *
     * @param	None
     * @return	this.convertedTextOfFile	String	Contained converted texted of file
     *
     */
    getConvertedFileAsJavaScript: function(){
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
        return this.convertedTextOfFile;
    },
    
    /**
     * Return true if there were conditions that the converter could not convert.
     *
     * @param	None
     * @return	this.warningFlagServerDependentFunctions || this.warningFlagMultilineCoding || this.warningFlagCustomProcedures
     *
     */
    hasUnconvertableSections: function(){
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
        return (this.warningFlagServerDependentFunctions || this.warningFlagMultilineCoding || this.warningFlagCustomProcedures);
    },
    
    /**
     * Return a string describing which conditons the converter could not convert.
     *
     * @param	None
     * @return	unconvertableConditions	String	Warning messages of unconvertable conditions
     *
     */
    getDescriptionOfUnconvertableSections: function(){
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
        
        var unconvertableConditions = "";
        
        if (this.warningFlagServerDependentFunctions) 
            unconvertableConditions += "\n" + getMessage('serverDependentWarning');
        
        if (this.warningFlagMultilineCoding) 
            unconvertableConditions += "\n" + getMessage('handcodedWarning');
        
        if (this.warningFlagCustomProcedures) 
            unconvertableConditions += "\n" + getMessage('customWarning');
        
        if (this.warningFlagCustomProcedures) 
            unconvertableConditions += "\n" + getMessage('conditionalWarning');
        
        return unconvertableConditions;
    },
    
    /**
     * Convert the file of the text in Windows .avw to a series of statements 
     * that, when evaluated, will define a view.
     *
     * @param	sourceTextToConvert	String 	Original contents of text to convert	
     * @param	viewVariableName	String	Name of the view variable to which to add the view definition after the evaluation, e.g. "top.Ab.ViewDef.myView"	
     * @return	True
     *
     */
    convertDo: function(sourceTextToConvert, viewVariableName){
    
        this.convertedTextOfFile = sourceTextToConvert;
        this.myView = viewVariableName;
        
        // warn if something won't convert.        
        this.convertFile_setWarningFlags();
        
        // replace title.
        this.convertFileOptions();
        
        // replace owner, assigned, and fields.
        this.convertFile_replaceTableDefs();
        
		// replace sort
        this.convertFile_replaceSort();
        
		// replace restrictions
        this.convertFile_replaceRestrictions();
        
		// replace SQL restrictions
        this.convertFile_replaceSQLRestrictions();
        
        // clear the unconvertable, remaining lines
        this.convertFile_clearRemainingLines();
        
        // result is now in this.convertedTextOfFile
        //  All's well with the accessors.
        this.fileIsConverted = true;
    },
    
    /**
     * Replace the end of line, title, and other cleanup things.
     *
     * @param	None
     * @return	None
     *
     */
    convertFileOptions: function(){
    
        // Convert Avw.SetSys	"Report Title", "Room Percentages by Business Unit" to:
        // myView.addTitle( "Room Percentages by Business Unit" ) ;
        // Titles can contain punctuation -- anything BasicScript allowed between the quotes is valid.       
        //                $1                             $2    $3
        var objRegExp = /(Avw\.SetSys).*"Report Title".*"(.*)"(.*)/gi;     
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + '.addTitle( "$2" ) ; \n');        
    },
    
    
    /**
     * Replace the AddOwner, AddAssigned, and AddStandard statments with XML equivalents.
     *
     * @param	None	
     * @return	None
     *
     */
    convertFile_replaceTableDefs: function(){
    
        //  ---- Convert:
        //  Avw.AddOwner "bl", 0
        //      :to: 
        //  myView.addTable( "bl", Ab.ViewDef.Table.MAIN_TABLE, 'AVW' ) ;
        //  Leading whitespace is fine.
        //  Table and field identifiers can have underscores and numbers.       
        //                $1                $2       
        var objRegExp = /(Avw\.AddOwner).*("[A-Za-z_0-9]*")(.*)/gi;      
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.MAIN_TABLE, 'AVW' ) ;");
        
        //  ---- Convert: Avw.AddAssigned "fl", 0  :to: the same
        //  format (Web views don't distinguish between owner and
        //  assigned.)       
        //                $1                $2
        var objRegExp = /(Avw\.AddAssigned).*("[A-Za-z_0-9]*")(.*)/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.MAIN_TABLE, 'AVW' ) ;");
        
        //  ---- Convert: Avw.AddStandard "rmstd", 0  :to: 
        //  myView.addTable( "rmstd", Ab.ViewDef.Table.STANDARD_TABLE ) ;       
        var objRegExp = /(Avw\.AddStandard).*("[A-Za-z_0-9]*")(.*)/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.STANDARD_TABLE ) ;");
        
        //  ---- Convert: Avw.FldOn "rm.rm_id" :to:
        //  myView.addField( "rm", "rm_id" ) ;
        //  Avw.FldOn is pattern $1
        //  Next is any number of characters of whitespace up to a first quote.
        //  Quote followed by any number of characters up to a literal period is pattern $2 -- table
        //  Any number of characters to a quote is pattern $3 -- field
        //  Any other character up to the <br> is pattern $4 -- the remainder of the line which can be erased      
        //                $1            $2                $3             $4
        var objRegExp = /(Avw\.FldOn).*"([A-Za-z_0-9]*)\.([A-Za-z_0-9]*)"(.*)/gi;     
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addField( \"$3\", \"$2\", \"AVW\" ) ;");       
    },
    
    
    /**
     * Replace the SetSort statements with an XML equivalent.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceSort: function(){
    
        //  Convert 
        //  Avw.SetSort	"activity_log", "activity_log.pr_id, activity_log.parcel_id, activity_log.activity_type", FALSE
        //  Avw.SetSort	"eq", "eq.dwgname DESC", FALSE
        //  :to:
        //   myView.addSortField( "activity_log", "pr_id", ,"Property Code", "AVW", true ) ;
        //   myView.addSortField( "activity_log", "parcel_id", "Parcel Code", "AVW", true ) ;
        //   myView.addSortField( "activity_log", "activity_type", "Activity Type", "AVW", true ) ;
		//
        //  First: get the outer tags in and the field list into its own line.
        //  Avw.SetSort is Pattern 1
        //  Next is any amount of whitespace up to the first quote.
        //  The quoted table name is Pattern 2
        //  Next is the comma and any amount of whitespace
        //  the quoted field.table list is Pattern 3
        //  The output is of this form:
        //     sortfieldlist="activity_log.pr_id, activity_log.parcel_id, activity_log.activity_type"      
        //                 $1             $2      $3
        var objRegExp = /(Avw\.SetSort).*"(.*)".*"(.*)".*/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "sortfieldlist=$3");
        
        //  ---- Second, remove any " DESC" from the sort fields.
        //                $1                      $2-rest of line
        var objRegExp = /(sortfieldlist=.*]*) DESC(.*)/gi;
        
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "$1$2");
        
        //  Third, replace the sortfieldlist with the individual <field />
        //  tags.  There are more elegant, Perl-like ways to apply a recursive
        //  pattern, but they are distressingly implementation-dependent in
        //  JavaScript.  Remember that there can be multiple Sort statements in
        //  an .avw.  Remember that hand-hacked .avw's will have extra
        //  whitespace around the commas.        
        //  The first sort field is delimited by "=", then by whitespaces and commas thereafter.           
        //  ---- Match the four sort-field pattern
        //                $1              $2 table1         %3 field1          %4-table2         %5-field2           %6 table3          %7 field3          %8 table4          %9 field4    
        var objRegExp = /(sortfieldlist=)([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$3\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$4\", \"$5\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$6\", \"$7\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$8\", \"$9\", \"\", \"AVW\", true ) ;");       
        
        //  ---- Match the three sort-field pattern
        //                $1              $2 table1         %3 field1          %4-table2         %5-field2           %6 table3          %7 field3
        var objRegExp = /(sortfieldlist=)([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$3\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$4\", \"$5\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$6\", \"$7\", \"\", \"AVW\", true ) ;");
        
        //  ---- Match the two sort-field pattern
        //                $1              $2 table.         %3 field 1         %4-table2         %5-field2        
        var objRegExp = /(sortfieldlist=)([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$3\", \"\", \"AVW\", true ) ; \n" +
        this.myView + ".addSortField( \"$4\", \"$5\", \"\", \"AVW\", true ) ;");
        
        //  ---- Match the one sort-field pattern
        //                $1              $2-table1         %3-field1
        var objRegExp = /(sortfieldlist=)([A-Za-z_0-9]*)[.]([A-Za-z_0-9]*)[, ]*/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$3\", \"\", \"AVW\", true ) ;");
        
    },
    
    
    /**
     * Replace the AddRest statements with an XML equivalent.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceRestrictions: function(){
    
        //  ---- Convert Avw.AddPermRest to Avw.AddRest, as there is no 
        // permanent restriction in the Web view format.
        //                $1               $2 - the rest of the line
        var objRegExp = /(Avw\.AddPermRest)(.*)/gi;      
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "Avw.AddRest $2");
              
        //  ---- Convert Avw.AddRest elements like:
        //  Avw.AddRest	"rm", "", "rm.dv_id", "=", "EXECUTIVE"
        //  Avw.AddRest	"rm", " AND ", "rm.dp_id", "=", "ENGINEERING"
        //  Avw.AddRest	"rm", ") OR(", "rm.area", "=", "0.00"
        //  Avw.AddRest	"rm", ") AND(", "rm.name", " IS NULL ", ""
        //  Avw.AddRest	"eq", "And", "vf_eq_active_wr", " > ", "0"
        //  Avw.AddRest	"wr", "And", "wr.date_completed", " IS NULL ", ""       
        //  :to this form:
        //                                     relop,   table, field, op,   value
        //  myView.addParsedRestrictionClause( ")AND(", "rm", "area", "<>", "100.00" ) ;       
        // Handle greater than or equal, less than or equal, greater than, and less than	
        //                $1             $2 tbl  $3 relop $4 fld $5 op   						$6 value
        var objRegExp = /(Avw\.AddRest).*(".*").*(".*").*(".*").*("[\s]*\>=[\s]*").*(".*").*/gi;             
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $2, $4, \"\&gt\;\=\", $6 ) ;");
                
        //                $1             $2 tbl  $3 relop $4 fld $5 op   						$6 value
        var objRegExp = /(Avw\.AddRest).*(".*").*(".*").*(".*").*("[\s]*\<=[\s]*").*(".*").*/gi;     
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $2, $4, \"\&lt\;\=\", $6 ) ;");
        
        //                $1             $2 tbl  $3 relop $4 fld $5 op   						$6 value
        var objRegExp = /(Avw\.AddRest).*(".*").*(".*").*(".*").*("[\s]*\>[\s]*").*(".*").*/gi;   
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $2, $4, \"\&gt\;\", $6 ) ;");
               
        //                $1             $2 tbl  $3 relop $4 fld $5 op   						$6 value
        var objRegExp = /(Avw\.AddRest).*(".*").*(".*").*(".*").*("[\s]*\<[\s]*").*(".*").*/gi; 
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $2, $4, \"\&lt\;\", $6 ) ;");
               
        //                $1             $2 tbl  $3 relop $4 fld $5 op   $6 value
        var objRegExp = /(Avw\.AddRest).*(".*").*(".*").*(".*").*(".*").*(".*").*/gi;   
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $2, $4, $5, $6 ) ;");       
    },
	
    /**
     * Replace SetSQLRest statements with an XML equivalent.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceSQLRestrictions: function(){
    
        //  ---- Convert Avw.SetPermSQLRest to Avw.SetSQLRest.
        //                $1               $2 - the rest of the line
        var objRegExp = /(Avw\.SetPermSQLRest)(.*)/gi;       
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "Avw.SetSQLRest $2");
               
        //  Convert Avw.SetSQLRest
        //  Avw.SetSqlRest	"wr", "wr.status in ('I','HP','HA','HL')"
        //  :to:
        //   myView.addSqlRestriction( "wr", "wr.status in ('I','HP','HA','HL')" ) ;     
        //                $1               $2 tbl  $3 sqlRest  
        var objRegExp = /(Avw\.SetSQLRest).*(".*").*(".*").*/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSqlRestriction( $2, $3 ) ;");
    },
    
    /**
     * Set the warning flags if there are unconvertable conditions.
     * Must be called before the lines are converted.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_setWarningFlags: function(){
   
        // set a warning flag if the view has hand-hacked multi-line coding (an underscore at the end of the line).  These will not translate.  These are typically complex PermSQLRest() clauses.   
        var objRegExp = /_$/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagMultilineCoding = true;
        
        // set a warning flag if the view uses "SqlFunc" functions.  These are server-dependent functions that will not translate.     
        var objRegExp = /sqlFunc/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagServerDependentFunctions = true;
        
        // set a warning flag if the view uses conditional code for different servers.
        var objRegExp = /ProjDb.ServerType/gi;    
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagServerDependentFunctions = true;
        
		// set a warning flag if view has add action
        var objRegExp = /Avw.AddAction/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagCustomProcedures = true;
        
		// set a warning flag if view has conditional if statements
        var objRegExp = /End[\s]+IF/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagConditionalStatements = true;
        
		// set a warning flag if view has select ststements
        var objRegExp = /End[\s]+SELECT/gi; 
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagConditionalStatements = true;
        
		// set a warning flag if view has custom procedures
        var objRegExp = /Avw.SetViewLoadProc/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagCustomProcedures = true;        
    },
       
    /**
     * Clear unconvertable lines.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_clearRemainingLines: function(){
    
        // replace all other "Avw." commands with blanks.  This includes: StartDef, EndDef, FldWidth, AddBreak,
        // AddAction, AddFieldDefaultValue, SetBarcodeFont, SetSys, AddDrawingSuffix, AddTemplateLayer,
        // ViewLoadProc, AddVfs,  AddLayers. Dim Vf, vf.*, Sub, End Sub, and comment lines ('comment),      
        // clear any line contents after a keyword or comment
        var objRegExp = /(Avw\.|sub\s|End Sub|^\'|\n\'|vf|Dim|AddVfs|AddLayers|Declare).*/gi;		
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        
        // clear any section contents within an IF conditional statement
        var objRegExp = /(If\s[\s\S]*\sEnd[\s]+If)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        
        // clear any section contents within an CASE statement
        var objRegExp = /(SELECT[\s\S]*End[\s]+SELECT)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        
        // clear purely blank lines. (That is: newline + any number of blank chars + newline: replace with one newline.)
        var objRegExp = /\n\s*\n/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "\n");
    }
    
}); // end definition of Ab.ViewDef.ConvertAvw class




