package com.archibus.eventhandler.rplm;

import java.util.*;

import org.json.*;

import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.xls.*;
import com.archibus.utility.StringUtil;

/**
 * A customized 2D XLS report builder to cover 8 RPLM cost report cases and Cash Flow report case
 * Basically just overwrite any customized part of a standard XLS report
 * 
 * 
 * 
 * @author Yong Shao
 * 
 */

public class XLSReport extends CrossTab2DBuilder {
    /**
     * Constant.
     */
    // @translatable
    private static final String TAX_AMOUNT = "Tax Amount";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String STRAIGHT_LINE_RENT = "Straight Line Rent";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String BL_CODE = "Building Code";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String PR_CODE = "Property Code";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String AC_CODE = "Account Code";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String COST_CAT = "Cost Category";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String TOTAL_YEAR_TITLE = "Yearly Totals:";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String TOTAL_MONTH_TITLE = "Monthly Totals:";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String TOTAL_QUARTER_TITLE = "Quarterly Totals:";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String MEASURE_INCOME = "Income";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String MEASURE_EXPENSE = "Expense";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String MEASURE_INCOME_VAT_REPORT = "Total VAT Earned as Income";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String MEASURE_EXPENSE_VAT_REPORT = "Total VAT Paid as Expense";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String MONTH_TITLE = "Month";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String QUARTER_TITLE = "Quarter";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String QUARTER_1 = "Q1";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String QUARTER_2 = "Q2";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String QUARTER_3 = "Q3";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String QUARTER_4 = "Q4";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String A_BASE_RENT = "Base Rent";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String B_LI_CREDIT = "Leasehold Improvement Credit";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String C_ACTUAL_RENT = "Actual Rent";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String D_SL_RENT = "Straight Line Rent";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String E_DIFFERENTIAL_RENT = "Differential";
    
    /**
     * Constant.
     */
    // @translatable
    private static final String F_DIFFERENTIAL_RENT_CUMUL = "Cumulative Differential";
    
    /**
     * Set true for VAT amount balance report and false otherwise.
     */
    private boolean isVATCashFlowReport = false;
    
    /**
     * Set true if is Straight line rent , false otherwise.
     */
    private boolean isStraightLineRentReport = false;
    
    /**
     * Boolean.
     */
    private boolean stripMinus = false;
    
    /**
     * Array with quarters corresponding to months. For example: quarters[3] = 4 means that March is
     * in Q4.
     */
    private int[] quarters;
    
    /**
     * String.
     */
    private String quarterYear;
    
    /**
     * Boolean.
     */
    private boolean isMonthFormat = false;
    
    /**
     * Boolean.
     */
    private boolean isQuarterFormat = false;
    
    /**
     * Boolean.
     */
    private boolean isGroupByCostCategory = false;
    
    /**
     * Projection type.
     */
    private String projectionType;
    
    /**
     * Calculation type.
     */
    String calculationType;
    
    public void setStripMinus(final boolean stripMinus) {
        this.stripMinus = stripMinus;
    }
    
    public void setMonthFormat(final boolean isMonthFormat) {
        this.isMonthFormat = isMonthFormat;
    }
    
    public void setQuarterFormat(final boolean isQuarterFormat) {
        this.isQuarterFormat = isQuarterFormat;
    }
    
    public void setProjectionType(final String projectionType) {
        this.projectionType = projectionType;
    }
    
    public void setCalculationType(final String calculationType) {
        this.calculationType = calculationType;
    }
    
    public void setGroupByCostCategory(final boolean isGroupByCostCategory) {
        this.isGroupByCostCategory = isGroupByCostCategory;
    }
    
    /**
     * @param isVATCashFlowReport the isVATCashFlowReport to set
     */
    public void setVATCashFlowReport(final boolean isVATCashFlowReport) {
        this.isVATCashFlowReport = isVATCashFlowReport;
    }
    
    /**
     * @param isStraightLineRentReport the isStraightLineRentReport to set
     */
    public void setStraightLineRentReport(final boolean isStraightLineRentReport) {
        this.isStraightLineRentReport = isStraightLineRentReport;
    }
    
    /**
     * Overwrite column head
     */
    @Override
    public void writeColumnHead(final int row, final int column, final JSONObject columnValue) {
        String result = "";
        final String value = StringUtil.notNull(columnValue.get("n"));
        String year = value.substring(0, 4);
        final String month = value.substring(5, 7);
        if (this.isMonthFormat) {
            result = month + "/" + year;
        } else if (this.isQuarterFormat) {
            final int numericMonth = Integer.parseInt(month);
            if (StringUtil.isNullOrEmpty(this.quarterYear)
                    || (column - 2 - this.nRowDimensionFields) % 4 == 0) {
                this.quarterYear = year;
            } else {
                year = this.quarterYear;
            }
            final int quarter = this.quarters[numericMonth];
            String localizedQ = QUARTER_4;
            switch (quarter) {
                case 1: {
                    localizedQ = QUARTER_1;
                    break;
                }
                case 2: {
                    localizedQ = QUARTER_2;
                    break;
                }
                case 3: {
                    localizedQ = QUARTER_3;
                    break;
                }
            }
            
            localizedQ =
                    EventHandlerBase.localizeString(this.context.getCurrentContext(), localizedQ,
                        this.getClass().getName());
            
            result = localizedQ + "/" + year;
        } else {
            result = year;
        }
        
        super.writeColumnHead(row, column, result);
    }
    
    /**
     * Add a custom final total row
     */
    @Override
    public void addCustomTotalRow(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> calculatedFields, final DataSet dataset) {
        final Map<String, Object> calculatedField = calculatedFields.get(0);
        final String calculatedFieldName = this.getStringValue("id", calculatedField);
        final DataSet2D dataSet2D = (DataSet2D) dataset;
        final JSONArray columnValues = dataSet2D.getColumnValues();
        final JSONArray rowValues = dataSet2D.getRowValues();
        // straight line rent details don't have total row
        final boolean isStraightLineDetails =
                this.isStraightLineRentReport && this.isGroupByCostCategory;
        
        final int row = totalRows + 1;
        
        for (int j = 0; j < columnValues.length() && !isStraightLineDetails; j++) {
            Double result = 0.00;
            final JSONObject columnValue = (JSONObject) columnValues.get(j);
            for (int i = 0; i < rowValues.length(); i++) {
                final JSONObject rowValue = (JSONObject) rowValues.get(i);
                final DataRecord record =
                        dataSet2D.getRecordForRowAndColumn(rowValue.getString("n"),
                            columnValue.getString("n"));
                final Object value = record.getValue(calculatedFieldName);
                if (value != null) {
                    final String strValue = value.toString();
                    Double numericValue = Double.valueOf(strValue);
                    // XXX: WEIRD!!!
                    if (this.stripMinus && strValue.startsWith("-")) {
                        numericValue = -numericValue;
                    }
                    result += numericValue;
                    
                }
            }
            addCustomTotalColumn(row, 2 + j + this.nRowDimensionFields, result, 2);
        }
        
        // XXX: add the total head
        if (rowValues.length() > 0 && !isStraightLineDetails) {
            for (int i = 0; i <= this.nRowDimensionFields; i++) {
                writeFieldTitle(row, i, "", this.totalColoring);
            }
            String localizedTitle = TOTAL_YEAR_TITLE;
            if (this.isMonthFormat) {
                localizedTitle = TOTAL_MONTH_TITLE;
            } else if (this.isQuarterFormat) {
                localizedTitle = TOTAL_QUARTER_TITLE;
            }
            localizedTitle =
                    EventHandlerBase.localizeString(this.context.getCurrentContext(),
                        localizedTitle, this.getClass().getName());
            
            writeFieldTitle(row, 1 + this.nRowDimensionFields, localizedTitle, this.totalColoring);
        }
        
    }
    
    /**
     * Strip Minus
     */
    @Override
    public void writeFieldValue(final Map<String, Object> calculatedField, final int row,
            final int col, final Object value) {
        final String strValue = StringUtil.notNull(value);
        if (this.stripMinus && (strValue != null && strValue.startsWith("-"))) {
            final Double numericValue = Double.valueOf(strValue);
            writeFieldValue(calculatedField, row, col, -numericValue, null);
        } else {
            writeFieldValue(calculatedField, row, col, strValue, null);
        }
    }
    
    @Override
    public void writeFieldTitle(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        if (this.projectionType != null) {
            if (this.nRowDimensionFields > 0 && this.isStraightLineRentReport
                    && this.isGroupByCostCategory) {
                final String localizedTitle = getLocalizedCostCategoryForStraightLineRent(title);
                this.xlsBuilder.writeCellTitle(row, column, localizedTitle, color);
            } else {
                this.xlsBuilder.writeCellTitle(row, column, title, color);
            }
        }
    }
    
    @Override
    public void writeTitleOfFirstGroupByField(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        if (this.projectionType != null) {
            // Cash Flow Case
            if (this.nRowDimensionFields > 0
                    && !(this.isStraightLineRentReport && this.isGroupByCostCategory)) {
                writeGroupByFieldTitle(row, column + 1, EventHandlerBase.localizeString(
                    this.context.getCurrentContext(), COST_CAT, this.getClass().getName()), color);
            }
            String loaclizedTitle = title;
            if (this.projectionType.equals("bl")) {
                loaclizedTitle = BL_CODE;
            } else if (this.projectionType.equals("ac")) {
                loaclizedTitle = AC_CODE;
            } else if (this.projectionType.equals("pr")) {
                loaclizedTitle = PR_CODE;
            }
            loaclizedTitle =
                    EventHandlerBase.localizeString(this.context.getCurrentContext(),
                        loaclizedTitle, this.getClass().getName());
            
            writeGroupByFieldTitle(row, column, loaclizedTitle, color);
        } else {
            writeGroupByFieldTitle(row, column, title, color);
        }
    }
    
    @Override
    public void writeTitleOfSecondGroupByField(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        String loaclizedTitle = title;
        if (this.isMonthFormat) {
            loaclizedTitle = MONTH_TITLE;
        } else if (this.isQuarterFormat) {
            loaclizedTitle = QUARTER_TITLE;
        }
        loaclizedTitle =
                EventHandlerBase.localizeString(this.context.getCurrentContext(), loaclizedTitle,
                    this.getClass().getName());
        
        writeGroupByFieldTitle(row, column, loaclizedTitle, color);
    }
    
    @Override
    public void writeCalculatedFieldTitle(final int row, final int column, final String title) {
        if (this.calculationType != null) {
            // net income
            String loaclizedTitle = this.isVATCashFlowReport ? TAX_AMOUNT : title;
            
            if (this.calculationType.equals("INCOME")) {
                loaclizedTitle =
                        this.isVATCashFlowReport ? MEASURE_INCOME_VAT_REPORT : MEASURE_INCOME;
            } else if (this.calculationType.equals("EXPENSE")) {
                loaclizedTitle =
                        this.isVATCashFlowReport ? MEASURE_EXPENSE_VAT_REPORT : MEASURE_EXPENSE;
            }
            
            if (this.isStraightLineRentReport) {
                loaclizedTitle = this.isGroupByCostCategory ? "" : STRAIGHT_LINE_RENT;
            }
            
            loaclizedTitle =
                    EventHandlerBase.localizeString(this.context.getCurrentContext(),
                        loaclizedTitle, this.getClass().getName());
            writeFieldTitle(row, column, loaclizedTitle, this.rowHeaderColoring);
        } else {
            writeFieldTitle(row, column, title, this.rowHeaderColoring);
        }
    }
    
    /**
     * Calculates quarters and set the result to instance variable.
     * 
     * @param dateStart
     * @param dateEnd
     */
    protected void setQuarters(final Date dateStart, final Date dateEnd) {
        final int[] quarters = new int[13];
        final Calendar cal = Calendar.getInstance();
        cal.setTime(dateStart);
        int counter = cal.get(Calendar.MONTH) + 1;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 3; j++) {
                quarters[counter] = i + 1;
                counter = (counter + 1 == 13 ? 1 : counter + 1);
            }
        }
        this.quarters = quarters;
    }
    
    /**
     * Localize cost category for straight line rent details.
     * 
     * @param value string
     * @return String
     */
    private String getLocalizedCostCategoryForStraightLineRent(final String value) {
        String localizedTitle = "";
        if ("a_base_rent".equals(value)) {
            localizedTitle = A_BASE_RENT;
        } else if ("b_li_credit".equals(value)) {
            localizedTitle = B_LI_CREDIT;
        } else if ("c_actual_rent".equals(value)) {
            localizedTitle = C_ACTUAL_RENT;
        } else if ("d_sl_rent".equals(value)) {
            localizedTitle = D_SL_RENT;
        } else if ("e_differential_rent".equals(value)) {
            localizedTitle = E_DIFFERENTIAL_RENT;
        } else if ("f_differential_rent_cumul".equals(value)) {
            localizedTitle = F_DIFFERENTIAL_RENT_CUMUL;
        }
        
        if (localizedTitle.length() > 0) {
            localizedTitle =
                    EventHandlerBase.localizeString(this.context.getCurrentContext(),
                        localizedTitle, this.getClass().getName());
        } else {
            localizedTitle = value;
        }
        return localizedTitle;
    }
}
