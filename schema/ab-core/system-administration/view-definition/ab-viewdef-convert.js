/**
 * ab-viewdef-convert.js
 * Class for converting old-school .avw and .axvw files to v17.3-and-later rich-interface files.
 *
 */
Ab.namespace('ViewDef');

/**
 * Class to convert view files using a series of regular expression replacements.
 *
 */
Ab.ViewDef.Convert = Base.extend({
    /** 
     * Constructor
     *
     * @param	contentsToConvert	String 	Contents of the view file that needs to be converted
     * @param	viewVariableName	String	Name of the view variable to which to add the view definition after the evaluation, e.g. "top.Ab.ViewDef.myView"
     * @return	None
     *
     */
    constructor: function(contentsToConvert, viewVariableName){
        this.convertedContents = contentsToConvert;
        this.viewVariableName = viewVariableName;
    },
    
    // ---- Member Variables ----------------    
    // string to hold converted contents.  The string in this variable is converted in a series of regex replaces.
    convertedContents: "",
    
    // contents after conversion to JavaScript.
    convertedContentsAsJavascript: "",
    
    // string to hold the name of the js variable which will hold the view object. 
    viewVariableName: "",
    
    // flag holding whether there are unconvertable parts to .avw .axvw
    warningHasUnconvertableSections: false,
    
    // description of what those unconvertable parts are.
    descUnconvertableSections: "",
    
    
    //  ---- Accessors ----------------  
    
    /**
     * Returns true if file just converted has sections that cannot be converted automatically.
     *
     * @param	None
     * @return	this.warningHasUnconvertableSections	Boolean	Whether there were unconvertable sections
     *
     */
    hasUnconvertableSections: function(){
        return this.warningHasUnconvertableSections;
    },
    
    /**
     * Description of what those uncovertable parts were.
     *
     * @param	None
     * @return	this.descUnconvertableSections	String	Description of unconvertable sections
     *
     */
    getDescriptionOfUnconvertableSections: function(){
        return this.descUnconvertableSections;
    },
    
    /**
     * Contents after conversion to JavaScript.
     *
     * @param	None
     * @return	this.convertedContentsAsJavascript	String	Contents after conversion
     *
     */
    getConvertedContentsAsJavascript: function(){
        return this.convertedContentsAsJavascript;
    },
    
    /**
     * Perform the conversion based on file type.
     *
     * @param	None
     * @return	None
     *
     */
    convertDo: function(){
        if (this.isAvwFile()) {
            this.regexTheAvwFile();
        }
        else {
            this.regexTheAxvwFile();
        }
    },
    
    /**
     * Return true if the file is an .avw; false if it is an .axvw.
     *
     * @param	None
     * @return	objRegExp.test(this.convertedContents)	Boolean	True if .avw
     *
     */
    isAvwFile: function(){
    
        // an avw definition begins with "StartDef"; axvw's don't.
        var objRegExp = /StartDef/gi;
        return (objRegExp.test(this.convertedContents)) ? true : false;
    },
    
    /**
     * Run the regex replaces on a Windows view file.
     *
     * @param	None
     * @return	None
     *
     */
    regexTheAvwFile: function(){
        myAvwConverter = new Ab.ViewDef.ConvertAvw();
        myAvwConverter.convertDo(this.convertedContents, this.viewVariableName);
        this.warningHasUnconvertableSections = myAvwConverter.hasUnconvertableSections();
        this.descUnconvertableSections = getMessage('conversionWarning1') + "\n\n" + getMessage('conversionWarning2') + myAvwConverter.getDescriptionOfUnconvertableSections();
        this.convertedContentsAsJavascript = myAvwConverter.getConvertedFileAsJavaScript();
    },
    
    
    /**
     * Run the replaces on a Web view file.
     *
     * @param	None
     * @return	None
     *
     */
    regexTheAxvwFile: function(){
        myAxvwConverter = new Ab.ViewDef.ConvertAxvw();
        myAxvwConverter.convertDo(this.convertedContents, this.viewVariableName);
        this.warningHasUnconvertableSections = myAxvwConverter.hasUnconvertableSections();
        this.descUnconvertableSections = getMessage('conversionWarning1') + "\n\n" + getMessage('conversionWarning2') + myAxvwConverter.getDescriptionOfUnconvertableSections();
        this.convertedContentsAsJavascript = myAxvwConverter.getConvertedFileAsJavaScript();
    }
    
}); // end definition of Ab.convert.Convert class

