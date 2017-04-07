
/*
 ab-viewdef-readfile.js
 Class for reading .avw and .axvw files.
 */
AFM.namespace('ViewDef');


/* Class to read a file into a string and call the next step. */

AFM.ViewDef.Reader = Base.extend({
    //  Name of file just read.
    fileToRead: "",
    
    //  Contents of file just read.
    fileContents: "",
    
    fileSuccessfullyMoved: false,
    constructor: function(){
    },
    
    /*
     * Read the given file.
     */
    readFile: function(fileToRead){
        this.fileToRead = fileToRead;
        if (!this.browserIsFirefox()) 
            this.readFileToStringForIE(fileToRead);
        else 
            this.readFileToStringForFirefox(fileToRead);
    },
    
    /* Return true if the browser is Firefox, false if it is IE */
    browserIsFirefox: function(){
        return ((navigator.userAgent.toUpperCase()).indexOf("FIREFOX") > 0);
    },
    
    
    /*
     * readFileToStringForIE
     * Use the FileSystemObject from IE to read a file.
     *
     * Expects a filename in the form d:\\tm\\conv\\arpctxbu.avw, the
     * form returned by the <input> file browser control.
     *
     *If you get an error: "Error: Number:-2146827859
     *    Description:Automation server can't create object":
     *
     * Then enable ActiveX objects:
     *   o In Internet Explorer > Tools > Internet Options > Security > Custom Level
     *   o Set to Enable or Prompt the "Initialize and Script ActiveX
     *     controls not marked as safe" setting
     */
    readFileToStringForIE: function(fileName){
        objFSO = new ActiveXObject("Scripting.FileSystemObject");
        if (objFSO.FileExists(fileName)) {
            try {
                this.fileContents = objFSO.OpenTextFile(fileName, 1).ReadAll();
            } 
            catch (e) { // ?? localization
                alert("Cannot read file: " + fileName + " " + e.message);
            }
        }
        else { // ?? localization
            alert("No such file named: " + fileName);
        }
    },
    
    
    /* ---- readFileToStringForFirefox ----------------
     *
     */
    // Please refer to: http://developer.mozilla.org/en/docs/Code_snippets:File_I/O
    
    readFileToStringForFirefox: function(fileName){
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(fileName);
            
            this.fileContents = "";
            var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
            var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
            
            fstream.init(file, 0x01, 00004, null);
            sstream.init(fstream);
            
            var str = sstream.read(4096);
            while (str.length > 0) {
                this.fileContents += str;
                str = sstream.read(4096);
            }
            
            sstream.close();
            fstream.close();
        } 
        catch (e) {
            alert(e);
            return false;
        }
        
    },
    
    
    /* Write the contents of AFM.ViewDef.readerContents into the file. */
    writeFile: function(fileToWrite, fileContents){
        if (!this.browserIsFirefox()) 
            this.writeStringToFileForIE(fileToWrite, fileContents);
        else 
            this.writeStringToFileForFirefox(fileToWrite, fileContents);
    },
    
    moveFile: function(fromFileName, toFileName){
        if (!this.browserIsFirefox()) 
            this.moveFileForIE(fromFileName, toFileName);
        else 
            this.moveFileForFirefox(fromFileName, toFileName);
    },
    
    /*
     * Use the FileSystemObject from IE to write a file.
     *
     */
    writeStringToFileForIE: function(fileName, fileContents){
    
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        if (valueExists(objFSO)) {
            try {
                var fileHandle = objFSO.CreateTextFile(fileName, true, false);
                
                //     var fileHandle = objFSO.OpenTextFile( fileName, 2, true ) ;
                fileHandle.write(fileContents);
                fileHandle.close();
            } 
            catch (e) { // ?? localization
                alert("Cannot write file: " + fileName + " " + e.message);
            }
        }
        else { // ?? localization
            alert("Cannot create Microsoft FileSystemObject ");
        }
    },
    
    
    
    /*
     * Write the string to the file for Firefox.
     * This usage does need to show the enablePrivilege dialog box to
     * the user to grant access to the local filesystem.
     */
    writeStringToFileForFirefox: function(fileName, fileContents){
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(fileName);
            if (!file.exists()) {
                file.create(0x00, 0644);
            }
            var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
            outputStream.init(file, 0x20 | 0x04, 00004, null);
            outputStream.write(fileContents, fileContents.length);
            outputStream.flush();
            outputStream.close();
            return true;
        } 
        catch (e) {
            alert(e);
            return false;
        }
    },
    
    moveFileForIE: function(fromFileName, toFileName){
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        if (valueExists(objFSO)) {
            try {
                var fileHandle = objFSO.MoveFile(fromFileName, toFileName);
                this.fileSuccessfullyMoved = true;
            } 
            catch (e) { // ?? localization
                alert("Cannot move file: " + e.message);
            }
        }
        else { // ?? localization
            alert("Cannot create Microsoft FileSystemObject ");
        }
        
    },
    
    moveFileForFirefox: function(fileName, fileContents){
        alert("Function not available.");
        /*
         try {
         netscape.security.PrivilegeManager.enablePrivilege ("UniversalXPConnect");
         var file =  Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
         file.initWithPath( fileName );
         if ( !file.exists() ) {
         file.create(0x00, 0644);
         }
         var outputStream =
         Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
         outputStream.init(file, 0x20 | 0x04, 00004, null);
         outputStream.write( fileContents, fileContents.length );
         outputStream.flush();
         outputStream.close();
         return true;
         }
         catch (e) {
         alert(e);
         return false;
         }
         */
    },
    
    deleteFileForIE: function(fileToDelete){
        var objFSO = new ActiveXObject("Scripting.FileSystemObject");
        if (valueExists(objFSO)) {
            try {
                var fileHandle = objFSO.DeleteFile(fileToDelete, true);
                this.fileSuccessfullyMoved = true;
            } 
            catch (e) { // ?? localization
                alert("Cannot delete file: " + e.message);
            }
        }
        else { // ?? localization
            alert("Cannot create Microsoft FileSystemObject ");
        }
        
    }
    
    
    
    
    
    
}); // end definition of AFM.convert.Reader class

