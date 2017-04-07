package com.archibus.eventhandler.AssetDepreciation;

import java.io.File;
import java.util.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;

/**
 * Generate four level paginated report:
 *
 * <pre>
 * <li>building</li>
 * <li>floor</li>
 * <li>room</li>
 * <li>furniture standard</li>
 * </pre>
 *
 * .
 *
 * @author Ana Paduraru
 *
 */
public class AssetPaginatedReportGenerator extends JobBase {
    /**
     * bl dataSource name.
     */
    private static final String BL_DS = "ds_abApFnstdByRm_bl";

    /**
     * build id column name.
     */
    private static final String BL_ID = "bl_id";

    /**
     * bl table name.
     */
    private static final String BL_TABLE = "bl";

    /**
     * export document extension: DOCX.
     */
    private static final String DOC_EXTENSION = ".docx";

    /**
     * report file name.
     */
    private static final String FINAL_FILE_NAME = "ab-ap-fnstd-by-rm-prnt-report";

    /**
     * fl dataSource name.
     */
    private static final String FL_DS = "ds_abApFnstdByRm_fl";

    /**
     * floor id column name.
     */
    private static final String FL_ID = "fl_id";

    /**
     * fl table name.
     */
    private static final String FL_TABLE = "fl";

    /**
     * type of file furniture.
     */
    private static final String FURNITURE_TYPE = "furniture";

    /**
     * type of file: location.
     */
    private static final String LOCATION_TYPE = "location";

    /**
     * number of steps: create intermediate files, merge intermediate files, delete intermediate
     * files.
     */
    private static final int NUMBER_OF_STEPS = 3;

    /**
     * partial file name for furniture.
     */
    private static final String PARTIAL_FILE_NAME_FURNITURE = "ab-ap-fnstd-by-rm-prnt-fn";

    /**
     * partial file name for buildings, floors and rooms.
     */
    private static final String PARTIAL_FILE_NAME_LOCATION = "ab-ap-fnstd-by-rm-prnt";

    /**
     * rm dataSource name.
     */
    private static final String RM_DS = "ds_abApFnstdByRm_rm";

    /**
     * room id column name.
     */
    private static final String RM_ID = "rm_id";

    /**
     * rm table name.
     */
    private static final String RM_TABLE = "rm";

    /**
     * source file name.
     */
    private static final String SOURCE_FILE_NAME = "ab-ap-fnstd-by-rm.axvw";

    /**
     * source file name.
     */
    private static final String UNDERLINE = "_";

    /**
     * view file extension: AXVW.
     */
    private static final String VIEW_FILE_EXTENSION = ".axvw";

    /**
     * building id.
     */
    private final String blId;

    /**
     * List with partial report files.
     */
    private List<String> files;

    /**
     * report final name and path.
     */
    private String finalFileFullname;

    /**
     * floor id.
     */
    private final String flId;

    /**
     * room id.
     */
    private final String rmId;

    /**
     * view title and report title.
     */
    private final String viewTitle;

    /**
     * Initialize blId, flId and rmId.
     *
     * @param blId building id
     * @param flId floor id
     * @param rmId room id
     * @param viewTitle view title
     */
    public AssetPaginatedReportGenerator(final String blId, final String flId, final String rmId,
            final String viewTitle) {
        super();
        this.blId = blId;
        this.flId = flId;
        this.rmId = rmId;
        this.viewTitle = viewTitle;
    }

    /**
     * Overrides com.archibus.jobmanager.JobBase.run method. Creates a docx report by merging
     * partial files and set it as result on job status.
     */
    @Override
    public void run() {
        // builder
        final PaginatedReportsBuilder builder = new PaginatedReportsBuilder();
        this.files = new ArrayList<String>();
        final Context context = ContextStore.get();

        this.status.setTotalNumber(NUMBER_OF_STEPS);

        final String dateString = getCurrentDate();

        obtainIntermediateFiles(builder, context, dateString);

        this.status.setCurrentNumber(1);

        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
            if (!this.files.isEmpty()) {
                this.status.setCurrentNumber(2);
                // delete intermediate files
                deletePartialFiles();
                this.status.setCurrentNumber(NUMBER_OF_STEPS);
            }
        } else {
            if (!this.files.isEmpty()) {
                // merging files into one file
                final String mainFileName = FINAL_FILE_NAME + "-" + dateString + DOC_EXTENSION;
                this.finalFileFullname =
                        ReportUtility.getReportFilesStorePath(context) + mainFileName;
                ReportUtility.appendDocxFiles(this.files, this.finalFileFullname);
                this.status.setCurrentNumber(2);
                // delete intermediate files
                deletePartialFiles();

                this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore
                    .get().getEventHandlerContext(), this.viewTitle, this.getClass().getName()),
                    mainFileName, context.getContextPath()
                    + ReportUtility.getPerUserReportFilesPath(context) + mainFileName));

                this.status.setCurrentNumber(NUMBER_OF_STEPS);
            }

            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    /**
     * Returns a parameters map object using the current iteration values of bl_id, fl_id and rm_id.
     *
     * @param currentBlId current bl_id
     * @param currentFlId current fl_id
     * @param currentRmId current rm_id.
     * @return parameters map object
     */
    Map<String, Object> getCurrentMoParameters(final String currentBlId, final String currentFlId,
        final String currentRmId) {
        final Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put("blId", currentBlId);
        parameters.put("flId", currentFlId);
        parameters.put("rmId", currentRmId);
        return parameters;
    }

    /**
     * Returns a restrictions map object using the current iteration values of bl_id, fl_id and
     * rm_id.
     *
     * @param currentBlId current bl_id
     * @param currentFlId current fl_id
     * @param currentRmId current rm_id.
     * @return restrictions map object
     */
    Map<String, Object> getCurrentMoRestriction(final String currentBlId, final String currentFlId,
        final String currentRmId) {
        final Map<String, Object> restriction = new HashMap<String, Object>();
        restriction.put(BL_DS, "bl.bl_id=" + SqlUtils.formatValueForSql(currentBlId));
        restriction.put(FL_DS, "fl.bl_id=" + SqlUtils.formatValueForSql(currentBlId)
            + " AND fl.fl_id=" + SqlUtils.formatValueForSql(currentFlId));
        restriction.put(RM_DS, "rm.bl_id=" + SqlUtils.formatValueForSql(currentBlId)
            + " AND rm.fl_id=" + SqlUtils.formatValueForSql(currentFlId) + " AND rm.rm_id="
            + SqlUtils.formatValueForSql(currentRmId));
        return restriction;
    }

    /**
     * Obtain data records iterator from specific data source.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1 (Best Practices): 'Statements with SELECT WHERE EXISTS ... pattern'
     * and the comments : 'The exception pattern "SELECT WHERE EXISTS" could be implemented with
     * DataSource by adding the EXISTS clause part as sql restriction' and 'Certainly there is noway
     * to avoid the subquery statement within EXISTS function.'
     *
     * @param type table type
     * @param blIdP current bl_id
     * @param flIdP current fl_id
     * @return data records iterator
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    Iterator<DataRecord> getIterator(final String type, final String blIdP, final String flIdP) {
        DataSource dataSource;
        List<DataRecord> records = null;
        if (BL_TABLE.equals(type)) {
            dataSource = DataSourceFactory.loadDataSourceFromFile(SOURCE_FILE_NAME, BL_DS);
            dataSource.addRestriction(Restrictions
                .sql("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = bl.bl_id)"));
            if (StringUtil.notNullOrEmpty(this.blId)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(BL_TABLE, BL_ID,
                    this.blId, Restrictions.OP_EQUALS));
            }
            records = dataSource.getRecords();
        } else if (FL_TABLE.equals(type)) {
            dataSource = DataSourceFactory.loadDataSourceFromFile(SOURCE_FILE_NAME, FL_DS);
            dataSource
            .addRestriction(Restrictions
                .sql("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = fl.bl_id AND fn.fl_id = fl.fl_id)"));
            if (StringUtil.notNullOrEmpty(blIdP)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(FL_TABLE, BL_ID,
                    blIdP, Restrictions.OP_EQUALS));
            }
            if (StringUtil.notNullOrEmpty(this.flId)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(FL_TABLE, FL_ID,
                    this.flId, Restrictions.OP_EQUALS));
            }
            records = dataSource.getRecords();
        } else {
            dataSource = DataSourceFactory.loadDataSourceFromFile(SOURCE_FILE_NAME, RM_DS);
            dataSource.addRestriction(Restrictions
                .sql("EXISTS(SELECT fn.fn_id FROM fn WHERE fn.bl_id = rm.bl_id AND "
                        + "fn.fl_id = rm.fl_id AND fn.rm_id = rm.rm_id)"));
            if (StringUtil.notNullOrEmpty(blIdP)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(RM_TABLE, BL_ID,
                    blIdP, Restrictions.OP_EQUALS));
            }
            if (StringUtil.notNullOrEmpty(flIdP)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(RM_TABLE, FL_ID,
                    flIdP, Restrictions.OP_EQUALS));
            }
            if (StringUtil.notNullOrEmpty(this.rmId)) {
                dataSource.addRestriction(new Restrictions.Restriction.Clause(RM_TABLE, RM_ID,
                    this.rmId, Restrictions.OP_EQUALS));
            }
            records = dataSource.getRecords();
        }
        return records.iterator();

    }

    /**
     * Delete intermediary files.
     *
     */
    private void deletePartialFiles() {
        // delete partial results to save space on hdd
        for (final String fullPath : this.files) {
            final File crtFile = new File(fullPath);
            if (crtFile.exists()) {
                crtFile.delete();
            }
        }

    }

    /**
     * Generate intermediate file containing location or furniture standards informations.
     *
     * @param type type of intermediate file information. Possible values: "location" and
     *            "furniture"
     * @param builder paginated report builder
     * @param context context
     * @param counter current intermediate file number
     * @param dateString current date as a String
     * @param moRestriction restrictions map object
     * @param moParameters parameters map object
     * @return generated file full name
     */
    private String generateIntermediateFile(final String type,
            final PaginatedReportsBuilder builder, final Context context, final int counter,
            final String dateString, final Map<String, Object> moRestriction,
            final Map<String, Object> moParameters) {
        com.archibus.ext.report.docx.Report report;
        report = new com.archibus.ext.report.docx.Report();
        report
        .setTitle(EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
            this.viewTitle, this.getClass().getName()));

        if (LOCATION_TYPE.equals(type)) {
            report.setFilename(PARTIAL_FILE_NAME_LOCATION + UNDERLINE + dateString + UNDERLINE
                + counter + DOC_EXTENSION);
            report.setRestrictions(moRestriction);
            builder.buildDocxFromView(context, report, PARTIAL_FILE_NAME_LOCATION
                + VIEW_FILE_EXTENSION, null);
        } else if (FURNITURE_TYPE.equals(type)) {
            report.setFilename(PARTIAL_FILE_NAME_FURNITURE + UNDERLINE + dateString + UNDERLINE
                + counter + DOC_EXTENSION);
            report.setPatameters(moParameters);
            builder.buildDocxFromView(context, report, PARTIAL_FILE_NAME_FURNITURE
                + VIEW_FILE_EXTENSION, null);
        }
        return report.getFileFullName();
    }

    /**
     * Obtain current date as String.
     *
     * @return date as String
     */
    private String getCurrentDate() {
        final java.sql.Date date = Utility.currentDate();
        return date.toString();
    }

    /**
     * Iterates through buildings, floors, rooms and furniture standards dataSources and creates
     * separate files for location(building, floor, room) and for furniture standards.
     *
     * @param builder The paginated report builder
     * @param context The Context
     * @param dateString The current date as String.
     */
    private void obtainIntermediateFiles(final PaginatedReportsBuilder builder,
            final Context context, final String dateString) {
        // counter for partial files
        int counter = 0;

        // building variables

        final Iterator<DataRecord> itBl = getIterator(BL_TABLE, null, null);
        String currentBlId;

        // floor variables

        Iterator<DataRecord> itFl;
        String currentFlId;

        // room variables
        Iterator<DataRecord> itRm;
        String currentRmId;

        Map<String, Object> moRestriction;
        Map<String, Object> moParameters;

        while (itBl.hasNext()) {
            currentBlId = itBl.next().getString("bl.bl_id");

            itFl = getIterator(FL_TABLE, currentBlId, null);
            while (itFl.hasNext()) {
                currentFlId = itFl.next().getString("fl.fl_id");

                itRm = getIterator(RM_TABLE, currentBlId, currentFlId);
                while (itRm.hasNext()) {
                    currentRmId = itRm.next().getString("rm.rm_id");

                    moRestriction = getCurrentMoRestriction(currentBlId, currentFlId, currentRmId);
                    moParameters = getCurrentMoParameters(currentBlId, currentFlId, currentRmId);

                    // generate the first 3 bands files
                    this.files.add(generateIntermediateFile(LOCATION_TYPE, builder, context,
                        counter, dateString, moRestriction, moParameters));

                    // generate the furniture files
                    this.files.add(generateIntermediateFile(FURNITURE_TYPE, builder, context,
                        counter, dateString, moRestriction, moParameters));

                    counter++;
                }
            }

        }
    }
}
