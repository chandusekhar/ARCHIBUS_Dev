package com.archibus.app.common.metrics.provider;

import java.io.*;
import java.util.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.utility.*;

/**
 * Metric values data transfer provider.
 *
 * @author Ioan Draghici
 * @since 21.2
 */
public class MetricValuesFileImportProvider implements MetricValuesProvider {
    /**
     * Data transfer sub-folder for user defined metric import files.
     */
    private static final String FOLDER_NAME = "metric-values-import/";

    /**
     * File extention.
     */
    private static final String EXTENSION = ".csv";

    /**
     * Metric granularity.
     */
    private Granularity metricGranularity;

    /**
     * Metric definition.
     */
    private Metric metric;

    /**
     * Setter for metric object.
     *
     * @param metric the metric to set
     */
    @Override
    public void setMetric(final Metric metric) {
        this.metric = metric;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
            final Date toDate) throws ExceptionBase {
        this.metricGranularity = granularity;
        try {
            final String fileName = getFileName(this.metric.getName());
            final String filePath = getFilePath();
            final ImportExportFileBase xlsBuilder = getXlSBuilder(filePath + fileName, "CSV");
            return getMetricValues(xlsBuilder);
        } catch (final ExceptionBase originalException) {
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_GENERIC_MESSAGE, new Object[] { this.metric.getTitle() });
            newException.setStackTrace(originalException.getStackTrace());
            throw newException;
        }
    }

    /**
     * Returns csv file name.
     *
     * @param metricName metric name
     * @return file name
     */
    private String getFileName(final String metricName) {
        return metricName + EXTENSION;
    }

    /**
     * Returns file path.
     *
     * @return file path
     */
    private String getFilePath() {
        String path = ContextStore.get().getWebAppPath();
        path += DataTransferUtility.PROJECTS_USERS_PATH + "public" + DataTransferUtility.DT_FOLDER
                + FOLDER_NAME;
        return Utility.replaceInvalidCharactersInFilePath(path);
    }

    /**
     * Read CSV file.
     *
     * @param xlsBuilder CSV reader
     * @return metric values
     */
    private Map<String, Double> getMetricValues(final ImportExportFileBase xlsBuilder) {
        final Map<String, Double> values = new HashMap<String, Double>();
        // get field names
        final List<String> fieldNames = xlsBuilder.getFieldNames();

        // remove the table names from the first field name
        for (int index = 0; index < fieldNames.size(); index++) {
            fieldNames.set(index, Utility.fieldNameFromFullName(fieldNames.get(index)));
        }
        final int colGroupByField = fieldNames.indexOf(DbConstants.COLLECT_GROUP_BY);
        final int colGroupByValue = fieldNames.indexOf(DbConstants.COLLECT_BY_VALUE);
        final int colMetricValue = fieldNames.indexOf(DbConstants.METRIC_VALUE);

        for (int row = 1; row <= xlsBuilder.getLastRowIndex(); row++) {
            final String collectGroupBy = xlsBuilder.getCellDataAsString(row, colGroupByField);
            if (this.metricGranularity.getGroupByFields().equals(collectGroupBy)) {
                final String groupByValue = xlsBuilder.getCellDataAsString(row, colGroupByValue);
                final Double metricValue =
                        Double.valueOf(xlsBuilder.getCellDataAsString(row, colMetricValue));
                values.put(groupByValue, metricValue);
            }
        }
        return values;
    }

    /**
     * Get XLS builder for specified file.
     *
     * @param serverFileName file name
     * @param format file format
     * @return xls builder
     */
    private ImportExportFileBase getXlSBuilder(final String serverFileName, final String format) {
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(serverFileName);
        } catch (final FileNotFoundException e) {
            throw new ExceptionBase(
                String.format("Unable to find the file [%s] on the server.", serverFileName));
        }
        final XlsBuilder.FileFormatType fileFormatType =
                XlsBuilder.FileFormatType.fromString(format);
        final ImportExportFileBase xlsBuilder = new ImportExportFileBase(fileFormatType);
        xlsBuilder.open(fileInputStream, fileFormatType);
        return xlsBuilder;
    }
}
