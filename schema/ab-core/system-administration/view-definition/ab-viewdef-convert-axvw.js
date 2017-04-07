/**
 * ab-viewdef-convert-axvw.js
 *
 */
Ab.namespace('ViewDef');

/**
 * Class for regex'ing a Web view into a series of .js statements
 * that will define a view object in JavaScript memory.
 *
 */
Ab.ViewDef.ConvertAxvw = Base.extend({
    constructor: function(){
    },
    
    // text of file to convert.  Gets converted in-place in his variable.
    convertedTextOfFile: '',
    
    // string to hold the name of the variable which will hold the view definition after evaluation, e.g. "top.Ab.ViewDef.myView"
    myView: '',
    
    pattern: '',
    
    // true if the axvw used server-dependent functions which will not convert. 
    warningFlagServerDependentFunctions: false,
    
    // true if the axvw has a hand-hacked mdx query.
    warningFlagCustomMdxQuery: false,
    
    // true if the axvw has a console.
    warningFlagConsole: false,
    
    // true if the axvw has custom xsl formatting.
    warningFlagXsl: false,
    
    // true if the axvw uses custom framesets.  
    warningFlagFramesets: false,
    
    // true if the view contains statistics
    warningFlagStatistics: false,
    
    // false until the conversion has been run.
    fileIsConverted: false,
    
    // warning if values not yet valid. ??Localization.
    NOT_YET_CONVERTED_ERROR: "File not yet converted.",
    
    vfTitles: null,
    
    virtualFields: null,
    
    
    //  Accessors.
    
    /**
     * Return the axvw file as a series of JavaScript statements that,
     * when evaluated, will define a view object.
     *
     * @param	None
     * @return	None
     * 
     */
    getConvertedFileAsJavaScript: function(){
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
        return this.convertedTextOfFile;
    },
    
    /**
     * Return true if there were conditions that the converter could
     * not convert.
     *
     * @param	None
     * @return	None
     * 
     */
    hasUnconvertableSections: function(){
        return "";
		
        //XXX: 17.1 ????
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
			
        return (this.warningFlagServerDependentFunctions ||		
        this.warningFlagCustomMdxQuery ||
        this.warningFlagConsole ||
        this.warningFlagXsl ||
        this.warningFlagFramesets ||
        this.warningFlagStatistics);
    },
    
    
    /**
     * Return a string describing which conditons the converter could
     * not convert.
     *      
     * @param	None
     * @return	None
     *
     */
    getDescriptionOfUnconvertableSections: function(){
        if (!this.fileIsConverted) 
            throw NOT_YET_CONVERTED_ERROR;
        
        var unconvertableConditions = "";
        
        if (this.warningFlagServerDependentFunctions) 
            unconvertableConditions += "\n" + getMessage('serverDependentWarning');
        if (this.warningFlagCustomMdxQuery) 
            unconvertableConditions += "\n" + getMessage('customqueryWarning');
        if (this.warningFlagConsole) 
            unconvertableConditions += "\n" + getMessage('consoleWarning');
        if (this.warningFlagXsl) 
            unconvertableConditions += "\n" + getMessage('xslWarning');
        if (this.warningFlagFramesets) 
            unconvertableConditions += "\n" + getMessage('framesetsWarning');
        if (this.warningFlagStatistics) 
            unconvertableConditions += "\n" + getMessage('statisticsWarning');
        
        return unconvertableConditions;
    },
    
    
    /**
     * Return true if the browser is Firefox, false if it is IE 
     * 
     * @param	None
     * @return	None
     * 
     */ 
    browserIsFirefox: function(){
        return ((navigator.userAgent.toUpperCase()).indexOf("FIREFOX") > 0);
    },
    
    /**
     * Convert the file of the text in a Web .axvw to a series of statements that,
     * when evaluated, will define a view.
     * Convert the most specialized tags first.  This saves confusion between inner
     * tags (e.g. <field />) that are used within multiple outer tags (e.g. fields,
     * statistics, restrictions, etc.  Avoid using nifty yet implementation-dependent
     * Perl-like features.  Slightly more robust would be to use the regex exec() method
     * to find sections between outer tags, replace the contents, then copy the contents
     * to a new file.  But there are no .axvw conditions that currently require this approach.
     * 
     * @param	sourceTextToConvert		String	Source text to convert
     * @param	viewVariableName		String 	View variable name
     * @return	None
     *
     */
    convertDo: function(sourceTextToConvert, viewVariableName){
    
        // get the source text
        this.convertedTextOfFile = sourceTextToConvert;
        
        // assign view variable name
        this.myView = viewVariableName;
        
        this.pattern = this.convertFile_getPattern();
        
        // pretty print the input
        this.convertFile_prettyPrint();
        
        // get and store vf panel title fields before removing comments
        this.convertFile_getVFPanelTitlesAndFields();
        
        // get and store column report options
        this.convertFile_moveColumnReportOptsToDs();

        // for url pattern
        this.convertFile_replaceURL(); 	
        
        // remove popups from summary patterns
        this.convertFile_removeSummaryPopups();
                
        // pretty print the input
        this.convertFile_removeComments();
   
        // move restrictionParameterName from panel to datasource
        this.convertFile_moveRestrictionParameterNamesToDs();
        
        // check showCounts="true"
        this.convertFile_getShowCounts();
			
        // get columns properties
        this.convertFile_getEditFormColumns();
        		                
        // get chart properties
        this.convertFile_getChartProperties();
        
        // get panel action properties
        this.convertFile_getPanelProperties();
        
        // get chart properties
        this.convertFile_getPaginatedReportProperties();
                
        // handle chart events (do not create extra tablegroup)
        this.convertFile_handleChartEvent();
	    	 				       
        // remove any existing panels
        this.convertFile_removeExistingPanels();
        
        // warn if something won't convert.
        this.convertFile_setWarningFlags();
			        
        // clear statistics.
        this.convertFile_replaceStatistics();
        
        // replace measures
        this.convertFile_replaceMeasures();
     
        // replace dimensions and remove sort
        this.convertFile_replaceDimensionsAndRemoveSort();
        
        // replace title.
        this.convertFileOptions();
        
        // replace restrictions for pre172
        this.convertedTextOfFile = this.convertFile_replaceRestrictionsPre172(this.convertedTextOfFile);
        
        // replace sort
        this.convertFile_replaceSortField();
									      
        // replace dataSource tags.
        this.convertFile_replaceDataSources();
		    		     
        // XXX: 17.1
		// fix double-printing in data tgrp ex: ab-sp-vw-rm-by-bl-fl.axvw
        // this.convertedTextOfFile = this.convertFile_replaceSQLRestrictions(this.convertedTextOfFile);
               
        // clear that which is unconvertable.
        this.convertFile_clearRemainingLines();
       
        // result is now in this.convertedTextOfFile;  All's well with the accessors.
        this.fileIsConverted = true;
    },

    /**
     * Get pattern from template
     *
     * @param	None
     * @return	string pattern name from designInfo tag
     */    
    convertFile_getPattern: function(){
        //                $1         $2     $3     $4
        var objRegExp = /([\s\S\n\r]*<designInfo.*pattern\=")(.*?)(".*\>?[\s\S\n\r]*)/gi;
        return this.convertedTextOfFile.replace(objRegExp, '$2');       
    },
    
    /**
     *  Pretty print the input first
     *
     * @param	None
     * @return	None
     */
    convertFile_prettyPrint: function(){
        //                $1         $2     $3     $4
        var objRegExp = /([\n|\r].?)([\s]*)([\S]+)(\<)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, ' $3$4');
        
        var objRegExp = /(\/\>)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, ' $1\n\r');
    },

    /**
     * Remove summary popups
     */
    convertFile_removeSummaryPopups: function(){
    		var objRegExp = /<!--ViewDef-Chart-Popup-Begin-->[.|\n|\r|\s|\S]*?<!--ViewDef-Chart-Popup-End-->/gi;      
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, '');
    },
        
    /**
     * Remove any comments.
     *
     * @param	None
     * @return	None
     * 
     */
    convertFile_removeComments: function(){
    
        var objRegExp = /[\n|\r]*\<!--[\S|\s]*?-->[\n|\r|\s]*/gi;
        
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, '');
    },
    
    /**
     * Get chart properties.
     *
     * @param	None
     * @return	None
     * 
     */
    convertFile_getChartProperties: function(){
    
        var objRegExp = /<panel.*type\="chart".*\>?/gi;
        var chartPanel = String(this.convertedTextOfFile.match(objRegExp));
        var propRegEx = / (.*?)\=\"(.*?)\"/gi;
        var eventRegExp = /(<event.*type="onClickItem"[\S|\s]*?.*>[\S|\s]*?<\/event>?)/gi;
        
        chartPanel = chartPanel.replace(/<panel.*type\="chart"/, "");
        chartPanel = chartPanel.replace(/\>/, "");
        chartPanel = chartPanel.replace(propRegEx, this.myView + ".addChartProperty( \"$1\", \"$2\" ) ; \n");
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, chartPanel);
        this.convertedTextOfFile = this.convertedTextOfFile.replace(eventRegExp, "$1\n" + this.myView + ".addChartProperty( \"enableChartDrilldown\", true ) ; \n");
    },
    
    convertFile_getPaginatedReportProperties: function(){
    		if(this.pattern.match(/paginated/gi)){
    			var objRegExp = /<report.*\>?/gi;
    			var reportTag = String(this.convertedTextOfFile.match(objRegExp));
    			var propRegEx = / (.*?)\=\"(.*?)\"/gi;        
    			reportTag = reportTag.replace(/<report/, "");
    			reportTag = reportTag.replace(/\/\>/, "");
    			reportTag = reportTag.replace(propRegEx, this.myView + ".addPaginatedReportProperty( \"$1\", \"$2\" ) ; \n");
    			this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, reportTag);   			
    		}
    },
    

    convertFile_getPanelProperties: function(){
        var objRegExp = /(<panel.*type\="grid"[\S|\s]*?)(showIndexAndFilterOnLoad)="(.*?)"(.*>?)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "$1$4\n" + this.myView + ".addPanelProperty( " +  "\"$2\", $3 ) ; \n");
        
		var actionRegExp = /(<action.*id="[\S|\s]*?.*"[\S|\s]*?.*>[\S|\s]*?<command.*outputType="?(docx|txfr|xls)"[\S|\s]*?.*\/>[\S|\s]*?.*<\/action>?)/gi;
		this.convertedTextOfFile = this.convertedTextOfFile.replace(actionRegExp, "\n" + this.myView + ".addPanelProperty( " +  "\"$2\", true ) ; \n");
    },
    
    convertFile_getEditFormColumns: function(){

        var objRegExp = /<panel.*\>?/gi;
        var panels = this.convertedTextOfFile.match(objRegExp);
        var columnsRegEx = / columns.*?\=\".*?\"/gi;
        
        if(panels){
        	for(var i=panels.length-1; i<panels.length; i++){
        		var panel = panels[i];
        		var columnsRegEx = / columns.*?\=\".*?\"/gi;
        		var numberOfColumns = String(panel.match(columnsRegEx));

  	      	if(valueExistsNotEmpty(numberOfColumns) && numberOfColumns != 'null'){
    	    		numberOfColumns = numberOfColumns.replace("columns", "");	
      	  		numberOfColumns = numberOfColumns.replace(/[\"\=]/gi, "");  
        			this.convertedTextOfFile +=  "\n" + this.myView + ".addEditFormColumns( " + i + "," +  numberOfColumns + " ) ; \n";  
        		}
        	}
        }

    },
    
    /**
     * Handle chart event.
     *
     * @param	None
     * @return	None
     * 
     */
    convertFile_handleChartEvent: function(){
    
        var eventRegExp = /<event.*type="onClickItem"[\S|\s]*?.*>[\S|\s]*?<\/event>?/gi;
        var panelIdRegExp = /panelId\=\"(.*?)\"/gi;
        var dataSourceIdRegExp = /dataSource\=\"(.*?)\"/gi;
        var event = this.convertedTextOfFile.match(eventRegExp);
        var tableRegExp = new RegExp('<table.*\/>');
        var field1RegExp = new RegExp('<field.*name\=\"(.*?)\".*table\=\"(.*?)\".*/>', 'gi');
        var field2RegExp = new RegExp('<field.*table\=\"(.*?)\".*name\=\"(.*?)\".*/>', 'gi');
		
        // clear the event
        this.convertedTextOfFile = this.convertedTextOfFile.replace(eventRegExp, '');
        
        if (event != null) {
            for (var i = 0; i < event.length; i++) {
				
                // find targetId
                var eventTargetId = String(event[i].match(panelIdRegExp));
                eventTargetId = eventTargetId.replace('panelId="', '');
                eventTargetId = eventTargetId.replace('"', '');
                var targetPanelRegExp = new RegExp('<panel.*id\=\"' + eventTargetId + '\".*>[\\S|\\s]*<\/panel>?');
                var targetPanel = this.convertedTextOfFile.match(targetPanelRegExp);
				
                // find dataSourceId
                if (targetPanel != null) {
                    for (var j = 0; j < targetPanel.length; j++) {
                        var dataSourceId = String(targetPanel[i].match(dataSourceIdRegExp));
                        dataSourceId = dataSourceId.replace('dataSource="', '');
                        dataSourceId = dataSourceId.replace('"', '');
                        var dataSourceRegExp = new RegExp('<dataSource.*id\=\"' + dataSourceId + '\".*>[\\S|\\s]*<\/dataSource>?');
                        var dataSourceContentsRegExp = new RegExp('<dataSource.*id\=\"' + dataSourceId + '\".*>([\\S|\\s]*)<\/dataSource>?');
                        var dataSource = this.convertedTextOfFile.match(dataSourceRegExp);
                        // find targetDataSource
                        if (dataSource != null) {
                            var newDataSource = String(dataSource[i].replace(dataSourceContentsRegExp, "$1"));
                            newDataSource = newDataSource.replace(tableRegExp, '');
                            newDataSource = newDataSource.replace(field1RegExp, 'myView.addChartPopupField( \"$1\", \"$2\", \"AXVW\", true ) ;');
                            newDataSource = newDataSource.replace(field2RegExp, 'myView.addChartPopupField( \"$2\", \"$1\", \"AXVW\", true ) ;');
                            this.convertedTextOfFile = this.convertedTextOfFile.replace(dataSourceContentsRegExp, newDataSource);
                        }
                    }
                }
            }
        }
    },
    
    /**
     * Remove any existing panels.
     *
     * @param	None
     * @return	None
     * 
     */
    convertFile_removeExistingPanels: function(){
    
        //                $1                             $2    $3
        var objRegExp = /[\n|\r]*\<panels\>[\S|\s]*?<\/panels>[\n|\r|\s]*/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, '');
    },
    
    /**
     * Clear statistics, which are not supported in new-school views.
     * Do not attempt this on IE 7, which goes into a recursive hang on this pattern.
     *
     * @param	None
     * @return	None
     * 
     */
    convertFile_replaceStatistics: function(){
    
        // <statistics> followed by any number of chars, carriage returns, or newlines, followed by </statistics>       
        if (this.browserIsFirefox()) {
            var objRegExp = /(<statistics>)(.|\r|\n)*(<\/statistics>)/gi;
            this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        }
    },
    
    /**
     * Convert
     * <title translatable="false">Rooms</title>
     * to:
     * myView.addTitle( "Room Percentages by Business Unit" ) ;
     * Titles can contain punctuation.
     *
     * @param	None
     * @return	None
     *
     */
    convertFileOptions: function(){
        var objRegExp = /([\s]*<title).*>(.*)<\/title>(.*)/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, '              ' + this.myView + ".addTitle( \"$2\" ) ; \n");
    },
    
    /**
     * Replace sort fields. For 2.0 views, the sort order is specified in the panel
     * section as opposed to the datasource section.
     *
     * @param 	None
     * @return 	None
     *
     */
    convertFile_replaceSortField: function(){
    
        // if (this.convertedTextOfFile.match(/pattern="ab-viewdef-summary-chart"/)){ 
        var groupByDateFieldRegExp = /<field.*formula\="(year|quarter|month|week|day)".*\/\>?/gi;
        var groupByDateFields = this.convertedTextOfFile.match(groupByDateFieldRegExp);
        
        var sortFieldNameRegExp = /<sortField.*name\="(.*)".*\/\>?/gi;
        var nameRegExp = /name\=\"(.*?)\"/gi;
        
        if (groupByDateFields != null) {
            for (var i = 0; i < groupByDateFields.length; i++) {
                var sortTargetId = String(groupByDateFields[i].match(nameRegExp));
                sortTargetId = sortTargetId.replace('name="', '');
                sortTargetId = sortTargetId.replace('"', '');
                
                var sortFieldRegExp = new RegExp('<sortField.*name\=\"' + sortTargetId + '\".*>?');
                this.convertedTextOfFile = this.convertedTextOfFile.replace(sortFieldRegExp, '');
                
                var restrictionRegExp = new RegExp('<restriction.*parameters.*' + "'" + sortTargetId + "'" + '.*>?');
                this.convertedTextOfFile = this.convertedTextOfFile.replace(restrictionRegExp, '');
            }
        }
        //	}			
        
        var dimRegExp = /<panel.*dataSource\=\"(.*)\".*>[.|\n|\r|\s|\S]*?(<sortField.*\/>)[.|\n|\r|\s|\S]*?<\/panel>/gi;
        var sortFieldRegExp = /<sortField.*\/>/gi;
        var dataSourceIDRegExp = /dataSource\=\"(.*?)\"/gi;
        
        // look for any panels that have a <sortField> tag			 	
        var panels = this.convertedTextOfFile.match(dimRegExp);
        if (panels != null) {
            for (var i = 0; i < panels.length; i++) {
                var panelOri = panels[i];
                var dataSourceID = String(panels[i].match(dataSourceIDRegExp));
                dataSourceID = dataSourceID.replace(dataSourceIDRegExp, "$1");
                
                // extract all sortFields
                var sortField = panels[i].match(sortFieldRegExp);
                
                if (sortField != null) {
					
                    // string to hold all sortfields within the panel
                    var sorts = "";
                    for (var j = 0; j < sortField.length; j++) {
						
                        // change this sortField tag to field tag (compatible with 17.1, which will subsequently get replaced
                        sortField[j] = sortField[j].replace("sortField", "field");												
                        sorts += sortField[j] + "\n";
                    }
                }
                
                // look for the correct dataSource, using the panel's id								 	
                var dataSourceRegExp = new RegExp('<dataSource.*id\=\"' + dataSourceID + '\".*>[\\S|\\s]*<\/dataSource>?');
                var dataSource = String(this.convertedTextOfFile.match(dataSourceRegExp));
                
                // inject the sort fields into the datasource section
                dataSource = dataSource.replace('</dataSource>', sorts + '\n</dataSource>');
                this.convertedTextOfFile = this.convertedTextOfFile.replace(dataSourceRegExp, dataSource);
                
                // remove sort fields from the panel
                var panel = panelOri.replace(sortFieldRegExp, '');
                this.convertedTextOfFile = this.convertedTextOfFile.replace(panelOri, panel);
            }
        }
        
    },

    /**
     * Move restrictionParameterName from panels to datasource
     *
     * @param	None
     * @return 	None
     *
     */
    convertFile_moveRestrictionParameterNamesToDs: function(){
    	
    	if(this.convertedTextOfFile.match(/paginated/gi)){	
		
		// get any panels that have a <field...restrictionParameterName=".." ..)
		var panelRegExp = /<panel.*dataSource=".*?"[\S|\s]*?.*>[\S|\s]*?<field.*table\=\".*?\".*name\=\".*?\".*restrictionParameterName\=\".*?\".*\/>[\S|\s]*?<\/panel>?/gi;
		var panels = this.convertedTextOfFile.match(panelRegExp);

		// regular expression to extract the ds_id from the panel
		var panelDsRegExp = /(<panel.*dataSource=")(.*?)("[\S|\s]*?.*>[\S|\s]*?[\S|\s]*?<\/panel>?)/;

		// regular expression to extract the table_name, field_name, and restriction_parameter from the panel field
		var restParamFld = /(<field.*table\=\")(.*?)(\".*name\=\")(.*?)(\".*restrictionParameterName\=\")(.*?)(\".*\/>)/;

		// loop through each panel
		if (panels){
			
			for (var i = 0; i < panels.length; i++) {
				var panel = panels[i];

				// get the ds_id
				var ds_id = panel.replace(panelDsRegExp, "$2");
			
				// while there is field tag with restrictionParameterName attribute
				while (panel.match(restParamFld)) {
			
					var attributes = panel.match(restParamFld);
					if (attributes != null) {
						var table_name = attributes[2];
						var field_name = attributes[4];
						var value = attributes[6];
					
						// find the correct field in the datasource, and add the restrictionParameterName attribute and its value to <field>
						var x = '(<dataSource.*id=\"' + ds_id + '\"[\\S|\\s]*?.*>[\\S|\\s]*?';
						x += '<field.*table\=\"' + table_name + '\".*name\=\"' + field_name + '\")' + '(.*>)';
						x += '([\\S|\\s]*?<\/dataSource>?)';
						var dsRegExp = new RegExp(x, 'm');
						this.convertedTextOfFile = this.convertedTextOfFile.replace(dsRegExp, '$1 restrictionParameterName="' + value + '" $2$3');
					
						var x = '(<dataSource.*id=\"' + ds_id + '\"[\\S|\\s]*?.*>[\\S|\\s]*?';
						x += '<field.*name\=\"' + field_name + '\".*table\=\"' + table_name + '\")' + '(.*>)';
						x += '([\\S|\\s]*?<\/dataSource>?)';
						var dsRegExp = new RegExp(x, 'm');
						this.convertedTextOfFile = this.convertedTextOfFile.replace(dsRegExp, '$1 restrictionParameterName="' + value + '" $2$3');
					
					}
				
					// remove the <field> so that we don't parse it again
					panel = panel.replace(restParamFld, '');
				}
			}				
		}
		}
    },

    /**
     * Get showCounts
     *
     * @param	None
     * @return 	None
     *
     */
    convertFile_getShowCounts: function(){
    	// get all panels
    	var panelRegExp = /<panel.*dataSource=".*?"[\S|\s]*?.*>[\S|\s]*?<\/panel>?/gi;
    	var panels = this.convertedTextOfFile.match(panelRegExp);
   	
    	// loop through each panel
    	if (panels){
    		for (var i = 0; i < panels.length; i++) {
    			var panel = panels[i];
    			if (panel.match(/showCounts="true"/gi)){
    				this.convertedTextOfFile += this.myView + ".showCounts(" + i + ") ; \n";
    			}			
    		}
    	}
    },


    /**
     * Move parameter tags from panel to corresponding datasource
     *
     * @param	None
     * @return 	None
     *
     */
    convertFile_replaceParameters: function(str){
		
		var objRegExp = /<parameter.*name\=\"(.*?)\".*value\=\"(.*?)\".*dataType\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$1\", \"$2\", \"$3\") ;");
		
        objRegExp = /<parameter.*name\=\"(.*?)\".*dataType\=\"(.*?)\".*value\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$1\", \"$3\", \"$2\") ;");

        objRegExp = /<parameter.*dataType\=\"(.*?)\".*name\=\"(.*?)\".*value\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$2\", \"$3\", \"$1\") ;");

        objRegExp = /<parameter.*dataType\=\"(.*?)\".*value\=\"(.*?)\".*name\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$3\", \"$2\", \"$1\") ;");
		
		objRegExp = /<parameter.*value\=\"(.*?)\".*name\=\"(.*?)\".*dataType\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$2\", \"$1\", \"$3\") ;");

		objRegExp = /<parameter.*value\=\"(.*?)\".*dataType\=\"(.*?)\".*name\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addParameter( \"$3\", \"$1\", \"$2\") ;");						   
	
		return str;
    },
	  
    /**
     * Replace the datasource sections.
     *
     * @param	None
     * @return 	None
     *
     */
    convertFile_replaceDataSources: function(){
        var dsObjRegExp = /(<dataSource [\S|\s]*?<\/dataSource>).*/gi;
        var dataSource = this.convertedTextOfFile.match(dsObjRegExp);
        if (dataSource == null) {
			
            //XXX: 17.1
            objRegExp = /(<dataSource>[\S|\s]*?<\/dataSource>).*/gi;
            dataSource = this.convertedTextOfFile.match(objRegExp);
        }
        
        dataSource = dataSource + "";
        
        this.convertFile_checkForSummarizeBySortOrder(dataSource);
        
        objRegexp = /id\=\"(.*)\"/;
        var dataSourceId = dataSource.match(objRegexp);
        dataSourceId = dataSource.replace(objRegexp, "$1");
        
        // main table
        objRegExp = /(<table).*("[A-Za-z_0-9]*")(.*)("main")(.*)/gi;
        dataSource = dataSource.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.MAIN_TABLE, 'AXVW' ) ;");
        
        // standard table
        objRegExp = /(<table).*("[A-Za-z_0-9]*")(.*)("standard")(.*)/gi;
        dataSource = dataSource.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.STANDARD_TABLE, 'AXVW' ) ;");
        
        // default to main table
        objRegExp = /(<table).*("[A-Za-z_0-9]*")(.*)/gi;
        dataSource = dataSource.replace(objRegExp, this.myView + ".addTable( $2, Ab.ViewDef.Table.MAIN_TABLE, 'AXVW' ) ;");
        			
        // XXX: 17.1
        dataSource = this.convertFile_replaceSort(dataSource);
        
        // fields
        dataSource = this.convertFile_replaceFields(dataSource);

		// replace sort fields for paginated drawings
		if (this.convertedTextOfFile.match(/role="legend"/gi)) {
			dataSource = this.convertFile_replaceSortFields(dataSource);
		}	
		
		// move parameter to datasource
		dataSource = this.convertFile_replaceParameters(dataSource);
		        
        // sort fields
        objRegExp = /<sortField.*name\=\"(.*?)\".*table\=\"(.*?)\".*ascending\=\"(true|false)\".*>/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$1\", \"\", \"\", \"AXVW\", $3) ;");
        
        objRegExp = /<sortField.*table\=\"(.*?)\".*name\=\"(.*?)\".*ascending\=\"(true|false)\".*>/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$1\", \"$2\", \"\", \"\", \"AXVW\", $3) ;");
        
        objRegExp = /<sortField.*name\=\"(.*?)\".*table\=\"(.*?)\".*>/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$1\", \"\", \"\", \"AXVW\", true) ;");
        
        objRegExp = /<sortField.*table\=\"(.*?)\".*name\=\"(.*?)\".*>/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + ".addSortField( \"$1\", \"$2\", \"\", \"\", \"AXVW\", true) ;");
     
        /*
         //                       $1 replace              $2 table $3 replace  $4 field  $5 replace               --
         var objRegExp = /([\s\S]*<groupingAxis.*table\=")(.*)(".*field\=")(.*)(".*\>[\s\S]*<\/groupingAxis>?[\s\S]*)/gi ;
         dataSource = dataSource + this.convertedTextOfFile.replace( objRegExp,
         this.myView + '.addSortField( \"$4\", \"$2\", \"\", \"AXVW\", true ) ;' ) ;
         //                       $1 replace              $2 field $3 replace  $4 table  $5 replace               --
         var objRegExp = /([\s\S]*<groupingAxis.*field\=")(.*)(".*table\=")(.*)(".*\>[\s\S]*<\/groupingAxis>?[\s\S]*)/gi ;
         dataSource = dataSource + this.convertedTextOfFile.replace( objRegExp,
         this.myView + '.addSortField( \"$4\", \"$2\", \"\", \"AXVW\", true ) ;' ) ;
         */
		
        // restrictions		
		dataSource = this.convertFile_replaceParamRestrictions172(dataSource);
        dataSource = this.convertFile_replaceRestrictions172(dataSource);
        dataSource = this.convertFile_replaceSQLRestrictions(dataSource);
   			     
        if (dataSource != 'null') {
            this.convertedTextOfFile = dataSource + this.convertedTextOfFile;
        }
        
    },
    
    /**
    * The summarizeBySortOrder option is a setting in the wizard. During conversion, we need to 
    * "reverse-engineer" the view contents to determine whether this setting should be set.
    */
    convertFile_checkForSummarizeBySortOrder: function(dataSource){
    	var dsGroupingRegExp = /<dataSource.*?type="grouping".*?>/gi;
    	var grouping= dataSource.match(dsGroupingRegExp);
    	var groupByRegExp = /<field.*?groupBy="true".*?>/gi;
    	var groupBy = dataSource.match(groupByRegExp);
    	var statsRegExp = /<field.*?formula="count-percent|sum-percent|count|sum|avg".*?>/g;
    	var stats = dataSource.match(statsRegExp);

    	if(grouping && groupBy && stats && this.pattern.match(/paginated/gi)){  
    		this.convertedTextOfFile += "myView.addPaginatedPanelProperties( '" + 'summarizeBySortOrder' + "', '" + 'summarizeBySortOrder' + "' ) ; \n";
    	}
    },

    convertFile_getVFPanelTitlesAndFields: function(){
    	var vfTitlesObjRegExp = /(<!--ViewDef-VirtualField-Title-Begin-->[\s\S].*?(?!<!--ViewDef-VirtualField-Title-Begin-->)[\s\S].*?>[\s\S]*?<!--ViewDef-VirtualField-Title-End-->)/gmi;
    	var vfTitles = this.convertedTextOfFile.match(vfTitlesObjRegExp);
    	this.vfTitles = vfTitles;
   	
    	//var fldsObjRegExp = /(<!--ViewDef-VirtualField-Begin-->[\s\S].*?(?!<!--ViewDef-VirtualField-Begin-->)[\s\S].*?>[\s\S]*?<!--ViewDef-VirtualField-End-->)/gmi;
     	var fldsObjRegExp = /(<!--ViewDef-VirtualField-Begin-->[\s\S].*?(?!<!--ViewDef-VirtualField-Begin-->)[\s\S].*?>[\s\S]*?<!--ViewDef-VirtualField-End-->)/gmi;
    	var virtualFields = this.convertedTextOfFile.match(fldsObjRegExp);
    	this.virtualFields = virtualFields;
    },
       
    convertFile_consolidateVFFields: function(str){    	
    	if(this.virtualFields){
    		for(var i=0; i<this.virtualFields.length; i++){
    			var vf = this.virtualFields[i];
    			var vfTable = getAttributeValue(vf, 'table');
    			var vfField = getAttributeValue(vf, 'name');
    			var data_type = getAttributeValue(vf, 'dataType');
    			var sql = this.generateVFSQLObject(vf);
    			var objRegExp = /[\n|\r]*\<!--ViewDef-VirtualField-(Begin|End)-->[\n|\r|\s]*/gi;
    			vf = vf.replace(objRegExp, '');
    			
    			var title = '';
    			if(this.vfTitles){
    				for(var j=0; j<this.vfTitles.length; j++){
    					var vfTitle = this.vfTitles[j];
    					var titleTable = getAttributeValue(vfTitle, 'table');
    					var titleField = getAttributeValue(vfTitle, 'name');   
    					 			   					
    					if((vfTable == titleTable) && (vfField == titleField)){  						
    						title = getTagValue(vfTitle, '<title.*?>', '<\/title>');
    						this.vfTitles.shift();
    						//this.virtualFields.shift(); 						
    					} 		
    				}
    			}
    			str = str.replace(vf, "\n" + this.myView + ".addField( '" + vfField + "', '" + vfTable + "', 'AXVW', false, false, 'Virtual Field', '', '" + title + "', 0, '" + data_type + "', false, true, '" + sql + "' ) ;\n"); 
    		}
    	}
    	return str;
    },
    
    generateVFSQLObject: function(vfPattern){
    	var vf = new Object();
    	vf.generic = this.getVFSQL('generic', vfPattern);
    	vf.oracle = this.getVFSQL('oracle', vfPattern);
    	vf.sqlServer = this.getVFSQL('sqlServer', vfPattern);
    	vf.sybase = this.getVFSQL('sybase', vfPattern);
    	return toJSON(vf);  	    	
    },

    getVFSQL: function(dialect, vfPattern){
    	var pattern = new RegExp('dialect="' + dialect + '"', 'gi');
    	if(pattern.test(vfPattern)){
    		return getTagValue(vfPattern, '<sql.*?dialect\=\"' + dialect + '\">', '<\/sql>');
    	} else {
    		return '';
    	}
    },
         	      
    /**
     * Replace the <fields> entries in the visible field list. Convert: 
     * <field name="bl_id" table="rm" />
     *       :to:
     * myView.addField( "rm", "rm_id" ) ;
     * Also replace groupby and measures fields.
     *
     * @param	str		String		Original string with XML fields
     * @return	str		String		String containing Javascript fields
     *
     */
    convertFile_replaceFields: function(str){
    	// place vf titles in datasource section
    	str = this.convertFile_consolidateVFFields(str);

		// max field
        //                              $1 table         $2 field								$3 restriction parameter
        var objRegExp = /<field.*table\=(\".*?\").*name\=(\".*?\").*formula\=\"max\".*>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>/gi;
        str = str.replace(objRegExp, this.myView + ".addField( $2, $1, 'AXVW', false, false, '', '' ) ;"); 
     
        //17.2 groupBy Field
        var objRegExp = /<field.*baseField\="(.*)\.(.*)".*formula\="(year|quarter|month|week|day)".*groupBy\="true".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true, \"$3\" ) ;');
        
        var objRegExp = /<field.*baseField\="(.*)\.(.*)".*groupBy\="true".*formula\="(year|quarter|month|week|day)".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true, \"$3\" ) ;');
        
        var objRegExp = /<field.*groupBy\="true".*baseField\="(.*)\.(.*)".*formula\="(year|quarter|month|week|day)".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true, \"$3\" ) ;');
          
        var objRegExp = /<field.*formula\="(year|quarter|month|week|day)".*baseField\="(.*)\.(.*)".*groupBy\="true".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$2\", \"$3\", \"\", \"AXVW\", true, \"$1\" ) ;');
        
        var objRegExp = /<field.*formula\="(year|quarter|month|week|day)".*groupBy\="true".*baseField\="(.*)\.(.*)".*groupBy\="true".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$2\", \"$3\", \"\", \"AXVW\", true, \"$1\" ) ;');
        
        var objRegExp = /<field.*groupBy\="true".*formula\="(year|quarter|month|week|day)".*baseField\="(.*)\.(.*)".*groupBy\="true".*\/\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addSortField( \"$2\", \"$3\", \"\", \"AXVW\", true, \"$1\" ) ;');
 
        // Regular groupBy
        // summary report
        if(this.pattern.match(/summary/gi)){
        	var objRegExp = /<field.*table\="(.*)".*name\="(.*)".*groupBy\="(.*)".*\/\>?/gi;
        	str = str.replace(objRegExp,   	this.myView + '.addFieldIfNotExists( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" + 
        	//  	this.myView + '.addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true ) ;') ; 
        	'');

        	var objRegExp = /<field.*name\="(.*)".*table\="(.*)".*groupBy\="(.*)".*\/\>?/gi;
        	str = str.replace(objRegExp,    	this.myView + '.addFieldIfNotExists( \"$1\", \"$2\", \"AXVW\", true ) ;' + "\n" + 
        	//   	this.myView + '.addSortField( \"$2\", \"$1\", \"\", \"AXVW\", true ) ;') ;
        	'');
      	}
         
        // 17.2 Measures 
        var objRegExp = /<field.*name\="(.*)".*formula\="(.*)".*baseField\="(.*?)\.(.*?)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        //       	var objRegExp = /<field.*name\="(.*)".*formula\="(.*)".*baseField\="(.*?)\.(.*?)".*\>[.|\n|\r|\s\d\D\w\W]*<\/field\>?/gi ;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$4\", \"$3\", \"AXVW\", true ) ;' + "\n" +
        this.myView +
        '.addMeasure( \"$4\", \"$2\", \"$1\", \"$5\",  \"$5\", \"$3\" ) ;');

        var objRegExp = /<field.*formula\="(.*)".*baseField\="(.*?)\.(.*?)".*name\="(.*)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$3\", \"$2\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$3\", \"$1\", \"$4\", \"\", \"\", \"$2\" ) ;');
        
        var objRegExp = /<field.*baseField\="(.*?)\.(.*?)".*name\="(.*)".*formula\="(.*)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$2\", \"$4\", \"$3\", \"\", \"\", \"$1\" ) ;');

        // Count percent                 						          		
        var objRegExp = /<field.*name\="(count_percent.*)".*baseField\="(.*?)\.(.*?)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$3\", \"$2\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$3\", \"count_percent\", \"$1\", \"$4\", \"$4\", \"$2\" ) ;');
        
        var objRegExp = /<field.*baseField\="(.*?)\.(.*?)".*name\="(count_percent.*)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$2\", \"count_percent\", \"$3\", \"\", \"\", \"$1\" ) ;');
        
        // Sum percent
        var objRegExp = /<field.*name\="(sum_percent.*)".*baseField\="(.*?)\.(.*?)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$3\", \"$2\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$3\", \"sum_percent\", \"$1\", \"$4\", \"$4\", \"$2\" ) ;');
        
        var objRegExp = /<field.*baseField\="(.*?)\.(.*?)".*name\="(count_percent.*)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$2\", \"sum_percent\", \"$3\", \"\", \"\", \"$1\" ) ;');
         
        // Average percent
        // var objRegExp = /<field.*name\="(avg_percent.*)".*baseField\="(.*?)\.(.*?)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        // str = str.replace(objRegExp, this.myView + '.addField( \"$3\", \"$2\", \"AXVW\", true ) ;' + "\n" +
        // this.myView + '.addMeasure( \"$3\", \"avg_percent\", \"$1\", \"$4\", \"$4\", \"$2\" ) ;');
        
        var objRegExp = /<field.*baseField\="(.*?)\.(.*?)".*name\="(count_percent.*)".*\>[.|\n|\r|\s|\S]*?myView.addTitle\( \"(.*)\" \)[.|\n|\r|\s|\S]*?<\/field\>?/gi;
        str = str.replace(objRegExp, this.myView + '.addFieldIfNotExists( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( \"$2\", \"avg_percent\", \"$3\", \"\", \"\", \"$1\" ) ;');

		// restriction parameter
        //                                $1 table         $2 field								$3 restriction parameter
        var objRegExp = /<field.*table\=(\".*?\").*name\=(\".*?\").*restrictionParameterName\=(\".*?\").*>/gi;
        str = str.replace(objRegExp, this.myView + ".addField( $2, $1, 'AXVW', false, false, '', $3 ) ;");        
        
        //                                $1 field         $2 table								$3 restriction parameter
        var objRegExp = /<field.*name\=\"(.*?)\".*table\=\"(.*?)\".*restrictionParameterName\=\"(.*?)\".*>/gi;        
        str = str.replace(objRegExp, this.myView + ".addField( $1, $2, 'AXVW', false, false, '', $3 ) ;");
      	       
        // showTotals
        //                                $1 table         $2 field								$3 showTotals
        var objRegExp = /<field.*table\=\"(.*?)\".*name\=\"(.*?)\".*showTotals\=(\"true.*?\").*>/gi;
        str = str.replace(objRegExp, this.myView + '.addField( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( "$2", \"sum\", \"\", \"\", \"\", \"$1\" ) ;');       
        
        //                                $1 field         $2 table								$3 showTotals
        var objRegExp = /<field.*name\=\"(.*?)\".*table\=\"(.*?)\".*showTotals\=\"true.*?\".*>/gi;        
        str = str.replace(objRegExp, this.myView + '.addField( \"$2\", \"$1\", \"AXVW\", true ) ;' + "\n" +
        this.myView + '.addMeasure( "$2", \"sum\", \"\", \"\", \"\", \"$1\" ) ;');

     		var fldRegExp = /<field.*name=".*?"[\S|\s]*?.*>[\S|\s]*?<\/field>|<field.*name=".*?"[\S|\s]*?.*\/>/gi;

        var fields = str.match(fldRegExp);

				if(fields && this.convertedTextOfFile.match(/columnreport/gi)){
        	//  expandedFlds ? expandedFlds.concat(unexpandedFlds): unexpandedFlds;
        	var nameRegExp = /([\S|\s]*name=")(.*?)("[\S|\s]*)/gi; 		
    			var tableRegExp = /([\S|\s]*<field.*table=")(.*?)("[\S|\s]*)/gi; 	
    			var rowspanRegExp = /([\S|\s]*rowspan=")(.*?)("[\S|\s]*)/gi; 	
    			var colspanRegExp = /([\S|\s]*colspan=")(.*?)("[\S|\s]*)/gi; 
    			var titleRegExp = /([\S|\s]*title=")(.*?)("[\S|\s]*)/gi; 
    			//var titleRegExp = /([\S|\s]*<title translatable="true">)(.*?)(<\/title>[\S|\s]*)/gi; 
    		
    			for(var k=0; k <fields.length; k++){
    				// get attributes
    				var field_name = fields[k].replace(nameRegExp, "$2");
    				var table_name = fields[k].replace(tableRegExp, "$2");
    				var colspan = fields[k].match(colspanRegExp, "$2") ? fields[k].replace(colspanRegExp, "$2") : null;
    				var rowspan = fields[k].match(rowspanRegExp) ? fields[k].replace(rowspanRegExp, "$2") : null;
    				var title = fields[k].match(titleRegExp) ? fields[k].replace(titleRegExp, "$2") : '';

    				var tmpFldStr =  ".addField('" + field_name + "', '" + table_name + "', 'AXVW', false, 	false ";

 	   				// afm_type
    				tmpFldStr += ", ''";
    				// restriction_parameter
    				tmpFldStr += ", ''";
    				// ml_heading
    				tmpFldStr += ", '" + title + "'";    			
    				// ml_heading_english
    				tmpFldStr += ", '" + title + "'"; 
    				// pkey
    				tmpFldStr += ", ''";
    				// data_type
    				tmpFldStr += ", ''";
    				// showSelectValueAction
    				tmpFldStr += ", false";    			
    				// is_virtual
    				tmpFldStr += ", false";  
    				// sql
    				tmpFldStr += ", ''";  
    				// rowspan

    				tmpFldStr += ", " + rowspan;  
    				// colspan

    				tmpFldStr += ", " + colspan;
    			
    				// ml_heading_english_original
    				tmpFldStr += ", '" + title + "'"; 

    				tmpFldStr += ") ;";

    				str = str.replace( fields[k].toString(), this.myView + tmpFldStr.toString());
    				// str = str.replace(objRegExp, this.myView + ".addField( $3, $2, 'AXVW', false, false, '', '' ) ;");
    			}
				}

        // fields                			       
        //                $1                  $2 field         $3 table
        var objRegExp = /(<field)[\s]*name=[\s]*("[A-Za-z_0-9]*")[\s]*table=[\s]*("[A-Za-z_0-9]*").*/gi        
        str = str.replace(objRegExp, this.myView + ".addField( $2, $3, 'AXVW', false, false, '', '' ) ;");
        
        //                $1                  $2 table         $3 field
        var objRegExp = /(<field)[\s]*table=[\s]*("[A-Za-z_0-9]*")[\s]*name=[\s]*("[A-Za-z_0-9]*").*/gi;       
        str = str.replace(objRegExp, this.myView + ".addField( $3, $2, 'AXVW', false, false, '', '' ) ;");
        
        return str;        
    },
    

	convertFile_replaceSortFields: function(str){
		// sort fields
        objRegExp = /<sortField.*name\=\"(.*?)\".*table\=\"(.*?)\".*ascending\=\"(true|false)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$1\", \"\", \"AXVW\", $3) ;");
        
        objRegExp = /<sortField.*table\=\"(.*?)\".*name\=\"(.*?)\".*ascending\=\"(true|false)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addSortField( \"$1\", \"$2\", \"\", \"AXVW\", $3) ;");
        
        objRegExp = /<sortField.*name\=\"(.*?)\".*table\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addSortField( \"$2\", \"$1\", \"\", \"AXVW\", true) ;");
        
        objRegExp = /<sortField.*table\=\"(.*?)\".*name\=\"(.*?)\".*>/gi;
        str = str.replace(objRegExp, this.myView + ".addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true) ;");

  		return str;
	},
	    
    /**
     *  Replace mdx measures.
     *  <measure name="Avg" aggregator="avg" column="area" >
     *      <title translatable="true">Average</title>
     *  </measure>
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceMeasures: function(){
        /* 			var objRegExp = /<measure.*name\=(".*").*aggregator\=(".*").*column\=(".*").*>[.|\n|\r|\s|\S]*?<title.*>(.*)<\/title>[.|\n|\r|\s|\S]*?<\/measure>/gi ;	
         this.convertedTextOfFile = this.convertedTextOfFile.replace( objRegExp,
         this.myView + ".addMeasure( $1, $2, $3, FOUR$4FOUR, FIVE$5FIVE ) ;"
         ) ;
         */
        var objRegExp = /<measure .*>[.|\n|\r|\s|\S]*?<\/measure>/gi;
        var measures = this.convertedTextOfFile.match(objRegExp);
        var newMeasures = "";
        
        if (measures != null) {
            for (var i = 0; i < measures.length; i++) {
                var titleRegExp = /<measure.*>[.|\n|\r|\s|\S]*?<title.*>([.|\n|\r|\s|\S]*?)<\/title>[.|\n|\r|\s|\S]*?<\/measure>/gi;
                var title = measures[i].replace(titleRegExp, "$1");
                var nameRegExp = /<measure.*name\="([.|\n|\r|\s|\S]*?)".*>[.|\n|\r|\s|\S]*?<\/measure>/;
                var name = measures[i].replace(nameRegExp, "$1");
                var aggregatorRegExp = /<measure.*aggregator\="([.|\n|\r|\s|\S]*?)".*>[.|\n|\r|\s|\S]*?<\/measure>/;
                var aggregator = measures[i].replace(aggregatorRegExp, "$1");
                var columnRegExp = /<measure.*column\="([.|\n|\r|\s|\S]*?)".*>[.|\n|\r|\s|\S]*?<\/measure>/;
                var column = measures[i].replace(columnRegExp, "$1");
                
                newMeasures += 'myView.addMeasure( "' + column + '", "' + aggregator + '", "' + name + '", "' + title + '", "' + title + '", "' + '") ; \n';
            }
            this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
            this.convertedTextOfFile += newMeasures;
        }
        
    },
    
    /**
     * Replace dimensions and remove sort
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceDimensionsAndRemoveSort: function(){
        var dimRegExp = /<dimension .*>[.|\n|\r|\s|\S]*?<\/dimension>/gi;
        var sortRegExp = /<sort>[.|\n|\r|\s|\S]*?<\/sort>/gi;
        
        var dimensions = this.convertedTextOfFile.match(dimRegExp);
        if (dimensions != null) {
            if (this.convertedTextOfFile.match(sortRegExp)) {
                this.convertedTextOfFile = this.convertedTextOfFile.replace(sortRegExp, "");
            }
            
            for (var i = 0; i < dimensions.length; i++) {
                var tableRegExp = /<dimension.*table\="([.|\n|\r|\s|\S]*?)".*>[.|\n|\r|\s|\S]*?<\/dimension>/;
                var table = dimensions[i].replace(tableRegExp, "$1");
                
                var columnRegExp = /<dimension.*column\="([.|\n|\r|\s|\S]*?)".*>[.|\n|\r|\s|\S]*?<\/dimension>/;
                var column = dimensions[i].replace(columnRegExp, "$1");
                
                var titleRegExp = /<dimension.*>[.|\n|\r|\s|\S]*?<title.*>([.|\n|\r|\s|\S]*?)<\/title>[.|\n|\r|\s|\S]*?<\/dimension>/gi;
                var title = dimensions[i].replace(titleRegExp, "$1");
                
                this.convertedTextOfFile = this.convertedTextOfFile.replace(dimRegExp, '\n' + this.myView + '.addSortField( "' + table + '", "' + column + '", "' + title + '", "AXVW",' + ' true ) ;');
                
                
            }
        }
    },
    
    /**
     * Replace grouping axis as sort field
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_replaceGroupingAxis: function(){
        //                       $1 table          $2 name        
        var objRegExp = /<groupingAxis.*table\="(.*)".*field\="(.*)".*\>[\s\S]*<\/groupingAxis>?/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, this.myView + '.addSortField( \"$1\", \"$2\", \"\", \"AXVW\", true ) ;');
    },
    
    /**
     * Replace the SetSort statements with Javascript.  Convert
     * <sort unique="false">
     *     <order>
     *         <field name="dv_id" table="rm" ascending="true"/>
     *         <field name="area" table="rm" ascending="false"/>
     *     </order>
     * </sort>
     * to:
     * myView.addSortField( "rm", "dv_id", "", "AXVW", true ) ;
     * myView.addSortField( "rm", "area", "", "AXVW", false ) ;
     * Bank on the fact that only sort fields have the ascending followed by true or false.
     * Leave the <sort> and <order> tags for a later step to clean  up.
     *
     * @param	str		String	Original string
     * @return	str		String	String with set sort statements converted to Javascript
     *
     */
    convertFile_replaceSort: function(str){
    	  // kb3025393
        //               $1        $2 field           %3 table           $4           $5                              
        // var objRegExp = /(<field).*"([A-Za-z_0-9]*)".*"([A-Za-z_0-9]*)".*(ascending).*(true|false).*>/gi;
        var objRegExp = /<field.*name\=\"(.*?)\".*table\=\"(.*?)\".*ascending\=\"(.*?)\".*>/gi;        
        str = str.replace(objRegExp, '              ' + this.myView + ".addSortField( \"$2\", \"$1\", \"\", \"AXVW\", $3 ) ;");

        var objRegExp = /<field.*table\=\"(.*?)\".*name\=\"(.*?)\".*ascending\=\"(.*?)\".*>/gi;        
        str = str.replace(objRegExp, '              ' + this.myView + ".addSortField( \"$1\", \"$2\", \"\", \"AXVW\", $3 ) ;");
        
        return str;
    },
    
    /**
     * Replace the parsed and SQL restrictions with the equivalent JavaScript. Convert:
     * <clause relop="AND" op="=" table="bl" name="bl_id" value="HQ" />
     * to this form:
     *                                     relop,   table, field, op,   value
     * myView.addParsedRestrictionClause( ")AND(", "rm", "area", "<>", "100.00" ) ;
     * Leave the <title> and <restriction> tags for a later step to clear.
     *
     * @param	str		String 	Original XML string
     * @return	str		String	String replaced with Javascript
     *
     */
    convertFile_replaceParamRestrictions172: function(str){
    
        // 17.2        
        //                       $1 relop   $2 op       $3 table    $4 name      $5 value        
        // var objRegExp = /[\s]*<clause.*relop\=(".*").*op\=(".*").*table\=(".*").*name\=(".*").*value\=("\${parameters\['.*").*\/\>?/gi;
        var objRegExp = /[\s]*<clause.*relop\=(".*").*op\=(".*").*table\=(".*").*name\=(".*").*value\="\${parameters\[('.*')]}".*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParamRestrictionClause( $1, $3, $4, $2, $5 ) ; \n");
        
        //                        $1 op       $2 table    $3 name      $4 value          $5 relop
        var objRegExp = /[\s]*<clause.*op\=(".*").*table\=(".*").*name\=(".*").*value\="\${parameters\[('.*')]}".*relop\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParamRestrictionClause( $5, $2, $3, $1, $4 ) ; \n");
        
        //                       $1 table    $2 name      $3 value          $4 relop         $5 op
        var objRegExp = /[\s]*<clause.*table\=(".*").*name\=(".*").*value\="\${parameters\[('.*')]}".*relop\=(".*").*op\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParamRestrictionClause( $4, $1, $2, $5, $3 ) ; \n");
        
        //                       $1 name      $2 value          $3 relop         $4 op            $5 table 
        var objRegExp = /[\s]*<clause.*name\=(".*").*value\="\${parameters\[('.*')]}".*relop\=(".*").*op\=(".*").*table\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParamRestrictionClause( $3, $5, $1, $4, $2 ) ; \n");
        
        //                       $1 value          $2 relop         $3 op            $4 table 		$5 name      
        var objRegExp = /[\s]*<clause.*name\=(".*").*value\="\${parameters\[('.*')]}".*relop\=(".*").*op\=(".*").*table\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParamRestrictionClause( $2, $4, $5, $3, $1 ) ; \n");
        
        return str;
    },
    
    /**
     * Replace the parsed and SQL restrictions with the equivalent JavaScript. Convert:
     * <clause relop="AND" op="=" table="bl" name="bl_id" value="HQ" />
     * to this form:
     *                                     relop,   table, field, op,   value
     * myView.addParsedRestrictionClause( ")AND(", "rm", "area", "<>", "100.00" ) ;
     * Leave the <title> and <restriction> tags for a later step to clear.
     *
     * @param	str		String 	Original XML string
     * @return	str		String	String replaced with Javascript
     *
     */
    convertFile_replaceRestrictions172: function(str){
    
        // 17.2        
        //                       $1 relop   $2 op       $3 table    $4 name      $5 value        
        var objRegExp = /[\s]*<clause.*relop\=(".*").*op\=(".*").*table\=(".*").*name\=(".*").*value\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $1, $3, $4, $2, $5 ) ; \n");
        
        //                        $1 op       $2 table    $3 name      $4 value          $5 relop
        var objRegExp = /[\s]*<clause.*op\=(".*").*table\=(".*").*name\=(".*").*value\=(".*").*relop\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $5, $2, $3, $1, $4 ) ; \n");
        
        //                       $1 table    $2 name      $3 value          $4 relop         $5 op
        var objRegExp = /[\s]*<clause.*table\=(".*").*name\=(".*").*value\=(".*").*relop\=(".*").*op\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $4, $1, $2, $5, $3 ) ; \n");
        
        //                       $1 name      $2 value          $3 relop         $4 op            $5 table 
        var objRegExp = /[\s]*<clause.*name\=(".*").*value\=(".*").*relop\=(".*").*op\=(".*").*table\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $3, $5, $1, $4, $2 ) ; \n");
        
        //                       $1 value          $2 relop         $3 op            $4 table 		$5 name      
        var objRegExp = /[\s]*<clause.*name\=(".*").*value\=(".*").*relop\=(".*").*op\=(".*").*table\=(".*").*\/\>?/gi;
        var str = str.replace(objRegExp, this.myView + ".addParsedRestrictionClause( $2, $4, $5, $3, $1 ) ; \n");
        
        return str;
    },
    
    
    /**
     * Replace Pre-172 XML restrictions to 17.2 and later XML format. Convert:
     * <restriction type="parsed">
     *     <title translatable="false">Parsed Restriction</title>
     *     <clause relop="AND" op="=" value="HQ">
     *         <field name="bl_id" table="rm"/>
     *     </clause>
     * </restriction>
     * to this form:
     *               relop,  		op		 table, 	field,  value
     * <clause relop="AND" op="=" table="bl" name="bl_id" value="HQ" />
     *
     * @param	str		String		Input string with pre-172 XML restrictions
     * @return	str		String 		Output string with post-172 XML restrictions
     *
     */
    convertFile_replaceRestrictionsPre172: function(str){
        //                $1       $2 relop  $3 op   $4 val    $5              $6         $7 fld  $8 tbl         
        var objRegExp = /(<clause).*(".*").*(".*").*(".*").*>.*(\r\n|\n|\n\r).*(<field).*(".*").*(".*").*/gi;
        str = str.replace(objRegExp, '<clause relop=$2 op=$3 table=$8 name=$7 value=$4 />');
        
        
        //                $1      $2 op   $3 val    $4              $5         $6 fld  $7 tbl         
        var objRegExp = /(<clause).*(".*").*(".*").*>.*(\r\n|\n|\n\r).*(<field).*(".*").*(".*").*/gi;
        str = str.replace(objRegExp, '<clause relop= op=$2 table=$7 name=$6 value=$3 />');
        
        return str;
    },    
    
    /**
     * Replace SQL Restrictions with their JavaScript equivalent.
     * The actual <field table="tbl" /> tag is optional, and doesn't appear in most views.
     * The sql statement itself can legally span lines (sql="can span lines"), but this
     * usage is obscure and very rare.
     * Convert:
     *  <restriction type="sql" sql="rm.fl_id='18'">
     *      <title translatable="false">SQL Restriction</title>
     *      <field table="rm"/>
     *  </restriction>
     *  to this form:
     *  myView.addSqlRestriction( "wr", "wr.status in ('I','HP','HA','HL')" ) ;
     *
     * @param	str		String	Original XML string
     * @return	str		String	String with Javascript
     *
     */
    convertFile_replaceSQLRestrictions: function(str){
        //                $1                    $2 sql
        var objRegExp = /(<restriction).*"sql".*(".*").*/gi;
        str = str.replace(objRegExp, this.myView + ".addSqlRestrictionToTgrp( $2 ) ;");
        return str;
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
		
        // set a warning flag if the view uses dialect="oracle" sections.  These are server-dependent functions that will not translate.      
        var objRegExp = /"oracle"/gi;     
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagServerDependentFunctions = true;
        
        // set a warning flag if mdx with custom query
        var objRegExp = /"<query>"/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagCustomMdxQuery = true;
        
        // set a warning flag if console view    
        var objRegExp = /"<restrictionConsole"/gi;    
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagConsole = true;
        
        // set a warning flag if custom Xsl formatting, ala <xsl file="ab-add-action-create.xsl" />    
        var objRegExp = /"<xsl"/gi;  
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagXsl = true;
        
        // set a warning flag if custom framests
        var objRegExp = /"frms"/gi;
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagFramesets = true;
        
        // set a warning flag if statistics      
        var objRegExp = /"<statistics>"/gi; 
        if (objRegExp.test(this.convertedTextOfFile)) 
            this.warningFlagStatistics = true;  
    },  
    
    /**
     * Clear unconvertable lines.
     *
     * @param	None
     * @return	None
     *
     */
    convertFile_clearRemainingLines: function(){

		// clear remaining <mdx> tags
        var objRegExp = /<mdx>[.|\n|\r|\s\d\D\w\W]*<\/mdx>/;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
  
        // if there is an mdx query, clear that section out first, as the query itself may expand several lines.  An example is: ab-bl-churn-report.axvw      
        var objRegExp = /<query>[.|\n|\r|\s\d\D\w\W]*<\/query>/;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        
        // replace all other values sitting between broken brackets (<>). this includes statistics, specialized preferences, etc.    						
        var objRegExp = /<.*>/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "");
        
        // clear purely blank lines. (That is: newline + any number of blank chars + newline: replace with one newline.)
        var objRegExp = /\n\s*\n/gi;
        this.convertedTextOfFile = this.convertedTextOfFile.replace(objRegExp, "\n");
        
    },

    /**
     * Replace URL
     *
     * @param	None
     * @return 	None
     *
     */    
    convertFile_replaceURL: function(){
    	var urlRegExp = /([\S|\s]*url=")(.*?)("[\S|\s]*)/gi; 	
    	this.convertedTextOfFile = this.convertedTextOfFile.replace(urlRegExp,  this.convertedTextOfFile + '\n' + this.myView + ".addURL( '$2' ) ;" );
    },
    
    /**
     * Move column report options from panels to datasource
     *
     * @param	None
     * @return 	None
     *
     */
    convertFile_moveColumnReportOptsToDs: function(){
    	if(this.convertedTextOfFile.match(/columnreport/gi)){	

    		//var panelRegExp = /<panel.*dataSource=".*?"[\S|\s]*?.*>[\S|\s]*?<field.*table\=\".*?\".*name\=\".*?\".*restrictionParameterName\=\".*?\".*\/>[\S|\s]*?<\/panel>?/gi;
    		var panelRegExp = /<panel.*dataSource=".*?"[\S|\s]*?.*>[\S|\s]*?<field.*name\=\".*?\"[\S|\s]*?<\/panel>/gi;
    		var panels = this.convertedTextOfFile.match(panelRegExp);

    		// regular expression to extract the ds_id from the panel
    		var panelDsRegExp = /(<panel.*dataSource=")(.*?)("[\S|\s]*?.*>[\S|\s]*?[\S|\s]*?<\/panel>?)/;
    		
    		// regular expression to extract the table_name, field_name, and restriction_parameter from the panel field
    		var expandedFldRegExp = /<field.*name=".*?"[\S|\s]*?.*>[\S|\s]*?<\/field>/gi;
    		var unexpandedFldRegExp = /<field.*name=".*?"[\S|\s]*?.*\/>/gi;
    		var nameRegExp = /([\S|\s]*name=")(.*?)("[\S|\s]*)/gi; 		
    		var tableRegExp = /([\S|\s]*<field.*table=")(.*?)("[\S|\s]*)/gi; 	
    		var rowspanRegExp = /([\S|\s]*rowspan=")(.*?)("[\S|\s]*)/gi; 	
    		var colspanRegExp = /([\S|\s]*colspan=")(.*?)("[\S|\s]*)/gi; 
    		var titleRegExp = /([\S|\s]*<title translatable="true">)(.*?)(<\/title>[\S|\s]*)/gi; 
    		    		    		    		    		
    		// loop through each panel
    		if (panels){
    			for (var i = 0; i < panels.length; i++) {
    				var panel = panels[i];
    				// get the ds_id
    				var ds_id = panel.replace(panelDsRegExp, "$2");
    				
    				var fldRegExp = /<field.*name=".*?".*?\/>|<field.*name=".*?"[\S|\s]*?.*>[\S|\s]*?<\/field>/gi;    				    				  				    				    				
    				var fields = panels[i].match(fldRegExp);

    				for(var k=0; k <fields.length; k++){
   					
    					// get attributes
    					var field_name = fields[k].replace(nameRegExp, "$2");
    					var table_name = fields[k].replace(tableRegExp, "$2");
     					var colspan = fields[k].match(colspanRegExp, "$2") ? fields[k].replace(colspanRegExp, "$2") : null;
    					var rowspan = fields[k].match(rowspanRegExp) ? fields[k].replace(rowspanRegExp, "$2") : null;
     					var title = fields[k].match(titleRegExp) ? fields[k].replace(titleRegExp, "$2") : null;

     					// find the correct field in the datasource, and add attribute and its value to <field>
    					var x = '(<dataSource.*id=\"' + ds_id + '\"[\\S|\\s]*?.*>[\\S|\\s]*?';
    					x += '<field.*table\=\"' + table_name + '\".*name\=\"' + field_name + '\")' + '(.*>)';
    					x += '([\\S|\\s]*?<\/dataSource>?)';

     					var dsRegExp = new RegExp(x, 'm');
    					     						
     					if(colspan != null){
     						this.convertedTextOfFile = this.convertedTextOfFile.replace(dsRegExp, '$1 colspan="' + colspan + '" $2$3');
     					}
     					
     					if(rowspan != null){    						
     						this.convertedTextOfFile = this.convertedTextOfFile.replace(dsRegExp, '$1 rowspan="' + rowspan + '" $2$3');
     					}

     					if(title != null){    					
     						this.convertedTextOfFile = this.convertedTextOfFile.replace(dsRegExp, '$1 title="' + title + '" $2$3');
     					}
     					
     					// remove the <field> so that we don't parse it again
     					//panel = panel.replace(fields[k], '');	
  					    					   					
    				}
    			}				
    		}
    	}
    }
    
    
}); // end definition of Ab.ViewDef.ConvertAvw class




