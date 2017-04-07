package com.archibus.app.solution.localization;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import org.dom4j.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.LocaleConfig;
import com.archibus.utility.*;

/**
 * Handles reading of file, table, and enum strings into localization tables.
 */
public class LocalizationRead extends LocalizationBase {

    /**
     * regex pattern used to look strings with empty spaces.
     */
    static final String ALL_SPACES_PATTERN = "^\\s*$";

    /**
     * regex pattern for matching translatable java string.
     */
    static final String DOUBLE_QUOTES_PATTERN = "\"(.*?)\"";

    /**
     * regex pattern used to look for equal signs within a quoted string.
     */
    static final String EQUAL_WITHIN_QUOTES_PATTERN = "[\"|\'].*?=.*?[\"|\']";

    /**
     * regex pattern for matching start of translatable tag.
     */
    static final String JAVA_START_TRANSLATABLE_PATTERN = "(//\\s*@translatable)";

    /**
     * regex pattern for matching end of translatable string block.
     */
    static final String JS_END_TRANSLATABLE_PATTERN = "(//\\s*@end_translatable)";

    /**
     * regex pattern for matching start of AFM class.
     */
    static final String JS_START_CLASS_PATTERN = "((Ab\\.)([a-zA-Z]+\\.)([a-zA-Z]+)\\s*=)";

    /**
     * regex pattern for matching start of translatable string block.
     */
    static final String JS_START_TRANSLATABLE_PATTERN = "(//\\s*@begin_translatable)";

    /**
     * path separator.
     */
    static final String PATH_SEPARATOR = "/";

    /**
     * pattern used to look strings with empty spaces.
     */
    static final Pattern patternAllSpaces = Pattern.compile(ALL_SPACES_PATTERN);

    /**
     * pattern used to look for equal signs within a quoted string.
     */
    static final Pattern patternEqualWithinQuote = Pattern.compile(EQUAL_WITHIN_QUOTES_PATTERN);

    /**
     * pattern for matching start of translatable tag.
     */
    static final Pattern patternJavaStartTranslatable = Pattern
            .compile(JAVA_START_TRANSLATABLE_PATTERN);

    /**
     * pattern for matching translatable java string.
     */
    static final Pattern patternJavaTranslatableString = Pattern.compile(DOUBLE_QUOTES_PATTERN);

    /**
     * pattern for matching end of translatable string block.
     */
    static final Pattern patternJsEndTranslatable = Pattern.compile(JS_END_TRANSLATABLE_PATTERN);

    /**
     * pattern.
     */
    static final Pattern patternJsStartClassElement = Pattern.compile(JS_START_CLASS_PATTERN);

    /**
     * pattern for matching start of translatable string block.
     */
    static final Pattern patternJsStartTranslatable = Pattern
            .compile(JS_START_TRANSLATABLE_PATTERN);

    /**
     * list of axvw, xsl, and jsp file paths.
     */
    protected List<String> axvwXslJspFiles = new ArrayList<String>();

    /**
     * list of java file paths.
     */
    protected List<String> javaFiles = new ArrayList<String>();

    /**
     * list of js file paths.
     */
    protected List<String> jsFiles = new ArrayList<String>();

    /**
     * list of mnu file paths.
     */
    protected List<String> mnuFiles = new ArrayList<String>();

    /**
     * list of resx file paths.
     */
    protected List<String> resxFiles = new ArrayList<String>();

    /**
     * list of mobile file paths.
     */
    protected List<String> mobileFiles = new ArrayList<String>();

    /**
     * list of pageNav file paths.
     */
    protected List<String> pageNavFiles = new ArrayList<String>();

    /**
     * total number of files for progress bar.
     */
    protected int totalFiles = 0;

    /**
     * Extracts all parameters into a string.
     *
     * @param s String Original string
     * @return parameters String consisting of parameters
     */
    public static String getParametersInString(final String s) {
        final String PARAM_PATTERN = "(\\{\\d}+)";
        final Pattern p = Pattern.compile(PARAM_PATTERN);
        String parameters = "";
        final Matcher m = p.matcher(s);

        while (m.find()) {
            parameters += m.group();
        }
        return parameters;
    }

    /**
     * Insert distinct translatable file string to lang_files table. Mark record as "OLD" if
     * appropriate.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param constant String
     * @param filename String
     * @param string_english String
     */
    public static void insertTranslatableFileString(final String language, String constant,
            final String filename, String string_english) {

        // don't insert blank translatable strings
        final Matcher matcherAllSpaces = patternAllSpaces.matcher("");
        matcherAllSpaces.reset(string_english);
        if (!matcherAllSpaces.find()) {
            // insert extra single quote if existing quote exists
            string_english = string_english.replace("'", "''");
            constant = constant.replace("'", "''");

            // insert extra double slashes if exist
            string_english = string_english.replace("\\", "\\\\");
            constant = constant.replace("\\", "\\\\");

            // replace curly braces with encoding
            string_english = string_english.replace("${record[", "$\\x7Brecord[");
            constant = constant.replace("${record[", "$\\x7Brecord[");
            string_english = string_english.replace("]}", "]\\x7D");
            constant = constant.replace("]}", "]\\x7D");

            // #kb 3039914
            string_english =
                    string_english.replace("${user.areaUnits.title}",
                            "$\\x7Buser.areaUnits.title\\x7D");
            constant =
                    constant.replace("${user.areaUnits.title}", "$\\x7Buser.areaUnits.title\\x7D");

            final Boolean recordExists =
                    checkIfRecordExists(language, constant, filename, string_english);

            // check if record exists, if so, update first
            if (recordExists) {
                updateExistingRecord(language, constant, filename, string_english);
            }

            // insert new record
            insertRecord(language, constant, filename, string_english);
        }
    }

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
     * Check if record exists.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param constant String
     * @param filename String
     * @param string_english String
     * @return int
     */
    private static Boolean checkIfRecordExists(final String language, final String constant,
            final String filename, final String string_english) {
        // check to see if there is an existing record in the database for this constant and if the
        // English string has changed
        final String sqlCheck =
                "SELECT DISTINCT constant, filename, language, string_english FROM lang_files"
                        + " WHERE language='" + language + "' AND filename='" + filename
                        + "' AND constant='" + constant + "' AND string_english <> '"
                        + string_english + "'";

        final DataSource searchDS = DataSourceFactory.createDataSource();
        searchDS.addTable("lang_files");
        final String[] fields = { "language", "filename", "constant", "string_english" };
        searchDS.addField(fields);
        searchDS.addQuery(sqlCheck.toString());
        return searchDS.getRecords().size() > 0;
    }

    /**
     * Insert new record
     *
     * @param context EventHandlerContext
     * @param language String (eg. Spanish, French, German, etc.)
     * @param constant String
     * @param filename String
     * @param string_english String
     */
    private static void insertRecord(final String language, final String constant,
            final String filename, final String string_english) {
        final String sqlInsert =
                "INSERT INTO lang_files( language, filename, constant, string_english, transfer_status) "
                        + "(SELECT '"
                        + language
                        + "', '"
                        + filename
                        + "', '"
                        + constant
                        + "', '"
                        + string_english
                        + "' , '"
                        + LocalizationBase.UPDATE_STATUS_INSERTED
                        + "' "
                        + "FROM lang_lang "
                        + "WHERE language = '"
                        + language
                        + "' "
                        + "AND NOT EXISTS "
                        + "(SELECT 1 FROM lang_files "
                        + "WHERE language='"
                        + language
                        + "' "
                        + "AND filename='"
                        + filename
                        + "'"
                        + " AND constant = '"
                        + constant + "'" + " ))";

        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_files").addQuery(sqlInsert);
        ds.executeUpdate();
    }

    /**
     * Marks records as old with update.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param constant String
     * @param filename String
     * @param string_english String
     */
    private static void updateExistingRecord(final String language, final String constant,
            final String filename, final String string_english) {
        final String sqlUpdate =
                "UPDATE lang_files " + "SET constant = '"
                        + LocalizationHelper.trimConstant(constant) + "-OLD-"
                        + LocalizationHelper.getTimeStamp() + "'" + ", transfer_status = '"
                        + LocalizationBase.UPDATE_STATUS_UPDATED + "' WHERE language = '"
                        + language + "' " + "AND filename = '" + filename + "'"
                        + " AND constant = '" + constant + "'";

        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_files").addQuery(sqlUpdate);
        ds.executeUpdate();
    }

    /**
     * Compares parameters from English string to Translated strings. Returns whether strings match.
     *
     * @param engParamStr String of parameters from English
     * @param transParamStr String of parameters from Translation
     * @return true|false Boolean Whether the two strings match
     */
    public boolean checkIfParamsMatch(final String engParamStr, final String transParamStr) {

        // size has to be the same
        if (engParamStr.length() != transParamStr.length()) {
            return false;
        } else {

            // test if english param is a component of trans
            final Vector<String> englishParamArray =
                    Utility.vectorFromStringWithEmptyValues(engParamStr, "}");
            final Vector<String> transParamArray =
                    Utility.vectorFromStringWithEmptyValues(transParamStr, "}");
            for (int i = 0; i < englishParamArray.size(); i += 1) {
                final String englishParam = englishParamArray.elementAt(i);
                if (!transParamArray.contains(englishParam)) {
                    return false;
                } else {
                    transParamArray.remove(englishParam);
                    englishParamArray.remove(englishParam);
                }
            }

            if (englishParamArray.size() != transParamArray.size()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Identify and return a list of mistranslated enums, where the stored value in the English
     * string is different from the stored value in the translated string
     *
     * @param language String (eg. French, German, Spanish, etc.)
     * @param viewName String Name of the view
     * @param dataSource String Name of the datasource
     *
     * @return DataSetList of mistranslatedEnumList records
     */
    public DataSetList findMistranslatedEnums(final String language, final String viewName,
            final String dataSourceName) {

        final List<DataRecord> mistranslatedEnumList = new ArrayList<DataRecord>();

        // get all records from lang_enum
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceName);
        final String restriction = "enum_trans IS NOT NULL";
        dataSource.addRestriction(Restrictions.sql(restriction));
        final List<DataRecord> records = dataSource.getAllRecords();

        // for each record in lang_enum
        for (int i = 0; i < records.size(); i++) {

            final DataRecord record = records.get(i);

            // get the english enum and translated enum
            final String englishEnum = (String) record.getValue("lang_enum.enum_english");
            final String transEnum = (String) record.getValue("lang_enum.enum_trans");

            // ---- First, place each display and data value into an array.
            // whitespace will be counted.
            final Vector<String> englishEnumArray =
                    Utility.vectorFromStringWithEmptyValues(englishEnum, ";");
            final Vector<String> transEnumArray =
                    Utility.vectorFromStringWithEmptyValues(transEnum, ";");

            // check whether the pair pattern match
            if (!matchEnumPattern(englishEnumArray, transEnumArray)) {
                mistranslatedEnumList.add(record);
                continue;
            }

            // check whether the stored value match
            if (!matchEnumStoredValues(englishEnumArray, transEnumArray)) {
                mistranslatedEnumList.add(record);
            }
        }

        return new DataSetList(mistranslatedEnumList);
    }

    /**
     * Identifies and returns a list of mistranslated parameters.
     *
     * @param language String (eg. French, German, Spanish, etc.)
     * @param viewName String Name of the view
     * @param dataSource String Name of the datasource
     * @return DataSetList of mistranslatedParamsList
     */
    public DataSetList findMistranslatedParams(final String language, final String viewName,
            final String dataSourceName) {
        final List<DataRecord> mistranslatedParamsList = new ArrayList<DataRecord>();

        // get all records that contain {_} from lang_files
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceName);
        final String restriction =
                "(string_english LIKE '%{%}%' OR string_trans LIKE '%{%}%') AND string_trans IS NOT NULL";
        dataSource.addRestriction(Restrictions.sql(restriction));
        final List<DataRecord> records = dataSource.getAllRecords();

        // for each record in lang_files
        for (int i = 0; i < records.size(); i++) {
            final DataRecord record = records.get(i);

            // get the english string and translated string
            final String englishString = (String) record.getValue("lang_files.string_english");
            final String transString = (String) record.getValue("lang_files.string_trans");

            // extract only the parameters
            final String engParamStr = getParametersInString(englishString);
            final String transParamStr = getParametersInString(transString);

            // check if the parameters match
            if (!checkIfParamsMatch(engParamStr, transParamStr)) {
                mistranslatedParamsList.add(record);
            }
        }
        return new DataSetList(mistranslatedParamsList);
    }

    /**
     * Identifies and returns a list of mistranslated parameters in glossary table. TODO: refactor
     * with findMistranslatedParams.
     *
     * @param language String (eg. French, German, Spanish, etc.)
     * @param viewName String Name of the view
     * @param dataSource String Name of the datasource
     * @return DataSetList of mistranslatedParamsList
     */
    public DataSetList findMistranslatedParamsGlos(final String language, final String viewName,
            final String dataSourceName) {
        final List<DataRecord> mistranslatedParamsList = new ArrayList<DataRecord>();

        // get all records that contain {_} from lang_files
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceName);
        final String restriction =
                "(string_english LIKE '%{%}%' OR string_trans LIKE '%{%}%') AND string_trans IS NOT NULL";
        dataSource.addRestriction(Restrictions.sql(restriction));
        final List<DataRecord> records = dataSource.getAllRecords();

        // for each record in lang_files
        for (int i = 0; i < records.size(); i++) {
            final DataRecord record = records.get(i);

            // get the english string and translated string
            final String englishString = (String) record.getValue("lang_glossary.string_english");
            final String transString = (String) record.getValue("lang_glossary.string_trans");

            // extract only the parameters
            final String engParamStr = getParametersInString(englishString);
            final String transParamStr = getParametersInString(transString);

            // check if the parameters match
            if (!checkIfParamsMatch(engParamStr, transParamStr)) {
                mistranslatedParamsList.add(record);
            }
        }
        return new DataSetList(mistranslatedParamsList);
    }

    /**
     * check whether the two enum lists's pattern match. ( same number of elements, and the element
     * number is even)
     *
     * @param englishEnumArray Vector
     * @param transEnumArray Vector
     * @return boolean.
     */
    public boolean matchEnumPattern(final Vector<String> englishEnumArray,
            final Vector<String> transEnumArray) {

        // size has to be the same
        if (englishEnumArray.size() != transEnumArray.size()) {
            return false;
        }
        // size has to be bigger than 2
        else if (englishEnumArray.size() < 2 || transEnumArray.size() < 2) {
            return false;
        }
        // Must be the same number of display and data values (even length array).
        else if (englishEnumArray.size() % 2 > 0 || transEnumArray.size() % 2 > 0) {
            return false;
        }

        return true;
    }

    /**
     * check whether the two enum lists's stored value match.
     *
     * @param englishEnumArray Vector
     * @param transEnumArray Vector
     * @return boolean.
     */
    public boolean matchEnumStoredValues(final Vector<String> englishEnumArray,
            final Vector<String> transEnumArray) {

        // compare the stored value for english and translated enum.
        for (int i = 0; i < englishEnumArray.size(); i += 2) {

            final String englishKey = englishEnumArray.elementAt(i);
            final String tranKey = transEnumArray.elementAt(i);

            if (englishKey.compareTo(tranKey) != 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * 3043513. Translate SL headings according to similar ML headings.
     *
     * @param language String (eg. French, German, Spanish, etc.)
     * @param viewName String Name of the view
     * @param dataSource String Name of the datasource
     *
     * @return DataSetList of records
     */
    public void translateSimilarSlHeadings(final String language, final String viewName,
            final String dataSourceName) {

        this.status.setTotalNumber(100);

        final String sqlStatement =
                "UPDATE lang_strings "
                        + "SET lang_strings.string_trans = t.trun_trans "
                        + "FROM "
                        // +
                        // "   (SELECT replace(string_english, '\\x0D\\x0A', ' ') AS trun_english,  replace(string_trans, '\\x0D\\x0A', ' ') AS trun_trans, string_type "
                        + "   (SELECT replace(string_english, CHAR(13) + CHAR(10), ' ') AS trun_english,  replace(string_trans, CHAR(13) + CHAR(10), ' ') AS trun_trans, string_type "
                        + "    FROM lang_strings "
                        // +
                        // "    WHERE string_english != replace(string_english, '\\x0D\\x0A', '') "
                        + "    WHERE string_english != replace(string_english, CHAR(13) + CHAR(10), '') "
                        + "    AND string_trans IS NOT NULL " + "    AND string_type = 2 "
                        + "    AND language = '" + language + "') AS t "
                        + "WHERE lang_strings.string_english = t.trun_english "
                        + "AND lang_strings.string_type = 3 "
                        + "AND lang_strings.string_trans IS NULL " + "AND language = '" + language
                        + "'";

        this.status.setCurrentNumber(50);

        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_strings")
                    .addQuery(sqlStatement);
        ds.executeUpdate();

        this.status.setCurrentNumber(100);

        // final List<DataRecord> records = ds.getAllRecords();
        // return new DataSetList(records);
    }

    /**
     * Reads in distinct enums from afm_flds table to lang_enum table.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     */
    public void readTranslatableEnums(final String language) {
        final String sqlStatement =
                "INSERT INTO lang_enum(language, enum_english, transfer_status)"
                        + " SELECT DISTINCT '" + language + "', enum_list, '"
                        + UPDATE_STATUS_INSERTED + "'" + " FROM afm_flds"
                        + " WHERE enum_list IS NOT NULL AND " + " enum_list NOT IN "
                        + " (SELECT DISTINCT enum_english FROM lang_enum WHERE language = '"
                        + language + "')";

        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_enum").addQuery(sqlStatement);
        ds.executeUpdate();
    }

    /**
     * Job that reads in all translatable file strings from user's specified options.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param activityDir String path to the activity
     * @param bAxvwXslJsp Boolean Whether to read in .axvw, .xsl, and .jsp files TRUE|FALSE
     * @param bJava Boolean Whether to read in .java files TRUE|FALSE
     * @param bJs Boolean Whether to read in .js files TRUE|FALSE
     * @param bResx Boolean Whether to read in .resx files TRUE|FALSE
     * @param bMnu Boolean Whether to read in .mnu files TRUE|FALSE
     * @param bCore Boolean Whether to include core files
     */
    public void readTranslatableFiles(final String language, String activityDir,
            final Boolean bAxvwXslJsp, final Boolean bJava, final Boolean bJs, final Boolean bResx,
            final Boolean bMnu, final Boolean bCore, final Boolean bMobile) {

        // set language and context
        this.language = language;
        activityDir = SCHEMA_ABSOLUTE_PATH + activityDir;

        // set axvw, xsl, jsp, java directory to schema if core was also chosen
        if (bCore) {
            activityDir = SCHEMA_ABSOLUTE_PATH;
        }

        // set records to no change
        setStatusToNoChange("lang_files");

        // fill list of file paths according to file type
        this.jsFiles = LocalizationHelper.getSourceFiles(bJs, AB_CORE_ABSOLUTE_PATH, "js", true);
        this.resxFiles =
                LocalizationHelper.getSourceFiles(bResx, this.RESX_MNU_ABSOLUTE_PATH, "resx", true);
        this.mnuFiles =
                LocalizationHelper.getSourceFiles(bMnu, this.RESX_MNU_ABSOLUTE_PATH, "mnu", true);

        this.axvwXslJspFiles =
                LocalizationHelper.getSourceFiles(bAxvwXslJsp, activityDir, "axvw", true);
        this.javaFiles = LocalizationHelper.getSourceFiles(bJava, activityDir, "java", true);

        if (bMobile) {
            this.mobileFiles =
                    LocalizationHelper.getSourceFiles(bMobile, this.MOBILE_ABSOLUTE_PATH, "js",
                        true);
        }

        final Boolean bPageNav = (bAxvwXslJsp && bCore);
        this.pageNavFiles =
                LocalizationHelper
                .getSourceFiles(bPageNav, this.PAGENAV_ABSOLUTE_PATH, "xml", true);

        // get total count of translatable files for progress bar
        this.totalFiles =
                this.jsFiles.size() + this.resxFiles.size() + this.axvwXslJspFiles.size()
                + this.javaFiles.size() + this.mobileFiles.size()
                + this.pageNavFiles.size();

        // set progress bar
        this.status.setTotalNumber(this.totalFiles);
        LocalizationBase.setLocales();

        // read axvw and xsl files if option selected
        if (bAxvwXslJsp) {
            readAxvwXslJsp();
            if (bCore) {
                addLoginPageStrings();
            }
        }

        // read java files if option selected
        if (bJava) {
            readJAVA();
            if (bCore) {
                addCoreStrings();
                addSCPreferenceStrings();
            }
        }

        // read js files if option selected
        if (bJs) {
            addOldSpanMessages();
            readJS();
        }

        // read resx files if option selected
        if (bResx) {
            readRESX();
        }

        // read resx files if option selected
        if (bMnu) {
            readMNU();
        }

        // read mobile files if option selected
        if (bMobile) {
            readMobile();
        }

        if (bPageNav) {
            readPageNav();
        }

        // this.status.setMessage("");

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            // when done, show affected files
            this.status.addProperty("affectedFiles",
                Integer.toString(getCountInserted("lang_files", "language")));
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    /**
     * Reads in all other (non-enum) translatable strings that come from the database to
     * lang_strings table.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param table String
     * @param field String
     * @param stringType Integer
     */
    public void readTranslatableStrings(final String language, final String table,
            final String field, final int stringType) {

        final String sqlStatement =
                "INSERT INTO lang_strings (language,string_english,string_type, transfer_status)"
                        + " SELECT DISTINCT '" + language + "', " + field + ", " + stringType
                        + ", '" + UPDATE_STATUS_INSERTED + "'" + " FROM " + table + " WHERE "
                        + field + " IS NOT NULL AND " + field + " NOT IN "
                        + " (SELECT DISTINCT string_english FROM lang_strings WHERE language = '"
                        + language + "' AND string_type = " + stringType + ")";

        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_strings")
                .addQuery(sqlStatement);
        ds.executeUpdate();
    }

    /**
     * Job that passes in user options and reads in relevant enums and table strings from db to
     * lang_enum and lang_strings tables. Calls readTranslatableEnums(..) and
     * readTranslatableLangStrings(..)
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param bSchema Boolean Whether to include schema tables TRUE|FALSE
     * @param bPnav Boolean Whether to include Process Navigator tables TRUE|FALSE
     * @param bOther Boolean Whether to include other tables TRUE|FALSE
     */
    public void readTranslatableTables(final String language, final Boolean bSchema,
            final Boolean bPnav, final Boolean bOther) {

        // for counts
        this.language = language;

        // set status to "No Change"
        String sqlStatement =
                "UPDATE lang_enum SET transfer_status = '" + UPDATE_STATUS_NO_CHANGE + "'";

        DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_enum").addQuery(sqlStatement);
        ds.executeUpdate();

        sqlStatement =
                "UPDATE lang_strings SET transfer_status = '" + UPDATE_STATUS_NO_CHANGE + "'";
        ds = DataSourceFactory.createDataSource().addTable("lang_strings").addQuery(sqlStatement);
        ds.executeUpdate();

        // insert new strings
        this.translatableFieldsByName = this.getTranslatableFieldsByName();

        // for each translatable table
        final Iterator<Map.Entry<String, org.dom4j.tree.DefaultElement>> it =
                this.translatableFieldsByName.entrySet().iterator();

        // set the total number for the progress bar
        this.status.setTotalNumber(this.translatableFieldsByName.size());

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
                // lang_enum
                this.readTranslatableEnums(language);
            } else {
                // check to see whether this translatable field need to be read
                if (bSchema && isSchemaTable || (bPnav && isPNavTable) || bOther && !isSchemaTable
                        && !isPNavTable) {

                    // lang_strings
                    this.readTranslatableStrings(language, tableName, fieldName, fieldType);
                }
            }
        } // end while

        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.addProperty("affectedEnums",
                Integer.toString(getCountInserted("lang_enum", "language")));
            this.status.addProperty("affectedStrings",
                Integer.toString(getCountInserted("lang_strings", "language")));
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    /**
     * add core strings
     *
     * @return
     */
    private void addCoreStrings() {
        insertTranslatableFileString(this.language, "1", "com.archibus.config.ContextImpl",
                "Find file by the file path=[{0}]");
        insertTranslatableFileString(this.language, "1", "com.archibus.config.ProjectImpl",
                "Please contact your system administrator. You have no activities assigned.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.config.ProjectImpl",
                "Your account has been assigned this activity for which your site does not have a license: [{0}] - Please contact your administrator to remove this activity.");
        insertTranslatableFileString(this.language, "2", "com.archibus.datasource.data.DataSet1D",
                "N/A");
        insertTranslatableFileString(this.language, "1", "com.archibus.db.DbConnectionImpl",
                "Could not commit ([{0}])");
        insertTranslatableFileString(this.language, "2", "com.archibus.db.DbConnectionImpl",
                "Could not commit/close: ([{0}])");
        insertTranslatableFileString(this.language, "1", "com.archibus.db.HandlerSqlException",
                "The value entered is larger than specified precision allowed for this field");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.db.HandlerSqlException",
                "Another table has records that validate on this one.  You must change the value of these dependent records before changing the value of the current record. See the server error for the dependent table name.");
        insertTranslatableFileString(
            this.language,
            "3",
            "com.archibus.db.HandlerSqlException",
                "A value for one of the fields, [{0}] is not correct.  The value must exist in the validating table, the [{1}] table");
        insertTranslatableFileString(
            this.language,
            "4",
            "com.archibus.db.HandlerSqlException",
                "This record is locked by another user or program.  This other user or program has changed the record but has not committed the changes.");
        insertTranslatableFileString(this.language, "5", "com.archibus.db.HandlerSqlException",
                "A value is required for the field: [{0}], a field whose value cannot be NULL, in the table: [{1}]");
        insertTranslatableFileString(this.language, "6", "com.archibus.db.HandlerSqlException",
                "A value is required for a field whose value cannot be NULL in the table: [{0}]");
        insertTranslatableFileString(
            this.language,
            "7",
            "com.archibus.db.HandlerSqlException",
                "Another record already exists with the same identifying value as this record -- the primary key for this record is not unique within the [{0}] table.");
        insertTranslatableFileString(this.language, "8", "com.archibus.db.HandlerSqlException",
                "An error occured when attempting to execute a stored procedure");
        insertTranslatableFileString(this.language, "9", "com.archibus.db.HandlerSqlException",
                "There was problem with processing your request. Please contact your system administrator.");
        insertTranslatableFileString(this.language, "10", "com.archibus.db.HandlerSqlException",
                "The check-in file might be empty.");
        insertTranslatableFileString(this.language, "11", "com.archibus.db.HandlerSqlException",
                "Request cannot be processed.");
        insertTranslatableFileString(this.language, "1", "com.archibus.db.QueryDefLoader",
                "You don't have permission for field=[{0}] in table=[{1}]");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.db.RecordPersistenceImplDT",
                "A value for one of the fields, [{0}] is not correct.  The value must exist in the validating table, the [{1}] table.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.db.RecordPersistenceImplDT",
                "A value for one of the fields, [{0}] is not correct.  The value must not be empty and exist in the validating table, the [{1}] table.");
        insertTranslatableFileString(this.language, "3", "com.archibus.db.RecordPersistenceImplDT",
                "The enumeration value [{0}] for field [{1}] does not exist in ARCHIBUS schema.");
        insertTranslatableFileString(this.language, "1", "com.archibus.docmanager.Document",
                "The size [{0} KB] of the file is larger than allowed [{1} KB].");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.docmanager.Document",
                "The system manager has removed all previous versions of this document from the server. Please notify your system manager. Use 'Delete Document' button to clear the document storage.");
        insertTranslatableFileString(
            this.language,
            "3",
            "com.archibus.docmanager.Document",
                "This file was locked by: [{0}], on: [{1}], at: [{2}]. Break the lock to delete or check in the file.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.docmanager.DocumentHandlers",
                "Files with [{0}] extension are not allowed for check-in.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.eventhandler.ChartDataHandler", "N/A");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.dashboarddefinition.DashboardWizardHandlers",
                "DashboardWizard - saveFile - IOException : [{0}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.eventhandler.dashboarddefinition.DashboardWizardHandlers",
                "DashboardWizard - readFile - ParserConfigurationException : [{0}]");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.eventhandler.dashboarddefinition.DashboardWizardHandlers",
                "DashboardWizard - readFile - SAXException : [{0}]");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.eventhandler.dashboarddefinition.DashboardWizardHandlers",
                "DashboardWizard - readFile - IOException : [{0}]");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.eventhandler.dashboarddefinition.DashboardWizardHandlers",
                "DashboardWizard - saveFile - IOException : [{0}]");

        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.report.HighlightHandler",
                "Unable to find the drawing for the specified floor in ARCHIBUS table.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.viewdefinition.ViewDefinitionHandlers", "Task failed");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.eventhandler.viewdefinition.ViewDefinitionHandlers", "Task failed.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.eventhandler.viewdefinition.ViewDefinitionHandlers",
                "Favorite was successfully saved");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.eventhandler.viewdefinition.ViewDefinitionHandlers",
                "Favorite was successfully removed");
        insertTranslatableFileString(this.language, "1", "com.archibus.eventhandler.ViewHandlers",
                "Record was successfully saved");
        insertTranslatableFileString(this.language, "2", "com.archibus.eventhandler.ViewHandlers",
                "Up");
        insertTranslatableFileString(this.language, "3", "com.archibus.eventhandler.ViewHandlers",
                "Top");
        insertTranslatableFileString(this.language, "4", "com.archibus.eventhandler.ViewHandlers",
                "All");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.WorkflowRuleHandlers", "Class Name");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.eventhandler.WorkflowRuleHandlers", "Method Name");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.eventhandler.WorkflowRuleHandlers", "name");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.eventhandler.WorkflowRuleHandlers", "name");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.eventhandler.WorkflowRuleHandlers", "name");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.ext.datatransfer.DataTransferIn",
                "WARNING: The enumeration value [{0}] for field [{1}] does not exist in ARCHIBUS schema, thus the default enum value has been inserted or updated.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.datatransfer.DataTransferIn",
                "You do not have the permission to perform bulk edit operations.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorHelperBase",
                "The enterprise graphics file is not available:[{0}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorLegendHelper",
                "An error occurs when close the legend file [{0}].");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorLegendHelper",
                "An error occurs when reading the legend file [{0}].");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorLegendHelper",
                "An error occurs when reading the legend json string.");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorLegendHelper",
                "An error occurs when parsing the legend json string [{0}].");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.drawing.highlight.PatternParser",
                "Unable to locate the hatch pattern file [{0}] for drawing highlight.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.drawing.highlight.PatternParser",
                "An error occurs when reading the hatch pattern file [{0}].");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.drawing.highlight.PatternParser",
                "Incorrect number format when reading the hatch pattern file [{0}].");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.ext.report.docx.DocxUtility",
                "Files are too large to merge. Please either merge the partial files in Microsoft Word, or print the partial files separately.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.ext.report.docx.DocxUtility",
                "Files are too large to merge. Please either append the files in Microsoft Word, or print the partial files separately.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.docx.DrawingPanelBuilder",
                "No table with drawing highlight dataSource=[{0}] has a drawing name field in its database schema.");
        insertTranslatableFileString(this.language, "1", "com.archibus.ext.report.docx.Report",
                "Page");
        insertTranslatableFileString(this.language, "2", "com.archibus.ext.report.docx.Report",
                "of");
        insertTranslatableFileString(this.language, "3", "com.archibus.ext.report.docx.Report",
                "Powered by ARCHIBUS");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.ext.report.docx.ReportBuilder",
                "The report is too large to produce. Please set a restriction filter on your data and print it again.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.xls.ReportBuilder", "Total");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.jobmanager.WorkflowRulesContainerImpl",
                "Your account does not belong to the security group required to run this rule: [{0}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.jobmanager.WorkflowRulesContainerImpl",
                "This rule is not active at your site: [{0}]");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.LicenseCounterImpl",
                "Your installation has run out of licenses for this program or activity: [{0}] - Please try again later or contact your administrator concerning additional licenses.");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.LicenseManagerImpl",
                "Your installation has more named users assigned to this program than there are named-user licenses:  [{0}] - Please contact your administrator concerning additional licenses.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.licensing.LicenseManagerLoader",
                "This time-limited version of ARCHIBUS expired on {0}.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.licensing.ViewLicenseLevelInterceptor",
                "Your account does not have license level [{0}] required to load view [{1}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Loading DataSource definition with id=[{0}].");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Main table not found.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Field [{0}] with groupBy='true' attribute can not be in the non-grouping DataSource.");
        insertTranslatableFileString(
            this.language,
            "4",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Field [{0}] can not be in the grouping DataSource. Fields in grouping datasource must be virtual or have groupBy='true' attribute.");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Unsupported RelativeOperation=[{0}]");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.model.view.datasource.processor.DataSourceDefLoader",
                "Unsupported Operation=[{0}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.form.processor.AnalysisViewDefGenerator", "Count");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.form.processor.AnalysisViewDefGenerator", "Sum");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Report definition contains [{0}] parent panels. Maximum of 2 parent panels is allowed.");
        insertTranslatableFileString(this.language, "8",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Panel field references data source field=[{0}], which is not defined in data source=[{1}].");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.report.processor.ReportDefImplicitGenerator",
                "Generate implicit objects for report definition=[{0}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.report.processor.ReportDefImplicitGenerator", "Overall {0}");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.report.processor.ReportDefLoader",
                "Loading report definition from filePath=[{0}].");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.report.processor.ReportDefLoader",
                "Loading report definition [{0}] from XML document");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.view.report.processor.ReportDefLoader",
                "No 'report' element in the view file.");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.model.view.report.processor.ReportDefLoader",
                "No 'view' element in the view file.");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.model.view.report.processor.ReportDefLoader",
                "Version=[{0}] of the view does not match required version=[{1}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.report.processor.ReportDefMerger",
                "Merge report definition with schema info for UserSession=[{0}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.report.processor.ReportDefMerger",
                "Panel=[{0}] has only memo fields.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.view.report.processor.ReportDefMerger",
                "DataSource=[{0}] of legend panel=[{1}] does not have drawing name field.");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.model.view.report.processor.ReportDefMerger",
                "Legend panel=[{0}] must have datasource.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "Validate report definition=[{0}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "No visible fields in panel=[{0}]");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "No restriction parameters in parent panel=[{0}]");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "No matching parameter in child datasource=[{0}]");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "No restriction in child datasource=[{0}]");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.model.view.report.processor.ReportDefValidator",
                "No parsed restriction with value=[{0}] in child datasource=[{1}] with");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.schema.FieldJavaTypeBaseImpl",
                "Format field value=[{0}] using format=[{1}]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.schema.FieldJavaTypeBaseImpl",
                "Parse field value=[{0}] using format=[{1}]");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.security.UserAccountLoader",
                "Could not find user account information for user: [{0}] - Please check the spelling of the user name.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.service.remoting.SmartClientViewServiceImpl",
                "User does not have permission to edit field {0}.{1}");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.servlet.utility.FileTransfer", "The file is empty!");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.servlet.utility.FileTransfer",
                "The size of the file is larger than allowed: [{0} Kb].");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.servletx.controller.DialogParameters", "Message");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.servletx.controller.ErrorDialogParameters", "Error Message");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.servletx.controller.ExceptionHandlerRendering",
                "The system has logged you out.  Please log in again, or close your browser to exit.");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.servletx.controller.SecurityControllerImpl",
                "Your WebCentral session has expired, and for reasons of security and resource use the system has logged you out. Please log in again, or close your browser to exit.");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.EnumTemplate",
                "Invalid value=[{0}] for enumeration type=[{1}]");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.ExceptionBase",
                "Operation failed: {0}");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.utility.ExceptionHandlerBase",
                "The system has logged you out. Please log in again, or close your browser to exit.");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.FileUtil",
                "Saving file=[{0}]");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.MailSender",
                "Invalid address list: [{0}]. [{1}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.analysis.MdxConfiguration", "Count");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.analysis.MdxConfiguration", "Total");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.view.analysis.MdxConfiguration", "N/A");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.tablegroup.datasource.DataSourceUpdateImpl",
                "The old record(s) is missing, unable to update");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.FieldActionsSupport", "Add more");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.taghandler.FieldActionsSupport", "Browse for Document");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.view.taghandler.FieldActionsSupport", "Show Document");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.view.taghandler.FieldActionsSupport", "Check In New Document");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.view.taghandler.FieldActionsSupport", "Check In New Version");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.view.taghandler.FieldActionsSupport", "Check Out Document");
        insertTranslatableFileString(this.language, "7",
            "com.archibus.view.taghandler.FieldActionsSupport", "Lock or Unlock Document");
        insertTranslatableFileString(this.language, "8",
            "com.archibus.view.taghandler.FieldActionsSupport", "Delete Document");
        insertTranslatableFileString(this.language, "9",
            "com.archibus.view.taghandler.FieldActionsSupport", "Select Value");
        insertTranslatableFileString(this.language, "10",
            "com.archibus.view.taghandler.FieldActionsSupport", "Select Value");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.PanelSimpleTag",
                "Setting column attribute to value=[{0}]: value must be an integer > 0!");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.taghandler.PanelSimpleTag", "Calendar");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.ViewSimpleTag", "*Demo*");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.taghandler.ViewSimpleTag",
                "**For demonstration only. Not for production use.**");
        insertTranslatableFileString(this.language, "1", "com.archibus.view.ViewLoader",
                "You do not have permission for this view");

        // 19.2 2010-12-1
        insertTranslatableFileString(this.language, "1", "com.archibus.config.ProjectLoader",
                "Invalid parameter of activity license=[{0}]");
        insertTranslatableFileString(this.language, "1", "com.archibus.datasource.DataSourceImpl",
                "The view field [{0}.{1}] is not defined in ARCHIBUS schema.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.drawing.highlight.HighlightGeneratorHelperBase",
                "Input file does not exist -");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.docx.PrintRestriction", "Restriction in Effect");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.LocalizedClauseOperations", "Equals");
        insertTranslatableFileString(this.language, "10",
            "com.archibus.ext.report.LocalizedClauseOperations", "Is Not Null");
        insertTranslatableFileString(this.language, "11",
            "com.archibus.ext.report.LocalizedClauseOperations", "Is any of");
        insertTranslatableFileString(this.language, "12",
            "com.archibus.ext.report.LocalizedClauseOperations", "Is none of");
        insertTranslatableFileString(this.language, "13",
            "com.archibus.ext.report.LocalizedClauseOperations", "and");
        insertTranslatableFileString(this.language, "14",
            "com.archibus.ext.report.LocalizedClauseOperations", "or");
        insertTranslatableFileString(this.language, "15",
            "com.archibus.ext.report.LocalizedClauseOperations", "AND");
        insertTranslatableFileString(this.language, "16",
            "com.archibus.ext.report.LocalizedClauseOperations", "OR");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.report.LocalizedClauseOperations", "Not equal to");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.report.LocalizedClauseOperations", "Less than");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.ext.report.LocalizedClauseOperations", "Less than or equal to");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.ext.report.LocalizedClauseOperations", "Greater than");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.ext.report.LocalizedClauseOperations", "Greater than or equal to");
        insertTranslatableFileString(this.language, "7",
            "com.archibus.ext.report.LocalizedClauseOperations", "Like");
        insertTranslatableFileString(this.language, "8",
            "com.archibus.ext.report.LocalizedClauseOperations", "Not Like");
        insertTranslatableFileString(this.language, "9",
            "com.archibus.ext.report.LocalizedClauseOperations", "Null");
        insertTranslatableFileString(this.language, "1", "com.archibus.ext.report.xls.BuilderBase",
                "Total");
        insertTranslatableFileString(
            this.language,
            "3",
            "com.archibus.jobmanager.WorkflowRulesContainerImpl",
                "Your account does not have the license level needed (Level 3 - Analysis) required to run this rule: [{0}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.licensing.processor.CheckViewRenderingRequest",
                "Your account does not have license level [{0}] required to load view [{1}]");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.model.licensing.processor.CheckViewRenderingRequest",
                "The program will not load view [{0}] as it belongs to a domain or activity not licensed at this site");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.service.interceptor.ExceptionHandlerImpl", "Your password has expired.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.service.interceptor.ExceptionHandlerImpl",
                "Too many failed login attempts. Your account is locked. Request that your system administrator unlocks your account.");
        insertTranslatableFileString(this.language, "1", "com.archibus.datasource.data.DataSet1D",
                "(no value)");
        insertTranslatableFileString(this.language, "1", "com.archibus.datasource.data.DataSet2D",
                "(no value)");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.ChartDataHandler", "(no value)");
        insertTranslatableFileString(this.language, "1", "com.archibus.controls.GanttService",
                "Unspecified");

        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.ReportBuilderJob",
                "Fail to export a paginated report with view name [%s]");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.report.ReportBuilderJob",
                "Fail to export a Crosstab XLS report with a view name [%s] and a data source id [%s]");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.report.ReportBuilderJob", "Fail to export a DOCX report for a chart");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.docmanager.DocumentArchiveUtil",
                "Un-Archiving was successfully executed!");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.docmanager.DocumentArchiveUtil", "Un-Archiving failed");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.docmanager.DocumentArchiveUtil", "Archiving was successfully executed!");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.docmanager.DocumentArchiveUtil", "Archiving failed");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.MailMessage",
                "Invalid address: empty");
        insertTranslatableFileString(this.language, "2", "com.archibus.utility.MailMessage",
                "Invalid address, does not contain \"@\": [{0}]. [{1}]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.importexport.common.TransferFields",
                "Error in Data Transfer Manager: The table name you provided is empty.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.importexport.common.TransferFields",
                "Error in Data Transfer Manager: The table name {[%s]} you provided is invalid.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.importexport.common.TransferFields",
                "Unable to load the tableDef object for table {[%s]}.");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.ext.importexport.common.TransferFields",
                "The field name [{0}] does not exist in table [{1}].");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.ext.importexport.common.TransferFields",
                "The protected field name [{0}] does not exist in ARCHIBUS schema.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.view.form.processor.AnalysisViewDefGenerator", "Count");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.form.processor.AnalysisViewDefGenerator", "Sum");

        // 2011-06-15, 20.1.1.13
        insertTranslatableFileString(this.language, "1", "com.archibus.jobmanager.JobStatus",
                "Job Not found - {0}% Completed");
        insertTranslatableFileString(this.language, "2", "com.archibus.jobmanager.JobStatus",
                "Job Created - {0}% Completed");
        insertTranslatableFileString(this.language, "3", "com.archibus.jobmanager.JobStatus",
                "Job Started - {0}% Completed");
        insertTranslatableFileString(this.language, "4", "com.archibus.jobmanager.JobStatus",
                "Job Complete - {0}%");
        insertTranslatableFileString(this.language, "5", "com.archibus.jobmanager.JobStatus",
                "Job Stop Requested - {0}% Completed");
        insertTranslatableFileString(this.language, "6", "com.archibus.jobmanager.JobStatus",
                "Job Stop Acknowledged - {0}% Completed");
        insertTranslatableFileString(this.language, "7", "com.archibus.jobmanager.JobStatus",
                "Job Stopped - {0}% Completed");
        insertTranslatableFileString(this.language, "8", "com.archibus.jobmanager.JobStatus",
                "Job Terminated - {0}% Completed");
        insertTranslatableFileString(this.language, "9", "com.archibus.jobmanager.JobStatus",
                "Job Failed - {0}% Completed");

        // 2011-08-24, 20.1.1.033
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.config.UnitsTitleFactory", "m\u00B2");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.config.UnitsTitleFactory", "M");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.config.UnitsTitleFactory", "ft\u00B2");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.model.config.UnitsTitleFactory", "ft");

        // 2012-01-09, 20.1.1.096
        insertTranslatableFileString(this.language, "1", "com.archibus.dao.jdbc.DocumentDaoImpl",
                "Files with names longer than [{0}] characters are not allowed for check-in.");
        insertTranslatableFileString(this.language, "2", "com.archibus.dao.jdbc.DocumentDaoImpl",
                "Files with [{0}] extension are not allowed for check-in.");
        insertTranslatableFileString(this.language, "1", "com.archibus.db.RecordPersistenceImpl",
                "No records updated, update failed for SQL=[{0}]");
        insertTranslatableFileString(this.language, "2", "com.archibus.db.RecordPersistenceImpl",
                "No records updated, update failed for SQL=[{0}]");
        insertTranslatableFileString(this.language, "3", "com.archibus.db.RecordPersistenceImpl",
                "The specified field values correspond to more than one record.");
        insertTranslatableFileString(
            this.language,
            "4",
            "com.archibus.db.RecordPersistenceImpl",
                "A value for one of the fields, [{0}] is not correct.  The value must exist in the validating table, the [{1}] table.");
        insertTranslatableFileString(
            this.language,
            "5",
            "com.archibus.db.RecordPersistenceImpl",
                "A value for one of the fields, [{0}] is not correct.  The value must not be empty and exist in the validating table, the [{1}] table.");
        insertTranslatableFileString(this.language, "6", "com.archibus.db.RecordPersistenceImpl",
                "Find view field=[{0}] in query");
        insertTranslatableFileString(this.language, "7", "com.archibus.db.RecordPersistenceImpl",
                "No fields to update");
        insertTranslatableFileString(this.language, "8", "com.archibus.db.RecordPersistenceImpl",
                "Value of primary key field=[{0}] is not present.");
        insertTranslatableFileString(this.language, "9", "com.archibus.db.RecordPersistenceImpl",
                "Check if old record has all key values");
        insertTranslatableFileString(this.language, "10", "com.archibus.db.RecordPersistenceImpl",
                "Value of primary key field [{0}] is not present.");
        insertTranslatableFileString(this.language, "11", "com.archibus.db.RecordPersistenceImpl",
                "No permission to edit the primary key field [{0}] of the table [{1}].");
        insertTranslatableFileString(this.language, "12", "com.archibus.db.RecordPersistenceImpl",
                "Record not found.");
        insertTranslatableFileString(this.language, "4", "com.archibus.db.RecordPersistenceImplDT",
                "Record not found.");
        insertTranslatableFileString(this.language, "1", "com.archibus.model.config.Currency",
                "Invalid currency code: {0}");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.security.UserAccountLoaderImpl",
                "User account [{0}] has no security groups assigned. Please contact your administrator.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.security.UserRoleLoaderImpl",
                "Role [{0}] has no security groups assigned. Please contact your administrator.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.service.remoting.SmartClientViewServiceImpl",
                "A view named {0} already exists. You cannot save a second view with the same name");

        // 2013-04-08, 21.1.1.070
        insertTranslatableFileString(this.language, "1",
            "com.archibus.eventhandler.NavigationPagesPublisher",
                "Home Pages successfully published for");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.drawing.highlight.emf.EmfRendererUtilities",
                "The file [%s] is not available.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.AbstractPanelBuilderFactory",
                "Cannot find the custom handler class named as [%s].");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.docx.DocxTemplate", "page");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.report.docx.DocxTemplate", "of");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.report.docx.DocxTemplate", "Powered by ARCHIBUS");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.ext.report.docx.drawinghighlight.DrawingPanelBuilderBase",
                "No table defined by drawing highlight dataSource=[{0}] has a drawing name field in its database schema.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.PanelReportProperties",
                "Fail to parse parameters with a view name [%s]");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.render.field.FieldRendererDate", "Calendar");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.render.field.FieldRendererDocument", "Upload a document");

        // 2013-06-12, post 21.1.1.118
        insertTranslatableFileString(this.language, "1", "com.archibus.security.UserAccountImpl",
                "Your administrator has not enabled your account for mobile access.");

        // 2013-07-15, 21.1 Multi
        insertTranslatableFileString(this.language, "1", "com.archibus.ext.report.Constants",
                "Restriction in Effect");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.taghandler.render.field.FieldRendererMultiEdit", "Any");

        // 2013-12-20, 21.2.2.214
        insertTranslatableFileString(this.language, "2",
            "com.archibus.eventhandler.NavigationPagesPublisher", " role - locale pairs");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.eventhandler.NavigationPagesPublisher", "Parse errors in descriptor file");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.eventhandler.NavigationPagesPublisher", "<br>for user role");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.eventhandler.NavigationPagesPublisher", " in");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.eventhandler.NavigationPagesPublisher",
                "Exception attempting to make directory");
        insertTranslatableFileString(this.language, "7",
            "com.archibus.eventhandler.NavigationPagesPublisher",
                "Exception attempting to clean directory");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.NavigationDescriptionParser",
                "Descriptor File not found :");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.navigation.NavigationDescriptionParser",
                "Reading an unknown descriptor element:");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.NavigationProductBucket", "ARCHIBUS APPLICATIONS");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.XsdValidationErrorHandler", "line:");

        // 21.2 ML 2014-01-08
        insertTranslatableFileString(this.language, "2",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "No panels in data role and no drawing panels.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.NavigationFavoritesBucket", "My Favorites");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.navigation.NavigationFavoritesBucket",
                "Most often used tasks and reports.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.view.navigation.XsdValidationErrorHandler", "column:");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.view.navigation.XsdValidationErrorHandler", "in");

        // 21.3 2014-07-22
        insertTranslatableFileString(this.language, "5",
            "com.archibus.eventhandler.viewdefinition.ViewDefinitionHandlers",
                "Favorites were successfully reordered");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "highlightDataSource is required attribute for the drawing panel [{0}].");
        insertTranslatableFileString(
            this.language,
            "4",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Data source with id=[{0}] is not defined in the view. Panel with id=[{1}] references this data source.");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Unsupported panel format=[{0}].");
        insertTranslatableFileString(this.language, "6",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Panel field=[{0}] is a virtual field, but data source=[{1}] already has field with the same name.");
        insertTranslatableFileString(this.language, "7",
            "com.archibus.model.view.report.panel.PanelDefLoader",
                "Panel field references data source field=[{0}], which is not defined in data source=[{1}].");

        // 21.3 ML 2014-08-29
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.processor.ActivityToDomainReassignmentCheck",
                "The program is stopping because ARCHIBUS stock domains have been reassigned in a manner inconsistent with this site's product license");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.NavigationProcessBucket",
                "This process' activity is not licensed.");

        // 21.3.3.698 ML 2014-10-24
        insertTranslatableFileString(
            this.language,
            "5",
            "com.archibus.model.licensing.processor.MobileLicensingCheck",
                "[{0}] security group requires your role to have at least this license level: [{1}]. Have your system manager make this change before you re-register.");

        // 22.1 2014-08-06
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.importexport.filebuilder.ImportExportFileBase",
            "Invalid input file! The first cell [%s] does not contain a valid table name.");
        insertTranslatableFileString(this.language, "2",
            "com.archibus.ext.importexport.filebuilder.ImportExportFileBase",
            "Please provide at least one field name in your field names list for import file content.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.ext.importexport.filebuilder.ImportExportFileBase",
            "Please provide the table name in the field names list for import file content.");
        insertTranslatableFileString(this.language, "1", "com.archibus.utility.XmlImpl",
                "Application error occurred.");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.view.navigation.NavigationPagesBlockUtilities", "ARCHIBUS APPLICATIONS");

        // 23.1 2016-03-30
        insertTranslatableFileString(this.language, "1",
            "com.archibus.ext.report.PaginatedReportsBuilder", "Legend");
        insertTranslatableFileString(this.language, "1",
            "com.archibus.model.licensing.processor.MobileLicensingCheck",
            "Your administrator has not assigned any mobile apps to your role.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.model.licensing.processor.MobileLicensingCheck",
            "[{0}] security group requires your role to be assigned at least one of these activities: [{1}]. Have your system manager make this change before you re-register.");
        insertTranslatableFileString(
            this.language,
            "3",
            "com.archibus.model.licensing.processor.MobileLicensingCheck",
            "[{0}] security group requires your role to be assigned all of these activities: [{1}]. Have your system manager make this change before you re-register.");
        insertTranslatableFileString(
            this.language,
            "4",
            "com.archibus.model.licensing.processor.MobileLicensingCheck",
            "[{0}] security group requires your role to have at least this license level: [{1}]. Have your system manager make this change before you re-register.");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.processor.ReportSecurityCheck",
            "You cannot load report [{0}] as it is not assigned to your role or is not licensed at your site. Please contact your ARCHIBUS Administrator for access to this report.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.model.licensing.processor.ViewRenderingRequestCheck",
            "You cannot load view [{0}] as it is not licensed at your site. Please contact your ARCHIBUS Administrator for access to this view.");
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.processor.ViewSecurityCheck",
            "You cannot load view [{0}] as it is not assigned to your role or is not licensed at your site. Please contact your ARCHIBUS Administrator for access to this view.");
        insertTranslatableFileString(
            this.language,
            "2",
            "com.archibus.security.UserAccountImpl",
            "You cannot register a mobile devices as your installation has not purchased a Mobile Framework License.");
        insertTranslatableFileString(this.language, "3",
            "com.archibus.service.interceptor.ExceptionHandlerImpl",
            "An application error occurred.");
        insertTranslatableFileString(this.language, "4",
            "com.archibus.service.interceptor.ExceptionHandlerImpl",
            "Your account has configuration problem. Please contact your administrator.");
        insertTranslatableFileString(this.language, "5",
            "com.archibus.service.interceptor.ExceptionHandlerImpl",
            "The user ID and password you entered don't match our records.");

        // 2016-05-17 23.1
        insertTranslatableFileString(
            this.language,
            "1",
            "com.archibus.model.licensing.processor.ViewRenderingRequestCheck",
            "Your site does not have a license for the Web Central 3D Navigator. Please contact your system administrator.");
    }

    /**
     * add login page strings.
     */
    private void addLoginPageStrings() {
        final String fileName = "/ab-system/system-administration/login.axvw";

        String className = "message";
        insertTranslatableFileString(this.language, className + "||"
                + "A password notification has been requested.", fileName,
                "A password notification has been requested.");
        insertTranslatableFileString(this.language, className + "||" + "Be Our Guest", fileName,
                "Be Our Guest");
        insertTranslatableFileString(
            this.language,
            className
            + "||"
            + "Could not request password notification. You will need to contact your administrator.",
            fileName,
                "Could not request password notification. You will need to contact your administrator.");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case-insensitive):", fileName,
                "Enter your password (case-insensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case-sensitive):", fileName,
                "Enter your password (case-sensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case-insensitive):", fileName,
                "Enter your user name (case-insensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case-sensitive):", fileName,
                "Enter your user name (case-sensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case-insensitive)", fileName,
                "Enter your password (case-insensitive)");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case-sensitive)", fileName,
                "Enter your password (case-sensitive)");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case-insensitive)", fileName,
                "Enter your user name (case-insensitive)");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case-sensitive)", fileName,
                "Enter your user name (case-sensitive)");
        insertTranslatableFileString(this.language, className + "||"
                + "Forgot your password? Click here.", fileName,
                "Forgot your password? Click here.");
        insertTranslatableFileString(this.language, className + "||" + "Guest Sign In", fileName,
                "Guest Sign In");
        insertTranslatableFileString(
            this.language,
            className
            + "||"
            + "If you don't have an account, use this selection to access your site's guest activities.",
            fileName,
                "If you don't have an account, use this selection to access your site's guest activities.");
        insertTranslatableFileString(this.language, className + "||" + "Project:", fileName,
                "Project:");
        insertTranslatableFileString(this.language, className + "||"
                + "Remember my user name on this computer", fileName,
                "Remember my user name on this computer");
        insertTranslatableFileString(this.language, className + "||" + "Request New Password?",
            fileName, "Request New Password?");
        insertTranslatableFileString(this.language, className + "||" + "Select a project:",
            fileName, "Select a project:");
        insertTranslatableFileString(
            this.language,
            className
            + "||"
            + "Sign in to your personalized list of activities and join the collaboration now.",
            fileName,
                "Sign in to your personalized list of activities and join the collaboration now.");
        insertTranslatableFileString(this.language, className + "||" + "Sign In", fileName,
                "Sign In");
        insertTranslatableFileString(this.language, className + "||" + "Sign-in Page Language:",
            fileName, "Sign-in Page Language:");
        insertTranslatableFileString(this.language, className + "||"
                + "This is a limited time version of ARCHIBUS. Days left on your license:",
                fileName, "This is a limited time version of ARCHIBUS. Days left on your license:");
        insertTranslatableFileString(this.language, className + "||" + "You must enter a password",
            fileName, "You must enter a password");
        insertTranslatableFileString(this.language,
            className + "||" + "You must enter a user name", fileName, "You must enter a user name");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case sensitive):", fileName,
                "Enter your user name (case sensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your user name (case insensitive):", fileName,
                "Enter your user name (case insensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case sensitive):", fileName,
                "Enter your password (case sensitive):");
        insertTranslatableFileString(this.language, className + "||"
                + "Enter your password (case insensitive):", fileName,
                "Enter your password (case insensitive):");
        insertTranslatableFileString(this.language, className + "||" + "I forgot my password.",
            fileName, "I forgot my password.");
        insertTranslatableFileString(this.language, className + "||" + "I forgot my password",
            fileName, "I forgot my password");
        insertTranslatableFileString(this.language, className + "||"
                + "Remember my user name on this computer", fileName,
                "Remember my user name on this computer");
        insertTranslatableFileString(this.language, className + "||"
                + "Send a change-password link to your work email?", fileName,
                "Send a change-password link to your work email?");
        insertTranslatableFileString(this.language, className + "||"
                + "Remember my username&lt;br&gt;on this computer", fileName,
                "Remember my username&lt;br&gt;on this computer");
        insertTranslatableFileString(this.language, className + "||"
                + "Sign in as &ldquo;guest&rdquo;", fileName, "Sign in as &ldquo;guest&rdquo;");
        insertTranslatableFileString(this.language, className + "||"
                + "This is a limited time version of ARCHIBUS. Days left on your license: {0}",
                fileName, "This is a limited time version of ARCHIBUS. Days left on your license: {0}");
        insertTranslatableFileString(this.language, className + "||" + "Select your language:",
            fileName, "Select your language:");
        insertTranslatableFileString(this.language, className + "||"
                + "Request administrator to reset your password?", fileName,
                "Request administrator to reset your password?");
        insertTranslatableFileString(this.language, className + "||" + "Yes", fileName, "Yes");
        insertTranslatableFileString(this.language, className + "||" + "No", fileName, "No");

        className = "title";
        insertTranslatableFileString(this.language, className + "||" + "Guest Sign In", fileName,
                "Guest Sign In");
        insertTranslatableFileString(this.language, className + "||" + "Sign In", fileName,
                "Sign In");

        className = "localeMessage";
        insertTranslatableFileString(this.language, className + "||" + "Arabic (Saudi Arabia)",
            fileName, "Arabic (Saudi Arabia)");
        insertTranslatableFileString(this.language, className + "||" + "Chinese (China)", fileName,
                "Chinese (China)");
        insertTranslatableFileString(this.language, className + "||" + "Chinese (Taiwan)",
            fileName, "Chinese (Taiwan)");
        insertTranslatableFileString(this.language, className + "||" + "Dutch", fileName, "Dutch");
        insertTranslatableFileString(this.language, className + "||" + "Dutch (Netherlands)",
            fileName, "Dutch (Netherlands)");
        insertTranslatableFileString(this.language, className + "||" + "English (Australia)",
            fileName, "English (Australia)");
        insertTranslatableFileString(this.language, className + "||" + "English (Canada)",
            fileName, "English (Canada)");
        insertTranslatableFileString(this.language, className + "||" + "English (United Kingdom)",
            fileName, "English (United Kingdom)");
        insertTranslatableFileString(this.language, className + "||" + "English (United States)",
            fileName, "English (United States)");
        insertTranslatableFileString(this.language, className + "||" + "French (Canada)", fileName,
                "French (Canada)");
        insertTranslatableFileString(this.language, className + "||" + "French (France)", fileName,
                "French (France)");
        insertTranslatableFileString(this.language, className + "||" + "German", fileName, "German");
        insertTranslatableFileString(this.language, className + "||" + "German (Germany)",
            fileName, "German (Germany)");
        insertTranslatableFileString(this.language, className + "||" + "Hebrew (Israel)", fileName,
                "Hebrew (Israel)");
        insertTranslatableFileString(this.language, className + "||" + "Italian", fileName,
                "Italian");
        insertTranslatableFileString(this.language, className + "||" + "Italian (Italy)", fileName,
                "Italian (Italy)");
        insertTranslatableFileString(this.language, className + "||" + "Japanese (Japan)",
            fileName, "Japanese (Japan)");
        insertTranslatableFileString(this.language, className + "||" + "Korean (South Korea)",
            fileName, "Korean (South Korea)");
        insertTranslatableFileString(this.language, className + "||" + "Norwegian (Norway)",
            fileName, "Norwegian (Norway)");
        insertTranslatableFileString(this.language, className + "||" + "Portuguese (Brazil)",
            fileName, "Portuguese (Brazil)");
        insertTranslatableFileString(this.language, className + "||" + "Spanish", fileName,
                "Spanish");
        insertTranslatableFileString(this.language, className + "||" + "Spanish (Spain)", fileName,
                "Spanish (Spain)");
        insertTranslatableFileString(this.language, className + "||" + "Estonian (Estonia)",
            fileName, "Estonian (Estonia)");
        insertTranslatableFileString(this.language, className + "||" + "Estonian", fileName,
                "Estonian");
        for (final LocaleConfig localeConfig : LocalizationBase.locales) {
            final String localeConfigLanguage = localeConfig.getTitle();
            insertTranslatableFileString(this.language, className + "||" + localeConfigLanguage,
                fileName, localeConfigLanguage);
        }
    }

    /**
     * add the old error messages and calendar text spans previously inserted for every view by the
     * XSL.
     */
    private void addOldSpanMessages() {
        final String className = "common";
        final String fileName = "legacy.js"; // "jsControl"; // legacy

        insertTranslatableFileString(this.language, className + "||"
                + "general_warning_message_empty_required_fields", fileName,
                "Some required fields have not been entered, please enter or select values for them!");
        insertTranslatableFileString(this.language, className + "||"
                + "general_delete_warning_message_empty_required_fields", fileName,
                "Are you sure you want to delete this record?");
        insertTranslatableFileString(this.language, className + "||"
                + "general_invalid_input_warning_message_integer", fileName,
                "Invalid input! Please enter an integer.");
        insertTranslatableFileString(this.language, className + "||"
                + "general_invalid_input_warning_message_numeric", fileName,
                "Invalid input! Please enter a numeric value.");
        insertTranslatableFileString(this.language, className + "||"
                + "general_invalid_input_warning_message_upperalphanumeric", fileName,
                "Invalid input! please enter alphas and/or numbers.");
        insertTranslatableFileString(
            this.language,
            className + "||" + "document_delete_warning_message",
            fileName,
                "This action will delete the reference to the version of this document stored on the server.  Only the archived versions will remain on the server.  Do you wish to continue?");
        insertTranslatableFileString(this.language, className + "||" + "sun", fileName, "Sun");
        insertTranslatableFileString(this.language, className + "||" + "mon", fileName, "Mon");
        insertTranslatableFileString(this.language, className + "||" + "tue", fileName, "Tue");
        insertTranslatableFileString(this.language, className + "||" + "wed", fileName, "Wed");
        insertTranslatableFileString(this.language, className + "||" + "thur", fileName, "Thur");
        insertTranslatableFileString(this.language, className + "||" + "fri", fileName, "Fri");
        insertTranslatableFileString(this.language, className + "||" + "sat", fileName, "Sat");
        insertTranslatableFileString(this.language, className + "||" + "today", fileName, "Today");
        insertTranslatableFileString(this.language, className + "||" + "close", fileName, "Close");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_numeric_decimal1", fileName,
                "Please enter a numeric value with at most");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_numeric_decimal2", fileName, "decimals");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_too_small_integer", fileName,
                "Too small input! Please enter an integer larger than");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_too_large_integer", fileName,
                "Too large input! Please enter an integer less than");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_too_small_numeric", fileName,
                "Too small input! Please enter a numeric value larger than");
        insertTranslatableFileString(this.language, className + "||"
                + "field_validation_warning_message_too_large_numeric", fileName,
                "Too large input! Please enter a numeric value less than");
    }

    /**
     * add SmartClient preference dialog strings
     *
     * @return
     */
    private void addSCPreferenceStrings() {
        final String fileName = "com.archibus.service.remoting.SecurityServiceImpl";
        insertTranslatableFileString(this.language, "1", fileName, "Arabic (Saudi Arabia)");
        insertTranslatableFileString(this.language, "2", fileName, "Chinese (China)");
        insertTranslatableFileString(this.language, "3", fileName, "Chinese (Taiwan)");
        insertTranslatableFileString(this.language, "4", fileName, "Dutch");
        insertTranslatableFileString(this.language, "5", fileName, "Dutch (Netherlands)");
        insertTranslatableFileString(this.language, "6", fileName, "English (Australia)");
        insertTranslatableFileString(this.language, "7", fileName, "English (Canada)");
        insertTranslatableFileString(this.language, "8", fileName, "English (United Kingdom)");
        insertTranslatableFileString(this.language, "9", fileName, "English (United States)");
        insertTranslatableFileString(this.language, "10", fileName, "French (Canada)");
        insertTranslatableFileString(this.language, "11", fileName, "French (France)");
        insertTranslatableFileString(this.language, "12", fileName, "German");
        insertTranslatableFileString(this.language, "13", fileName, "German (Germany)");
        insertTranslatableFileString(this.language, "14", fileName, "Hebrew (Israel)");
        insertTranslatableFileString(this.language, "15", fileName, "Italian");
        insertTranslatableFileString(this.language, "16", fileName, "Italian (Italy)");
        insertTranslatableFileString(this.language, "17", fileName, "Japanese (Japan)");
        insertTranslatableFileString(this.language, "18", fileName, "Korean (South Korea)");
        insertTranslatableFileString(this.language, "19", fileName, "Norwegian (Norway)");
        insertTranslatableFileString(this.language, "20", fileName, "Portuguese (Brazil)");
        insertTranslatableFileString(this.language, "21", fileName, "Spanish");
        insertTranslatableFileString(this.language, "22", fileName, "Spanish (Spain)");
        insertTranslatableFileString(this.language, "23", fileName, "Estonian");
        insertTranslatableFileString(this.language, "24", fileName, "Estonian (Estonia)");
        for (int i = 0; i < LocalizationBase.locales.size(); i++) {
            final LocaleConfig localeConfig = LocalizationBase.locales.get(i);
            final String localeConfigLanguage = localeConfig.getTitle();
            insertTranslatableFileString(this.language, "" + (25 + i) + "", fileName,
                localeConfigLanguage);
        }
    }

    /**
     * Reads in contents of file with given path as an input stream.
     *
     * @param srcFilePath
     * @throws IOException
     */
    private void parseJavaFile(final String srcFilePath) throws IOException {
        // Create a file object from the src & target file name
        final File fin = new File(srcFilePath);

        // Open an input and output stream
        final FileInputStream fis = new FileInputStream(fin);

        // Create a buffered reader & writer
        final BufferedReader in = new BufferedReader(new InputStreamReader(fis));

        try {
            searchForJavaStrings(in, srcFilePath);
        } catch (final Exception e) {
            handleException(e);
        } finally {
            in.close();
        }
    }

    /**
     * Reads in contents of file with given path as an input stream
     *
     * @param srcFilePath String file path
     * @throws IOException
     */
    private void parseJsFile(final String srcFilePath) throws IOException {
        // Create a file object from the src & target file name
        final File fin = new File(srcFilePath);
        // Open an input and output stream
        final FileInputStream fis = new FileInputStream(fin);
        // Create a buffered reader & writer
        final BufferedReader in = new BufferedReader(new InputStreamReader(fis));
        final String fileName = srcFilePath.substring(srcFilePath.lastIndexOf(PATH_SEPARATOR) + 1);

        try {
            searchForClassNameOrClasslessTransBlock(in, "", fileName);
        } catch (final Exception e) {
            handleException(e);
        } finally {
            in.close();
        }
    }

    /**
     * Reads in contents of file with given path as an input stream.
     *
     * @param srcFilePath
     * @throws IOException
     */
    private void parseMnuFile(final String srcFilePath) throws IOException {
        // Create a file object from the src & target file name
        final File fin = new File(srcFilePath);

        // Open an input and output stream
        final FileInputStream fis = new FileInputStream(fin);

        // Create a buffered reader & writer
        final BufferedReader in = new BufferedReader(new InputStreamReader(fis));

        try {
            searchForMnuStrings(in, srcFilePath);
        } catch (final Exception e) {
            handleException(e);
        } finally {
            in.close();
        }
    }

    /**
     * Process 2.0 views, where <ab:tooltip>, <ab:message>, <ab:title>, and <ab:instructions> tags
     * are translatable by default, unless explicitly set to translatable="false". All other tags
     * will need translatable="true".
     *
     * @param root
     */
    private Document preProcessJspFile(String fileContents) {
        // get starting index
        final Integer startIndex = fileContents.indexOf("<ab:view");

        // remove everything before starting index
        fileContents = fileContents.substring(startIndex);

        // remove everything after ending index
        final Integer endIndex = fileContents.indexOf("</ab:view>");
        fileContents = fileContents.substring(0, endIndex + 10);

        // remove namespace
        fileContents = fileContents.trim();
        fileContents = fileContents.replaceAll("<ab:", "<");
        fileContents = fileContents.replaceAll("</ab:", "</");
        fileContents = fileContents.replaceAll("<ex:", "<");
        fileContents = fileContents.replaceAll("</ex:", "</");

        final Document doc = LocalizationHelper.convertXMLStringToDocument(fileContents);

        return doc;
    }

    /**
     * process a JavaScript class that started with Ab.namespace.className = someOtherClass.extend
     * ({ now that we've just eaten that line
     *
     * @param in
     * @param className
     * @throws IOException
     * @throws IOException
     */
    private void processJavaScriptClass(final BufferedReader in, final String className,
            final String fileName) throws IOException {
        final Matcher matchJsStartClassElement = patternJsStartClassElement.matcher("");
        final Matcher matchJsStartTranslatable = patternJsStartTranslatable.matcher("");
        String aLine = null;

        // search for start of translatable block within
        while ((aLine = in.readLine()) != null) {
            matchJsStartClassElement.reset(aLine);
            matchJsStartTranslatable.reset(aLine);
            if (matchJsStartTranslatable.find()) {
                processTranslatableBlock(in, className, fileName);
            } else if (matchJsStartClassElement.find()) {
                final String jsClassName =
                        matchJsStartClassElement.group(2) + matchJsStartClassElement.group(3)
                        + matchJsStartClassElement.group(4);
                processJavaScriptClass(in, jsClassName, fileName);
            }
        }
    }

    /**
     * Process legacy views where all translatable tags will be marked with translatable="true".
     *
     * @param root
     */
    private void processLegacyView(final Element root, final String filename) {
        @SuppressWarnings("unchecked")
        final List<Element> translatableTrueElements =
        root.selectNodes("//*[@translatable='true']");
        final Iterator<Element> elementIterator = translatableTrueElements.iterator();
        while (elementIterator.hasNext()) {
            final Element element = elementIterator.next();
            final String nodeName = element.getName();
            final String string_english = element.getText();
            insertTranslatableFileString(this.language, nodeName + "||" + string_english,
                filename.replace("\\", PATH_SEPARATOR), string_english);
        }
    }

    /**
     * process one set of localizable strings now that we've just eaten the start line //@begin_translatable
     *
     * @param in
     * @param className
     * @throws IOException
     */
    private void processTranslatableBlock(final BufferedReader in, String className,
            final String fileName) throws IOException {
        final Matcher matchJsEndTranslatable = patternJsEndTranslatable.matcher("");
        final Matcher matcherEqualWithinQuote = patternEqualWithinQuote.matcher("");
        String aLine = null;

        // default to file using [static constant] data member notation (i.e., variableName:
        // variableValue[,])
        String separator = ":";
        String terminator = ",";
        final String namespaceDelimitor = ".";

        while ((aLine = in.readLine()) != null) {
            matchJsEndTranslatable.reset(aLine);
            if (matchJsEndTranslatable.find()) {
                // go back to looking for className
                searchForClassNameOrClasslessTransBlock(in, className, fileName);
            } else {
                // ignore blank lines
                if (aLine.trim().length() == 0) {
                    continue;
                }
                // file may use variable notation (i.e., [var] [class]variableName = variableValue;)
                if (aLine.indexOf('=') > -1) {
                    matcherEqualWithinQuote.reset(aLine);

                    // if equal sign is within translatable string, this is not a variable notation
                    if (!matcherEqualWithinQuote.find()) {
                        separator = "=";
                        terminator = ";";
                    }
                }

                String nm = aLine.substring(0, aLine.indexOf(separator)).trim();
                if (nm.indexOf(namespaceDelimitor) != -1) {
                    className = nm.substring(0, nm.lastIndexOf(namespaceDelimitor));
                    nm = nm.substring(nm.lastIndexOf(namespaceDelimitor) + 1);
                } else if (nm.indexOf("var ") != -1) {
                    nm = nm.substring(nm.indexOf("var ") + 4);
                }

                String val = aLine.substring(aLine.indexOf(separator) + 1).trim();
                if (val.endsWith(terminator)) {
                    val = val.substring(0, val.length() - 1);
                }
                // remove quotes from WITHIN string
                val = LocalizationHelper.unQuote(val);

                insertTranslatableFileString(this.language, className + "||" + val, fileName, val);
            }
        }
    }

    /**
     * Process 2.0 views, where <tooltip>, <message>, <title>, and <instructions> tags are
     * translatable by default, unless explicitly set to translatable="false". All other tags will
     * be translatable="true".
     *
     * @param root
     */
    private void processView(final Element root, final String filename) {
        @SuppressWarnings("unchecked")
        final List<Element> allElements = root.selectNodes("//*");

        final Iterator<Element> elementIterator = allElements.iterator();

        if (filename.endsWith(".xml")) {
            while (elementIterator.hasNext()) {
                final Element element = elementIterator.next();
                if (!"process".equals(element.attributeValue("type"))) {
                    processElementByAttribute("title", element, filename);
                    processElementByAttribute("tooltip", element, filename);
                    processElementByAttribute("subtitle", element, filename);
                }
            }
        } else {
            while (elementIterator.hasNext()) {
                final Element element = elementIterator.next();
                final String nodeName = element.getName();
                final String translatable = element.attributeValue("translatable");
                final String string_english = element.getText();

                if (("true".equals(translatable))
                        || ((nodeName.equals("title") || nodeName.equals("message")
                                || nodeName.equals("tooltip") || nodeName.equals("instructions") || nodeName
                                .equals("option")) && !("false".equals(translatable)))) {
                    insertTranslatableFileString(this.language,
                        nodeName + "||" + string_english.trim(),
                        filename.replace("\\", PATH_SEPARATOR), string_english.trim());
                }
            }
        }
    }

    /**
     * Process Page Navigation .xml files, looking for title="", tooltip="", or subtitle=""
     *
     * @param attribute String. Possible values are "title", "tooltip", or "subtitle"
     * @param element Element
     * @param filename String Name of xml
     */
    private void processElementByAttribute(final String attribute, final Element element,
            final String filename) {
        final String string_english = element.attributeValue(attribute);
        if (string_english != null) {
            insertTranslatableFileString(this.language, attribute + "||" + string_english,
                filename.replace("\\", PATH_SEPARATOR), string_english);
        }
    }

    /**
     * Reads in all translatable strings from list of *.axvw, *.xsl, *.jsp files to lang_files.
     */
    private void readAxvwXslJsp() {
        this.status.setMessage("AXVW/XSL/JSP Files");

        // parse axvw, xsl, jsp files
        for (final Object element : this.axvwXslJspFiles) {
            this.status.incrementCurrentNumber();

            // path to JavaScript file with translatable strings
            final String axvwXslJspFilePath = (String) element;
            try {
                searchForAxvwXslJspXmlStrings(axvwXslJspFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all translatable strings from list of *.axvw, *.xsl, *.jsp files to lang_files.
     */
    private void readPageNav() {
        this.status.setMessage("Page Navigation Files");

        // parse axvw, xsl, jsp files
        for (final Object element : this.pageNavFiles) {
            this.status.incrementCurrentNumber();

            // path to JavaScript file with translatable strings
            final String pageNavFilePath = (String) element;
            try {
                searchForAxvwXslJspXmlStrings(pageNavFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all translatable strings from list of *.java files to lang_files.
     */
    private void readJAVA() {
        this.status.setMessage("JAVA Files");

        for (final Object element : this.javaFiles) {
            this.status.incrementCurrentNumber();

            // path to Java file with translatable strings
            final String javaFilePath = (String) element;
            try {
                parseJavaFile(javaFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all translatable strings from list of *.js files into lang_files.
     */
    private void readJS() {
        this.status.setMessage("JS Files");

        for (final Object element : this.jsFiles) {
            this.status.incrementCurrentNumber();

            // path to JavaScript file with translatable strings
            final String filePath = (String) element;
            try {
                parseJsFile(filePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all *.mnu files into lang_files.
     */
    private void readMNU() {
        this.status.setMessage("MNU Files");

        for (final Object element : this.mnuFiles) {

            // path to mnu file with translatable strings
            final String mnuFilePath = (String) element;
            try {
                parseMnuFile(mnuFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all *.resx files into lang_files.
     */
    private void readRESX() {
        this.status.setMessage("RESX Files");

        for (final Object element : this.resxFiles) {
            this.status.incrementCurrentNumber();

            // path to resx file with translatable strings
            final String resxFilePath = (String) element;
            try {
                searchForResxStrings(resxFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Reads in all mobile files into lang_files.
     */
    private void readMobile() {
        this.status.setMessage("Mobile Files");

        for (final Object element : this.mobileFiles) {

            // path to mnu file with translatable strings
            final String mobileFilePath = (String) element;
            try {
                parseMobileFile(mobileFilePath);
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }

        readMobileBootstrapStrings();
    }

    /**
     * Reads in bootstrap strings for mobile. These strings are for the AppLauncher, and are
     * separate from WebC files.
     */
    private void readMobileBootstrapStrings() {
        final String packageName = "BootStrapper.controller.Main";
        final String filePath = "/ab-products/common/mobile/src/BootStrapper/controller/Main.js";

        insertTranslatableFileString(this.language, packageName + "||" + "Server Unreachable",
            filePath, "Server Unreachable");
        insertTranslatableFileString(this.language, packageName + "||"
                + "Web Central URL is required", filePath, "Web Central URL is required");
        insertTranslatableFileString(this.language, packageName + "||"
                + "Web Central URL must begin with http", filePath,
                "Web Central URL must begin with http");
        insertTranslatableFileString(
            this.language,
            packageName
            + "||"
            + "Unable to connect to the server at: <br>{0}<br>The server may be unavailable. Check the URL and try again.",
            filePath,
                "Unable to connect to the server at: <br>{0}<br>The server may be unavailable. Check the URL and try again.");
        insertTranslatableFileString(this.language, packageName + "||" + "Input Error", filePath,
                "Input Error");
        insertTranslatableFileString(this.language, packageName + "||"
                + "ARCHIBUS Mobile Client Registration", filePath,
                "ARCHIBUS Mobile Client Registration");
        insertTranslatableFileString(this.language, packageName + "||" + "Web Central URL",
            filePath, "Web Central URL");
        insertTranslatableFileString(this.language, packageName + "||" + "Connect", filePath,
                "Connect");
    }

    /**
     * parseMobileFile.
     *
     * @param filePath
     * @return
     */
    private String parseMobileFile(final String filePath) {

        final String fileName = filePath.substring(filePath.lastIndexOf(PATH_SEPARATOR) + 1);

        String contents = "";
        try {
            contents = LocalizationHelper.readFileAsString(filePath);
        } catch (final FileNotFoundException e) {
            e.printStackTrace();
        } catch (final IOException e) {
            e.printStackTrace();
        }

        String strPattern =
                ("control_en.js".equals(fileName)) ? "(\\{key1: [\"|']{1}(.*?)[\"|']{1}, key2: [\"|']{1}(.*?)[\"|']{1}, value: [\"|']{1}.*?[\"|']{1})\\}"
                        : "(LocaleManager.getLocalizedString[(]{1}[\\n\\r\\s]*'(.*?)',[\\n\\r\\s]*[\"|']{1}(.*?)[\"|']{1})";
        parseMobileFileWithPattern(strPattern, contents, filePath, fileName);

        // go back and match double quotes
        if (!"control_en.js".equals(fileName)) {
            strPattern =
                    "(LocaleManager.getLocalizedString[(]{1}[\\n\\r\\s]*\"(.*?)\",[\\n\\r\\s]*[\"|']{1}(.*?)[\"|']{1})";
            parseMobileFileWithPattern(strPattern, contents, filePath, fileName);
        }

        return contents;
    }

    /**
     *
     * parseMobileFileWithPattern.
     *
     * @param strPattern
     * @param contents
     * @param filePath
     * @param fileName
     */
    private void parseMobileFileWithPattern(final String strPattern, final String contents,
            final String filePath, final String fileName) {

        final Pattern pattern = Pattern.compile(strPattern);
        final Matcher matcher = pattern.matcher(strPattern);
        final String absoluteFilePath = filePath.replace(SCHEMA_ABSOLUTE_PATH, "");

        matcher.reset(contents);
        while (matcher.find()) {
            final String string_english =
                    ("control_en.js".equals(fileName)) ? matcher.group(3) : matcher.group(2);
            final String packageName =
                    ("control_en.js".equals(fileName)) ? matcher.group(2) : matcher.group(3);
            insertTranslatableFileString(this.language, packageName + "||" + string_english,
                absoluteFilePath, string_english);
        }
    }

    /**
     * Walk the DOM to extract translatable strings from *.axvw files.
     *
     * @param srcFilePath
     * @throws IOException
     */
    private void searchForAxvwXslJspXmlStrings(final String srcFilePath) throws IOException {
        try {
            final String filePath = srcFilePath.replace(LocalizationBase.SCHEMA_ABSOLUTE_PATH, "");
            Document doc = null;

            if (srcFilePath.endsWith("jsp")) {
                final String fileContents = FileUtil.readFile(srcFilePath);
                doc = preProcessJspFile(fileContents);
            } else {
                doc = LocalizationHelper.readFile(srcFilePath);
            }

            final Element root = doc.getRootElement();
            final Boolean legacyView =
                    (((root.selectNodes("//view[@version='2.0']").size() == 0) || (srcFilePath
                            .endsWith("xsl"))) && (!srcFilePath.endsWith("jsp") && !srcFilePath
                                    .endsWith(".xml")));
            if (legacyView) {
                processLegacyView(root, filePath);
            } else {
                // extractDialogTitles(root, filePath);
                processView(root, filePath);
            }
        } catch (final Exception e) {
            handleException(e);
        }
    }

    /**
     * iterate through the lines of the JavaScript file looking for the start of a class or a
     * translatable block
     *
     * @param in
     * @param fileName
     * @throws IOException
     */
    private void searchForClassNameOrClasslessTransBlock(final BufferedReader in,
            final String jsClass, final String fileName) throws IOException {
        final Matcher matchJsStartClassElement = patternJsStartClassElement.matcher("");
        final Matcher matchStartTranslatable = patternJsStartTranslatable.matcher("");
        String aLine = null;

        while ((aLine = in.readLine()) != null) {
            matchJsStartClassElement.reset(aLine);
            matchStartTranslatable.reset(aLine);
            if (matchJsStartClassElement.find()) {
                // get JavaScript className
                final String elem2 = matchJsStartClassElement.group(2);
                final String elem3 = matchJsStartClassElement.group(3);
                final String elem4 = matchJsStartClassElement.group(4);
                final String jsClassName = elem2 + elem3 + elem4;
                processJavaScriptClass(in, jsClassName, fileName);
            } else if (matchStartTranslatable.find()) {
                // get isolated (classless) Translatable strings
                processTranslatableBlock(in, fileName, fileName);
            }
        }
    }

    /**
     * Process contents of java file, line by line. Extracts translatable strings and inserts into
     * database.
     *
     * @param in BufferedRead input stream of file contents
     * @param srcFilePath String file path
     * @throws IOException
     */
    private void searchForJavaStrings(final BufferedReader in, final String srcFilePath)
            throws IOException {

        // find package name
        final int startIndex = srcFilePath.indexOf("com/archibus");
        String packageName = srcFilePath.substring(startIndex).replace(PATH_SEPARATOR, ".");
        packageName = packageName.replace(".java", "");

        final Matcher matchJavaStartTranslatable = patternJavaStartTranslatable.matcher("");
        final Matcher matchJavaTranslatableString = patternJavaTranslatableString.matcher("");

        String aLine = null;
        int constant = 0;

        while ((aLine = in.readLine()) != null) {
            matchJavaStartTranslatable.reset(aLine);
            if (matchJavaStartTranslatable.find()) {

                // search for content between double-quotes; concatenate lines if necessary
                String translatableBlock = aLine + in.readLine();
                matchJavaTranslatableString.reset(translatableBlock);
                while (!matchJavaTranslatableString.find() && !translatableBlock.contains(";")) {
                    translatableBlock += in.readLine();
                }

                // extract translatable string and insert into db
                matchJavaTranslatableString.reset(translatableBlock);
                if (matchJavaTranslatableString.find()) {
                    final String string_english = matchJavaTranslatableString.group(1);
                    constant += 1;
                    insertTranslatableFileString(this.language, Integer.toString(constant),
                        packageName, string_english);
                }
            }
        }
    }

    /**
     * Process contents of mnu file, line by line. Extracts translatable strings and inserts into
     * database TODO: Refactor
     *
     * @param in BufferedRead input stream of file contents
     * @param srcFilePath String file path
     * @throws IOException
     */
    private void searchForMnuStrings(final BufferedReader in, final String srcFilePath)
            throws IOException {

        final String fileName = srcFilePath.substring(srcFilePath.lastIndexOf(PATH_SEPARATOR) + 1);

        // regex pattern for matching start of translatable tag
        final String MNU_START_TRANSLATABLE_PATTERN = "(\\[)";
        final Pattern patternMnuStartTranslatable = Pattern.compile(MNU_START_TRANSLATABLE_PATTERN);

        // regex pattern for matching translatable java string
        final Pattern patternStringWithinDoubleQuotes = Pattern.compile(DOUBLE_QUOTES_PATTERN);

        final Matcher matchMnuStartTranslatable = patternMnuStartTranslatable.matcher("");
        final Matcher matchStringWithinDoubleQuotes = patternStringWithinDoubleQuotes.matcher("");

        String aLine = null;
        while ((aLine = in.readLine()) != null) {
            matchMnuStartTranslatable.reset(aLine);
            if (matchMnuStartTranslatable.find()) {

                // search for content between brackets; concatenate lines if necessary
                String translatableBlock = aLine.substring(matchMnuStartTranslatable.start());
                matchMnuStartTranslatable.reset(translatableBlock);

                if (!matchMnuStartTranslatable.find() && !translatableBlock.contains("]")) {
                    translatableBlock += in.readLine();
                }

                translatableBlock =
                        translatableBlock.substring(0, translatableBlock.lastIndexOf("]") + 1);

                String string_english =
                        translatableBlock.substring(1, translatableBlock.length() - 1);
                if (translatableBlock.startsWith("[_Toolbar")
                        || translatableBlock.startsWith("[_Button")
                        || translatableBlock.startsWith("[_Flyout")) {
                    // extract translatable string and insert into db
                    matchStringWithinDoubleQuotes.reset(translatableBlock);
                    if (matchStringWithinDoubleQuotes.find()) {
                        string_english = matchStringWithinDoubleQuotes.group(1);
                        insertTranslatableFileString(this.language, string_english, fileName,
                            string_english);
                    }
                } else {
                    insertTranslatableFileString(this.language, string_english, fileName,
                        string_english);
                }
            }
        }
    }

    /**
     * Walk the DOM to extract translatable strings from *.resx files.
     *
     * @param srcFilePath
     * @throws IOException
     */
    private void searchForResxStrings(final String srcFilePath) throws IOException {
        try {
            final Document resxFileDocument = LocalizationHelper.readFile(srcFilePath);
            final Element resxElementRoot = resxFileDocument.getRootElement();
            final Boolean isForm = resxElementRoot.selectNodes("//assembly").size() > 0;
            final String fileName =
                    srcFilePath.substring(srcFilePath.lastIndexOf(PATH_SEPARATOR) + 1);

            // loop through list of data elements
            for (@SuppressWarnings("unchecked")
            final Iterator<Element> i = resxElementRoot.elementIterator("data"); i.hasNext();) {
                final Element dataElement = i.next();
                final Element valueElement = dataElement.element("value");
                final Boolean bXmlSpace = "preserve".equals(dataElement.attributeValue("space"));

                // check that the data has xml:space="preserve" and a value childnode
                if (bXmlSpace && valueElement != null) {
                    final String dataName = dataElement.attributeValue("name");

                    // 3053930
                    final Boolean bPropertyItem =
                            bXmlSpace && dataName.contains(".Properties.Items");

                    // for forms, further filter out data nodes whose name do not end with .Text;
                    // for regular, use all
                    if ((isForm && (dataName.endsWith(".Text") || dataName.endsWith(".Caption")
                            || dataName.endsWith(".Hint") || dataName.endsWith(".ToolTipText") || dataName
                            .endsWith(".Description"))) || (!isForm) || bPropertyItem) {
                        insertTranslatableFileString(this.language, fileName + "||" + dataName,
                            fileName, valueElement.getText());
                    }
                }
            }
        } catch (final Exception e) {
            handleException(e);
        }
    }
}