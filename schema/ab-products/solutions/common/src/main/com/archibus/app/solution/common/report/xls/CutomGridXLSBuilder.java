package com.archibus.app.solution.common.report.xls;

import java.util.*;

import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.xls.GridBuilder;

/**
 * A simple customized XLS Grid Build to add statistics info for numeric fields. Run its JUnit test
 * and check the XLS report XLS file under WebCentral/projects/users/afm.
 * 
 * 
 * @author Yong Shao
 * 
 */
public class CutomGridXLSBuilder extends GridBuilder {
    /**
     * AVERAGE.
     */
    private static final String AVERAGE = "Average";
    
    /**
     * MIN.
     */
    private static final String MIN = "Min";
    
    /**
     * MAX.
     */
    private static final String MAX = "Max";
    
    /**
     * Customizes numeric fields with statistics {@inheritDoc}
     */
    @Override
    public void customizeField(final String fieldName, final int decimal, final int columnIndex,
            final int totalRows, final int totalColumns, final List<DataRecord> records) {
        double total = 0.00;
        double min = 0.00;
        double max = 0.00;
        for (DataRecord dataRecord : records) {
            final double numericValue = dataRecord.getDouble(fieldName);
            total += numericValue;
            min = Math.min(min, numericValue);
            max = Math.max(max, numericValue);
        }
        
        final double avg = total / records.size();
        
        addValue(totalRows - 1, columnIndex, avg, decimal, "Average on " + fieldName);
        addValue(totalRows, columnIndex, min, decimal, "Min on " + fieldName);
        addValue(totalRows + 1, columnIndex, max, decimal, "Max on " + fieldName);
    }
    
    /**
     * Customizes non-numeric fields to color empty cells as same as numeric statistics cells.
     * {@inheritDoc}
     */
    @Override
    public void customizeField(final String fieldName, final int columnIndex, final int totalRows,
            final int totalColumns, final List<DataRecord> records) {
        writeEmptyTitle(totalRows - 1, columnIndex, this.getTotalColor());
        writeEmptyTitle(totalRows, columnIndex, this.getTotalColor());
        writeEmptyTitle(totalRows + 1, columnIndex, this.getTotalColor());
    }
    
    /**
     * Adds statistics titles{@inheritDoc}
     */
    @Override
    public void endCustomization(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> visibleFields, final List<DataRecord> records) {
        writeFieldTitle(totalRows - 1, 0, AVERAGE, this.getTotalColor());
        writeFieldTitle(totalRows, 0, MIN, this.getTotalColor());
        writeFieldTitle(totalRows + 1, 0, MAX, this.getTotalColor());
    }
    
}
