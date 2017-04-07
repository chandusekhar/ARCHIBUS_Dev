package com.archibus.app.solution.recurring;

import static com.archibus.app.solution.recurring.RecurringScheduleExportHelper.*;

import java.text.ParseException;
import java.util.*;

import com.archibus.context.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.*;
import com.archibus.ext.report.docx.PanelBuilderBase;
import com.archibus.ext.report.docx.table.CategoryPanelBuilder;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.model.view.datasource.processor.DataSourceUnitsConverter;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.StringUtil;

/**
 * Provides methods to export panels that display recurring pattern fields.
 * 
 * @author Ioan Draghici
 * @since 21.2
 */

public class RecurringScheduleExport extends JobBase {

    /**
     * Constant.
     */
    private static final int VALUE_TEN = 10;

    /**
     * Main routine for client-side call to build a XLS Grid report based on a cached dataSource (a
     * panel's ad hoc XLS action).
     * 
     * @param viewName view name
     * @param dataSourceId data source control id
     * @param title report title
     * @param visibleFields visible fields
     * @param restriction sql restriction
     * @param parameters parameters
     * @throws ParseException parse exception
     */
    public void generateGridXLSReport(final String viewName, final String dataSourceId,
            final String title, final List<Map<String, Object>> visibleFields,
            final String restriction, final Map<String, Object> parameters) throws ParseException {

        this.status.setTotalNumber(ONE_HUNDRED);
        this.status.setCurrentNumber(0);

        String reportTitle = "";
        if (StringUtil.notNullOrEmpty(title) && !NULL.equalsIgnoreCase(title)) {
            reportTitle = title;
        }

        final PanelReportProperties panelReportProperties =
                loadPanelProperties(viewName, parameters);

        final String clientRestriction = handleRestriction(restriction, parameters);
        // load data source and set parameters
        final DataSource dataSource =
                loadDataSource(viewName, dataSourceId, panelReportProperties, parameters);
        // get totals record
        final DataRecord totalsRecord =
                getTotalsRecord(viewName, dataSource, panelReportProperties, parameters,
                    clientRestriction);
        // get printable restriction handler
        final com.archibus.ext.report.xls.PrintRestrictionHandler printRestrictionHandler =
                getPrintRestrictionHandler(dataSource, visibleFields, parameters, clientRestriction);

        // load records
        final List<DataRecord> records = dataSource.getRecords(clientRestriction);
        DataSourceUnitsConverter.convertRecords(records, dataSource);

        final GridXLSBuilder builder = new GridXLSBuilder();

        builder.setFileName(builder.createFileName(viewName));

        builder.setPrintRestrictionHandler(printRestrictionHandler);

        builder.build(records, totalsRecord, reportTitle, visibleFields);

        //
        final String fileName = builder.getFileName();
        final String url = builder.getURL();
        final JobResult result = new JobResult(reportTitle, fileName, url);
        this.status.setResult(result);
        this.status.setCurrentNumber(ONE_HUNDRED);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }

    /**
     * Main routine for client-side call to build a docx report based on a cached dataSource (a
     * panel's ad hoc DOC action).
     * 
     * @param viewName - required
     * @param dataSourceId - required
     * @param reportTitle - required
     * @param visibleFields - optional (if not being provided, all fields in dataSource will be
     *            reported)
     * @param clientRestriction - client restriction
     * @param parameters - report parameters
     * @param recurringFields - recurring pattern fields
     * @throws ParseException parse exception
     */
    public void buildDocxFromDataSource(final String viewName, final String dataSourceId,
            final String reportTitle, final List<Map<String, Object>> visibleFields,
            final String clientRestriction, final Map<String, Object> parameters,
            final List<String> recurringFields) throws ParseException {

        final Context context = ContextStore.get();

        String title = reportTitle;
        if (NULL.equalsIgnoreCase(title)) {
            title = "";
        }

        final com.archibus.ext.report.docx.Report report =
                new com.archibus.ext.report.docx.Report();
        report.setJobStatus(this.status);

        final PanelReportProperties panelReportProperties =
                loadPanelProperties(viewName, parameters);

        final DataSource dataSource =
                loadDataSource(viewName, dataSourceId, panelReportProperties, parameters);

        final ReportPropertiesDef reportPropertiesDef =
                ReportUtility.getReportPropertiesDef(context);

        setPrintRestriction(report, parameters);

        final DataSource totalsDataSource =
                getTotalsDataSource(viewName, dataSource, panelReportProperties, parameters,
                    clientRestriction);

        setReportProperties(report, panelReportProperties, reportPropertiesDef, parameters,
            clientRestriction);

        final String docxOutputFileName =
                ReportUtility.createFileName(viewName, report.getOutputFileType().toString());

        report.init(context, reportPropertiesDef, title, docxOutputFileName);

        dataSource.setContext();

        final RecurringPanelBuilderFactoryImpl recurringPanelBuilderFactoryImpl =
                new RecurringPanelBuilderFactoryImpl();

        final PanelBuilderBase panelBuilder =
                recurringPanelBuilderFactoryImpl.getDocxBuilder(panelReportProperties,
                    reportPropertiesDef, dataSource, visibleFields, totalsDataSource, null);

        if (panelBuilder instanceof CategoryPanelBuilder) {
            ((CategoryPanelBuilder) panelBuilder)
            .setCategoryFieldDrillDown(new CategoryFieldDrillDown(parameters, dataSource));
        }

        panelBuilder.build(report, null, VALUE_TEN, 0);
        // save docx
        report.finalizeOutputFile();

    }
}
