package com.archibus.eventhandler.AssetDepreciation;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;

public class AssetService extends JobBase {
    private String assetFields;
    
    private String sqlLeaseRest;
    
    private String assetFromWhereStmt;
    
    private String dateReceivedFld;
    
    private String costPurchaseFld;
    
    private String reportFromWhereStmt;
    
    private String reportId;
    
    private Date dateReceived;
    
    private Date lastDate;
    
    private String depMethod;
    
    private double depLife;
    
    private String assetTable;
    
    private int monthsBetweenAssetReceiptAndReport;
    
    private String assetId;
    
    private double valSalvage;
    
    private double costOriginal;
    
    public void calculateEquipmentDepreciation() {
        if (!this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STARTED);
            this.calculateDepreciation("eq");
            this.status.setCode(JobStatus.JOB_COMPLETE);
        } else {
            this.status.setCode(JobStatus.JOB_STOPPED);
        }
    }
    
    public void calculateTaggedFurnitureDepreciation() {
        if (!this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STARTED);
            this.calculateDepreciation("ta");
            this.status.setCode(JobStatus.JOB_COMPLETE);
        } else {
            this.status.setCode(JobStatus.JOB_STOPPED);
        }
    }
    
    /*
     * Adds records to the appropriate asset depreciation table (eq_dep, ta_dep) for each report
     * which is active in the dep_reports table. Only assets which have a ta.date_delivery,
     * eq.date_installed and which have a ta.value_original, eq.cost_purchase, and which are not
     * leased, are depreciated. For each report, only those assets, which have a depreciation period
     * into which the reports date falls, are used. Each asset has a property type; each property
     * type has a depreciation method and period.
     */
    
    private void calculateDepreciation(final String assetTable) {
        
        // establish SQL parameters
        
        this.assetTable = assetTable;
        if (this.assetTable.equals("ta")) {
            this.dateReceivedFld = "date_delivery";
            this.costPurchaseFld = "value_original";
            this.assetFields =
                    "ta_id, " + this.dateReceivedFld + "," + this.costPurchaseFld
                    + ",value_salvage , deprec_method, deprec_period";
            this.sqlLeaseRest = " AND ta_lease_id IS NULL";
        } else {
            this.dateReceivedFld = "date_installed";
            this.costPurchaseFld = "cost_purchase";
            this.assetFields =
                    "eq_id," + this.dateReceivedFld + "," + this.costPurchaseFld
                    + ",value_salvage , deprec_method , deprec_period";
            this.sqlLeaseRest = " AND ta_lease_id IS NULL";
        }
        
        this.assetFromWhereStmt =
                " FROM " + this.assetTable + ", property_type" + " WHERE " + this.assetTable
                + ".property_type = " + " property_type.property_type" + " AND "
                + this.dateReceivedFld + " IS NOT NULL" + " AND " + this.costPurchaseFld
                + " > 0.0" + this.sqlLeaseRest;
        
        this.reportFromWhereStmt = " FROM dep_reports WHERE active = 'yes'";
        
        // delete all records from depreciation table
        // KB 3026381 CM 03/10/2010 delete only information that belongs to active logs
        final String sqlQuery =
                "DELETE FROM "
                        + this.assetTable
                        + "_dep WHERE "
                        + this.assetTable
                        + "_dep.report_id IN (SELECT report_id FROM dep_reports WHERE dep_reports.active = 'yes')";
        
        SqlUtils.executeUpdate(this.assetTable + "_dep", sqlQuery);
        
        final DataSource dsRep = DataSourceFactory.createDataSource();
        dsRep.addTable("dep_reports");
        dsRep.addField("report_id");
        dsRep.addField("last_date");
        dsRep.addQuery("SELECT report_id, last_date " + this.reportFromWhereStmt,
            SqlExpressions.DIALECT_GENERIC);
        final List<DataRecord> recsRep = dsRep.getAllRecords();
        
        final DataSource dsAsset = DataSourceFactory.createDataSource();
        dsAsset.addTable(this.assetTable);
        dsAsset.addTable("property_type", DataSource.ROLE_STANDARD);
        dsAsset.addField(this.assetTable == "eq" ? "eq_id" : "ta_id");
        dsAsset.addField(this.dateReceivedFld);
        dsAsset.addField(this.costPurchaseFld);
        dsAsset.addField("value_salvage");
        dsAsset.addField("property_type", "deprec_method");
        dsAsset.addField("property_type", "deprec_period");
        
        dsAsset.addQuery("SELECT " + this.assetFields + this.assetFromWhereStmt,
            SqlExpressions.DIALECT_GENERIC);
        final List<DataRecord> recsAsset = dsAsset.getAllRecords();
        
        for (final DataRecord recRep : recsRep) {
            
            this.reportId = recRep.getString("dep_reports.report_id");
            this.lastDate = recRep.getDate("dep_reports.last_date");
            
            for (final DataRecord recAsset : recsAsset) {
                
                this.dateReceived = recAsset.getDate(this.assetTable + "." + this.dateReceivedFld);
                this.depMethod = recAsset.getString("property_type.deprec_method");
                this.depLife = recAsset.getInt("property_type.deprec_period");
                
                this.assetId = recAsset.getString(this.assetTable + "." + this.assetTable + "_id");
                
                this.monthsBetweenAssetReceiptAndReport =
                        this.getDatesDiff(this.lastDate, this.dateReceived);
                
                if (this.monthsBetweenAssetReceiptAndReport > 0
                        && ((this.depLife >= this.monthsBetweenAssetReceiptAndReport) || this.depMethod
                                .equals("PCT"))) {
                    
                    this.costOriginal =
                            recAsset.getDouble(this.assetTable + "." + this.costPurchaseFld);
                    this.valSalvage = recAsset.getDouble(this.assetTable + ".value_salvage");
                    this.createAssetDepreciationRecord();
                }
            }
        }
    }
    
    /*
     * Calculates Depreciation for asset and inserts a record into depreciation table
     */
    private void createAssetDepreciationRecord() {
        
        StringBuilder sqlStatement;
        double currentDep = 0;
        double accumDep = 0;
        double currentValue;
        // SL
        if (this.depMethod.equals("SL")) {
            currentDep = (this.costOriginal - this.valSalvage) / this.depLife;
            accumDep = currentDep * this.monthsBetweenAssetReceiptAndReport;
        }
        // DDB
        /**
         * double-declining-balance method. To illustrate, suppose a business has an asset with
         * $1,000 Original Cost, $100 Salvage Value, and 5 years useful life. First, calculate
         * straight-line depreciation rate. Since the asset has 5 years useful life, the
         * straight-line depreciation rate equals (100% / 5) 20% per year. With
         * double-declining-balance method, as the name suggests, double that rate, or 40%
         * depreciation rate is used.
         *
         * http://en.wikipedia.org/wiki/Depreciation
         */
        /*
         * 03/11/2010 IOAN KB 3026385 check is the asset is depreciated earlier than is supposed. In
         * this case depreciation record is not created for current depreciation log
         */
        else if (this.depMethod.equals("DDB")) {
            // dep factor % = (100 % / depLife ) * 2
            double crtCostOriginal = 0;
            crtCostOriginal = this.costOriginal;
            for (int i = 1; i <= this.monthsBetweenAssetReceiptAndReport; i++) {
                currentDep = (crtCostOriginal / this.depLife) * 2;
                if (i < this.monthsBetweenAssetReceiptAndReport
                        && crtCostOriginal - currentDep < this.valSalvage) {
                    // asset is depreciated earlier that is supposed
                    // exit without creating depreciation record
                    return;
                }
                // check last month depreciation
                if (i == this.monthsBetweenAssetReceiptAndReport
                        && crtCostOriginal - currentDep < this.valSalvage
                        && crtCostOriginal - this.valSalvage <= currentDep) {
                    currentDep = crtCostOriginal - this.valSalvage;
                }
                crtCostOriginal = crtCostOriginal - currentDep;
                accumDep += currentDep;
            }
        }
        // SYD
        /**
         * Sum-of-Years' Digits is a depreciation method that results in a more accelerated
         * write-off than straight line, but less than declining-balance method. Under this method
         * annual depreciation is determined by multiplying the Depreciable Cost by a schedule of
         * fractions. Depreciable Cost = Original Cost - Salvage Value Book Value = Original Cost -
         * Accumulated Depreciation Example: If an asset has Original Cost $1000, a useful life of 5
         * years and a Salvage Value of $100, compute its depreciation schedule. First, determine
         * Years' digits. Since the asset has useful life of 5 years, the Years' digits are: 5, 4,
         * 3, 2, and 1. Next, calculate the sum of the digits. 5+4+3+2+1=15 Depreciation rates are
         * as follows: 5/15 for the 1st year, 4/15 for the 2nd year, 3/15 for the 3rd year, 2/15 for
         * the 4th year, and 1/15 for the 5th year.
         *
         * http://en.wikipedia.org/wiki/Depreciation
         */
        else if (this.depMethod.equals("SYD")) {
            double sumMonthDigits = 0;
            double crtCostOriginal = 0;
            crtCostOriginal = this.costOriginal;
            for (int i = 1; i <= this.depLife; i++) {
                sumMonthDigits = sumMonthDigits + i;
            }
            for (int i = 1; i <= this.monthsBetweenAssetReceiptAndReport; i++) {
                currentDep =
                        (this.costOriginal - this.valSalvage) * (this.depLife - i + 1)
                        / sumMonthDigits;
                crtCostOriginal = crtCostOriginal - currentDep;
                accumDep += currentDep;
            }
        }
        // PCT
        else if (this.depMethod.equals("PCT")) {
            currentDep = -(this.costOriginal * (this.depLife / 100)) / 12;
            accumDep = this.monthsBetweenAssetReceiptAndReport * currentDep;
            
        }
        
        currentValue = (this.costOriginal - accumDep) < 0.0001 ? 0 : (this.costOriginal - accumDep);
        
        // insert statement
        /*
         * KB 3027826 numeric value muste be send as numbers implicit conversion crash on oracle
         */
        sqlStatement = new StringBuilder("insert into ");
        sqlStatement.append(this.assetTable + "_dep ");
        sqlStatement.append("( report_id, " + this.assetTable
            + "_id, value_current_dep, value_accum_dep, value_current) values ");
        sqlStatement.append("( '" + this.reportId + "', '" + this.assetId + "' ," + currentDep
            + " ," + accumDep + " ," + currentValue + ")");
        SqlUtils.executeUpdate(this.assetTable + "_dep", sqlStatement.toString());
        
        // update asset table
        // KB 3050633 update using data record - to trigger data change event listener
        if ("ta".equals(this.assetTable)) {
            final DataSource dataSource =
                    DataSourceFactory.createDataSourceForFields("ta", new String[] { "ta_id",
                    "value_salvage" });
            dataSource.addRestriction(Restrictions.eq("ta", "ta_id", this.assetId));
            final DataRecord record = dataSource.getRecord();
            record.setValue("ta.value_salvage", currentValue);
            dataSource.updateRecord(record);
        } else {
            final DataSource dataSource =
                    DataSourceFactory.createDataSourceForFields("eq", new String[] { "eq_id",
                    "cost_dep_value" });
            dataSource.addRestriction(Restrictions.eq("eq", "eq_id", this.assetId));
            final DataRecord record = dataSource.getRecord();
            record.setValue("eq.cost_dep_value", currentValue);
            dataSource.updateRecord(record);
        }
        
    }
    
    /*
     * get the number of months between last report date and date received of an asset
     */
    
    private int getDatesDiff(final Date lastDate, final Date receivedDate) {
        int monthDiff = 0;
        final Calendar cLastDate = Calendar.getInstance();
        cLastDate.setTime(lastDate);
        
        final Calendar cDateReceived = Calendar.getInstance();
        cDateReceived.setTime(receivedDate);
        
        monthDiff = (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH));
        if (monthDiff < 0) {
            monthDiff =
                    (cLastDate.get(Calendar.YEAR) - cDateReceived.get(Calendar.YEAR) - 1)
                    * 12
                    + (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH) + 12);
        } else {
            
            monthDiff =
                    (cLastDate.get(Calendar.YEAR) - cDateReceived.get(Calendar.YEAR)) * 12
                    + (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH));
        }
        return monthDiff;
    }
}
