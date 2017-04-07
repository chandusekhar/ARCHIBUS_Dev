package com.archibus.app.solution.localization;

import java.io.*;
import java.text.MessageFormat;
import java.util.*;
import java.util.regex.*;

import org.apache.log4j.Logger;
import org.dom4j.*;
import org.dom4j.io.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.*;
import com.archibus.utility.text.StringHelper;

/**
 * Handles writing of file, table, and enum strings from localization tables to *.lang files and
 * translatable tables.
 *
 */
public class LocalizationWrite extends LocalizationBase {
    /**
     * Constant.
     */
    // @translatable
    private static final String LOG_PREFIX = "Localization Kit - : [{0}]";

    /**
     * The Logger object to log messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * Handles exceptions in a uniform way
     *
     * @param e
     * @throws Exception
     */
    protected static void handleException(final Throwable e) throws ExceptionBase {
        e.printStackTrace();
        throw new ExceptionBase(e.getMessage());
    }

    /**
     * Inserts missing fields into afm_flds_lang table.
     *
     * @author Urmas Alber www.reminet.ee
     * @param
     * @return
     */
    public void copyAllTablesintoLang() {

        try {
            final String sqlStatement =
                    "insert into afm_flds_lang " + "( table_name, field_name" + "  ) "
                            + " select  " + "table_name, field_name" + " from afm_flds where "
                            + " not exists (select 1 from afm_flds_lang where "
                            + " afm_flds_lang.table_name = afm_flds.table_name and "
                            + " afm_flds_lang.field_name = afm_flds.field_name) ";

            final DataSource ds =
                    DataSourceFactory.createDataSource().addTable("afm_flds_lang")
                    .addQuery(sqlStatement);
            ds.executeUpdate();
        } catch (final ExceptionBase sqlException) {
            final String errorMessage =
                    MessageFormat.format(LOG_PREFIX, sqlException.toStringForLogging());
            this.log.error(errorMessage);
        }
    }

    /**
     * Job that passes in user options and delete relevant localization tables
     *
     * @param bFiles Boolean Whether to delete lang_files table TRUE|FALSE
     * @param bEnums Boolean Whether to delete lang_enum table TRUE|FALSE
     * @param bStrings Boolean Whether to delete lang_strings table TRUE|FALSE
     */
    public void deleteLocalizationTables(final Boolean bFiles, final Boolean bEnums,
            final Boolean bStrings, final Boolean bGlossary, final String language,
            final String dbExtension, final Boolean bRemoveGreeked) throws ExceptionBase {

        this.status.setTotalNumber(100);
        this.language = language;
        this.dbExtension = dbExtension;

        final String languageClause = " WHERE language = '" + language + "'";

        // use default delete statements
        String sqlFiles = "DELETE FROM lang_files" + languageClause;
        String sqlStrings = "DELETE FROM lang_strings" + languageClause;
        String sqlEnum = "DELETE FROM lang_enum" + languageClause;
        String sqlGlossary = "DELETE FROM lang_glossary" + languageClause;

        // use update statements, if remove only greeked strings option is selected
        if (bRemoveGreeked) {
            final String greekingClauseRaw = generateRawGreekingClause();
            sqlFiles =
                    "UPDATE lang_files SET string_trans = NULL" + languageClause + " AND "
                            + greekingClauseRaw.replace("translatableField", "string_trans");
            sqlStrings =
                    "UPDATE lang_strings SET string_trans = NULL" + languageClause + " AND "
                            + greekingClauseRaw.replace("translatableField", "string_trans");
            sqlEnum =
                    "UPDATE lang_enum SET enum_trans = NULL" + languageClause + " AND "
                            + greekingClauseRaw.replace("translatableField", "enum_trans");
            sqlGlossary =
                    "UPDATE lang_glossary SET string_trans = NULL" + languageClause + " AND "
                            + greekingClauseRaw.replace("translatableField", "string_trans");
        }

        this.status.setCurrentNumber(20);

        // delete all lang_files records, no filter
        if (bFiles) {
            SqlUtils.executeUpdate("lang_files", sqlFiles);
        }

        this.status.setCurrentNumber(40);

        // delete all lang_enum records, no filter
        if (bEnums) {
            SqlUtils.executeUpdate("lang_enum", sqlEnum);
        }

        this.status.setCurrentNumber(60);

        // delete all lang_strings records, no filter
        if (bStrings) {
            SqlUtils.executeUpdate("lang_strings", sqlStrings);
        }

        if (bGlossary) {
            SqlUtils.executeUpdate("lang_glossary", sqlGlossary);
        }
        this.status.setCurrentNumber(80);

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        }
    }

    public String generateRawGreekingClause() throws ExceptionBase {
        String clause = "";

        try {
            // get greeking chars
            final String greekingPath =
                    SCHEMA_ABSOLUTE_PATH + "/ab-products/solutions/localization/greeking.xml";
            final Document doc = LocalizationHelper.readFile(greekingPath);
            final Element root = doc.getRootElement();
            final Element asian = (Element) root.selectSingleNode("//characters[@name='asian'");
            final String asianChars = asian.attributeValue("value");

            final Element european =
                    (Element) root.selectSingleNode("//characters[@name='european'");
            final String europeanChars = european.attributeValue("value");

            clause =
                    "translatableField LIKE '%_" + this.dbExtension + asianChars + "'"
                            + " OR translatableField LIKE '%_xx" + asianChars + "'"
                            + " OR translatableField LIKE '%_" + this.dbExtension + europeanChars
                            + "'" + " OR translatableField LIKE '%_xx" + europeanChars + "'"
                            + " OR translatableField LIKE '%_" + this.dbExtension + europeanChars
                            + asianChars + "'" + " OR translatableField LIKE '%_xx" + europeanChars
                            + asianChars + "'";
        } catch (final Exception e) {
            LocalizationRead.handleException(e);
        }

        return clause;
    }

    public String getMnuResxFilesPath() {

        String path =
                LocalizationBase.PROJECTS_USERS_PATH
                + ContextStore.get().getUser().getName().toLowerCase()
                + LocalizationBase.LOCALIZE_FOLDER;

        path = Utility.replaceInvalidCharactersInFilePath(path);

        return path;
    }

    /**
     * Write all the resx files onto the disk.
     *
     */
    public void handleMnuFile(final String path, final String language) {
        final String fPattern = ".+\\...-..\\.mnu";
        final Pattern fP = Pattern.compile(fPattern);
        final String ePattern = ".+\\.mnu";
        final Pattern eP = Pattern.compile(ePattern);

        final File dir = new File(path);
        final File[] children = dir.listFiles();

        if (StringUtil.isNullOrEmpty(children)) {
            return;
        }

        for (final File element : children) {
            final String englishFileName = element.getName();
            final String englishFileWholeName = element.getPath();

            // if dir
            if (element.isDirectory()) {
                handleMnuFile(englishFileWholeName, language);
            } else { // if file
                // if .mnu
                final Matcher fM = fP.matcher(englishFileName);
                final Matcher eM = eP.matcher(englishFileName);

                if (!fM.find() && eM.find()) {
                    // execute
                    final DataSource ds =
                            DataSourceFactory.createDataSource().addTable("lang_files",
                                DataSource.ROLE_MAIN);
                    ds.addField("filename");
                    ds.addField("constant");
                    ds.addField("string_english");
                    ds.addField("string_trans");

                    // get strings form database for this file
                    final String restriction =
                            "language = '" + language + "'" + " AND (filename LIKE '"
                                    + englishFileName + "') ";
                    ds.addRestriction(Restrictions.sql(restriction));
                    final List<DataRecord> records = ds.getAllRecords();

                    String fileContents = FileUtil.readFile(englishFileWholeName);

                    // iterate over the record list, and fill in the document
                    for (int j = 0; j < records.size(); j++) {
                        this.status.incrementCurrentNumber();

                        final DataRecord record = records.get(j);
                        String fileName = (String) record.getValue("lang_files.filename");
                        fileName = fileName.replace('\\', '/');
                        record.getValue("lang_files.constant");
                        final String stringTrans =
                                (String) record.getValue("lang_files.string_trans");
                        final String stringEnglish =
                                (String) record.getValue("lang_files.string_english");

                        // regex pattern for matching strings that resemble [Show/Hide
                        // Navigator]
                        final String BRACKET_PATTERN = "\\[(" + stringEnglish + ")\\]";
                        final Pattern patternBracket = Pattern.compile(BRACKET_PATTERN);
                        final Matcher matchBracket = patternBracket.matcher("");

                        // regex pattern for matching strings that resemble ID_AfmToggleReactors
                        // [_Button( "Start/Stop
                        // Reactors",Ov_Start_or_Stop_Reactors_16_n_i8,Ov_Start_or_Stop_Reactors_32_n_i8)
                        // ]
                        final String FULL_DOUBLEQUOTES_PATTERN =
                                "\\[[_Toolbar|_Button|_Flyout].*?\"(" + stringEnglish + ")\".*?\\]";
                        final Pattern patternFullStringInDoubleQuotes =
                                Pattern.compile(FULL_DOUBLEQUOTES_PATTERN);
                        final Matcher matchFullStringInDoubleQuotes =
                                patternFullStringInDoubleQuotes.matcher("");

                        // regex pattern to match double quotes inside
                        final String DOUBLEQUOTES_PATTERN = "\"(" + stringEnglish + ")\"";
                        final Pattern patternStringInDoubleQuotes =
                                Pattern.compile(DOUBLEQUOTES_PATTERN);
                        final Matcher matchStringInDoubleQuotes =
                                patternStringInDoubleQuotes.matcher("");

                        matchBracket.reset(fileContents);
                        fileContents = matchBracket.replaceAll("[" + stringTrans + "]");

                        matchFullStringInDoubleQuotes.reset(fileContents);
                        if (matchFullStringInDoubleQuotes.find()) {
                            for (int i = 0; i < matchFullStringInDoubleQuotes.groupCount(); i++) {
                                String fullString = matchFullStringInDoubleQuotes.group(i);
                                matchStringInDoubleQuotes.reset(fullString);
                                fullString =
                                        matchStringInDoubleQuotes.replaceAll("\"" + stringTrans
                                            + "\"");
                                fileContents = matchFullStringInDoubleQuotes.replaceAll(fullString);
                            }
                        }
                    }// end for (Iterator it = records.iterator(); it.hasNext();) {

                    // identify the localize file name
                    final String englishFileWholeNamePrefix =
                            englishFileWholeName
                            .substring(0, englishFileWholeName.lastIndexOf("."));
                    final String[] localeHelpTokens = this.fullLocaleName.split("_");
                    final String localizedFileName =
                            englishFileWholeNamePrefix + "." + localeHelpTokens[0] + "-"
                                    + localeHelpTokens[1] + ".mnu";

                    try {
                        // delete the current localize file
                        FileUtil.deleteFile(localizedFileName);

                        // write localized mnu file
                        FileOutputStream fos = null;
                        BufferedWriter fOut = null;
                        fos = new FileOutputStream(localizedFileName);
                        fOut = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
                        fOut.write(fileContents);
                        fOut.close();
                    } catch (final Exception e) {
                        handleException(e);
                    }
                }// end if(m.find())

            }// else{ //if file
        }// end for (File element : files) {
    }

    /**
     * Write all the resx files onto the disk
     */
    @SuppressWarnings("unchecked")
    public void handleResxFile(final String path, final String language) {
        final String fPattern = ".+\\...-[\\w]{2,4}\\.resx";
        final Pattern fP = Pattern.compile(fPattern);

        final String ePattern = ".+\\.resx";
        final Pattern eP = Pattern.compile(ePattern);

        final File dir = new File(path);
        final File[] children = dir.listFiles();

        if (StringUtil.isNullOrEmpty(children)) {
            return;
        }

        Document resxFileDocument = null;
        Element resxElementRoot = null;

        for (final File element : children) {

            final String englishFileName = element.getName();
            final String englishFileWholeName = element.getPath();

            // if dir
            if (element.isDirectory()) {
                handleResxFile(englishFileWholeName, language);
            } else { // if file

                // if .resx
                final Matcher fM = fP.matcher(englishFileName);
                final Matcher eM = eP.matcher(englishFileName);

                if (!fM.find() && eM.find()) {

                    resxFileDocument = LocalizationHelper.readFile(englishFileWholeName);

                    // <root> </root>
                    resxElementRoot = resxFileDocument.getRootElement();

                    // get strings form database for this fil
                    final String restriction =
                            "language = '" + language + "'" + " AND (filename LIKE '"
                                    + englishFileName + "') ";

                    // execute
                    final DataSource ds =
                            DataSourceFactory.createDataSource().addTable("lang_files",
                                DataSource.ROLE_MAIN);

                    ds.addField("filename");
                    ds.addField("constant");
                    ds.addField("string_english");
                    ds.addField("string_trans");
                    ds.addRestriction(Restrictions.sql(restriction));

                    final List<DataRecord> records = ds.getAllRecords();

                    // iterate over the record list, and fill in the document
                    for (int j = 0; j < records.size(); j++) {

                        this.status.incrementCurrentNumber();

                        final DataRecord record = records.get(j);
                        String fileName = (String) record.getValue("lang_files.filename");
                        fileName = fileName.replace('\\', '/');

                        final String constantWhole =
                                (String) record.getValue("lang_files.constant");
                        final String[] tokens = constantWhole.split("\\|\\|");
                        final String constant = tokens[1];
                        final String stringTrans =
                                (String) record.getValue("lang_files.string_trans");

                        // iterate through child elements of root
                        // find the node
                        for (final Iterator<Element> i = resxElementRoot.elementIterator("data"); i
                                .hasNext();) {
                            final Element dataElement = i.next();

                            final String key1 = dataElement.attributeValue("name");
                            final Element valueElement = dataElement.element("value");

                            if (key1.compareToIgnoreCase(constant) == 0 && stringTrans != null) {
                                valueElement.setText(stringTrans);
                                break;
                            }
                        }// end for (Iterator i = resxElementRoot.elementIterator("data");
                        // i.hasNext();)

                    }// end for (Iterator it = records.iterator(); it.hasNext();) {

                    // identify the localize file name
                    final String englishFileWholeNamePrefix =
                            englishFileWholeName
                            .substring(0, englishFileWholeName.lastIndexOf("."));
                    final String[] localeHelpTokens = this.fullLocaleName.split("_");
                    final String localizedFileName =
                            ("zh_CN".equals(this.fullLocaleName)) ? englishFileWholeNamePrefix
                                    + ".zh-Hans.resx" : englishFileWholeNamePrefix + "."
                                    + localeHelpTokens[0] + "-" + localeHelpTokens[1] + ".resx";

                    // delete the current localize file
                    FileUtil.deleteFile(localizedFileName);

                    // write the localize file
                    writeResxFile(resxFileDocument, localizedFileName);
                }// end if(m.find())
            }// else{ //if file
        }// end for (File element : files) {
    }

    public void writeJSHead(final BufferedWriter fOut) throws Exception {
        fOut.write("Ab.namespace('localization');");
        fOut.newLine();
        fOut.newLine();
        fOut.write("/**");
        fOut.newLine();
        fOut.write(" * Class that holds the JavaScript representation of the lang file as key-value tuples.");
        fOut.newLine();
        fOut.write(" * Localized Strings for locale ");
        fOut.write(this.dbExtension);
        fOut.newLine();
        fOut.write(" */");
        fOut.newLine();
        fOut.write("Ab.localization.Localization = Base.extend({},");
        fOut.newLine();
        fOut.write("{        localizedStrings: [");
        fOut.newLine();
    }

    public void writeMobileHead(final BufferedWriter fOut, final String id) throws Exception {
        if ("language".equals(id)) {
            fOut.write("var Mobile = Mobile || {};");
            fOut.newLine();
            fOut.newLine();
            fOut.write("Mobile." + id + " = Mobile.language || {};");
            fOut.newLine();
            fOut.newLine();
            fOut.write("Mobile." + id + "." + this.dbExtension + " = {");
            fOut.newLine();
            fOut.newLine();
            fOut.write("    localizedStrings: [");
        }
        fOut.newLine();
    }

    public void writeResxFile(final Document doc, final String filename) {
        try {
            final OutputFormat format = OutputFormat.createPrettyPrint();
            format.setEncoding("UTF-8");
            format.setLineSeparator(System.getProperty("line.separator"));

            final FileOutputStream fos = new FileOutputStream(filename);
            final XMLWriter writer =
                    new XMLWriter(new BufferedWriter(new OutputStreamWriter(fos, "UTF8")), format);

            writer.write(doc);
            writer.close();
        } catch (final Exception e) {
            e.printStackTrace();
            throw new ExceptionBase(e.getMessage());
        }
    }

    /**
     * Writes translated enums from the lang_enum table to the relevant locale-specific field of the
     * specified table.
     *
     * @param language String (eg. French, German, Spanish, etc.)
     */
    public void writeTranslatableEnums(final String language) {
        try {
            String sqlStatement =
                    "UPDATE afm_flds_lang SET enum_list_"
                            + this.dbExtension
                            + " = "
                            + "(SELECT TOP 1 enum_trans FROM lang_enum, afm_flds "
                            + "WHERE RTRIM(LTRIM(afm_flds.enum_list)) = RTRIM(LTRIM(lang_enum.enum_english)) AND "
                            + "afm_flds_lang.table_name = afm_flds.table_name AND "
                            + "afm_flds_lang.field_name = afm_flds.field_name AND "
                            + "language = '" + language + "' AND "
                            + "enum_trans IS NOT NULL ORDER BY enum_trans)";

            if (SqlUtils.isOracle() == true) {
                sqlStatement =
                        "UPDATE afm_flds_lang SET enum_list_"
                                + this.dbExtension
                                + " = "
                                + "(SELECT MAX(enum_trans) FROM lang_enum, afm_flds "
                                + "WHERE RTRIM(LTRIM(afm_flds.enum_list)) = RTRIM(LTRIM(lang_enum.enum_english)) AND "
                                + "afm_flds_lang.table_name = afm_flds.table_name AND "
                                + "afm_flds_lang.field_name = afm_flds.field_name AND "
                                + "language = '" + language + "' AND " + "enum_trans IS NOT NULL)";
            }

            // execute
            final DataSource ds =
                    DataSourceFactory.createDataSource().addTable("afm_flds_lang")
                    .addQuery(sqlStatement);
            ds.executeUpdate();

        } catch (final ExceptionBase sqlException) {
            final String errorMessage =
                    MessageFormat.format(LOG_PREFIX, sqlException.toStringForLogging());
            this.log.error(errorMessage);
        }
    }

    /**
     * Write translatable file.
     *
     * @param language String Name of language.
     * @param activityToInclude String Activity to include
     * @param fileType String file type
     * @param bCore Boolean Whether or not to include core files
     * @param whenWriting Int Options to perform when writings
     * @param activityId String Id of the activity
     */
    public void writeTranslatableFile(final String language, final String activityToInclude,
            final String fileType, final Boolean bCore, final int whenWriting,
            final String activityId) throws Exception {

        // get the destination file name
        final String webAppPath = ContextStore.get().getWebAppPath();

        String destinationFileName = "";
        String destinationFilePath = "";

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_VIEW
                || fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {
            destinationFilePath = webAppPath + DEFAULT_LANG_DIR;
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_JS) {
            destinationFilePath = webAppPath + LocalizationBase.DEFAULT_JS_DIR;
        } else if ((fileType == LocalizationBase.FILE_TYPE_WRITE_RESX)
                || (fileType == LocalizationBase.FILE_TYPE_WRITE_MNU)) {
            destinationFilePath = webAppPath + getMnuResxFilesPath();
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE
                || fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL) {
            destinationFilePath = webAppPath + LocalizationBase.DEFAULT_MOBILE_DIR;
        }
        destinationFilePath = Utility.replaceInvalidCharactersInFilePath(destinationFilePath);

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_RESX) {
            // create folder if not
            FileUtil.createFoldersIfNot(destinationFilePath);
            handleResxFile(destinationFilePath, language);
            return;
        }

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_MNU) {
            // create folder if not
            FileUtil.createFoldersIfNot(destinationFilePath);
            handleMnuFile(destinationFilePath, language);
            return;
        }

        /*
         * if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE) { // create folder if not
         * FileUtil.createFoldersIfNot(destinationFilePath); handleMobileFile(destinationFilePath,
         * language); return; }
         */

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_VIEW) {
            if (whenWriting == LocalizationBase.EXTENSION_LANG_FILE) {
                destinationFileName += activityId + "-";
            }
            destinationFileName +=
                    DEFAULT_SCHEMA_LANG + "-" + this.dbExtension + LocalizationBase.EXT_LANG;
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {
            if (whenWriting == LocalizationBase.EXTENSION_LANG_FILE) {
                destinationFileName += activityId + "-";
            }
            destinationFileName +=
                    DEFAULT_CORE_LANG + "-" + this.dbExtension + LocalizationBase.EXT_LANG;
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_JS) {
            destinationFileName +=
                    DEFAULT_CONTROL_JS + "-" + this.dbExtension + LocalizationBase.EXT_JS;
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE) {
            destinationFileName +=
                    DEFAULT_CONTROL_MOBILE + "_" + this.dbExtension + LocalizationBase.EXT_JS;
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL) {
            destinationFileName +=
                    DEFAULT_CONTROL_MOBILE_CONTROL + "_" + this.dbExtension
                    + LocalizationBase.EXT_JS;
        }
        final String destinationFileWholeName = destinationFilePath + destinationFileName;

        Document langFileDocument = null;
        Element langElementRoot = null;
        Element localizedStringsElem = null;

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_VIEW
                || fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {

            // create xml document
            // create new empty document if user selects to delete the old lang file.
            if (whenWriting == LocalizationBase.DELETE_LANG_FILE
                    || whenWriting == LocalizationBase.EXTENSION_LANG_FILE) {
                langFileDocument = DocumentHelper.createDocument();

                // <afmLocalizedStrings> </afmLocalizedStrings>
                localizedStringsElem = langFileDocument.addElement(ELEMENT_LOCALIZED_STRINGS);

                // <locale name="es_ES"> </locale>
                langElementRoot = localizedStringsElem.addElement(ELEMENT_LOCALE);
                langElementRoot.addAttribute(ATTRIBUTE_LOCALE_NAME, this.fullLocaleName);

            } else if (whenWriting == LocalizationBase.APPEND_LANG_FILE) {
                // read in the existing .lang file if user selectes to append
                langFileDocument = LocalizationHelper.readFile(destinationFileWholeName);

                // <afmLocalizedStrings> </afmLocalizedStrings>
                localizedStringsElem = langFileDocument.getRootElement();

                // <locale name="es_ES"> </locale>
                langElementRoot = localizedStringsElem.element(ELEMENT_LOCALE);
            }
        }

        // delete the current lang file
        FileUtil.deleteFile(destinationFileWholeName);
        FileOutputStream fos = null;
        BufferedWriter fOut = null;
        String englishFileContents = "";

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_JS) {
            fos = new FileOutputStream(destinationFileWholeName);
            fOut = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
            writeJSHead(fOut);
        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE) {
            fos = new FileOutputStream(destinationFileWholeName);
            fOut = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
            writeMobileHead(fOut, "language");

        } else if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL) {
            englishFileContents =
                    LocalizationHelper.readFileAsString(destinationFilePath
                        + DEFAULT_CONTROL_MOBILE_CONTROL + "_en" + LocalizationBase.EXT_JS);
            englishFileContents =
                    englishFileContents.replace("Mobile.control.en", "Mobile.control."
                            + this.dbExtension);
            fos = new FileOutputStream(destinationFileWholeName);
            fOut = new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));
            writeMobileHead(fOut, "control");
        }

        // get the records from database
        String restriction = "language = '" + language + "'";

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_VIEW) {
            restriction +=
                    " AND (filename LIKE '%.axvw' OR filename LIKE '%.xsl' OR filename LIKE '%.jsp' OR filename LIKE '%.acts' OR filename LIKE '%page-navigation%.xml') ";

            // activity
            restriction += " AND ( filename LIKE '%" + activityToInclude + "%'";
            restriction += " OR filename LIKE '%" + activityToInclude.replace("/", "\\") + "%'";

            // core
            if (bCore) {
                restriction +=
                        " OR filename LIKE '%" + LocalizationBase.AB_CORE + "%'"
                                + " OR filename LIKE '%" + LocalizationBase.AB_SYSTEM + "%'";
                restriction +=
                        " OR filename LIKE '%" + LocalizationBase.AB_CORE.replace("/", "\\") + "%'"
                                + " OR filename LIKE '%"
                                + LocalizationBase.AB_SYSTEM.replace("/", "\\") + "%'";
            }

            restriction += ")";
        }

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {
            restriction += " AND (filename LIKE '%com.archibus%') ";
        }

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_JS) {
            restriction +=
                    " AND (filename LIKE '%.js' AND constant LIKE '%||%' AND filename NOT LIKE '%mobile%.js')";
        }
        // restriction = " language= 'French' and " + "(filename LIKE '%ab-sys-afm-atyp-gd.axvw') ";

        if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE) {
            restriction +=
                    " AND (filename LIKE '%mobile%.js' AND filename NOT LIKE '%control_en.js' AND constant LIKE '%||%')";
        }
        if (fileType == LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL) {
            restriction +=
                    " AND (filename LIKE '%mobile%.js' AND filename LIKE '%control_en.js' AND constant LIKE '%||%')";
        }

        // execute
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_files", DataSource.ROLE_MAIN);

        ds.addField("filename");
        ds.addField("constant");
        ds.addField("string_english");
        ds.addField("string_trans");
        ds.addRestriction(Restrictions.sql(restriction));

        final List<DataRecord> records = ds.getAllRecords();

        // iterate over the record list, and fill in the document
        for (int j = 0; j < records.size(); j++) {

            this.status.incrementCurrentNumber();

            final DataRecord record = records.get(j);

            boolean add = true;

            String fileName = (String) record.getValue("lang_files.filename");
            fileName = fileName.replace('\\', '/');

            final String constantWhole = (String) record.getValue("lang_files.constant");
            final String[] tokens = constantWhole.split("\\|\\|");
            String constant = tokens[0];

            if (fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {
                constant = "";
            }

            String stringEnglish = (String) record.getValue("lang_files.string_english");

            String stringTrans = (String) record.getValue("lang_files.string_trans");
            // kb 3031065, kb3053358
            if (stringTrans != null) {
                if (fileType == LocalizationBase.FILE_TYPE_WRITE_JAVA) {
                    stringTrans = StringHelper.replaceAll(stringTrans, "\'", "&apos;");
                } else {
                    stringTrans = stringTrans.replaceAll("&apos;", "\'");
                }
            }

            if (fileType == LocalizationBase.FILE_TYPE_WRITE_JS && !fileName.contains("/mobile/")) {

                if (stringTrans == null) {
                    stringTrans = "";
                }

                if ("legacy.js".equals(fileName)) {
                    fOut.write("                {key1: \"" + constant + "\"," + " key2: \""
                            + fileName + "\"," + " key3: \"" + tokens[1] + "\"," + " value: \""
                            + stringTrans + "\"}");
                } else {
                    fOut.write("                {key1: \"" + constant + "\"," + " key2: \""
                            + fileName + "\"," + " key3: \"" + stringEnglish + "\"," + " value: \""
                            + stringTrans + "\"}");
                }
                if (j != records.size() - 1) {
                    fOut.write(",");
                }
                fOut.newLine();
            } else if (LocalizationBase.FILE_TYPE_WRITE_MOBILE.equals(fileType)) {

                if (stringTrans == null) {
                    stringTrans = "";
                }
                // fOut.write("        '" + stringEnglish + "' : '" + stringTrans + "'");
                fOut.write("        {key1: \"" + constant + "\"," + " key2: \"" + stringEnglish
                    + "\"," + " value: \"" + stringTrans + "\"}");

                if (j != records.size() - 1) {
                    fOut.write(",");
                }
                fOut.newLine();
            } else if (LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL.equals(fileType)) {
                if (stringTrans == null) {
                    stringTrans = "";
                }
                englishFileContents =
                        englishFileContents.replaceAll("(\\{key1: [\"|']{1}" + constant
                            + "[\"|']{1}, key2: [\"|']{1}" + stringEnglish
                            + "[\"|']{1}, value: [\"|']{1})(.*?)([\"|']{1}\\})", "$1"
                                    + stringTrans + "$3");

            } else if ((LocalizationBase.FILE_TYPE_WRITE_VIEW.equals(fileType) || LocalizationBase.FILE_TYPE_WRITE_JAVA
                .equals(fileType))) {
                stringEnglish = stringEnglish.replace("$\\x7Brecord[", "${record[");
                constant = constant.replace("$\\x7Brecord[", "${record[");
                stringEnglish = stringEnglish.replace("]\\x7D", "]}");
                constant = constant.replace("]\\x7D", "]}");

                stringEnglish =
                        stringEnglish.replace("$\\x7Buser.areaUnits.title\\x7D",
                                "${user.areaUnits.title}");
                constant =
                        constant.replace("$\\x7Buser.areaUnits.title\\x7D",
                                "${user.areaUnits.title}");

                if (stringTrans != null) {
                    stringTrans = stringTrans.replace("$\\x7Brecord['", "${record[&quot;");
                    stringTrans = stringTrans.replace("']\\x7D", "&quot;]}");
                    // 3035262
                    stringTrans = stringTrans.replace("$\\x7Brecord[", "${record[");
                    stringTrans = stringTrans.replace("]\\x7D", "]}");

                    stringTrans =
                            stringTrans.replace("$\\x7Buser.areaUnits.title\\x7D",
                                    "${user.areaUnits.title}");
                }

                if (whenWriting == LocalizationBase.APPEND_LANG_FILE) {

                    // add = false;
                    add = true;

                }// end if (whenWriting == this.APPEND_LANG_FILE)

                // add the current record to the document
                if (add) {
                    langElementRoot.addElement("string").addAttribute("key1", fileName)
                    .addAttribute("key2", constant).addAttribute("key3", stringEnglish)
                    .addAttribute("value", stringTrans);
                }
            }// end if( (fileType == this.FILE_TYPE_WRITE_VIEW || fileType ==

        }// end for (Iterator it = records.iterator(); it.hasNext();)

        // create and write xml document to lang file
        if (LocalizationBase.FILE_TYPE_WRITE_VIEW.equals(fileType)
                || LocalizationBase.FILE_TYPE_WRITE_JAVA.equals(fileType)) {
            writeXmlFile(langFileDocument, destinationFileWholeName);
        } else if (LocalizationBase.FILE_TYPE_WRITE_JS.equals(fileType)) {
            fOut.write("]});");
            fOut.close();
        } else if (LocalizationBase.FILE_TYPE_WRITE_MOBILE.equals(fileType)) {
            fOut.write("    ]");
            fOut.newLine();
            fOut.write("};");
            fOut.close();
        } else if (LocalizationBase.FILE_TYPE_WRITE_MOBILE_CONTROL.equals(fileType)) {
            fOut.write(englishFileContents);
            fOut.close();
        }
    }

    /**
     * Job that passes in user options and writes translated strings from lang_files table to the
     * relevant files.
     *
     * @param language String (French, German, Spanish, etc.)
     * @param activityToInclude String path to the activity
     * @param bAxvwXslJsp Boolean Whether to read in .axvw, .xsl, and .jsp files TRUE|FALSE
     * @param bJs Boolean Whether to read in .js files TRUE|FALSE
     * @param bJava Boolean Whether to read in .java files TRUE|FALSE
     * @param bResx Boolean Whether to include resx files TRUE|FALSE
     * @param bMnu Boolean Whether to include mnu files TRUE|FALSE
     * @param bCore Boolean Whether to include core files
     * @param whenWriting Int
     * @param activityId String Id of the activity
     * @param dbExtension String dbextension
     * @param locale String locale
     */
    public void writeTranslatableFiles(final String language, final String activityToInclude,
            final Boolean bAxvwXslJsp, final Boolean bJs, final Boolean bJava, final Boolean bResx,
            final Boolean bMnu, final Boolean bMobile, final Boolean bCore, final int whenWriting,
            final String activityId, final String dbExtension, final String locale) {

        this.dbExtension = dbExtension;

        // getLocaleName();
        this.fullLocaleName = locale;

        final List<String> types = new ArrayList<String>();
        if (bAxvwXslJsp) {
            types.add(FILE_TYPE_WRITE_VIEW);
        }
        if (bJs) {
            types.add(FILE_TYPE_WRITE_JS);
        }
        if (bJava) {
            types.add(FILE_TYPE_WRITE_JAVA);
        }
        if (bResx) {
            types.add(FILE_TYPE_WRITE_RESX);
        }
        if (bMnu) {
            types.add(FILE_TYPE_WRITE_MNU);
        }
        if (bMobile) {
            types.add(FILE_TYPE_WRITE_MOBILE);
        }

        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_files", DataSource.ROLE_MAIN)
                .addVirtualField("lang_files", "numberOfRecords", DataSource.DATA_TYPE_INTEGER);
        String sqlStatement =
                "SELECT COUNT(*) ${sql.as} numberOfRecords FROM lang_files "
                        + " WHERE language = '" + language + "' AND ( ";

        final Iterator<String> iterator = types.iterator();
        int count = 0;
        while (iterator.hasNext()) {
            final String type = iterator.next().toString();

            if (count != 0) {
                sqlStatement += " OR ";
            }

            if (type.equals(FILE_TYPE_WRITE_VIEW)) {
                sqlStatement +=
                        " ((filename LIKE '%.axvw' OR filename LIKE '%.xsl' OR filename LIKE '%.jsp' OR filename LIKE '%.acts' OR filename LIKE '%page-navigation%.xml') ";

                // activity
                sqlStatement += " AND ( filename LIKE '%" + activityToInclude + "%'";

                // core
                if (bCore) {
                    sqlStatement +=
                            " OR filename LIKE '%" + LocalizationBase.AB_CORE + "%'"
                                    + " OR filename LIKE '%" + LocalizationBase.AB_SYSTEM + "%'";
                }

                sqlStatement += "))";

            } else if (type.equals(FILE_TYPE_WRITE_JAVA)) {
                sqlStatement += " (filename LIKE '%com.archibus%') ";
            } else if (type.equals(FILE_TYPE_WRITE_JS)) {
                sqlStatement += " (filename LIKE '%.js' AND constant LIKE '%||%')";
            } else if (type.equals(FILE_TYPE_WRITE_RESX)) {
                sqlStatement += "  (filename LIKE '%.resx')";
            } else if (type.equals(FILE_TYPE_WRITE_MNU)) {
                sqlStatement += "  (filename LIKE '%.mnu')";
            } else if (type.equals(FILE_TYPE_WRITE_MOBILE)) {
                sqlStatement += "  (filename LIKE '%mobile%.js')";
            }
            count++;
        }// end while(iterator.hasNext()){

        sqlStatement += ")";

        ds.addQuery(sqlStatement.toString());
        final DataRecord record = ds.getRecord();
        final int totalNum = record.getInt("lang_files.numberOfRecords");
        this.status.setTotalNumber(totalNum);

        try {
            if (bAxvwXslJsp) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_VIEW, bCore,
                    whenWriting, activityId);
            }

            if (bJs) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_JS, bCore,
                    whenWriting, null);
            }

            if (bJava) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_JAVA, bCore,
                    whenWriting, activityId);
            }

            if (bResx) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_RESX, bCore,
                    whenWriting, activityId);
            }

            if (bMnu) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_MNU, bCore,
                    whenWriting, activityId);
            }

            if (bMobile) {
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_MOBILE, bCore,
                    whenWriting, activityId);
                writeTranslatableFile(language, activityToInclude, FILE_TYPE_WRITE_MOBILE_CONTROL,
                    bCore, whenWriting, activityId);
            }
        } catch (final Exception e) {
            e.printStackTrace();
            throw new ExceptionBase(e.getMessage());
        }

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCurrentNumber(totalNum);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    /**
     * Writes translated fields from the lang_strings table to the relevant locale-specific field of
     * the specified table.
     *
     * @param language String name of the language
     * @param tableName String name of specified table (ie. afm_flds)
     * @param fieldName String name of english field (ie. ml_heading)
     * @param stringType Integer string type Possible values: 0, 1, or 2 (0-Other, 1-Enum,
     *            2-MLHEADING)
     */
    public void writeTranslatableStrings(final String language, final String tableName,
            final String fieldName, final String translationTable, final int stringType) {

        try {
            String sqlStatement = "";

            final DataSource ds = DataSourceFactory.createDataSource();

            if (stringType == LocalizationBase.TYPE_ML_HEADING
                    || stringType == LocalizationBase.TYPE_SL_HEADING) {

                // "UPDATE afm_flds_lang SET ml_heading_"
                sqlStatement =
                        "UPDATE afm_flds_lang SET " + fieldName + "_" + this.dbExtension + " = "
                                + "(SELECT TOP 1 string_trans FROM lang_strings, afm_flds "
                                + "WHERE RTRIM(LTRIM(afm_flds." + fieldName
                                + ")) = RTRIM(LTRIM(lang_strings.string_english)) AND "
                                + "afm_flds_lang.table_name = afm_flds.table_name AND "
                                + "afm_flds_lang.field_name = afm_flds.field_name AND "
                                + "string_type = " + stringType + " AND "
                                + "string_trans IS NOT NULL AND " + "language = '" + language
                                + "' ORDER BY string_trans)";

                if (SqlUtils.isOracle() == true) {
                    sqlStatement =
                            "UPDATE afm_flds_lang SET " + fieldName + "_" + this.dbExtension
                            + " = "
                            + "(SELECT MAX(string_trans) FROM lang_strings, afm_flds "
                            + "WHERE RTRIM(LTRIM(afm_flds." + fieldName
                            + ")) = RTRIM(LTRIM(lang_strings.string_english)) AND "
                            + "afm_flds_lang.table_name = afm_flds.table_name AND "
                            + "afm_flds_lang.field_name = afm_flds.field_name AND "
                            + "string_type = " + stringType + " AND "
                            + "string_trans IS NOT NULL AND " + "language = '" + language
                            + "')";
                }

                ds.addTable("afm_flds_lang");
            } else {
                final String tableToUpdate =
                        (translationTable == null) ? tableName : translationTable;
                sqlStatement = "UPDATE " + tableToUpdate + " SET ";

                if (tableName.compareToIgnoreCase("afm_ptasks") == 0
                        && fieldName.compareToIgnoreCase("task_id") == 0) {
                    sqlStatement += "task";
                } else {
                    sqlStatement += fieldName;
                }

                if (SqlUtils.isOracle()) {
                    sqlStatement +=
                            "_" + this.dbExtension + " = "
                                    + " (SELECT MAX(string_trans) FROM lang_strings"
                                    + " WHERE RTRIM(LTRIM(" + tableName + "." + fieldName
                                    + " )) = RTRIM(LTRIM(lang_strings.string_english)) AND "
                                    + "string_type = " + stringType + " AND "
                                    + "string_trans IS NOT NULL AND " + "language = '" + language
                                    + "')";
                } else {
                    sqlStatement +=
                            "_" + this.dbExtension + " = "
                                    + " (SELECT TOP 1 string_trans FROM lang_strings"
                                    + " WHERE RTRIM(LTRIM(" + tableName + "." + fieldName
                                    + " )) = RTRIM(LTRIM(lang_strings.string_english)) AND "
                                    + "string_type = " + stringType + " AND "
                                    + "string_trans IS NOT NULL AND " + "language = '" + language
                                    + "' ORDER BY string_trans)";
                }
                ds.addTable(tableName);
            }

            // execute sql
            ds.addQuery(sqlStatement);
            ds.executeUpdate();
        } catch (final ExceptionBase sqlException) {
            final String errorMessage =
                    MessageFormat.format(LOG_PREFIX, sqlException.toStringForLogging());
            this.log.error(errorMessage);
        }
    }

    /**
     * Job that passes in user options and writes relevant strings in lang_strings and lang_enums to
     * database tables. Calls writeTranslatableEnums(..) and writeTranslatableStrings(..)
     *
     * @param language String (eg. French, German, Spanish, etc.)
     * @param bSchema Boolean Whether to include schema tables
     * @param bPnav Boolean Whether to include Process Navigator tables
     * @param bOther Boolean Whether to include other tables
     * @param bOnlyUntranslated Boolean Whether to update only untranslated
     */
    public void writeTranslatableTables(final String language, final Boolean bSchema,
            final Boolean bPnav, final Boolean bOther, final Boolean bOnlyUntranslated,
            final String dbExtension) {

        this.dbExtension = dbExtension;

        // write translated strings
        this.translatableFieldsByName = this.getTranslatableFieldsByName();

        // for each translatable table
        final Iterator<Map.Entry<String, org.dom4j.tree.DefaultElement>> it =
                this.translatableFieldsByName.entrySet().iterator();

        // set the total number for the progress bar
        this.status.setTotalNumber(this.translatableFieldsByName.size());

        copyAllTablesintoLang();

        while (it.hasNext()) {

            final Map.Entry<String, org.dom4j.tree.DefaultElement> pairs = it.next();

            // get translatable field infor
            final String fullName = pairs.getKey();

            final String tableName = Utility.tableNameFromFullName(fullName);
            final String fieldName = Utility.fieldNameFromFullName(fullName);

            // Increment percentage in progress bar
            this.status.incrementCurrentNumber();

            final int fieldType = getFieldType(tableName, fieldName);

            final boolean isSchemaTable = checkSchemaTable(tableName);
            final boolean isPNavTable = checkPNavTable(tableName);
            final boolean isExcludeTable = checkExcludeTable(tableName);

            // for exclude table
            if (isExcludeTable) {
                continue;
            } else if (bSchema && fullName.compareToIgnoreCase("afm_flds.enum_list") == 0) {
                // for enum field
                // lang_enum
                this.writeTranslatableEnums(language);
            } else {
                // check to see whether this translatable field need to be read
                if (bSchema && isSchemaTable || bPnav && isPNavTable || bOther && !isSchemaTable
                        && !isPNavTable) {

                    final String translationTable =
                            pairs.getValue().attributeValue("translationTable");

                    // lang_strings
                    this.writeTranslatableStrings(language, tableName, fieldName, translationTable,
                        fieldType);
                }
            }
        } // end while

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCurrentNumber(this.translatableFieldsByName.size());
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    public void writeXmlFile(final Document doc, final String filename) {
        try {
            final OutputFormat format = OutputFormat.createPrettyPrint();
            format.setEncoding("UTF-8");
            format.setLineSeparator(System.getProperty("line.separator"));

            final FileOutputStream fos = new FileOutputStream(filename);
            final BufferedWriter bufferedWriter =
                    new BufferedWriter(new OutputStreamWriter(fos, "UTF8"));

            // Writer w = new PrintWriter(System.out);
            final Writer writer = new PrintWriter(bufferedWriter);
            final LocalizationXMLWriter xmlWriter = new LocalizationXMLWriter(writer, format);
            xmlWriter.write(doc);
            xmlWriter.close();

        } catch (final Exception e) {
            e.printStackTrace();
            throw new ExceptionBase(e.getMessage());
        }
    }
}