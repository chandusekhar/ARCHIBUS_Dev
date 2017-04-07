package com.archibus.app.solution.localization;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;
import org.springframework.util.FileCopyUtils;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Helper file that contains common functions used in Localization Activity.
 *
 */

public class LocalizationHelper extends EventHandlerBase {
    /**
     * File separator.
     */
    static final String PATH_SEPARATOR = "/";
    
    /**
     * Convert xml string to Document.
     *
     * @param xml String Original XML String
     * @return document Document
     */
    protected static Document convertXMLStringToDocument(final String xml) {
        Document document = null;
        try {
            document = DocumentHelper.parseText(xml);
        } catch (final DocumentException e) {
            e.printStackTrace();
        }
        return document;
    }
    
    /**
     * Parses the .axvw (XML) file and return the XML document.
     *
     * @param path String html path
     * @return String
     */
    protected static String createLink(final String path) {
        return "<a href='" + path + "' target='_blank'/>" + path + "</a>";
    }
    
    /**
     * Return a list of absolute paths to files with the given extension below the given directory.
     *
     * @param selected - Whether or not selected
     * @param directoryName - starting directory
     * @param extension - extension of files to list
     * @param descend - recursively descend to child directories
     * @return fileList Array
     */
    protected static List<String> getSourceFiles(final Boolean selected, String directoryName,
            final String extension, final boolean descend) {
        final List<String> fileList = new ArrayList<String>();
        
        if (selected) {
            if (!directoryName.endsWith(PATH_SEPARATOR)) {
                directoryName += PATH_SEPARATOR;
            }
            
            final File dir = new File(directoryName);
            FilenameFilter filter = null;
            if ("resx".equals(extension)) {
                filter = setResxFilter(extension, descend);
            } else if ("mnu".equals(extension)) {
                filter = setMnuFilter(extension, descend);
            } else if ("axvw".equals(extension)) {
                filter = setAxvwXslJspFilter(extension, descend);
            } else if ("java".equals(extension)) {
                filter = setJavaFilter(extension, descend);
            } else {
                filter = setFilter(extension, descend);
            }
            
            final String[] children = dir.list(filter);
            if (children == null) {
            } else {
                for (final String element : children) {
                    // Get filename of file or directory
                    final String filePath = directoryName + element;
                    
                    final File testFile = new File(filePath);
                    if (testFile.isDirectory()) {
                        final List<String> childFiles =
                                getSourceFiles(selected, filePath, extension, descend);
                        for (final String string : childFiles) {
                            fileList.add(string.toString());
                        }
                    } else {
                        fileList.add(filePath);
                    }
                }
            }
        }
        return fileList;
    }
    
    /**
     * Return timestamp in custom format.
     *
     * @return date
     */
    protected static String getTimeStamp() {
        final Calendar c = Calendar.getInstance();
        
        final String timestamp =
                Integer.toString(c.get(Calendar.YEAR))
                        + padString(Integer.toString(c.get(Calendar.MONTH) + 1))
                        + padString(Integer.toString(c.get(Calendar.DATE))) + "-"
                        + padString(Integer.toString(c.get(Calendar.HOUR))) + ":"
                        + padString(Integer.toString(c.get(Calendar.MINUTE))) + ":"
                        + padString(Integer.toString(c.get(Calendar.SECOND)));
        return timestamp;
    }
    
    /**
     * Ensure that string is padded with 0 if single digit.
     *
     * @param x String Original string
     * @return padded string
     */
    protected static String padString(final String x) {
        if (x.length() == 1) {
            return "0" + x;
        }
        return x;
    }
    
    /**
     * Parses the .axvw (XML) file and return the XML document.
     *
     * @param fileName String Name of file
     * @return doc Document
     */
    protected static Document readFile(final String fileName) {
        
        final SAXReader reader = new SAXReader();
        // reader.setStripWhitespaceText(true);
        reader.setMergeAdjacentText(true);
        Document doc;
        try {
            doc = reader.read(fileName);
        } catch (final Exception e) {
            e.printStackTrace();
            throw new ExceptionBase(e.getMessage());
        }
        
        return doc;
    }
    
    /**
     * Parses the .axvw (XML) file and return the XML document.
     *
     * @param fileName String Name of file
     * @return doc Document
     */
    protected static String readFileAsString(final String filepath) throws FileNotFoundException,
            IOException {
        final File file = new File(filepath);
        final Reader reader = new FileReader(file);
        final String fileContent = FileCopyUtils.copyToString(reader);
        
        return fileContent;
    }
    
    /**
     * Constant field is 96 chars long, trim after 74 so "-OLD-yyyymmdd-hh:nn:ss" can be added.
     *
     * @param c String
     * @return c String
     */
    protected static String trimConstant(final String c) {
        if (c.length() > 96) {
            return c.substring(1, 74);
        }
        return c;
    }
    
    /**
     * remove inner quotes from string so that we don't get something like "'This string gets
     * translated'".
     *
     * @param quotedString String Quoted string
     * @return quotedString
     */
    protected static String unQuote(String quotedString) {
        if (quotedString.indexOf("'") == 0
                && quotedString.lastIndexOf("'") == (quotedString.length() - 1)) {
            quotedString = quotedString.substring(1, quotedString.length() - 1);
        } else if (quotedString.indexOf("\"") == 0
                && quotedString.lastIndexOf("\"") == (quotedString.length() - 1)) {
            quotedString = quotedString.substring(1, quotedString.length() - 1);
        }
        return quotedString;
    }
    
    /**
     * Set filter for *.axvw, *.xsl, and *.jsp files.
     *
     * @param extension - extension of files to list
     * @param descend - recursively descend to child directories
     * @return filter
     */
    private static FilenameFilter setAxvwXslJspFilter(final String extension, final boolean descend) {
        // filter the list of returned files to only return
        final String ext = extension;
        final boolean searchSubdirectories = descend;
        final FilenameFilter filter = new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                final File testFile = new File(dir + PATH_SEPARATOR + name);
                if (searchSubdirectories && testFile.isDirectory()) {
                    return true;
                } else {
                    // get only *.axvw, *.xsl, and *.jsp files
                    return (name.endsWith(ext) || name.endsWith("xsl") || name.endsWith("jsp") || name
                        .endsWith("acts")) && testFile.isFile();
                }
            }
        };
        return filter;
    }
    
    /**
     * Set filter for files matching given extension.
     *
     * @param extension - extension of files to list
     * @param descend - recursively descend to child directories
     * @return filter
     */
    private static FilenameFilter setFilter(final String extension, final boolean descend) {
        // filter the list of returned files to only return
        final String ext = extension;
        final boolean searchSubdirectories = descend;
        final FilenameFilter filter = new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                final File testFile = new File(dir + PATH_SEPARATOR + name);
                if (searchSubdirectories && testFile.isDirectory()) {
                    return true;
                } else {
                    return name.endsWith(ext) && testFile.isFile();
                }
            }
        };
        return filter;
    }
    
    /**
     * Set filter for files matching given extension.
     *
     * @param extension - extension of files to list
     * @param descend - recursively descend to child directories
     * @return filter
     */
    private static FilenameFilter setJavaFilter(final String extension, final boolean descend) {
        // filter the list of returned files to only return
        final String ext = extension;
        final boolean searchSubdirectories = descend;
        final FilenameFilter filter = new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                final File testFile = new File(dir + PATH_SEPARATOR + name);
                if (searchSubdirectories && testFile.isDirectory()) {
                    return true;
                } else {
                    return (dir.getPath().contains("com/archibus") || dir.getPath().contains(
                        "com\\archibus"))
                            && name.endsWith(ext) && testFile.isFile();
                }
            }
        };
        return filter;
    }
    
    /**
     * Set filter for *.mnu files.
     *
     * @param extension - list of extensions of files to match
     * @param descend - recursively descend to child directories
     * @return filter
     */
    private static FilenameFilter setMnuFilter(final String extension, final boolean descend) {
        // filter the list of returned files to only return
        final String ext = extension;
        final boolean searchSubdirectories = descend;
        final FilenameFilter filter = new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                final File testFile = new File(dir + PATH_SEPARATOR + name);
                
                // regex pattern for matching localized *.resx files
                final String MNU_FILENAME_PATTERN = "[\\.|_]{1}[\\w]{2}-[\\w]{2}\\.mnu";
                final Pattern mnuFilenamePattern = Pattern.compile(MNU_FILENAME_PATTERN);
                final Matcher matchMnuFileName = mnuFilenamePattern.matcher("");
                matchMnuFileName.reset(name);
                final boolean bLocalizedFile = matchMnuFileName.find();
                
                if (searchSubdirectories && testFile.isDirectory()) {
                    return true;
                } else {
                    return name.endsWith(ext) && !bLocalizedFile && testFile.isFile();
                }
            }
        };
        return filter;
    }
    
    /**
     * Set filter for *.resx files.
     *
     * @param extension - list of extensions of files to match
     * @param descend - recursively descend to child directories
     * @return filter
     */
    private static FilenameFilter setResxFilter(final String extension, final boolean descend) {
        // filter the list of returned files to only return
        final String ext = extension;
        final boolean searchSubdirectories = descend;
        final FilenameFilter filter = new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                final File testFile = new File(dir + PATH_SEPARATOR + name);
                
                // regex pattern for matching localized *.resx files
                final String RESX_FILENAME_PATTERN = "[\\.|_]{1}[\\w]{2}-[\\w]{2,4}\\.resx";
                final Pattern resxFilenamePattern = Pattern.compile(RESX_FILENAME_PATTERN);
                final Matcher matchResxFileName = resxFilenamePattern.matcher("");
                matchResxFileName.reset(name);
                final boolean bLocalizedFile = matchResxFileName.find();
                
                if (searchSubdirectories && testFile.isDirectory()) {
                    return true;
                } else {
                    return name.endsWith(ext) && (!bLocalizedFile) && testFile.isFile();
                }
            }
        };
        return filter;
    }
    
    /**
     * Check if field exist in schema.
     *
     * @param table table
     * @param field field
     * @return if existed return true else return false
     */
    protected static boolean schemaFieldExists(final String table, final String field) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final List<DataRecord> records =
                selectDbRecords(context,
                    "select 1 from afm_flds where afm_flds.table_name =" + literal(context, table)
                    + " and afm_flds.field_name=" + literal(context, field));
        if (!records.isEmpty()) {
            return true;
        } else {
            return false;
        }
    }
}