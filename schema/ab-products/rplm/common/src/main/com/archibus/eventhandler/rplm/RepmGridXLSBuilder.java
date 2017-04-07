package com.archibus.eventhandler.rplm;

import java.util.*;

import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.xls.GridBuilder;
import com.archibus.utility.StringUtil;

/**
 * A customized XLS Grid Build to add statistics info for numeric fields for "Lease Benchmarks" and
 * "Property and Building Benchmarks" reports
 * 
 * 
 * @author Yong Shao
 * 
 */
public class RepmGridXLSBuilder extends GridBuilder {

    /**
     * Overwrite addCustomRows() to add extra row into report
     */
    @Override
    public void addCustomRows(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> visibleFields, final List<DataRecord> records) {

        // @translatable
        String avgTitle = "Average";
        avgTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(), avgTitle, this
            .getClass().getName());

        // @translatable
        String minTitle = "Min";
        minTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(), minTitle, this
            .getClass().getName());

        // @translatable
        String maxTitle = "Max";
        maxTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(), maxTitle, this
            .getClass().getName());

        int column = 0;
        for (Map<String, Object> field : visibleFields) {
            final boolean isNumeric = isNumeric(field);
            if (isNumeric) {
                // Statistics avg, min and max for the numeric field
                double avg = 0.00;
                double min = 0.00;
                double max = 0.00;
                final String fieldName = getStringValue("id", field);
                for (DataRecord dataRecord : records) {
                    final Object value = dataRecord.getNeutralValue(fieldName);
                    if (value != null) {
                        final double numericValue = Double.parseDouble(StringUtil.notNull(value));
                        avg += numericValue;
                        min = Math.min(min, numericValue);
                        max = Math.max(max, numericValue);
                    }
                }

                int counter = (records != null && records.size() > 0) ? records.size() : 1;
                avg = avg / counter;

                final int decimals = getDecimals(field);

                // XXX: add statistics info to certain XLS cells
                addCustomRow(totalRows, column, avg, decimals);
                addCustomRow(totalRows + 1, column, min, decimals);
                addCustomRow(totalRows + 2, column, max, decimals);
            } else {
                // just color empty cell
                writeFieldTitle(totalRows, column, "", this.totalColoring);
                writeFieldTitle(totalRows + 1, column, "", this.totalColoring);
                writeFieldTitle(totalRows + 2, column, "", this.totalColoring);
            }

            column++;
        }
        // titles for Statistics (if first column is numeric field????)
        writeFieldTitle(totalRows, 0, avgTitle, this.totalColoring);
        writeFieldTitle(totalRows + 1, 0, minTitle, this.totalColoring);
        writeFieldTitle(totalRows + 2, 0, maxTitle, this.totalColoring);
    }
}
