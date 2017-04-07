var tabsFrame = View.getView('parent').panels.get('tabsFrame');
/**
 *  ab-viewdef-pattern.js
 *
 **/
Ab.namespace('ViewDef');

Ab.ViewDef.Pattern = Base.extend({

    patterns: ['ab-viewdef-report', 'ab-viewdef-report-drilldown', 'ab-viewdef-report-drilldown-two-level', 'ab-viewdef-summary-report', 'ab-viewdef-summary-chart', 'ab-viewdef-summary-report-drilldown', 'ab-viewdef-summary-chart-drilldown', 'ab-viewdef-editform-drilldown', 'ab-viewdef-editform-drilldown-two-level', 'ab-viewdef-editform-drilldown-console', 'ab-viewdef-editform-drilldown-popup'],
    
    // Ab.ViewDef.View object containing values to insert into the pattern.  See ab-viewdef-view.js.
    view: undefined,
    
    // name of pattern, which matches the name of its .axvw file.
    patternName: "",
    
    viewType: "",
    
    // number of table groups required in this pattern.
    numberOfTgrpsInTemplate: -1,
    
    // number of table groups in actual view.    
    numberOfTgrpsInView: -1,
    
    // contents of view as an XML string after conversion.
    convertedView: "",
    
    // original contents of pattern view as XML string (never converted).
    originalPattern: "",
	
	numberOfTableGroups: 0,
    
    //	---- Delimiters
    kVIEWDEF: "ViewDef", // Macro "namespace" prefix
    kBEGIN: "-Begin", // Mark the beginning of a location
    kEND: "-End", // Mark the end of a location
    kCB: "<!--", // HTML comment begin
    kCE: "-->", // HTML comment end
    //	---- Target Locations
    kEXAMPLELOC: "-Example", // Example location name
    kVIEWLOC: "-View",
    kTOPDRILLDOWNTGRP: "-TopDrillDownTgrp-DataSource",
    kDRILLDOWNTGRP: "-DrillDownTgrp-DataSource",
    kDATATGRP: "-DataTgrp-DataSource",
    
    //	---- Targets
    kVIEWTITLE: "-ViewTitle",
    kPANELTITLE: "-PanelTitle",
    kDATASOURCE: "-DataSource",
    kFIELDLISTLOCATIONS: ["-FieldList1", "-FieldList2"],
    kTGRPNAME: ["DataTgrp", "DrillDownTgrp", "DrillDown2Tgrp"],	    
    /**
     * Constructor.
     *
     * @param	view		Object 	Ab.ViewDef.View object with valid view parameters
     * @param	patternName	String	Name of the template to apply to the view
     *
     */
    constructor: function(view, viewType, patternName, numberOfTgrpsInTemplate, numberOfTgrpsInView){
        this.view = view;
        this.viewType = viewType;
        this.patternName = patternName;
        this.numberOfTgrpsInView = numberOfTgrpsInView;
        this.numberOfTgrpsInTemplate = numberOfTgrpsInTemplate;
		this.numberOfTableGroups = this.view.tableGroups.length;
        
        if (-1 == this.numberOfTgrpsInTemplate) 
            throw "\nNo such pattern: " + patternName;
        
        try {
        
            if (this.numberOfTgrpsInTemplate != this.numberOfTgrpsInView) 
                throw "The number of tablegroups in this view does not match the number of tablegroups needed for this pattern.  Please select a different pattern or select some tables.";
        } 
        catch (e) {
            alert(e);
            this.patternName = "ab-viewdef-blank";
            tabsFrame.selectTab('page2');
        }
    },
    
    
    /**
     *  Given a pattern name, return the number of tgrps it requires.
     *
     *  @param	patternName	String	Name of pattern
     *  @return	i			Number of tablegroups for pattern
     *
     */
    nTgrpsForPattern: function(patternName){
        for (var i = 0; i < this.patterns.length; i++) {
            if (patternName == this.patterns[i][0]) {
                return i;
            }
        }
        return -1; // no such pattern
    },
    
    
    /**
     * Return converted .axvw file contents as a string.
     *
     * @param	None
     * @return	None
     *
     */
    getConvertedView: function(){
        return this.convertedView;
    },
    
    
    /**
     *  Return the contents of the panel as retrieved frm the pattern's .axvw file.
     *
     *  @param	None
     *  @param	this.originalPattern	String	Name of original pattern
     **/
    getOriginalPattern: function(){
        return this.originalPattern;
    },
    
    
    /**	 
     * Internal: translate the tgrp index into the location name used for its
     * particular role in this pattern.
     * The role each tablegroup plays within the pattern is
     * named so that when you are defining view patterns, you
     * won't throw a nutter.  However, the table groups themselves are
     * just an array within the view.  This function sets
     * that mapping.
     *
     * @param	n					Integer		Tablegroup index
     * @return	locationNames[n]	String		Name of tablegroup location
     *
     **/
    getNthTgrpLocationName: function(n){
        var locationNames = ["TopDrillDownTgrp-DataSource", "DrillDownTgrp-DataSource", "DataTgrp-DataSource"];
        var locationIndex = n + this.numberOfTgrpsInTemplate - 1;
        return locationNames[n];
    },
    
    
    /**
     * Do the work of applying the pattern and updating the new view contents.
     *
     * @param	None
     * @return	None
     *
     **/
    applyPattern: function(){
        this.readPatternFile();
        this.originalPattern = originalPattern;
        this.convertedView = this.originalPattern;
			
        this.clearExampleSections();
        
        var pattern = this.patternName;   	
        
        if (pattern.match(/paginated/gi)){
        	this.replacePaginatedProperties();
        } 
               							
        for (var tgrpndx = this.numberOfTgrpsInView; tgrpndx > 0; tgrpndx--) {
        	if (pattern.match(/editform|viewdef-report/gi)){
        		this.replacePanelProperties(tgrpndx);
        	}	

        	this.replaceReportActions(tgrpndx);
        	      
            this.replaceTitleMacros(tgrpndx);
            // alert("apply" + tgrpndx);                    
			this.replaceNthDataSourcesSection(tgrpndx);	
										
				// for paginated reports
                if(pattern.match(/paginated/gi)){	
				
					// for paginated reports with summary	
					var view = tabsFrame.newView;
					var curTgrp = view.tableGroups[tgrpndx - 1];	

					if ( hasSummarizeBySortOrder(curTgrp) ){

						this.replaceGroupingAxis(tgrpndx);
                		this.replaceDataAxis(tgrpndx);
                		this.replaceGroupByDate(tgrpndx);
						
						// this.removePaginatedNonSummaryMarkers();	// needs to be called before replaceNthFieldListSection	
					}
					/* else {
						// for paginated report without summary
						this.removePaginatedSummaryMarkers();						
					}*/
		
					this.removePaginatedSummaryMarkers(tgrpndx);
					this.replacePaginatedPanelProperties(tgrpndx);
					
					this.replacePaginatedDataSource(tgrpndx);

                }
				
				if (pattern.match(/highlight-restriction/gi)){
					this.removeCDATAComments();
				}
						
 				// for summary reports 
  			  	if (((tgrpndx == this.numberOfTgrpsInView) && pattern.match(/summary/gi)) || pattern.match(/chart-2d/gi)){
                	this.replaceGroupingAxis(tgrpndx);
                	this.replaceDataAxis(tgrpndx);
                	this.replaceGroupByDate(tgrpndx);
				}           

					
            this.replaceNthFieldListSection(tgrpndx);
            if(pattern.match(/editform|columnreport/gi)){
            	this.replaceColumnNumber(tgrpndx);
            }
        }
        
        if(this.viewType == 'url'){
        	this.replaceURL();
        	this.replaceViewTitleMacro();
        }   
    },
    
    
    /**
     * Internal: read the pattern file into the member variable called originalPattern.
     *
     * @param	None
     * @return	None
     **/
    readPatternFile: function(){
        var fileName = this.patternName + ".axvw";
        var parameters = {
            'fileName': fileName,
            'fileType': 'Pattern'
        };
        var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-getViewContents', parameters);
        originalPattern = result.message;
        
        //	Pattern files are named after the pattern itself
        var fileName = "view-patterns\\" + this.patternName + ".axvw";
    },
    
    /**
     * Internal: View patterns include example code that is
     * needed for the view to function but that is replaced by
     * new equivalent code.  Clear this example code.
     * To do so, replace a section in this format:
     * <!--ViewDef-Example-Begin-->
     * ... example code ..
     * <!--ViewDef-Example-End-->
     * With nothing.
     *
     * @param	None
     * @return	None
     *
     **/
    clearExampleSections: function(){
        locationName = this.kEXAMPLE;
        var markerForBeginning = this.kVIEWDEF + locationName + this.kBEGIN;
        var markerForEnd = this.kCB + this.kVIEWDEF + locationName + this.kEND + this.kCE;
    },
    
    /**
     * Internal: Replace the macros that will hold the title.
     * <title translatable="true">AfmViewDef-View-Title</title>
     * <title translatable="true">AfmViewDef-DataTgrp-PanelTitle</title>
     *
     * @param	tgrpndx	Integer	Index of tablegroup
     * @return	None
     *
     **/
    replaceTitleMacros: function(tgrpndx){
        // replace the view title
        var macroName = this.kVIEWDEF + this.kVIEWLOC + this.kVIEWTITLE;
        var numberOfTableGroups = this.view.tableGroups.length;
        
        this.replaceViewTitleMacro();

        // replace each tgrp's panel title with the title of the main table within each tgrp   
        if (tgrpndx == numberOfTableGroups) {
            var regexPattern = /Viewdef-DataTgrp-Panel-Title/gi;
        }
        else 
            if (tgrpndx == (numberOfTableGroups - 1)) {
                var regexPattern = /Viewdef-DrillDownTgrp-Panel-Title/gi;
            }
            else 
                if (tgrpndx == (numberOfTableGroups - 2)) {
                    var regexPattern = /Viewdef-DrillDownTgrp2-Panel-Title/gi;
                }
                else {
                    var regexPattern = "No match";
                }
        
        if (regexPattern != "No match") {
            this.convertedView = this.convertedView.replace(regexPattern, this.view.tableGroups[tgrpndx - 1].title);
        }
    },

    replaceViewTitleMacro: function(){
    	var regexViewTitle = /Viewdef-View-Title/;
    	this.convertedView = this.convertedView.replace(regexViewTitle, this.view.title);
    },
        
    /** 
     * Replace a section in this format:
     * <!--ViewDef-DrillDownTgrp-DataSource-Begin-->
     * ... old data source ..
     * <!--ViewDef-DrillDownTgrp-DataSource-End-->
     *
     * @param	tgrpndx		Integer	Index of tablegroup
     * @return	None
     */
    replaceNthDataSourcesSection: function(tgrpndx){
        //	The location name varies by tgrp and its role in this pattern.
        var locationName = this.getNthTgrpLocationName(tgrpndx);
		var pattern = this.patternName;
		
        //	The datasource is marked off by comments.          
        //	The datasource can have any characters spanning multiple lines.
        //	The replacement datasource comes from the given view object.    
        var numberOfTableGroups = this.view.tableGroups.length;
        
        //	The order of the tablegroups that appear in the .axvw and the order the datasource tablegroup array are in reverse order.
        //		Therefore, in order to match up the two, we need to calculate from the number of table groups.				
        if (tgrpndx == numberOfTableGroups) {
            var regexPattern = /\<\!--ViewDef-DataTgrp-DataSource-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DataTgrp-DataSource-End-->/gi;
        }
        else if (tgrpndx == (numberOfTableGroups - 1)) {
            var regexPattern = /\<\!--ViewDef-DrillDownTgrp-DataSource-Begin-->[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDownTgrp-DataSource-End-->/gi;
        } else {
            if (tgrpndx == (numberOfTableGroups - 2)) {
                var regexPattern = /\<\!--ViewDef-DrillDown2Tgrp-DataSource-Begin-->[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDown2Tgrp-DataSource-End-->/gi;
            }
            else {
                var regexPattern = "No match";
            }
   		}


        if (regexPattern != "No match") {

			// get measures refactor
        	// var lastIndex = numberOfTableGroups - 1;
        	var view = tabsFrame.newView;
        	var measuresArr = view.tableGroups[tgrpndx - 1].measures;
			var hasMeasures = false;

        	if ((measuresArr != undefined) && (measuresArr != '')){
        	// alert("measuresArr.length: " + measuresArr.length);
				if (measuresArr.length > 0) {
					hasMeasures = true;
				}
        	}

			// print sort fields in datasource section for:
			// a. summary reports/charts datatgrp (which have groupings)
			// b. paginated with measures/statistics (which will also have groupings)			
 			if ((pattern.match(/summary/gi) && (tgrpndx == this.numberOfTgrpsInView)) || (pattern.match(/chart-2d/gi) && hasMeasures) || (pattern.match(/paginated/gi) && hasMeasures)) {
                var mdxContents = this.replaceMDXSection(tgrpndx);
                var strSortField = "";
                var tgrp = this.view.tableGroups[tgrpndx - 1];

				// prevent double-printing of sortfield for paginated, with sort, with sum, no summary
				// alert(hasSummarizeBySortOrder(tgrp));
				// if (!(pattern.match(/paginated/gi) && !hasSummarizeBySortOrder(tgrp))) {
				// if (!(pattern.match(/paginated/gi) && hasSummarizeBySortOrder(tgrp))) {
					for (m = 0; m < tgrp.sortFields.length; m++) {
						if ((tgrp.sortFields[m].groupByDate != '') && tgrp.sortFields[m].groupByDate != 'undefined') {
							strSortField += "\n        <sortField table=" + dqte(tgrp.sortFields[m].table_name);
							strSortField += " name=" + dqte(tgrp.sortFields[m].groupByDate);
							strSortField += ' ascending="' + tgrp.sortFields[m].isAscending + '"/>';
						}
						else {
							strSortField += "\n        <sortField table=" + dqte(tgrp.sortFields[m].table_name);
							strSortField += " name=" + dqte(tgrp.sortFields[m].field_name);
							strSortField += ' ascending="' + tgrp.sortFields[m].isAscending + '"/>';
						}			
					}
					// strSortField += "\n    ";
				// }
				       
        				if (mdxContents == undefined){
        					mdxContents = '';
        				}
                var temp = this.view.listTableGroupAsDataSourceXml(tgrpndx - 1, this.patternName);
                // temp = temp.replace(/(<\/dataSource>)/gi, mdxContents + strSortField + "$1");
                temp = temp.replace(/(<\/dataSource>)/gi, mdxContents + strSortField + "\n    $1");
                this.convertedView = this.convertedView.replace(regexPattern, temp);
            }
            else {
                this.convertedView = this.convertedView.replace(regexPattern, this.view.listTableGroupAsDataSourceXml(tgrpndx - 1, this.patternName));
            }
        }
    },
    
    replaceColumnNumber: function(tgrpndx){
    	var view = tabsFrame.newView;   
    	var tgrp = view.tableGroups[tgrpndx - 1];
    	if(tgrp.hasOwnProperty('numberOfColumns')){
    		var numOfCols = tgrp['numberOfColumns'];
    		var pattern = new RegExp(); 
    		if(this.patternName.match(/console/gi) && (tgrpndx == 1)){
    			pattern = new RegExp('(columns\=")(.*?)("[\\s|\\S]*)');		
    		} else if (tgrpndx == this.numberOfTgrpsInView){
    			pattern = new RegExp('(_detailsPanel[\\s|\\S]*' + 'columns' + '\=")(.*?)("[\\s|\\S]*)');
    		}  		
    		this.convertedView = this.convertedView.replace(pattern, "$1" + numOfCols + "$3");
    	}    	 	
    },
	    
    /**
     * Replace the field list located in the nth tgrp
     * Replace a section in this format:
     * <!--ViewDef-DataTgrp-PanelFields-Begin
     * <field list pattern "table_name" "field_name" more pattern text>
     * <ViewDef-DataTgrp-PanelFields-End-->
     * The field list is a template which is repeated for each visible field in the tgrp.
     * With each iteration, replace the table_name and field_name with the actual
     * values for this visible field.
     *
     * @param	tgrpndx Integer	Index of tablegroup
     * @return	None
     *
     */
    replaceNthFieldListSection: function(tgrpndx){
        //	---- For each field, apply the template and build the fieldListSectionContents.
        var fieldListSectionContents = "";
        var numberOfTableGroups = this.view.tableGroups.length;
        var pattern = this.patternName;

		// refactor
		var view = tabsFrame.newView;
        var measuresArr = view.tableGroups[tgrpndx - 1].measures;
		var hasMeasures = false;

        if ((measuresArr != undefined) && (measuresArr != '')){
			if (measuresArr.length > 0) {
				hasMeasures = true;
			}
        }
		// end refactor
					
        if (tgrpndx == numberOfTableGroups) {
            var objregexPattern = /[\s]*\<\!--ViewDef-DataTgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DataTgrp-PanelFields-End-->[\s]*/gi;
            index = 0;
        }
        else 
            if (tgrpndx == (numberOfTableGroups - 1)) {
                var objregexPattern = /[\s]*\<\!--ViewDef-DrillDownTgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDownTgrp-PanelFields-End-->[\s]*/gi;
            }
            else 
                if (tgrpndx == (numberOfTableGroups - 2)) {
                    var objregexPattern = /[\s]*\<\!--ViewDef-DrillDown2Tgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDown2Tgrp-PanelFields-End-->[\s]*/gi;
                }
                else {
                    var objregexPattern = "No match";
                }
        
        if (objregexPattern != "No match") {

            var tgrp = this.view.tableGroups[(tgrpndx - 1)];
            var fieldListSectionContents = "\n        ";
		
			// if this is a paginated report and "Summarize the data in this data band by its sort order?:" 
			// has been selected, simply remove the panel field markers.  This will prevent double-printing
			// of sort fields in the panel and datasource.				
				
            var panel = String(this.originalPattern.match(objregexPattern));
 
			// for paginated reports only, print out the measures and sort fields
			if (pattern.match(/ab-viewdef-paginated|ab-viewdef-paginated-parent-child|ab-viewdef-paginated-parent-parent-child/gi)) {
			// if (pattern == 'ab-viewdef-paginated' || pattern == 'ab-viewdef-paginated-parent-child' || pattern == 'ab-viewdef-paginated-parent-parent-child') {
				if (hasSummarizeBySortOrder(tgrp) == true) {
					
					// insert only sort/groupby fields					
					if (hasMeasures) {
						
						// loop through list of fields, making note of sortfields and parameter restrictions
						for (var j = 0; j < tgrp.fields.length; j++) {
							var field = tgrp.fields[j];
							var field_name_f = field.field_name;
							var table_name_f = field.table_name;
							var bHasRestrictionParameter = false;
							var bIsSortField = false;
							var fieldContents = '';
							
							// check if has restriction parameter
							var restriction_parameter = String(field.restriction_parameter);
							if (valueExistsNotEmpty(restriction_parameter) && restriction_parameter != 'undefined') {
								bHasRestrictionParameter = true;
							}

							// check if sort		
							for (k = 0; k < tgrp.sortFields.length; k++) {
								if ((field_name_f == tgrp.sortFields[k].field_name) && (table_name_f == tgrp.sortFields[k].table_name)){
									bIsSortField = true;									
								}								
							}
							
							// only print fields that either have restriction paramter or is sort
							if ((bHasRestrictionParameter == true) || (bIsSortField == true) || ((tgrpndx == 3) &&  pattern.match(/paginated-highlight/gi) && field.afm_type == 'HPattern Acad Ext')){
								fieldContents = "<field table=" + dqte(table_name_f);
								fieldContents += " name=" + dqte(field_name_f);
								// include the restrictionParameter attribute
								if (bHasRestrictionParameter == true){
									fieldContents += ' restrictionParameterName=' + dqte(restriction_parameter);								
								}

								fieldContents += "/>\n        ";	

							/*	
								// insert controlType="color" for hpattern acad fields								
								// if ((tgrpndx == 3) &&  pattern.match(/paginated-highlight/gi) && field.afm_type == 'HPattern Acad Ext') {
									fieldContents = fieldContents.replace('/>', ' controlType="color">\n            <title translatable="true">Color</title>\n        </field>');
								// }	
							*/						
							}
							/*
							// insert controlType="color" for hpattern acad fields								
							if ((tgrpndx == 3) &&  pattern.match(/paginated-highlight/gi) && field.afm_type == 'HPattern Acad Ext') {
								var fieldContents = "<field table=" + dqte(table_name_f);
								fieldContents += " name=" + dqte(field_name_f);
								// include the restrictionParameter attribute
								fieldContents += ' controlType="color">\n            <title translatable="true">Color</title>\n        </field>\n    ';
							}							
							*/
							fieldListSectionContents += fieldContents;	
						}
					}
					
				} else {
					// var hasSummarize = hasSummarizeBySortOrder(tgrp);
					var fields = tgrp.fields;
					for (k = 0; k < fields.length; k++) {
						if(fields[k].is_virtual){
							fieldListSectionContents += '<!--ViewDef-VirtualField-Title-Begin-->\n        ';
						}
						
						fieldListSectionContents += "<field table=" + dqte(fields[k].table_name);
						fieldListSectionContents += " name=" + dqte(tgrp.fields[k].field_name);
						var restriction_parameter = String(fields[k].restriction_parameter);
						if (valueExistsNotEmpty(restriction_parameter) && (restriction_parameter != 'undefined') && pattern.match(/paginated-parent/gi)) {
							//					if ((fields[k].restriction_parameter != undefined) && (fields[k].restriction_parameter != '')) {
							fieldListSectionContents += ' restrictionParameterName=' + dqte(fields[k].restriction_parameter);
						}
						
						if(hasShowTotalsForField(measuresArr, fields[k].table_name, fields[k].field_name)){
							fieldListSectionContents += ' showTotals="true"';
						}

						fieldListSectionContents += '/>\n        ';	
												
						// insert controlType="color" for hpattern acad fields
						if ( ((tgrpndx -1) == 0) && pattern.match(/paginated-highlight/gi) && fields[k].afm_type == 'HPattern Acad Ext') {
							fieldListSectionContents = fieldListSectionContents.replace(/(\/>)([\n|\r|\s]*)$/, 'controlType="color">\n            <title translatable="true">Color</title>\n        </field>$2');
						}

						// insert ml heading for virtual field
						if(fields[k].is_virtual){
							fieldListSectionContents = fieldListSectionContents.replace(/(\/>)([\n|\r|\s]*)$/, '>\n            <title translatable="true">' + fields[k].ml_heading_english + '</title>\n        </field>$2');
							// fieldListSectionContents = fieldListSectionContents.replace (/(\/>)([\n|\r|\s]*)$/, '>\n            <title translatable="true">' + fields[k].ml_heading + '</title>\n        </field>$2');
							fieldListSectionContents += '\n        <!--ViewDef-VirtualField-Title-End-->';
						}
					}
				}
				
				if (hasMeasures && !(hasSummarizeBySortOrder(tgrp) == false) ){
					for (var k = 0; k < measuresArr.length; k++) {
						var stats = measuresArr[k].stats;
						for (x = 0; x < stats.length; x++) {
							fieldListSectionContents += "<field table=" + dqte(measuresArr[k].table_name);
							// fieldListSectionContents += " name=" + dqte(stats[x].toLowerCase() + '_' + measuresArr[k].field_name) + "/>\n        ";
							fieldListSectionContents += " name=" + dqte(createStatPrefix((stats[x])) + '_' + measuresArr[k].field_name) + "/>\n        ";
						}
					}
				}
				
				
			}
			else {
				var objregexPattern2 = /\<field\s?.*\/>/;
				var strfield = String(panel.match(objregexPattern2));
				var splitPattern = "/>";
				
				if (strfield == "null") {
					objregexPattern2 = /\<field\s[\n|\r|\s\D\d\W\w]*\<\/field>/;
					strfield = String(panel.match(objregexPattern2));
					splitPattern = "</field>";
				}
				
				if (strfield == "null") {
					var objregexPattern2 = /\<field\s[\n|\r|\sA-Za-z0-9"=]*\/>/;
					strfield = String(panel.match(objregexPattern2));
				}
				
				var fieldsInPanel = strfield.split(splitPattern, 2);
				
				if (fieldsInPanel.length > 1) {
					var fieldTemplateText = fieldsInPanel[0] + splitPattern;
				}
				else {
					var fieldTemplateText = strfield;
				}
				var strPopUpFlds = "\n";
				for (j = 0; j < tgrp.fields.length; j++) {
					var field = tgrp.fields[j];
					var strTemp = fieldTemplateText.replace(/(table=\")([A-Za-z0-9_]*)(\")/, "$1" + field.table_name + "$3");
					if(tgrp.fields[j].is_virtual){
						strTemp = '<!--ViewDef-VirtualField-Title-Begin-->\n        ' + strTemp;
					}

					var strTempPopUpFlds = '        <field table=' + dqte(field.table_name) + ' name=' + dqte(field.field_name) + '/>\n';

					// for paginated reports with no sort summary specified.  panel fields should not be listed in the template
					if (!strTemp.match(/null/gi)) {
						strTemp = strTemp.replace(/(name=\")([A-Za-z0-9_]*)(\")/, "$1" + field.field_name + "$3");
						
						if (pattern.match(/paginated/) && (field.restriction_parameter != undefined) && (field.restriction_parameter != '')) {
							strTemp = strTemp.replace(/(name=\")([A-Za-z0-9_]*)(\")/, '$1$2$3 restrictionParameterName="' + field.restriction_parameter + '"');
						}
						
						// only for editforms showSelectValueAction
						// if (pattern.match(/editform/) && tgrp.fields[j].showSelectValueAction.toString().match(/true|false/)){
						if (pattern.match(/editform/) && tgrp.fields[j].hasOwnProperty("showSelectValueAction")){
							// if (tgrp.fields[j].showSelectValueAction != undefined){

							if ((tgrp.fields[j].showSelectValueAction == "true") || (tgrp.fields[j].showSelectValueAction == true) || (tgrp.fields[j].showSelectValueAction == "false") || (tgrp.fields[j].showSelectValueAction == false)){
								// specially handle drilldown-popup pattern
								if (pattern.match(/editform-drilldown-popup/)) {
									strTempPopUpFlds = strTempPopUpFlds.replace('/>', ' showSelectValueAction="' + tgrp.fields[j].showSelectValueAction + '"/>');
								} else {									
									strTemp = strTemp.replace('/>', ' showSelectValueAction="' + tgrp.fields[j].showSelectValueAction + '"/>');
								}		
							}					
						}
						
						if(pattern.match(/editform|viewdef-report/) && measuresArr){
							if(hasShowTotalsForField(measuresArr, tgrp.fields[j].table_name, tgrp.fields[j].field_name)){
								var fieldTagPos = strTemp.indexOf('>');
								if(strTemp.charAt(fieldTagPos-1) == "/"){
									strTemp = strTemp.replace('/>', ' showTotals="true"/>');
								} else {
									strTemp = strTemp.replace('>', ' showTotals="true">');
								}								
							}
						}
						
						if(field['is_virtual'] == false){
							strPopUpFlds += strTempPopUpFlds;
						}
												
						// insert controlType="color" for hpattern acad fields
						if (index == 0 && pattern.match(/paginated-highlight/gi) && field.afm_type == 'HPattern Acad Ext') {
							strTemp = strTemp.replace('/>', 'controlType="color">\n            <title translatable="true">Color</title>\n        </field>');
						}

						if (index == 0 && pattern.match(/columnreport/gi)) {
							if (valueExists(field.rowspan)){
								strTemp = strTemp.replace('/>', ' rowspan="' + field.rowspan + '"/>');
							}
							if (valueExists(field.colspan)){
								strTemp = strTemp.replace('/>', ' colspan="' + field.colspan + '"/>');
							}

							if (!field.is_virtual && valueExistsNotEmpty(field.ml_heading_english_original) && (field.ml_heading_english_original != field.ml_heading_english.replace('  ', ' '))){
								strTemp = strTemp.replace('/>', '>\n            <title translatable="true">' + field.ml_heading_english + '</title>\n        </field>');
							}
						}						
						
						// insert ml heading for virtual field
						if(field.is_virtual){
							// handling drilldowns
							// strTemp = strTemp.replace(/(<\/field>)([\n|\r|\s]*)$/, '    <title translatable="true">' + field.ml_heading + '</title>\n        </field>$2');
							strTemp = strTemp.replace(/(<\/field>)([\n|\r|\s]*)$/, '    <title translatable="true">' + field.ml_heading_english + '</title>\n        </field>$2');
							// regularly
							//strTemp = strTemp.replace(/(\/>)([\n|\r|\s]*)$/, '>\n            <title translatable="true">' + field.ml_heading + '</title>\n        </field>$2');
							strTemp = strTemp.replace(/(\/>)([\n|\r|\s]*)$/, '>\n            <title translatable="true">' + field.ml_heading_english + '</title>\n        </field>$2');
							strTemp = strTemp +  '\n        <!--ViewDef-VirtualField-Title-End-->';
						}
						
						
						fieldListSectionContents += strTemp + "\n        ";
					}
				}

				if(tgrp.hasOwnProperty('indexField') && !hasFieldsWithSameName(tgrp.fields)){				
					var indexField = tgrp.indexField;
					fieldListSectionContents += '<indexField table=' + dqte(indexField.table_name) + ' name=' + dqte(indexField.field_name) + '/>\n        ';
				} 
				
				// only for editforms showSelectValueAc
				if (pattern.match(/editform-drilldown-popup/)) {					
					var editPopupRegExp = /[\s]*\<\!--ViewDef-DataTgrp-PanelFields-EditformDrilldownPopup-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DataTgrp-PanelFields-EditformDrilldownPopup-End-->[\n|\r|\s]*/gi;
					this.convertedView = this.convertedView.replace(editPopupRegExp, "    " + strPopUpFlds + "    ");
				}											
			}
			
            // insert any sort fields
            var sortFieldTemplateText = '<sortField name="fl_id" table="rm" ascending="true" />';
			if ( (!(pattern.match(/paginated/gi) && hasMeasures)) && (!pattern.match(/paginated-highlight/gi)) ) {
				for (k = 0; k < tgrp.sortFields.length; k++) {
					var strTemp = sortFieldTemplateText.replace(/(table=\")([A-Za-z0-9_]*)(\")/, "$1" + tgrp.sortFields[k].table_name + "$3");
					strTemp = strTemp.replace(/(name=\")([A-Za-z0-9_]*)(\")/, "$1" + tgrp.sortFields[k].field_name + "$3");
					strTemp = strTemp.replace(/(ascending=\")([A-Za-z0-9_]*)(\")/, "$1" + tgrp.sortFields[k].isAscending + "$3");
					fieldListSectionContents += strTemp + "\n        ";
				}

			}
            
            // rtrim field list
            fieldListSectionContents = rtrim(fieldListSectionContents);
            
            this.convertedView = this.convertedView.replace(objregexPattern, "    " +fieldListSectionContents + "\n    ");
        } 

    },
           
    /**
     * Replace grouping axis
     *
     * @param	None
     * @return	None
     *
     */
    replaceGroupingAxis: function(tgrpndx){
        var lastIndex = this.view.tableGroups.length - 1;
        var dimensionsArr = this.view.tableGroups[tgrpndx - 1].sortFields;
        var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)];
        var pattern = tabsFrame.patternRestriction;
        var view = tabsFrame.newView;
        var showLabel = "true";
        if (view.chartProperties['showLabel']) {
            showLabel = view.chartProperties['showLabel'];
        }
        
        var markerId = tgrpName + '-GroupingAxis';
        var groupingAxisTemplate = getTemplate(tgrpndx, markerId);
        var groupingAxisTemplateNoMarker = getTemplateWithoutMarker(tgrpndx, markerId);
        var titleRegExp = /(\<title.*>)([\n|\r|\s\D\d\W\w]*)(\<\/title>)/gi;
        
        // var objregexPattern = /\<\!--ViewDef-DataTgrp-GroupingAxis-Begin-->[\n|\r|\s\D\d\W\w]*<!--ViewDef-DataTgrp-GroupingAxis-End-->/gi;      
        var strGroupingAxis = "";
        for (k = 0; k < dimensionsArr.length; k++) {
            //var grouping_heading = dimensionsArr[k].ml_heading.replace(/[\n|\r]/, " ");
            var grouping_heading = dimensionsArr[k].ml_heading_english.replace(/[\n|\r]/, " ");
            
            if ((tgrpndx == 2 ) && pattern.match(/chart-2d/gi)){
             	if ((dimensionsArr[k].groupByDate != '') && (dimensionsArr[k].groupByDate != 'undefined') && (pattern.match(/summary-chart/gi))) {
             		/*
                strGroupingAxis += '<secondaryGroupingAxis table="' + dimensionsArr[k].table_name + '" field="' + dimensionsArr[k].groupByDate +  '"> \n';
                strGroupingAxis += '            <title translatable="true">' + grouping_heading + ' (grouped by ' + dimensionsArr[k].groupByDate + ')</title> \n';
                strGroupingAxis += '        </secondaryGroupingAxis>\n        ';
                */
                strGroupingAxis = getTemplateWithNewAttributeValue(groupingAxisTemplateNoMarker, "table", dimensionsArr[k].table_name);
               	strGroupingAxis = getTemplateWithNewAttributeValue(strGroupingAxis, "field", dimensionsArr[k].groupByDate);
               	strGroupingAxis = strGroupingAxis.replace(titleRegExp, "$1" + grouping_heading + ' (grouped by ' + dimensionsArr[k].groupByDate + ')$3');    
               }
               else {
               	strGroupingAxis = getTemplateWithNewAttributeValue(groupingAxisTemplateNoMarker, "table", dimensionsArr[k].table_name);
               	strGroupingAxis = getTemplateWithNewAttributeValue(strGroupingAxis, "field", dimensionsArr[k].field_name);
               	strGroupingAxis = strGroupingAxis.replace(titleRegExp, "$1" + grouping_heading + '$3');              	
               }           	
            } else {
            	 // add line and spacing ONLY when more than one <groupingAxis>
            	 if (k > 0){
            	 	 strGroupingAxis += '\n        ';
            	 }
            	 if ((dimensionsArr[k].groupByDate != '') && (dimensionsArr[k].groupByDate != 'undefined') && (pattern.match(/summary-chart/gi))) {
                strGroupingAxis += '<groupingAxis ';
                if (pattern.match(/chart-2d/gi)){
                	  var dsId = getAttributeValue(groupingAxisTemplateNoMarker, "dataSource");
                	  strGroupingAxis += 'dataSource="' + dsId + '" ';
                } 
                strGroupingAxis += 'table="' + dimensionsArr[k].table_name + '" field="' + dimensionsArr[k].groupByDate + '" showLabel="' + showLabel + '"> \n';
                strGroupingAxis += '            <title translatable="true">' + grouping_heading + ' (grouped by ' + dimensionsArr[k].groupByDate + ')</title> \n';
                strGroupingAxis += '        </groupingAxis>';

               } else {

                strGroupingAxis += '<groupingAxis ';
                if (pattern.match(/chart-2d/gi)){
                	  var dsId = getAttributeValue(groupingAxisTemplateNoMarker, "dataSource");
                	  strGroupingAxis += 'dataSource="' + dsId + '" ';
                }
                strGroupingAxis += 'table="' + dimensionsArr[k].table_name + '" field="' + dimensionsArr[k].field_name + '" showLabel="' + showLabel + '"> \n';
                strGroupingAxis += '            <title translatable="true">' + grouping_heading + '</title> \n';
                strGroupingAxis += '        </groupingAxis>'; 
                // chart2d
                // strGroupingAxis += '        </groupingAxis>';
               }
            	/*
            	if ((dimensionsArr[k].groupByDate != '') && (dimensionsArr[k].groupByDate != 'undefined') && (pattern.match(/summary-chart/gi))) {
                strGroupingAxis += '<groupingAxis table="' + dimensionsArr[k].table_name + '" field="' + dimensionsArr[k].groupByDate + '" showLabel="' + showLabel + '"> \n';
                strGroupingAxis += '            <title translatable="true">' + grouping_heading + ' (grouped by ' + dimensionsArr[k].groupByDate + ')</title> \n';
                strGroupingAxis += '        </groupingAxis>\n        ';
               }
               else {
                strGroupingAxis += '<groupingAxis table="' + dimensionsArr[k].table_name + '" field="' + dimensionsArr[k].field_name + '" showLabel="' + showLabel + '"> \n';
                strGroupingAxis += '            <title translatable="true">' + grouping_heading + '</title> \n';
                strGroupingAxis += '        </groupingAxis>\n        ';
               }
               */
            }
        }

        this.convertedView = this.convertedView.replace(groupingAxisTemplate, strGroupingAxis);
        // this.convertedView = this.convertedView.replace(objregexPattern, strGroupingAxis);
    },
    
    /**
     * Replace Data axis
     *
     * @param	None
     * @return	None
     *
     */
    replaceDataAxis: function(tgrpndx){
        // var lastIndex = this.view.tableGroups.length - 1;
        var view = tabsFrame.newView;
        var measuresArr = view.tableGroups[tgrpndx - 1].measures;
        var objregexPattern = /[\s]*\<\!--ViewDef-DataTgrp-DataAxis-Begin-->[\n|\r|\s\D\d\W\w]*<!--ViewDef-DataTgrp-DataAxis-End-->/gi;
        var strDataAxis = "";
        
        var labelPosition = "none";
        if (view.chartProperties['labelPosition']) {
            labelPosition = view.chartProperties['labelPosition'];
        }
        
        var showLabel = "true";
        if (view.chartProperties['showLabel']) {
            showLabel = view.chartProperties['showLabel'];
        }
        
        var labelRotation = 0;
        if (view.chartProperties['labelRotation']) {
            showLabel = view.chartProperties['labelRotation'];
        }
        
        var autoCalculateTickSizeInterval = "true";
        if (view.chartProperties['autoCalculateTickSizeInterval']) {
            autoCalculateTickSizeInterval = view.chartProperties['autoCalculateTickSizeInterval'];
        }
        
        var tickSizeInterval = 1000;
        if (view.chartProperties['tickSizeInterval']) {
            tickSizeInterval = view.chartProperties['tickSizeInterval'];
        }

	 	if (measuresArr && measuresArr.length > 0){
        	for (k = 0; k < measuresArr.length; k++) {
            	var stats = measuresArr[k].stats;
            	for (x = 0; x < stats.length; x++) {
            			var stat = stats[x]; 

                	strDataAxis += '<dataAxis table="' + measuresArr[k].table_name + '" field="' + createStatPrefix(stat) + "_" + measuresArr[k].field_name + '" showLabel="' + showLabel + '" labelPosition="' + labelPosition + '" labelRotation="' + labelRotation + '" autoCalculateTickSizeInterval="' + autoCalculateTickSizeInterval;
                	if (autoCalculateTickSizeInterval == "false") {
                    	strDataAxis += '" tickSizeInterval="' + tickSizeInterval;
                	}
                	
                	if (view.chartProperties['controlType'] == 'columnLineChart' && k == measuresArr.length-1) {
                		strDataAxis += '" type="line';
                	}
                	
                	strDataAxis += '"> \n';
                	var data_heading = measuresArr[k].ml_headings[x].replace(/[\n|\r]/, " ");
                	    
                	strDataAxis += '            <title translatable="true">' + data_heading + ' (' + stat + ')' + '</title> \n';
                	strDataAxis += '        </dataAxis>\n        ';
            	}
        	}
		
		}

        this.convertedView = this.convertedView.replace(objregexPattern, '\n        ' + rtrim(strDataAxis) );
    },
       	   	       	    
    /**
     * Replace MDX
     *		
     * @param	None
     * @return	None
     *
     */
    replaceMDXSection: function(tgrpndx){

        var view = tabsFrame.newView;
        var pattern = tabsFrame.patternRestriction;
        // var lastIndex = view.tableGroups.length - 1;
        var mdxContents = "";
        var tgrp = view.tableGroups[tgrpndx - 1];
        var measuresArr = tgrp.measures;
        var dimensionsArr = tgrp.sortFields;
              	
        var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)];
        if(pattern.match(/paginated/gi)){
        	tgrpName = 'DataTgrp';
        }

        if (((!measuresArr) || (measuresArr.length == 0))) {
//        if (((!measuresArr) || (measuresArr.length == 0)) && (!pattern.match(/chart-2d/)gi) {
            alert(getMessage("noStatistics"));
            mdxContents = "";
            tabsFrame.selectTab('page4');
            return;
        }
        else 
            if (((dimensionsArr == undefined) || (dimensionsArr == '') || (dimensionsArr.length == 0)) && !(pattern.match(/paginated-stats-data/gi) && (tgrpndx == 1)) && !(pattern.match(/paginated/gi) && (!hasSummarizeBySortOrder(tgrp)))) {
                alert(getMessage("noGrouping"));
                mdxContents = "";
                tabsFrame.selectTab('page4');
                return;
            }
            else {
            	  // TODO: use getMarkerContents

                // Get mdx-related all patterns first
               //  var  mdxPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-MDX-Begin-->)([\\n|\\r|\\s\\D\\d\\W\\w]*)(<!--ViewDef-' + tgrpName + '-MDX-End-->[\\s]*)', 'gi' );
                var  mdxPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-MDX-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-MDX-End-->[\\s]*)', 'gi' );
                // get the template
                var temp = String(this.originalPattern.match(mdxPattern));
                // remove the template marker
                var mdx = temp.replace(mdxPattern, '$2    ');

                var countPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Count-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Count-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(countPattern));
                var count = temp.replace(countPattern, '$2    ');

                var sumPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Sum-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Sum-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(sumPattern));
                var sum = temp.replace(sumPattern, '$2    ');
                
                var avgPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Avg-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Avg-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(avgPattern));
                var avg = temp.replace(avgPattern, '$2    ');                

                var countPercentPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Count-Percent-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Count-Percent-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(countPercentPattern));
                var countPercent = temp.replace(countPercentPattern, '$2    '); 
                
                var sumPercentPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Sum-Percent-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Sum-Percent-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(sumPercentPattern));
                var sumPercent = temp.replace(sumPercentPattern, '$2    '); 
                
                // var avgPercentPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Measure-Avg-Percent-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Measure-Avg-Percent-End-->[\\s]*)', 'gi' );
                // var temp = String(this.originalPattern.match(avgPercentPattern));
                // var avgPercent = temp.replace(avgPercentPattern, '$2    '); 
                               
                var dimensionPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Dimension-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Dimension-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(dimensionPattern));
                var dimension = temp.replace(dimensionPattern, '$2    '); 

                var regexPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Dimension-Field-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + tgrpName + '-Dimension-Field-End-->[\\s]*)', 'gi' );
                var temp = String(this.originalPattern.match(regexPattern));
                var field = temp.replace(regexPattern, '$2    '); 
                                                     
                // var columnPattern = /(column=")(.*)(")/gi;
                var baseFieldPattern = /(baseField=")(.*?)(")/gi;
                var calculatedNamePattern = /(name=")(.*?)(")/gi;
                var formulaPattern = /(formula=")(.*?)(")/gi;
                var dataTypePattern = /(dataType=")(.*?)(")/gi;
                var decimalsPattern = /(decimals=")(.*?)(")/gi;
                //																					$1				$2   $3	$4				$5	  $6  
                // var fieldDimensionPattern = /[\n|\r|\s]*(<field name=")(.*)(")(.*table=")(.*"?)( .* \/>[\n|\r|\s]*)/i;	  				
                // var fieldDimensionPattern = /[\n|\r|\s]*(<field table=")(.*)(")(.*name=")(.*?")(.*\/>[\n|\r|\s]*)/i;
                var fieldDimensionPattern = /[\s]*(<field table=")(.*)(")(.*name=")(.*?")(.*\/>)/i;
                field = field.match(fieldDimensionPattern);
                field = field[0];

                var dimPattern = /(name=")(.*)(")(.*)(table=")(.*)(")(.*)(column=")(.*)(")(.*)/gi;
                var titlePattern = /(itle translatable="true">)(.*)(\<\/)/gi;
                var dataSourcePattern = /([\n|\r|\s]*<\/dataSource>)/;
                
                var mdxContents = "";
                var measures = "";
                var fieldDimension = "";
                var dimensions = "";
                var temp = "";
		
                for (i = 0; i < measuresArr.length; i++) {
                    var stats = measuresArr[i].stats;
                    
                    for (x = 0; x < stats.length; x++) {
                        //var ml_heading = measuresArr[i].ml_headings[x].replace(/[\n|\r]/, " ");
                        var ml_heading_english = (measuresArr[i].ml_headings_english[x]) ? measuresArr[i].ml_headings_english[x].replace(/[\n|\r]/, " ") :  measuresArr[i].ml_heading_english;
                        var bNoSummary= (hasSummarizeBySortOrder(tgrp) == false) && (!pattern.match(/summary/gi));

                        if ((stats[x].toLowerCase() == "sum")) {                       	
                        		if( bNoSummary && !pattern.match(/highlight-thematic/gi) ){
                        			measures += "    <field table=" + dqte(measuresArr[i].table_name);
                        			measures += " name=" + dqte(measuresArr[i].field_name);
                        			measures += ' showTotals="true"/>\n    ';
                        		} else {
                            	temp = sum.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                            	temp = temp.replace(calculatedNamePattern, "$1sum_" + measuresArr[i].field_name + "$3");
                            	// measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('sum') + "$3");
                            	measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('sum') + "$3");
                            }
                        }
                        if ((stats[x].toLowerCase() == "avg")) {
                        		if( bNoSummary  ){
                        		} else {                       			
                            	temp = avg.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                            	temp = temp.replace(calculatedNamePattern, "$1avg_" + measuresArr[i].field_name + "$3");
                            	// measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('avg') + "$3");
                            	measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('avg') + "$3");
                          	}
                        }
                        if ((stats[x].toLowerCase() == "count")) {
                        		if( !bNoSummary || pattern.match(/highlight-thematic/gi) ){
                            	temp = count.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                            	temp = temp.replace(calculatedNamePattern, "$1ct_" + measuresArr[i].field_name + "$3");
                            	// measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('count') + "$3");
                            	measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('count') + "$3");
                            }
                        }

                        if ((stats[x].toLowerCase().match(/sum_percent|sum-percent/gi))) {
                        		if( !bNoSummary ){
                            	temp = sumPercent.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                            	temp = temp.replace(calculatedNamePattern, "$1sp_" + measuresArr[i].field_name + "$3");                           
                            	temp = temp.replace(/area_comn_ocup|cost_est_total|cost_estimated/g, measuresArr[i].field_name);
                            	// measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('sumPercent') + "$3");
                            	measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('sumPercent') + "$3");
                          	}
                        }
                        // if ((stats[x].toLowerCase() == "avg_percent")) {
                        // 	temp = avgPercent.replace(/rm|wrtr|wr/g, measuresArr[i].table_name);
                        //    temp = temp.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                        //    temp = temp.replace(calculatedNamePattern, "$1avg_percent_" + measuresArr[i].field_name + "$3");                            
                        //    temp = temp.replace(/area_comn_ocup|cost_est_total|cost_estimated/g, measuresArr[i].field_name);
                        //    //measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('avgPercent') + "$3");
                        //		measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('avgPercent') + "$3");
                        // }
                        if ((stats[x].toLowerCase().match(/count_percent|count-percent/gi))) {
                        	if( !bNoSummary ){
                            temp = countPercent.replace(baseFieldPattern, "$1" + measuresArr[i].table_name + "." + measuresArr[i].field_name + "$3");
                            temp = temp.replace(calculatedNamePattern, "$1cp_" + measuresArr[i].field_name + "$3");
                            temp = temp.replace(/area_comn_ocup|cost_est_total|cost_estimated/g, measuresArr[i].field_name);
                            // measures += temp.replace(titlePattern, "$1" + ml_heading + " " + getMessage('countPercent') + "$3");
                            measures += temp.replace(titlePattern, "$1" + ml_heading_english + " " + getMessage('countPercent') + "$3");
                          }
                        }
                    }
                }
   
                if (!(pattern.match(/paginated/gi) && (!hasSummarizeBySortOrder(tgrp))) ) {
					if(valueExists(dimensionsArr)){
						
						// sortFields array may not have all attributes
						var fldsArr = tgrp.fields;
						if(fldsArr){
							for(var b=0; b<dimensionsArr.length; b++){
								for(var c=0; c<fldsArr.length; c++){
									if((dimensionsArr[b].table_name == fldsArr[c].table_name) && (dimensionsArr[b].field_name == fldsArr[c].field_name)){
										dimensionsArr[b].is_virtual = fldsArr[c].is_virtual;
										dimensionsArr[b].sql = fldsArr[c].sql;
										dimensionsArr[b].data_type = fldsArr[c].data_type;
									}       			
								}        		
							}
						}

					for (var j = 0; j < dimensionsArr.length; j++) {
						var dimTemp = dimensionsArr[j];
						var is_virtual = dimensionsArr[j].is_virtual;
						var sqlObj = dimensionsArr[j].sql;
						if(sqlObj == 'string'){
							sqlObj = eval('(' + dimensionsArr[j].sql + ')');
						}
						var data_type = dimensionsArr[j].data_type;
						var temp = field;
						// embed vf marker
						if(is_virtual == 'true' || is_virtual == true){						
							temp = temp.replace(field, '\n        <!--ViewDef-VirtualField-Begin-->' + field + '\n        <!--ViewDef-VirtualField-End-->');
						}

						
						if ((dimTemp['data_type'] == 'Date') && (this.patternName.match(/summary-report|paginated/))) {
					
							if ((dimTemp.groupByDate != '') && (dimTemp.groupByDate != undefined) && (dimTemp.groupByDate != 'undefined')) {
								temp = temp.replace(fieldDimensionPattern, "\n        $1" + dimensionsArr[j].table_name + "$3$4" + dimensionsArr[j].groupByDate + '"' + ' baseField="' + dimensionsArr[j].table_name + '.' + dimensionsArr[j].field_name + '" formula="' + dimensionsArr[j].groupByDate + '" dataType="text"' + "$6");
							} else {
								// insert dateType="date" attribute  
								temp = temp.replace(fieldDimensionPattern, "\n        $1" + dimensionsArr[j].table_name + "$3$4" + dimensionsArr[j].field_name + '"' + ' dataType="date"' + "$6");
							}
							if(is_virtual == 'true' || is_virtual == true){						
								var strToReplaceWith = ' groupBy="true">    ' + generateVFSQLdialects(sqlObj) + '\n        </field>';
								temp = temp.replace('groupBy="true"/>', strToReplaceWith);
							}
							
							fieldDimension += temp;

						} else {
							if ((dimTemp.groupByDate != '') && (dimTemp.groupByDate != undefined) && (this.patternName.match(/summary-chart/))) {
								// groupByDate in charts
								fieldDimension += temp.replace(fieldDimensionPattern, "\n        $1" + dimensionsArr[j].table_name + "$3$4" + dimensionsArr[j].groupByDate + '"' + ' baseField="' + dimensionsArr[j].table_name + '.' + dimensionsArr[j].field_name + '" formula="' + dimensionsArr[j].groupByDate + '" dataType="text"' + "$6");
							} else if ( !(pattern.match(/paginated-highlight-thematic/gi) && (tgrpndx == 3)) ){
								temp = temp.replace(fieldDimensionPattern, "\n        $1" + dimensionsArr[j].table_name + "$3$4" + dimensionsArr[j].field_name + '"' + "$6");
								// add virtual field attributes				
								if(is_virtual == 'true' || is_virtual == true){
									var strToReplaceWith = 'dataType=' + dqte(data_type);
									if(data_type == 'number'){
										strToReplaceWith += ' decimals=' + dqte('2');
									}									
									strToReplaceWith += ' groupBy="true">    ' + generateVFSQLdialects(sqlObj) + '\n        </field>';	
									temp= temp.replace('groupBy="true"/>', strToReplaceWith);
								}													
								fieldDimension += temp; 													
							}													
						}
		
						//dimension = dimension.replace(dimPattern, "$1" + dimensionsArr[j].ml_heading + "$3$4$5" + dimensionsArr[j].table_name + "$7 " + "$9" + dimensionsArr[j].field_name + "$11$12");
						//dimension = dimension.replace(titlePattern, "$1" + dimensionsArr[j].ml_heading + "$3");
						dimension = dimension.replace(dimPattern, "$1" + dimensionsArr[j].ml_heading_english + "$3$4$5" + dimensionsArr[j].table_name + "$7 " + "$9" + dimensionsArr[j].field_name + "$11$12");
						dimension = dimension.replace(titlePattern, "$1" + dimensionsArr[j].ml_heading_english + "$3");
					}
				}
				}

                // dimension = dimension.replace(regexPattern, "$1" + fieldDimension + "$5");
                dimension = dimension.replace(regexPattern, fieldDimension + '\n        ');

                // clear the count, sum, avg, countpercent, sumpercent  sections
                mdxContents = trim(mdx.replace(countPattern, ""));
                
                mdxContents = trim(mdxContents.replace(sumPattern, ""));
                
                mdxContents = trim(mdxContents.replace(avgPattern, ""));
                
                mdxContents = trim(mdxContents.replace(countPercentPattern, ""));
                
                mdxContents = trim(mdxContents.replace(sumPercentPattern, measures));
                
                // mdxContents = trim(mdxContents.replace(sumPercentPattern, ""));
   
                // replace the avg sections with all new measures
                // mdxContents = trim(mdxContents.replace(avgPercentPattern, measures));

                // replace the dimensions section with new dimensions				  			
                mdxContents = trim(mdxContents.replace(dimensionPattern,  dimension));
            }
        
        // return the new mdx section
        mdxContents = '    ' + trim(mdxContents.replace(/\n\s+\r\n/gi, ""));
        return mdxContents;
    },
    
    /**
     * Replace group by dates
     *	
     * @param	None
     * @return	None
     *
     */
    replaceGroupByDate: function(tgrpndx){

    	  var view = tabsFrame.newView;
        var sortFields = view.tableGroups[tgrpndx - 1].sortFields;
        var chart2d = this.patternName.match(/chart-2d/gi) ? true : false;

        if (sortFields && sortFields.length > 0){ 
        	if ((sortFields.length == 1) && !chart2d){
        		this.replaceGroupByDate1D(tgrpndx); 
        	}
        	if ((sortFields.length == 2) || (chart2d)){
        		this.replaceGroupByDate2D(tgrpndx);
        		if(tgrpndx == 1){
        			this.replacePrimaryGroupingRestriction(sortFields[0]);
        			this.replaceChart2DParameter(sortFields[0]);
        		}
        	}
        }
    },

    replacePrimaryGroupingRestriction: function(sf){
        var primaryGrpMarkerId = 'DrillDownTgrp-Chart2D-Primary-Grouping-Restriction';
        var regExp = new RegExp('(<\\!--ViewDef-' + primaryGrpMarkerId + '-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + primaryGrpMarkerId + '-End-->)', 'gi' );
        var restriction = '';
        var groupByDate = sf.groupByDate;           	            	            	
        if ((groupByDate != '') && (groupByDate != undefined) && (groupByDate != 'undefined')) {    
        		var formula = this.getGroupByDateSqlFormula(sf.groupByDate);       
        		restriction += "                           if(name == '" + sf.table_name + "." + sf.groupByDate + "'){ \n"; 
        		restriction += "                              restriction += \"${sql." + formula + "('" + sf.table_name + "." + sf.field_name + "')} = '\" + selectedChartData[i] + \"' AND \"; \n";
        		restriction += "                           } \n";
        } else {
        		restriction += "                           if(name == '" + sf.table_name + "." + sf.field_name + "'){ \n"; 
        		restriction += "                              restriction += \"" + sf.field_name + " = '\" + selectedChartData[i] + \"' AND \";\n";
        		restriction += "                           } \n";       	
        } 
        this.convertedView = this.convertedView.replace(regExp, restriction);       	
    }, 
    
    replaceChart2DParameter: function(sf){ 
    	var markerId = 'DrillDownTgrp-Chart-Parameter';
      var regExp = new RegExp('(<\\!--ViewDef-' + markerId  + '-Begin-->)([\\s\\S|\\n|\\r]*)(<!--ViewDef-' + markerId  + '-End-->)', 'gi' );
      var newParameter = getTemplateWithoutMarker(1, markerId); 
			if(valueExistsNotEmpty(sf.groupByDate)){
      	var formula = this.getGroupByDateSqlFormula(sf.groupByDate);
      	var fieldSql =  '${sql.' + formula + "('" + sf.field_name + "')}"; 
      	newParameter = newParameter.replace("bl_id",  fieldSql);
      }else{
      	newParameter = newParameter.replace("bl_id",  sf.field_name);
      }
      this.convertedView = this.convertedView.replace(regExp, newParameter);
    }, 
    
    getGroupByDateSqlFormula: function(str){ 
    	var formula = str;
    	switch (str) {
        case "year":
        		formula = 'yearOf';
            break;
        case "quarter":
        		formula = 'yearQuarterOf';
            break;           
        case "month":
        		formula = 'yearMonthOf';
            break;            
        case "day":
        		formula = 'yearMonthDayOf';
            break;
        case "week":
        		formula = 'yearWeekOf';
            break;
    	}
    	return formula;
    },	  
    
    replaceGroupByDate2D: function(tgrpndx){
        var view = tabsFrame.newView;
        var sf = view.tableGroups[tgrpndx - 1].sortFields;
        var restrictions = view.tableGroups[tgrpndx - 1].parsedRestrictionClauses;
        var patternCC = convertToCamelCase(this.patternName);
        var chart2d = this.patternName.match(/chart-2d/gi) ? true : false;

        var callFunctionRegExp = /[\s]*\<\!--ViewDef-Chart-Popup-Event-GroupByDate-CallFunction-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-CallFunction-End-->[\s]*/gi;
        var parameterRegExp = /[\s]*\<\!--ViewDef-Chart-Popup-Event-GroupByDate-Parameter-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-Parameter-End-->[\s]*/gi;
        var restrictionRegExp = /\<\!--ViewDef-Chart-Popup-Event-GroupByDate-Restriction-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-Restriction-End-->[\s*]/gi;
        var eventOpenDialogRegExp = /([\s]*\<\!--ViewDef-Chart-Popup-Event-OpenDialog-Begin--\>)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-Chart-Popup-Event-OpenDialog-End-->)/gi;
                
        var callFunction = '\n            ';
        callFunction += '<command type="callFunction" functionName="setDrilldownRestriction"/>\n';
        callFunction += '            <script language="javaScript"> \n';
        callFunction += '                function setDrilldownRestriction(obj){  \n';
        callFunction += '                  if (obj.restriction.clauses.length > 0){   \n';
        callFunction += "                      var grid = View.getControl('', 'panel_" + patternCC + "_popup'); \n";
        callFunction += "                      var restriction = ''; \n";
        
        if (pattern.match(/chart/)){
        	callFunction += "                      var selectedChartData = obj.selectedChartData; \n";
        	callFunction += "                      for(i in selectedChartData){ \n";  
        	callFunction += "                           var name = i; \n"; 
        }else{
        	callFunction += "                      var clauses = obj.restriction.clauses; \n";
        	callFunction += "                      for(var i=clauses.length-1; i>-1; i--){ \n";
        	callFunction += "                           if(i != clauses.length-1){ \n";
        	callFunction += "                              restriction += ' AND '; \n";        
        	callFunction += "                           } \n";    
        	callFunction += "                           var name = clauses[i].name; \n";   
      	} 
                                           
        var parameter = '';
        var restriction = '';

       
		if (sf && sf.length > 0){ 
        	for (var i = 0; i < sf.length; i++) {
            	var groupByDate = sf[i].groupByDate; 
            	switch (sf[i].groupByDate) {
            		case 'year':
            			break;
            		case 'month':
            			groupByDate = 'yearMonth';
            			break;
            		case 'quarter':
            			groupByDate = 'yearQuarter';
            			break;
            		case 'week':
            			groupByDate = 'yearWeek';
            			break;
            		case 'day':
            			groupByDate = 'yearMonthDay';
            			break;
            		default:
            	}
            	
							var formula = this.getGroupByDateSqlFormula(sf[i].groupByDate);
                         	          	            	            	
            	if ((groupByDate != '') && (groupByDate != undefined) && (groupByDate != 'undefined')) {           
                	if (sf[i].groupByDate.match(/year|month|day|quarter|week/)) {
                		  callFunction += "                           if(name == '" + sf[i].table_name + "." + sf[i].groupByDate + "'){ \n"; 
                		  /*                   
                    	if (this.patternName.match(/chart/)) {
                         	callFunction += "                              restriction += \"${sql." + groupByDate + "Of('" + sf[i].table_name + "." + sf[i].field_name + "')} = '\" + selectedChartData[i] + \"' AND \"; \n";
                    	}
                    	else {
                        	callFunction += "                              restriction += \"${sql." + groupByDate + "Of('" + sf[i].table_name + "." + sf[i].field_name + "')} = '\" + clauses[i].value + \"' \"; \n";
                    	}  
											*/
											if (this.patternName.match(/chart/)) {
 													callFunction += "                              restriction += \"${sql." + formula + "('" + sf[i].table_name + "." + sf[i].field_name + "')} = '\" + selectedChartData[i] + \"' AND \"; \n";                     
                    	}
                    	else {
                        	callFunction += "                              restriction += \"${sql." + groupByDate + "Of('" + sf[i].table_name + "." + sf[i].field_name + "')} = '\" + clauses[i].value + \"' \"; \n";  				
                    	} 
                      callFunction += "                           } \n";
                    	this.convertedView = this.convertedView.replace(eventOpenDialogRegExp, '');
                	}
            	} else if (pattern.match(/summary/gi)){
            		  callFunction += "                           if(name == '" + sf[i].table_name + "." + sf[i].field_name + "'){ \n"; 
            			// parameter += '    <parameter name="' + sf[i].table_name + '.' + sf[i].field_name + '" dataType="text" value=""/>\n    ';
            			if (this.patternName.match(/chart/)) {
                      callFunction += "                              restriction += \"" + sf[i].table_name + "." + sf[i].field_name + " = '\" + selectedChartData[i] + \"' AND \";\n";
                  }else {
                      callFunction += "                              restriction += \"" + sf[i].table_name + "." + sf[i].field_name + " = '\" + clauses[i].value + \"' \";\n";
                  } 
                  callFunction += "                           } \n";
        			}
        	}
        } 
        
        if(chart2d){
        	this.convertedView = this.convertedView.replace(eventOpenDialogRegExp, '');
        } 
        // TODO: what about other restrictions?
        /*
        if ((restrictions != '') && (restrictions != undefined) && (restrictions != 'undefined')) {
        	restriction += ' AND (';
        	for (var j = 0; j <= restrictions.length; j++) {
        		var r = restrictions[j];
        		if ((r != '') && (r != undefined) && (r != 'undefined')) {
        			if (j > 0) {
        				restriction += r.relop + ' ';
        			}
        			restriction += r.table_name + '.' + r.field_name + ' ' + r.op + " '" + r.value + "'";
        		}
        	}
        	restriction += ')';
        }
        restriction += '"/>';
        */            	
        
        // insert marker to include primary grouping field in restriction restriction
        if (chart2d){
        	callFunction += "<!--ViewDef-DrillDownTgrp-Chart2D-Primary-Grouping-Restriction-Begin-->\n";                  	
        	callFunction += "                              <!--ViewDef-DrillDownTgrp-Chart2D-Primary-Grouping-Restriction-End-->\n";
        }	
        
        callFunction += "                      } \n";  
        if (patternCC.match(/chart/gi)){
        	callFunction += "                      restriction = restriction.substring(0, restriction.length - 5); \n";
        }          
        callFunction += '                      grid.refresh(restriction); \n';
        callFunction += '                      grid.show(true); \n';
        callFunction += '                      grid.showInWindow({ \n';
        callFunction += '                        width: 600, \n';
        callFunction += '                        height: 400 \n';
        callFunction += '                      }); \n';
        callFunction += '                  }  \n';
        callFunction += '                }   \n';  
        callFunction += '            </script>\n        ';
        
        this.convertedView = this.convertedView.replace(callFunctionRegExp, callFunction);
        
        this.convertedView = this.convertedView.replace(eventOpenDialogRegExp, '$2');
        
        this.convertedView = this.convertedView.replace(parameterRegExp, parameter);
        
        this.convertedView = this.convertedView.replace(restrictionRegExp, restriction);
    },
        
    replaceGroupByDate1D: function(tgrpndx){
        var view = tabsFrame.newView;
        // var lastIndex = view.tableGroups.length - 1;
        var sf = view.tableGroups[tgrpndx - 1].sortFields;
        var restrictions = view.tableGroups[tgrpndx - 1].parsedRestrictionClauses;
        var patternCC = convertToCamelCase(this.patternName);
        
        var callFunctionRegExp = /[\s]*\<\!--ViewDef-Chart-Popup-Event-GroupByDate-CallFunction-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-CallFunction-End-->[\s]*/gi;
        var parameterRegExp = /[\s]*\<\!--ViewDef-Chart-Popup-Event-GroupByDate-Parameter-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-Parameter-End-->[\s]*/gi;
        var restrictionRegExp = /[\s]*\<\!--ViewDef-Chart-Popup-Event-GroupByDate-Restriction-Begin--\>[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-Chart-Popup-Event-GroupByDate-Restriction-End-->[\s*]/gi;
        var eventOpenDialogRegExp = /([\s]*\<\!--ViewDef-Chart-Popup-Event-OpenDialog-Begin--\>)([.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-Chart-Popup-Event-OpenDialog-End-->)/gi;
                
        var callFunction = '\n            ';
        var parameter = '';
        var restriction = '';
        
		if (sf && sf.length > 0){ 

        	for (var i = 0; i < sf.length; i++) {
            	var groupByDate = sf[i].groupByDate;
            	if ((groupByDate != '') && (groupByDate != undefined) && (groupByDate != 'undefined')) {
                	switch (sf[i].groupByDate) {
                    	case 'year':
                        	break;
                    	case 'month':
                        	groupByDate = 'yearMonth';
                        	break;
                    	case 'quarter':
                        	groupByDate = 'yearQuarter';
                        	break;
                    	case 'week':
                        	groupByDate = 'yearWeek';
                        	break;
                    	case 'day':
                        	groupByDate = 'yearMonthDay';
                        	break;
                    	default:
                	}
            
                	if (sf[i].groupByDate.match(/year|month|day|quarter|week/)) {
                    	callFunction += '<command type="callFunction" functionName="setDrilldownRestriction"/>\n';
                    	callFunction += '            <script language="javaScript"> \n';
                    	callFunction += '                function setDrilldownRestriction(obj){  \n';
                    	callFunction += '                  if (obj.restriction.clauses.length > 0){   \n';
                    	callFunction += "                      var grid = View.getControl('', 'panel_" + patternCC + "_popup'); \n";
                    
                    	if (this.patternName.match(/chart/)) {
                        	callFunction += "                      grid.addParameter('" + sf[i].groupByDate + "', obj.selectedChartData['" + sf[i].table_name + "." + sf[i].groupByDate + "']); \n";
                    	}
                    	else {
                        	callFunction += "                      grid.addParameter('" + sf[i].groupByDate + "', obj.restriction.clauses[0].value); \n";
                    	}  
                    	callFunction += '                      grid.refresh(); \n';
                    	callFunction += '                      grid.show(true); \n';
                    	callFunction += '                      grid.showInWindow({ \n';
                    	callFunction += '                        width: 600, \n';
                    	callFunction += '                        height: 400 \n';
                    	callFunction += '                      }); \n';
                    	callFunction += '                  }  \n';
                    	callFunction += '                }   \n';  
                    	callFunction += '            </script>\n        ';
                    	                 
                    	parameter += '    <parameter name="' + sf[i].groupByDate + '" dataType="text" value=""/>';
                    	restriction += '\n        <restriction type="sql" sql="${sql.' + groupByDate + "Of('" + sf[i].table_name + "." + sf[i].field_name + "')} &lt;= ${parameters['" + sf[i].groupByDate + "']} AND ${sql." + groupByDate + "Of('" + sf[i].table_name + "." + sf[i].field_name + "')} &gt;= ${parameters['" + sf[i].groupByDate + "']}";
                    
                    	if ((restrictions != '') && (restrictions != undefined) && (restrictions != 'undefined')) {
                        	restriction += ' AND (';
                        	for (var j = 0; j <= restrictions.length; j++) {
                            	var r = restrictions[j];
                            	if ((r != '') && (r != undefined) && (r != 'undefined')) {
                                	if (j > 0) {
                                    	restriction += r.relop + ' ';
                                	}
                                
                                	restriction += r.table_name + '.' + r.field_name + ' ' + r.op + " '" + r.value + "'";
                            	}
                        	}
                        	restriction += ')';
                    	}
                    	restriction += '"/>';
 	
                    	this.convertedView = this.convertedView.replace(eventOpenDialogRegExp, '');
                	}
            	}
        	}
        } 
        this.convertedView = this.convertedView.replace(callFunctionRegExp, callFunction);
        
        this.convertedView = this.convertedView.replace(eventOpenDialogRegExp, '$2');
        
        this.convertedView = this.convertedView.replace(parameterRegExp, parameter);
        
        this.convertedView = this.convertedView.replace(restrictionRegExp, restriction);
    },
    
    /**
     * Replace paginated report properties.  These properties are in the <report> tag.
     *
     * @param	None
     * @return	None
     *
     */
    replacePaginatedProperties: function(){
        var view = tabsFrame.newView;
		var paginatedProperties = view.paginatedProperties;
		if (hasSummarizeBySortOrder(view.tableGroups[this.numberOfTgrpsInView - 1]) == false){
			this.convertedView = this.convertedView.replace(' type="grouping"', '');
		}	
		
		// need to refactor the spacing/pretty-print   
        var objregexPattern = /\<\!--ViewDef-Paginated-Properties-Begin-->[\n|\r|\s\D\d\W\w]*<!--ViewDef-Paginated-Properties-End-->[\s]*/gi;
	
		// create report tag		
		var strPaginatedProperties = '<report />\n\n    ';

		// loop through properties and insert values into the report tag
		for (var i in paginatedProperties) {
			if (paginatedProperties.hasOwnProperty(i)){
				strPaginatedProperties = strPaginatedProperties.replace('/>', i + '="' + paginatedProperties[i] + '" />');
			}
		}
	       
	   	// place new property values into view
        this.convertedView = this.convertedView.replace(objregexPattern, strPaginatedProperties);
    },
	
	/**
     * Replace paginated panel properties.  These properties are in the <panel> tag.
     *
     * @param	None
     * @return	None
     *
     */
    replacePaginatedPanelProperties: function(tgrpndx){

		var view = tabsFrame.newView;
		var paginatedPanelProperties = view.tableGroups[tgrpndx-1].paginatedPanelProperties;

		var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)];
		var objregexPattern = new RegExp('(<\\!--ViewDef-' + tgrpName + '-Paginated-Panel-Properties-Begin-->)([\\n|\\r|\\s\\D\\d\\W\\w]*)(<!--ViewDef-' + tgrpName + '-Paginated-Panel-Properties-End-->[\\s]*)', 'gi' );

		// get the template
        var temp = String(this.convertedView.match(objregexPattern));

		// remove the template marker
		var strPaginatedPanelProperties = temp.replace(objregexPattern, '$2    ');

		// loop through properties and replace values in template
		for (var i in paginatedPanelProperties) {
        	var regex = new RegExp(i + '\="(.*?)"');
			if (paginatedPanelProperties[i] == 'column') {
					strPaginatedPanelProperties = strPaginatedPanelProperties.replace(regex, i + '="' + paginatedPanelProperties[i] + '" columns="' + paginatedPanelProperties['column'] + '"');
			}
			else if (i == 'pageBreakBefore'){
				strPaginatedPanelProperties = strPaginatedPanelProperties.replace('>', ' ' + i + '=' + dqte(paginatedPanelProperties[i]) + '>');
			} else {
				strPaginatedPanelProperties = strPaginatedPanelProperties.replace(regex, i + '="' + paginatedPanelProperties[i] + '"');		
			} 
		}

		var tgrp = view.tableGroups[tgrpndx-1];
		var measuresArr = tgrp.measures;
		if(measuresArr){
			var bShowCount = (hasShowCount(measuresArr) && (hasSummarizeBySortOrder(tgrp) == false));
			if(bShowCount){
				strPaginatedPanelProperties = strPaginatedPanelProperties.replace('>', ' showCounts="true">');
			}
		}

	   	// place new property values into view
        this.convertedView = this.convertedView.replace(objregexPattern, strPaginatedPanelProperties);
    },

	/**
     * Replace panel properties.  These properties are in the <panel> tag.
     *
     * @param	None
     * @return	None
     *
     */
    replacePanelProperties: function(tgrpndx){
    	var view = tabsFrame.newView;
    	var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)];
    	var objregexPattern = new RegExp('(\\s*<\\!--ViewDef-' + tgrpName + '-Panel-Properties-Begin-->)([\\n|\\r|\\s\\D\\d\\W\\w]*)(<!--ViewDef-' + tgrpName + '-Panel-Properties-End-->[\\s]*)', 'gi' );

    	// get the template
    	var temp = String(this.convertedView.match(objregexPattern));
    	    	
    	// remove the template marker
    	var strPanel = temp.replace(objregexPattern, '\n$2    ');

    	var measuresArr = view.tableGroups[tgrpndx-1].measures;
    	if(measuresArr){
    		if(hasShowCount(measuresArr)){
    			if(pattern.match(/editform/gi) && !pattern.match(/editform-drilldown-popup/gi) && (tgrpndx-1 == this.numberOfTgrpsInView-1)){
    			} else{
    				strPanel = strPanel.replace('>', ' ' + 'showCounts=' + dqte("true") + '>');
    			} 
    		}
    	}

    	if(view.hasOwnProperty('panelProperties')){
        	var panelProperties = view.panelProperties[tgrpndx-1];
        	if(panelProperties.hasOwnProperty('showIndexAndFilterOnLoad') && pattern.match(/report/gi)){
        		strPanel = strPanel.replace('>', ' showIndexAndFilterOnLoad="' + panelProperties['showIndexAndFilterOnLoad'] + '">');
        	}   		
    	}
    	
    	// place new property values into view
    	this.convertedView = this.convertedView.replace(objregexPattern, strPanel);
    },

	/**
     * Replaces report actions
     *
     * @param	index
     * @return	None
     *
     */    
    replaceReportActions: function(index){

    	if((this.viewType == 'reports') || (this.viewType == 'summaryReports')){
    		// TODO:
    		var view = tabsFrame.newView;
    		var panelProperties = (view.hasOwnProperty('panelProperties')) ? view.panelProperties[index-1] : '';
    		var availableProperties = ['docx', 'xls', 'txfr'];
    		var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - index];
    		
			for(i in panelProperties){
				if(panelProperties[i] == 'true'){
					if (availableProperties.indexOf(i) > -1) {
						availableProperties.splice(availableProperties.indexOf(i), 1);
						var markerId = tgrpName + '-Action-Properties-' + i.toUpperCase();
						var template = getTemplateFromContents(this.convertedView, markerId);
						var templateWithoutMarker = getTemplateWithoutMarker('',markerId );
						templateWithoutMarker = templateWithoutMarker.replace(/^[\r|\s|\n]*/gi, '');
						this.convertedView = this.convertedView.replace(template, templateWithoutMarker);						
					}
				}
			}
			for(var j=0; j<availableProperties.length; j++){
				var property = availableProperties[j];
				var markerId = tgrpName + '-Action-Properties-' + property.toUpperCase();
				var template = getTemplateFromContents(this.convertedView, markerId);
				this.convertedView = this.convertedView.replace(template, '');
			}
    	}  	  	
    },
        		
	/**
     * Removes any markers from paginated templates that do  have summary
     *
     * @param	None
     * @return	None
     *
     */
    removePaginatedSummaryMarkers: function(tgrpndx){    
		// remove type="grouping" from <dataSource>					   
		// var regexPattern = /(\<dataSource [\n|\r|\s\D\d\W\w]*)(type\=\"grouping\" )([\n|\r|\s\D\d\W\w]*>)/gi;    
		
		var regexPattern = /([\s]*\<\!--ViewDef-Paginated-DataSource-With-Grouping-Begin-->)([\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*)(<!--ViewDef-Paginated-DataSource-With-Grouping-End-->[\s]*)/gi;	   
		// var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)]
		// var regexPattern = new RegExp('(<\\!--ViewDef-Paginated-' + tgrpName + '-DataSource-With-Grouping-Begin-->)([\\n|\\r|\\s\\D\\d\\W\\w]*)(<!--ViewDef-Paginated-' + tgrpName + '-DataSource-With-Grouping-End-->[\\s]*)', 'gi' );
	
	    var temp = String(this.convertedView.match(regexPattern));

		if (!temp.match(/null/gi) && !this.hasMeasures(tgrpndx)) {
			temp = temp.replace(' type="grouping"', '');
	    }
		this.convertedView = this.convertedView.replace(regexPattern, temp);
		
		// remove outer tags
		this.convertedView = this.convertedView.replace(regexPattern, "$2    ");		
    },
    
    hasMeasures: function(tgrpndx){
    	var view = tabsFrame.newView;
		var measuresArr = view.tableGroups[tgrpndx - 1].measures;
		var hasMeasures = false;		
		if ((measuresArr != undefined) && (measuresArr != '')){
			if (measuresArr.length > 0) {
				hasMeasures = true;
			}
		}
		return hasMeasures;
    },
	
	/**
     * Removes any markers from paginated templates that do not have summary
     *
     * @param	None
     * @return	None
     *
     */
    removePaginatedNonSummaryMarkers: function(){

		// remove panel field and sort field markers
		var regexPattern = /[\s]*\<\!--ViewDef-DataTgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DataTgrp-PanelFields-End-->[\s]*/gi;
		this.convertedView = this.convertedView.replace(regexPattern, "\n    ");

		// remove panel field and sort field markers
		var regexPattern = /[\s]*\<\!--ViewDef-DrillDownTgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDownTgrp-PanelFields-End-->[\s]*/gi;
		this.convertedView = this.convertedView.replace(regexPattern, "\n    ");

		// remove panel field and sort field markers
		var regexPattern = /[\s]*\<\!--ViewDef-Drill2DownTgrp-PanelFields-Begin-->[\n|\r|\s]*.*[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-DrillDown2Tgrp-PanelFields-Begind-->[\s]*/gi;
		this.convertedView = this.convertedView.replace(regexPattern, "\n    ");							
    }, 
	
	replacePaginatedDataSource: function(tgrpndx){
		// var paginatedPanelProperties = this.view.tableGroups[tgrpndx-1].paginatedPanelProperties;
		var view = tabsFrame.newView;
		var tgrpName = this.kTGRPNAME[this.numberOfTableGroups - (tgrpndx)]; 
		var objregexPattern = new RegExp('(<\\!--ViewDef-Paginated-' + tgrpName + '-DataSource-Begin-->)([\\n|\\r|\\s\\D\\d\\W\\w]*)(<!--ViewDef-Paginated-' + tgrpName + '-DataSource-End-->[\\s]*)', 'gi' );
		
		var measuresArr = view.tableGroups[tgrpndx - 1].measures;
		var hasMeasures = false;		
		if ((measuresArr != undefined) && (measuresArr != '')){
			if (measuresArr.length > 0) {
				hasMeasures = true;
			}
		}
									
		// get the template
        var temp = String(this.convertedView.match(objregexPattern));
		if (!temp.match(/null/gi)) {
			// remove the template marker
			var strPaginatedDataSource = trim(temp.replace(objregexPattern, '$2'));

			//if (hasSummarizeBySortOrder(view.tableGroups[tgrpndx - 1]) || ((pattern.match(/highlight-restriction/gi) || pattern.match(/paginated-parent/))&& hasMeasures)) {
			if ((hasSummarizeBySortOrder(view.tableGroups[tgrpndx - 1]) || (pattern.match(/highlight-thematic/gi) && (tgrpName == 'DataTgrp')) )  && !strPaginatedDataSource.match(/grouping/gi)) {
				strPaginatedDataSource = strPaginatedDataSource.replace('>', ' type="grouping">');
			}		
			this.convertedView = this.convertedView.replace(objregexPattern, strPaginatedDataSource);
		}			
	},
	
	replaceURL: function(){
		var view = tabsFrame.newView;
		var url = view.viewURL;
		var urlRegExp = /([\S|\s]*url=")(.*?)("[\S|\s]*)/gi; 	
		this.convertedView = this.convertedView.replace(urlRegExp, "$1" + url + "$3");
	},
		
	/**
     * Removes CDATA commments
     *
     * @param	None
     * @return	None
     *
     */
    removeCDATAComments: function(){
	
		// remove comments
		var regexPattern = /[\s]*\<\!--ViewDef-CDATA-Begin-Comment-Begin-->[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-CDATA-Begin-Comment-End-->[\s]*/gi;
		this.convertedView = this.convertedView.replace(regexPattern, "\n        ");							

		var regexPattern = /[\s]*\<\!--ViewDef-CDATA-End-Comment-Begin-->[.|\n|\r|\s\d\D\w\W]*<!--ViewDef-CDATA-End-Comment-End-->[\s]*/gi;
		this.convertedView = this.convertedView.replace(regexPattern, "\n        ");
    } 	
	
	
} // last function, no comma
);


/**
 * Returns string with spaces removed at end
 *
 * @param  strInput	String	Input string
 * @return result	String	String with spaces removed end
 *
 */
function rtrim(strInput){
    var result = strInput.replace(/\s+$/, "");
    return result;
}

/**
 * Returns string with spaces removed at beginning
 *
 * @param  strInput	String	Input string
 * @return result	String	String with spaces removed at beginning
 *
 */
function ltrim(strInput){
    var result = strInput.replace(/^\s+/, "");
    return result;
}

/**
 * Returns string with spaces removed at beginning and end
 *
 * @param  strInput	String	Input string
 * @return result	String	String with spaces removed at beginning and end
 *
 */
function trim(strInput){
    var result = strInput.replace(/^\s+|\s+$/, "");
    result.replace(/[\n\r\s]*$, ""/);
    result.replace(/^[\n\r\s], ""/);
    return result;
}

