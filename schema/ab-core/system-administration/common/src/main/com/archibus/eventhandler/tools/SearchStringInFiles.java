package com.archibus.eventhandler.tools;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import org.apache.log4j.Logger;
import org.dom4j.*;
import org.dom4j.io.SAXReader;

import com.archibus.context.*;
import com.archibus.servletx.utility.*;
import com.archibus.utility.StringUtil;

/**
 * This job implements business logic related to searching for files that contain a search phrase
 * ("parseFloat").
 *
 * @author Emily Dich
 */
public class SearchStringInFiles {
    /**
     * .axvw extension.
     */
    private static final String AXVW_EXT = ".axvw";

    /**
     * Backward slash.
     */
    private static final String BACKWARD_SLASH = "\\";

    /**
     * End parenthesis.
     */
    private static final String END_PAREN = "}";

    /**
     * .htm extension.
     */
    private static final String HTM_EXT = ".htm";

    /**
     * url prefix for links.
     */
    private static final String LINK_PREFIX = "http://localhost:8080/archibus/";

    /**
     * HTML space.
     */
    private static final String NBSP = "&nbsp;";

    /**
     * Is a dependent view.
     */
    private static final String TYPE_DEPENDENT = "D";

    /**
     * Is a master view.
     */
    private static final String TYPE_MASTER = "M";

    /**
     * webAppPath.
     */
    private static final String WEBAPPPATH = ContextStore.get().getWebAppPath();

    /**
     * list of master views.
     */
    protected final List<String> masterViews = new ArrayList<String>();

    /**
     * list of all views.
     */
    private final List<String> allViews = new ArrayList<String>();

    /**
     * list of view types.
     */
    private final List<String> applications = new ArrayList<String>();

    /**
     * list of full file paths.
     */
    private final List<String> fullPaths = new ArrayList<String>();

    /**
     * logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * list of view types.
     */
    private final List<String> matchedApplications = new ArrayList<String>();

    /**
     * list of full file paths fors views and associated files that match search criteria.
     */
    private final List<String> matchedFullPaths = new ArrayList<String>();

    /**
     * list of line numbers.
     */
    private final List<String> matchedLineNumbers = new ArrayList<String>();

    /**
     * list of views and associated files that contain search string.
     */
    private final List<String> matchedViews = new ArrayList<String>();

    /**
     * list view types for views and associated files that match search criteria.
     */
    private final List<String> matchedViewTypes = new ArrayList<String>();

    /**
     * search string.
     */
    private String searchString = "parseFloat";

    /**
     * list of view types.
     */
    private final List<String> viewTypes = new ArrayList<String>();

    /**
     * Finds a file and returns absolute file path.
     *
     * @param fileName (String) Name of file.
     * @return taskFilePath (String) File path.
     */
    public String findFile(final String fileName) {
        String taskFilePath;

        final Context context = ContextStore.get();
        final FileIndex fileIndex = (FileIndex) context.getBean("fileIndex");
        final FileIndex.Entry fileIndexEntry =
                fileIndex.getOrCreateFileIndexEntry(fileName, context);
        if (fileIndexEntry == null) {
            taskFilePath = FileHelper.findFile(context, fileName);
        } else {
            taskFilePath = fileIndexEntry.filePath;
        }

        return taskFilePath;
    }

    /**
     * Add file and continue searching for dependent files.
     *
     * @param name String Name of file
     */
    public void addFileAndContinueSearch(final String name) {
        // use only actual file name if paginated report job
        final String fileName = name.replace("ab-paginated-report-job.axvw?viewName=", "");
        // try {
        final String dependentFullPath = findFile(fileName);
        if (dependentFullPath == null) {
            this.log.info(fileName + " does not exist.");
        } else {
            this.allViews.add(fileName);
            this.viewTypes.add(SearchStringInFiles.TYPE_DEPENDENT);
            this.fullPaths.add(dependentFullPath);
            this.applications.add("");
            if (fileName.endsWith(SearchStringInFiles.AXVW_EXT)
                    && !this.masterViews.contains(fileName)) {
                searchForDependentFiles(dependentFullPath, fileName);
            }
        }
        // } catch (Exception e) {
        // this.log.info(fileName + " could not be found.");
        // }
    }

    /**
     * Add master view properties.
     *
     * @param taskFile Name of task file.
     * @param taskFilePath Path of task file.
     * @param application Application that the task file belongs to.
     */
    public void addMaster(final String taskFile, final String taskFilePath, final String application) {
        this.allViews.add(taskFile);
        this.viewTypes.add(SearchStringInFiles.TYPE_MASTER);
        this.fullPaths.add(taskFilePath);
        this.applications.add(application);
    }

    /**
     * Generate footer for .html file.
     *
     * @return footer
     */
    public String generateFooter() {
        String footer = "";
        footer += "        </table>\n";
        footer += "    </body>\n";
        footer += "</html>\n";
        return footer;
    }

    /**
     * Generate header for .html file.
     *
     * @return header
     */
    public String generateHeader() {
        String header = "";

        // heading
        header += "<html>\n";
        header += "    <head>\n";

        // header += "    <link href=\"search-string.css\" rel=\"stylesheet\" type=\"text/css\">\n";
        header += "<style type=\"text/css\">";
        header += "span.title {";
        header += "font-weight: bold;";
        header += "font-family: 'Arial';";
        header += SearchStringInFiles.END_PAREN;
        header += "tr.header {";
        header += "font-weight:  bold;";
        header += SearchStringInFiles.END_PAREN;
        header += "table.table {";
        header += "font-size:  12px;";
        header += "font-family:  'Arial';";
        header += SearchStringInFiles.END_PAREN;
        header += "</style>";
        header += "    </head>\n";

        header += "    <body>\n";
        header += "<span class=\"title\">Files containing " + this.searchString + "</span>\n";
        header += "        <table class=\"table\">\n";
        header += "            <tr class=\"header\">\n";
        header += "               <td>#</td>\n";
        header += "               <td>Application</td>\n";
        header += "               <td>Root View</td>\n";
        header += "               <td>All Dependent Files</td>\n";
        header += "               <td>Line #</td>\n";
        header += "            </tr>\n";
        return header;
    }

    /**
     * Generate
     * <TR>
     * row for .html file.
     *
     * @param index Index of file.
     * @param countMaster Count of master files.
     * @return row HTML syntax for row.
     */
    public String generateRow(final Integer index, final String countMaster) {
        String row = "";
        String nbsp;
        nbsp = SearchStringInFiles.NBSP;
        String tdBegin;
        tdBegin = "               <td>";
        String tdEnd;
        tdEnd = "               </td>\n";
        String indentation;
        indentation = "                   ";

        String linkPath = this.matchedFullPaths.get(index);
        linkPath =
                linkPath
                .replace(SearchStringInFiles.WEBAPPPATH.replace(
                    SearchStringInFiles.BACKWARD_SLASH, "/"), SearchStringInFiles.LINK_PREFIX);

        row += "           <tr>\n";

        // #
        row += tdBegin;
        row += countMaster;
        row += tdEnd;

        // application
        row += tdBegin;
        if (SearchStringInFiles.TYPE_MASTER.equals(this.matchedViewTypes.get(index))) {
            row += this.matchedApplications.get(index);
        } else {
            row += nbsp;
        }
        row += tdEnd;

        // master
        row += tdBegin;
        if (SearchStringInFiles.TYPE_MASTER.equals(this.matchedViewTypes.get(index))) {
            row += "                   <a href=\"" + linkPath + "\">" + linkPath + "</a>\n";
        } else {
            row += nbsp;
        }
        row += tdEnd;

        // dependent
        row += tdBegin;
        if (SearchStringInFiles.TYPE_MASTER.equals(this.matchedViewTypes.get(index))) {
            row += nbsp;
        } else {
            row += indentation + this.matchedViews.get(index);
        }
        row += tdEnd;

        // line numbers
        final String lineNumbers =
                SearchStringInFiles.TYPE_MASTER.equals(this.matchedViewTypes.get(index)) ? nbsp
                        : indentation + this.matchedLineNumbers.get(index);
        row += tdBegin + lineNumbers + tdEnd;
        // row += "           </tr>\n";
        /*
         * String text = ""; text += j + "   "; text += this.matchedViews.get(j) + "  " +
         * this.matchedViewTypes.get(j) + "\r\n"; out.write(text); // out.write(fullPaths.get(j) +
         * "\r\n");
         */
        return row;
    }

    /**
     * Process files, searching for search phrase.
     *
     * @param str String to search for.
     */
    public void processFiles(final String str) {
        int masterIndex = 0;
        int index = 0;

        // this.searchString = searchString;
        this.searchString = str;

        // search for parseFloat in .js
        for (int j = 0; j < this.allViews.size(); j++) {
            if (SearchStringInFiles.TYPE_MASTER.equals(this.viewTypes.get(j))) {
                masterIndex = j;
            }
            final String fileName = this.allViews.get(j);
            // if (fileName.endsWith(".js")) {
            final List<Integer> lineNumbers = scanFile(this.fullPaths.get(j), this.searchString);
            if (!lineNumbers.isEmpty()) {
                index = j;
                for (int k = masterIndex; k < (index + 1); k++) {
                    this.matchedViews.add(this.allViews.get(k));
                    this.matchedViewTypes.add(this.viewTypes.get(k));
                    this.matchedFullPaths.add(this.fullPaths.get(k));
                    this.matchedApplications.add(this.applications.get(k));
                    if (fileName.equals(this.allViews.get(k))) {
                        this.matchedLineNumbers.add(lineNumbers.toString());
                    } else {
                        this.matchedLineNumbers.add("");
                    }
                }
                masterIndex = j + 1;
            }
            // }
        }
    }

    /**
     * Parses the .axvw (XML) file and return the XML document.
     *
     * @param fileName String Name of file
     * @return doc Document
     */
    public Document readFile(final String fileName) {

        final SAXReader reader = new SAXReader();
        // reader.setStripWhitespaceText(true);
        reader.setMergeAdjacentText(true);
        Document doc = null;

        try {
            doc = reader.read(fileName);
        } catch (final DocumentException e) {
            this.log.error(e.getMessage());
        }

        return doc;
    }

    /**
     * Scan file, searching for string.
     *
     * @param fileName String Name of file
     * @param phrase String search phrase
     * @return Boolean
     */
    public List<Integer> scanFile(final String fileName, final String phrase) {
        final List<Integer> lineNumbers = new ArrayList<Integer>();
        try {
            final Scanner fileScanner = new Scanner(new File(fileName));
            int lineID = 0;

            final Pattern pattern = Pattern.compile(phrase);
            Matcher matcher = null;
            while (fileScanner.hasNextLine()) {
                final String line = fileScanner.nextLine();
                lineID++;
                matcher = pattern.matcher(line);
                if (matcher.find()) {
                    lineNumbers.add(lineID);
                }
            }
        } catch (final FileNotFoundException e) {
            this.log.info("  File not found: " + fileName);
        }
        return lineNumbers;
    }

    /**
     * Search for dependent files.
     *
     * @param filePath Path of file.
     * @param fileName Name of file.
     */
    public void searchForDependentFiles(final String filePath, final String fileName) {
        final Document doc = readFile(filePath);
        if (doc != null) {
            final Element root = doc.getRootElement();
            final List<Element> allElements = root.selectNodes("//*");
            final Iterator<Element> elementIterator = allElements.iterator();
            while (elementIterator.hasNext()) {
                final Element element = elementIterator.next();
                final String file = element.attributeValue("file");
                final String viewName = element.attributeValue("viewName");

                if (!this.allViews.contains(viewName) && file != null && !fileName.equals(file)
                        && !file.endsWith(SearchStringInFiles.HTM_EXT)) {
                    addFileAndContinueSearch(file);
                }
                if (!this.allViews.contains(viewName) && viewName != null
                        && !fileName.equals(viewName)
                        && !viewName.endsWith(SearchStringInFiles.HTM_EXT)) {
                    addFileAndContinueSearch(viewName);
                }
            }
        }
    }

    /**
     * Create .html file for results.
     */
    public void writeResults() {

        String outputPath = SearchStringInFiles.WEBAPPPATH + "\\schema\\per-site\\";
        outputPath =
                StringUtil.replace(outputPath, SearchStringInFiles.BACKWARD_SLASH, File.separator);

        try {
            final File outputPathDir = new File(outputPath);

            // if (!outputPathDir.exists() && !outputPathDir.mkdirs()) {
            if (!outputPathDir.exists() && !outputPathDir.mkdirs()) {
                this.log.error(" Folder could not be created: " + outputPath);
            }

            final File outputFile =
                    File.createTempFile("search-string", ".html", new File(outputPath));
            final Writer out =
                    new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outputFile),
                            "UTF8"));

            out.write(generateHeader());

            // generate HTML for row
            Integer countMaster = 0;
            for (int index = 0; index < this.matchedViews.size(); index++) {
                if (SearchStringInFiles.TYPE_MASTER.equals(this.matchedViewTypes.get(index))) {
                    countMaster = countMaster + 1;
                    out.write(generateRow(index, countMaster.toString() + ". "));
                } else {
                    out.write(generateRow(index, SearchStringInFiles.NBSP));
                }
            }

            out.write(generateFooter());
            out.close();
        } catch (final IOException e) {
            this.log.error(e.getMessage());
        }
    }

}
