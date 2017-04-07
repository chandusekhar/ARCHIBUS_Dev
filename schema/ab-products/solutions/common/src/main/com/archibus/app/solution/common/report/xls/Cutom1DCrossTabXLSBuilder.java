package com.archibus.app.solution.common.report.xls;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.data.*;
import com.archibus.ext.report.xls.*;

/**
 * A simple customized 1D cross-tab XLS Build to add statistics info for numeric fields. Run its
 * JUnit test and check the XLS report file under WebCentral/projects/users/afm.
 *
 * @author Yong Shao
 *
 */
public class Cutom1DCrossTabXLSBuilder extends CrossTab1DBuilder {
    /**
     * Overwrite Group By Field Title.
     */
    /** {@inheritDoc} */
    @Override
    public void writeGroupByFieldTitle(final int row, final int column, final String title,
            final XlsBuilder.Color color) {
        writeFieldTitle(row, column, "GroupBy: " + title, color);
    }

    /**
     * Overwrite calculated Field Title.
     */
    /** {@inheritDoc} */
    @Override
    public void writeCalculatedFieldTitle(final int row, final int column, final String title) {
        writeFieldTitle(row, column, "Calculated: " + title, this.rowHeaderColoring);
    }

    /**
     * Add a total row at the bottom of XLS sheet.
     */
    /** {@inheritDoc} */
    @Override
    public void addCustomTotalRow(final int totalRows, final int totalColumns,
            final List<Map<String, Object>> calculatedFields, final DataSet dataset) {
        final int row = totalRows;
        final DataSet1D dataSet1D = (DataSet1D) dataset;
        final org.json.JSONArray totalValuesArray = dataSet1D.getTotals();
        final JSONObject totalValues = (JSONObject) totalValuesArray.get(0);
        final JSONObject totalValue = (JSONObject) totalValues.get("wr.total_requests");

        for (int i = 0; i < calculatedFields.size(); i++) {
            addCustomTotalColumn(row, 1 + i, Double.valueOf(totalValue.getString("n")), 2);
        }
    }
}
