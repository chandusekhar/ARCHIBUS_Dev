package com.archibus.app.solution.localization;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.RestrictionSqlBase;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.common.FileHelper;
import com.archibus.ext.importexport.exporter.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.ExceptionBase;

/**
 * Handles importing and exporting jobs used in Localization Activity.
 *
 */
public class LocalizationImportExport extends LocalizationBase {

    /**
     * Job that exports localization table strings (lang_files, lang_enum, lang_strings) to a
     * spreadsheet based on the language, strings to include, and file format. Calls exportTable.
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param stringsToInclude ""|"needTrans" (all strings or only strings that need translation)
     * @param format "csv"|"xls" the file format for the excel file
     * @param dbExtension String dbExtension
     */
    public void exportExtractFiles(final String language, final String stringsToInclude,
            final String format, final String dbExtension) {

        // create restrictions for each localization table
        final String langRest = "language = '" + language + "'";
        String enumRest = langRest;
        String stringRest = langRest;
        String fileRest = langRest;
        String dtPaths = "";

        // add restriction depending if export only strings that need translation was selected
        if ("needTrans".equals(stringsToInclude)) {
            enumRest += " AND enum_trans IS NULL";
            stringRest += " AND string_trans IS NULL";
            fileRest += " AND string_trans IS NULL";
        }

        // export lang_enum
        this.status.setMessage("Enum Table");
        String panelFields =
                "[{name:'lang_enum.language'}, {name:'lang_enum.string_english'},{name:'lang_enum.enum_trans'}, {name:'lang_enum.date_last_updated'}, {name:'lang_enum.reference_info'}]";
        dtPaths +=
                exportTable("ab-localization-edit-lang-enum.axvw",
                    "abLocalizationEditLangEnum_ds_0", panelFields, "Language Enum Table",
                    "lang_enum", dbExtension + "_lang_enum", format, enumRest);
        dtPaths += "</br>";

        // export lang_strings
        this.status.setMessage("Strings Table");
        panelFields =
                "[{name:'lang_string.language'}, {name:'lang_strings.string_english'},{name:'lang_strings.string_trans'}, {name:'lang_strings.date_last_updated'}, {name:'lang_strings.reference_info'}]";
        dtPaths +=
                exportTable("ab-localization-edit-lang-strings.axvw",
                    "abLocalizationEditLangStrings_ds_0", panelFields, "Language Strings Table",
                    "lang_strings", dbExtension + "_lang_strings", format, stringRest);
        dtPaths += "</br>";

        // export lang_files
        this.status.setMessage("Files Table");
        panelFields =
                "[{name:'lang_files.language'}, {name:'lang_files.string_english'},{name:'lang_files.string_trans'}, {name:'lang_files.date_last_updated'}, {name:'lang_files.reference_info'}]";
        dtPaths +=
                exportTable("ab-localization-edit-lang-files.axvw",
                    "abLocalizationEditLangFiles_ds_0", panelFields, "Language Files Table",
                    "lang_files", dbExtension + "_lang_files", format, fileRest);

        // provide links
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.addProperty("dtPath", dtPaths);
        }
    }

    /**
     * Job that exports glossary strings to a spreadsheet based on the language, strings to include,
     * and file format. Calls exportTable().
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param stringsToInclude ""|"needTrans" (all strings or only strings that need translation)
     * @param format "csv"|"xls" the file format for the excel file
     * @param dbExtension String db extension
     */
    public void exportGlossaryFiles(final String language, final String stringsToInclude,
            final String format, final String dbExtension) {

        // create restriction
        String restriction = "language = '" + language + "'";
        if ("needTrans".equals(stringsToInclude)) {
            restriction += " AND string_trans IS NULL";
        }

        // export lang_glossary
        final String panelFields =
                "[{name:'lang_glossary.language'}, {name:'lang_glossary.string_english'},{name:'lang_glossary.string_trans'}, {name:'lang_glossary.string_type'}]";
        final String dtPath =
                exportTable("ab-localization-grid-lang-glos.axvw",
                    "abLocalizationGridLangGlos_ds_0", panelFields, "Language Glossary Table",
                    "lang_glossary", dbExtension + "_lang_glossary", format, restriction);

        // provide links
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.addProperty("dtPath", dtPath);
        }
    }

    /**
     * Common function that calls Data Transfer API to export file and returns the resulting .csv or
     * .xls file path in as an html link.
     *
     * @param viewFile String Name of the *.axvw
     * @param ds String Datasource in viewFile
     * @param panelFields String List of fields to include in export
     * @param title String Title for the export file
     * @param table String Name of the database table
     * @param fileName String Name of the *.xls|*.csv
     * @param format String "csv"|"xls" the file format for the excel file
     * @param restriction String Restriction on records exports
     * @return None
     */
    private String exportTable(final String viewFile, final String ds, final String panelFields,
            final String title, final String table, final String fileName, final String format,
            final String restriction) {

        try {
            final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(viewFile, ds);
            dataSource.setContext();
            dataSource.setMaxRecords(0);

            // retrieve a list of field names to transfer out.
            final List<Map<String, String>> panelFieldsList =
                    DataTransferUtility.getPanelFeldsList(dataSource);
            final List<String> visibleFieldsFromMainTable =
                    DataTransferUtility.getVisibleFieldsFromMainTable(dataSource, panelFieldsList);

            final DatabaseExporter DatabaseExporter =
                    (DatabaseExporter) ContextStore.get().getBean(
                        DatabaseExporterImpl.DATABASEEXPORTOR_BEAN);

            // set the manager's job status to current job
            DatabaseExporter.setJobStatus(this.status);

            // set the job's total number based on the
            final List<DataRecord> records = dataSource.getRecords(restriction);
            DatabaseExporter.getJobStatus().setTotalNumber(records.size());

            // initial the job title and file name etc.
            final String validatedFileName =
                    DataTransferUtility.getValidFileName(format, fileName, table);

            DatabaseExporter.onInitJobStatus(title, validatedFileName,
                FileHelper.getFileURL(validatedFileName, ""));

            // we need to set the data source since the data source contains restrictions that
            // needed to be passed into transfered manager.
            DatabaseExporter.setDataSourceRestrictions(dataSource.getRestrictions());

            // retrieve the default file path
            final String filePath = FileHelper.getDefaultStorePath("") + validatedFileName;

            final List<RestrictionSqlBase.Immutable> restrictions =
                    dataSource.parseClientRestrictions(restriction);

            DatabaseExporter.setDocPath(filePath);

            // transfer out.
            DatabaseExporter.exportData(filePath, table, visibleFieldsFromMainTable, restrictions,
                title, true);

            return LocalizationHelper.createLink(FileHelper.getFileURL(validatedFileName, ""));

        } catch (final Exception e) {
            // @non-translatable
            throw new ExceptionBase(String.format("Fail to tansfer data with view name [%s]",
                viewFile), e);
        }
    }
}