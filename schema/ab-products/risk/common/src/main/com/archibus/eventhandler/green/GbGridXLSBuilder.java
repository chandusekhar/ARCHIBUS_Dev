package com.archibus.eventhandler.green;

import java.util.*;

import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.xls.GridBuilder;
import com.archibus.utility.StringUtil;

/**
 * A customized XLS Grid Build to add statistics info for numeric fields for Green Building
 * Footprints reports
 * 
 */
public class GbGridXLSBuilder extends GridBuilder {
    
    private boolean isPerArea;
    
    private boolean isAtTheBottom;
    
    private String areaExtFieldName;
    
    /**
     * True if the last record to export is already a total row
     */
    private boolean isLastRowTotal = false;
    
    public void setPerArea(boolean isPerArea) {
        this.isPerArea = isPerArea;
    }
    
    /**
     * Set isLastRowTotal to true if the last record to export is already a total row
     * 
     * @param isLastRowTotal
     */
    public void setLastRowTotal(boolean isLastRowTotal) {
        this.isLastRowTotal = isLastRowTotal;
    }
    
    public void setAtTheBottom(boolean isAtTheBottom) {
        this.isAtTheBottom = isAtTheBottom;
    }
    
    public void setAreaExtFieldName(String areaExtFieldName) {
        this.areaExtFieldName = areaExtFieldName;
    }
    
    /**
     * Overwrite addCustomRows() to add extra row into report
     */
    @Override
    public void addCustomRows(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> visibleFields, final List<DataRecord> records) {
        
        int column = 0;
        int insertPosition = 3;
        
        if (this.isLastRowTotal) {
            // we need to modify the last row which is already a total row
            insertPosition = totalRows - 2;
        } else if (this.isAtTheBottom) {
            insertPosition = totalRows - 1;
        } else {
            this.xlsBuilder.insertRow(3);
        }
        
        ListIterator<Map<String, Object>> iterator = visibleFields.listIterator();
        
        while (iterator.hasNext()) {
            
            Map<String, Object> field = iterator.next();
            
            final String fieldName = getStringValue("id", field);
            
            final boolean isNumeric = isNumeric(field);
            
            if (isNumeric && !fieldName.equals("gb_fp_totals.calc_year")
                    && !fieldName.equals(this.areaExtFieldName)) {
                
                // 'Total' calculated value for the numeric field
                double total = this.calculateTotals(fieldName, records);
                
                final int decimals = getDecimals(field);
                
                // XXX: add statistics info to certain XLS cells
                addCustomRow(insertPosition, column, total, decimals);
            } else {
                // just color empty cell
                writeFieldTitle(insertPosition, column, "", this.totalColoring);
            }
            
            column++;
        }
    }
    
    /**
     * Calculate values for 'Totals' row.
     * 
     * @param fieldName
     * @param records
     * @return
     */
    private double calculateTotals(String fieldName, final List<DataRecord> records) {
        double total = 0.00;
        double totalGrossArea = 0.00;
        
        if (this.isLastRowTotal) {
            // when we already have the totals in the last record, we just take the values from it
            DataRecord lastRecord = records.get(records.size() - 1);
            if (lastRecord != null) {
                final Object value = lastRecord.getNeutralValue(fieldName);
                if (value != null) {
                    total = Double.parseDouble(StringUtil.notNull(value));
                }
            }
        } else {
        for (DataRecord dataRecord : records) {
            final Object value = dataRecord.getNeutralValue(fieldName);
            if (value != null) {
                double numericValue = Double.parseDouble(StringUtil.notNull(value));
                    if (this.isPerArea && (dataRecord.findField(this.areaExtFieldName) != null)) {
                        final Object grossAreaValue = dataRecord
                            .getNeutralValue(this.areaExtFieldName);
                    if (grossAreaValue != null
                            && !fieldName.equals("gb_fp_totals.vf_cf_bldg_count")
                            && !fieldName.equals("gb_fp_totals.vf_bldg_count")) {
                        double numericGrossArea = Double.parseDouble(StringUtil
                            .notNull(grossAreaValue));
                        total += (numericValue * numericGrossArea);
                        totalGrossArea += numericGrossArea;
                    } else {
                        total += numericValue;
                    }
                    
                } else {
                    total += numericValue;
                    
                }
                
            }
        }
        
        total = (this.isPerArea && totalGrossArea > 0) ? total / totalGrossArea : total;
        }
        
        return total;
    }
    
}
