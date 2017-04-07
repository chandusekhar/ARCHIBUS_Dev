package com.archibus.app.solution.common.report.xls;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.data.*;
import com.archibus.ext.report.xls.*;
import com.archibus.utility.StringUtil;

/**
 * A simple customized 2D cross-tab XLS Build to add statistics info for numeric fields. Run its
 * JUnit test and check the report XLS file under WebCentral/projects/users/afm.
 * 
 * @author Yong Shao
 * 
 */

public class Cutom2DCrossTabXLSBuilder extends CrossTab2DBuilder {
    /**
     * OverWrite first group by field's title.
     */
    /** {@inheritDoc} */
    @Override
    public void writeTitleOfFirstGroupByField(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        writeGroupByFieldTitle(row, column, "First: " + title, color);
    }
    
    /**
     * OverWrite second group by field's title.
     */
    /** {@inheritDoc} */
    @Override
    public void writeTitleOfSecondGroupByField(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        writeGroupByFieldTitle(row, column, "Second: " + title, color);
    }
    
    /**
     * OverWrite calculated field's title.
     */
    /** {@inheritDoc} */
    @Override
    public void writeCalculatedFieldTitle(final int row, final int column, final String title) {
        writeFieldTitle(row, column, "Calculated: " + title, this.rowHeaderColoring);
    }
    
    /**
     * OverWrite field's value.
     */
    /** {@inheritDoc} */
    @Override
    public void writeFieldValue(final Map<String, Object> calculatedField, final int row,
            final int col, final Object value) {
        
        if (StringUtil.notNullOrEmpty(value) && isNumeric(calculatedField)) {
            // add minus
            final Double numericValue = Double.valueOf(value.toString() + "10");
            writeFieldValue(calculatedField, row, col, numericValue, null);
        } else {
            writeFieldValue(calculatedField, row, col, value, null);
        }
    }
    
    /**
     * Add a cutom total row.
     */
    /** {@inheritDoc} */
    
    @Override
    public void addCustomTotalRow(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> calculatedFields, final DataSet dataset) {
        final Map<String, Object> calculatedField = calculatedFields.get(0);
        final int decimal = getDecimals(calculatedField);
        
        final DataSet2D dataSet2D = (DataSet2D) dataset;
        final JSONArray columnValues = dataSet2D.getColumnValues();
        final JSONArray rowValues = dataSet2D.getRowValues();
        
        final int row = totalRows + 2;
        
        for (int j = 0; j < columnValues.length(); j++) {
            Double result = 0.00;
            
            // add up each column value for all calculated fields
            for (int r = 0; r < rowValues.length(); r++) {
                // avoid magic number warning ?????
                final int rIndex = 1 + 1 + 1 + 1 + r;
                final int cIndex = 1 + 1 + 1 + j;
                final Object temp = this.xlsBuilder.getCellData(rIndex, cIndex);
                if (StringUtil.notNullOrEmpty(temp)) {
                    final Double numericValue = Double.valueOf(temp.toString());
                    result += numericValue;
                }
            }
            
            addCustomTotalColumn(row, 1 + 1 + 1 + j + this.nRowDimensionFields, result, decimal);
        }
        
        // XXX: add the total head
        if (rowValues.length() > 0) {
            Double result = 0.00;
            // add up total column value for all calculated fields
            for (int r = 0; r < rowValues.length(); r++) {
                final Object temp = this.xlsBuilder.getCellData(1 + 1 + 1 + 1 + r, 2);
                if (temp != null) {
                    final Double numericValue = Double.valueOf(temp.toString());
                    result += numericValue;
                }
            }
            addCustomTotalColumn(row, 2, result, 2);
            writeFieldTitle(row, 1 + this.nRowDimensionFields, "Sum for calculated fields:",
                this.totalColoring);
        }
        
    }
}
