package com.archibus.app.common.finanal.domain;

import java.util.Date;

import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Domain object for financial analysis parameters. Mapped to finanal_params database table
 *
 * <p>
 * Suppress Warning: PMD.TooManyFields, PMD.ExcessivePublicCount
 * <p>
 * Justification: this class represents a database record. Using nested classes will make code
 * difficult to understand.
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
@SuppressWarnings({ "PMD.TooManyFields", "PMD.ExcessivePublicCount" })
public class FinancialAnalysisParameter {
    /**
     * Parameter id.
     */
    private int parameterId;

    /**
     * Building code.
     */
    private String buildingCode;

    /**
     * Property code.
     */
    private String propertyCode;

    /**
     * Equipment code.
     */
    private String equipmentCode;

    /**
     * Project Code.
     */
    private String projectCode;

    /**
     * Property Type.
     */
    private String propertyType;

    /**
     * Purchase date.
     */
    private Date datePurchased;

    /**
     * Appreciation start date.
     */
    private Date dateApprecStart;

    /**
     * Loan start date.
     */
    private Date dateLoanStart;

    /**
     * Date Market Value Assessed.
     */
    private Date dateMarketVal;

    /**
     * Loan term.
     */
    private int loanTerm;

    /**
     * Planned life period.
     */
    private int plannedLife;

    /**
     * Sub loan.
     */
    private int subLoan;

    /**
     * Cost basis for building depreciation.
     */
    private double costBasisForDeprec;

    /**
     * Cost of land.
     */
    private double costOfLand;

    /**
     * Cost purchase.
     */
    private double costPurchase;

    /**
     * Loan amount.
     */
    private double loanAmount;

    /**
     * Loan down payment.
     */
    private double loanDownPayment;

    /**
     * Loan rate.
     */
    private double loanRate;

    /**
     * Appreciation rate.
     */
    private double rateApprec;

    /**
     * Market value.
     */
    private double valueMarket;

    /**
     * Asset type.
     */
    private AssetType assetType;

    /**
     * Asset id.
     */
    private String assetId;

    /**
     * Site id.
     */
    private String siteCode;

    /**
     * City code.
     */
    private String cityCode;

    /**
     * State code.
     */
    private String stateCode;

    /**
     * Countryu code.
     */
    private String ctryCode;

    /**
     * To log definition error if multiple assets are specified.
     */
    private String definitionError;

    /**
     * Getter for the parameterId property.
     *
     * @see parameterId
     * @return the parameterId property.
     */
    public int getParameterId() {
        return this.parameterId;
    }

    /**
     * Setter for the parameterId property.
     *
     * @see parameterId
     * @param parameterId the parameterId to set
     */

    public void setParameterId(final int parameterId) {
        this.parameterId = parameterId;
    }

    /**
     * Getter for the buildingCode property.
     *
     * @see buildingCode
     * @return the buildingCode property.
     */
    public String getBuildingCode() {
        return this.buildingCode;
    }

    /**
     * Setter for the buildingCode property.
     *
     * @see buildingCode
     * @param buildingCode the buildingCode to set
     */

    public void setBuildingCode(final String buildingCode) {
        this.buildingCode = buildingCode;
    }

    /**
     * Getter for the propertyCode property.
     *
     * @see propertyCode
     * @return the propertyCode property.
     */
    public String getPropertyCode() {
        return this.propertyCode;
    }

    /**
     * Setter for the propertyCode property.
     *
     * @see propertyCode
     * @param propertyCode the propertyCode to set
     */

    public void setPropertyCode(final String propertyCode) {
        this.propertyCode = propertyCode;
    }

    /**
     * Getter for the equipmentCode property.
     *
     * @see equipmentCode
     * @return the equipmentCode property.
     */
    public String getEquipmentCode() {
        return this.equipmentCode;
    }

    /**
     * Setter for the equipmentCode property.
     *
     * @see equipmentCode
     * @param equipmentCode the equipmentCode to set
     */

    public void setEquipmentCode(final String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    /**
     * Getter for the projectCode property.
     *
     * @see projectCode
     * @return the projectCode property.
     */
    public String getProjectCode() {
        return this.projectCode;
    }

    /**
     * Setter for the projectCode property.
     *
     * @see projectCode
     * @param projectCode the projectCode to set
     */

    public void setProjectCode(final String projectCode) {
        this.projectCode = projectCode;
    }

    /**
     * Getter for the propertyType property.
     *
     * @see propertyType
     * @return the propertyType property.
     */
    public String getPropertyType() {
        return this.propertyType;
    }

    /**
     * Setter for the propertyType property.
     *
     * @see propertyType
     * @param propertyType the propertyType to set
     */

    public void setPropertyType(final String propertyType) {
        this.propertyType = propertyType;
    }

    /**
     * Getter for the datePurchased property.
     *
     * @see datePurchased
     * @return the datePurchased property.
     */
    public Date getDatePurchased() {
        return this.datePurchased;
    }

    /**
     * Setter for the datePurchase property.
     *
     * @see datePurchased
     * @param datePurchased the datePurchased to set
     */

    public void setDatePurchased(final Date datePurchased) {
        this.datePurchased = datePurchased;
    }

    /**
     * Getter for the dateApprecStart property.
     *
     * @see dateApprecStart
     * @return the dateApprecStart property.
     */
    public Date getDateApprecStart() {
        return this.dateApprecStart;
    }

    /**
     * Setter for the dateApprecStart property.
     *
     * @see dateApprecStart
     * @param dateApprecStart the dateApprecStart to set
     */

    public void setDateApprecStart(final Date dateApprecStart) {
        this.dateApprecStart = dateApprecStart;
    }

    /**
     * Getter for the dateLoanStart property.
     *
     * @see dateLoanStart
     * @return the dateLoanStart property.
     */
    public Date getDateLoanStart() {
        return this.dateLoanStart;
    }

    /**
     * Setter for the dateLoanStart property.
     *
     * @see dateLoanStart
     * @param dateLoanStart the dateLoanStart to set
     */

    public void setDateLoanStart(final Date dateLoanStart) {
        this.dateLoanStart = dateLoanStart;
    }

    /**
     * Getter for the dateMarketVal property.
     *
     * @see dateMarketVal
     * @return the dateMarketVal property.
     */
    public Date getDateMarketVal() {
        return this.dateMarketVal;
    }

    /**
     * Setter for the dateMarketVal property.
     *
     * @see dateMarketVal
     * @param dateMarketVal the dateMarketVal to set
     */

    public void setDateMarketVal(final Date dateMarketVal) {
        this.dateMarketVal = dateMarketVal;
    }

    /**
     * Getter for the loanTerm property.
     *
     * @see loanTerm
     * @return the loanTerm property.
     */
    public int getLoanTerm() {
        return this.loanTerm;
    }

    /**
     * Setter for the loanTerm property.
     *
     * @see loanTerm
     * @param loanTerm the loanTerm to set
     */

    public void setLoanTerm(final int loanTerm) {
        this.loanTerm = loanTerm;
    }

    /**
     * Getter for the plannedLife property.
     *
     * @see plannedLife
     * @return the plannedLife property.
     */
    public int getPlannedLife() {
        return this.plannedLife;
    }

    /**
     * Setter for the plannedLife property.
     *
     * @see plannedLife
     * @param plannedLife the plannedLife to set
     */

    public void setPlannedLife(final int plannedLife) {
        this.plannedLife = plannedLife;
    }

    /**
     * Getter for the subLoan property.
     *
     * @see subLoan
     * @return the subLoan property.
     */
    public int getSubLoan() {
        return this.subLoan;
    }

    /**
     * Setter for the subLoan property.
     *
     * @see subLoan
     * @param subLoan the subLoan to set
     */

    public void setSubLoan(final int subLoan) {
        this.subLoan = subLoan;
    }

    /**
     * Getter for the costBasisForDeprec property.
     *
     * @see costBasisForDeprec
     * @return the costBasisForDeprec property.
     */
    public double getCostBasisForDeprec() {
        return this.costBasisForDeprec;
    }

    /**
     * Setter for the costBasisForDeprec property.
     *
     * @see costBasisForDeprec
     * @param costBasisForDeprec the costBasisForDeprec to set
     */

    public void setCostBasisForDeprec(final double costBasisForDeprec) {
        this.costBasisForDeprec = costBasisForDeprec;
    }

    /**
     * Getter for the costOfLand property.
     *
     * @see costOfLand
     * @return the costOfLand property.
     */
    public double getCostOfLand() {
        return this.costOfLand;
    }

    /**
     * Setter for the costOfLand property.
     *
     * @see costOfLand
     * @param costOfLand the costOfLand to set
     */

    public void setCostOfLand(final double costOfLand) {
        this.costOfLand = costOfLand;
    }

    /**
     * Getter for the costPurchase property.
     *
     * @see costPurchase
     * @return the costPurchase property.
     */
    public double getCostPurchase() {
        return this.costPurchase;
    }

    /**
     * Setter for the costPurchase property.
     *
     * @see costPurchase
     * @param costPurchase the costPurchase to set
     */

    public void setCostPurchase(final double costPurchase) {
        this.costPurchase = costPurchase;
    }

    /**
     * Getter for the loanAmount property.
     *
     * @see loanAmount
     * @return the loanAmount property.
     */
    public double getLoanAmount() {
        return this.loanAmount;
    }

    /**
     * Setter for the loanAmount property.
     *
     * @see loanAmount
     * @param loanAmount the loanAmount to set
     */

    public void setLoanAmount(final double loanAmount) {
        this.loanAmount = loanAmount;
    }

    /**
     * Getter for the loanDownPayment property.
     *
     * @see loanDownPayment
     * @return the loanDownPayment property.
     */
    public double getLoanDownPayment() {
        return this.loanDownPayment;
    }

    /**
     * Setter for the loanDownPayment property.
     *
     * @see loanDownPayment
     * @param loanDownPayment the loanDownPayment to set
     */

    public void setLoanDownPayment(final double loanDownPayment) {
        this.loanDownPayment = loanDownPayment;
    }

    /**
     * Getter for the loanRate property.
     *
     * @see loanRate
     * @return the loanRate property.
     */
    public double getLoanRate() {
        return this.loanRate;
    }

    /**
     * Setter for the loanRate property.
     *
     * @see loanRate
     * @param loanRate the loanRate to set
     */

    public void setLoanRate(final double loanRate) {
        this.loanRate = loanRate;
    }

    /**
     * Getter for the rateApprec property.
     *
     * @see rateApprec
     * @return the rateApprec property.
     */
    public double getRateApprec() {
        return this.rateApprec;
    }

    /**
     * Setter for the rateApprec property.
     *
     * @see rateApprec
     * @param rateApprec the rateApprec to set
     */

    public void setRateApprec(final double rateApprec) {
        this.rateApprec = rateApprec;
    }

    /**
     * Getter for the valueMarket property.
     *
     * @see valueMarket
     * @return the valueMarket property.
     */
    public double getValueMarket() {
        return this.valueMarket;
    }

    /**
     * Setter for the valueMarket property.
     *
     * @see valueMarket
     * @param valueMarket the valueMarket to set
     */

    public void setValueMarket(final double valueMarket) {
        this.valueMarket = valueMarket;
    }

    /**
     * Getter for the assetType property.
     *
     * @see assetType
     * @return the assetType property.
     */
    public AssetType getAssetType() {
        return this.assetType;
    }

    /**
     * Getter for the assetId property.
     *
     * @see assetId
     * @return the assetId property.
     */
    public String getAssetId() {
        return this.assetId;
    }

    /**
     * Getter for the definitionError property.
     *
     * @see definitionError
     * @return the definitionError property.
     */
    public String getDefinitionError() {
        return this.definitionError;
    }

    /**
     * Getter for the siteCode property.
     *
     * @see siteCode
     * @return the siteCode property.
     */
    public String getSiteCode() {
        return this.siteCode;
    }

    /**
     * Setter for the siteCode property.
     *
     * @see siteCode
     * @param siteCode the siteCode to set
     */

    public void setSiteCode(final String siteCode) {
        this.siteCode = siteCode;
    }

    /**
     * Getter for the cityCode property.
     *
     * @see cityCode
     * @return the cityCode property.
     */
    public String getCityCode() {
        return this.cityCode;
    }

    /**
     * Setter for the cityCode property.
     *
     * @see cityCode
     * @param cityCode the cityCode to set
     */

    public void setCityCode(final String cityCode) {
        this.cityCode = cityCode;
    }

    /**
     * Getter for the stateCode property.
     *
     * @see stateCode
     * @return the stateCode property.
     */
    public String getStateCode() {
        return this.stateCode;
    }

    /**
     * Setter for the stateCode property.
     *
     * @see stateCode
     * @param stateCode the stateCode to set
     */

    public void setStateCode(final String stateCode) {
        this.stateCode = stateCode;
    }

    /**
     * Getter for the ctryCode property.
     *
     * @see ctryCode
     * @return the ctryCode property.
     */
    public String getCtryCode() {
        return this.ctryCode;
    }

    /**
     * Setter for the ctryCode property.
     *
     * @see ctryCode
     * @param ctryCode the ctryCode to set
     */

    public void setCtryCode(final String ctryCode) {
        this.ctryCode = ctryCode;
    }

    /**
     * Check parameter definition. Check order: building, property, project and equipment.
     */
    public void checkParameterDefinition() {
        boolean isUndefined = true;
        if (StringUtil.notNullOrEmpty(this.buildingCode)) {
            this.assetType = AssetType.BUILDING;
            this.assetId = this.buildingCode;
            isUndefined = false;
        }

        if (StringUtil.notNullOrEmpty(this.propertyCode)) {
            if (isUndefined) {
                this.assetType = AssetType.PROPERTY;
                this.assetId = this.propertyCode;
                isUndefined = false;
            } else {
                this.definitionError = "Multiple assets defined (property code)";
            }
        }

        if (StringUtil.notNullOrEmpty(this.projectCode)) {
            if (isUndefined) {
                this.assetType = AssetType.PROJECT;
                this.assetId = this.projectCode;
                isUndefined = false;
            } else {
                this.definitionError = "Multiple assets defined (project code)";
            }
        }

        if (StringUtil.notNullOrEmpty(this.equipmentCode)) {
            if (isUndefined) {
                this.assetType = AssetType.EQUIPMENT;
                this.assetId = this.equipmentCode;
                isUndefined = false;
            } else {
                this.definitionError = "Multiple assets defined (equipment code)";
            }
        }

    }

    /**
     * Read asset location for financial parameter.
     *
     */
    public void getAssetLocation() {
        if (AssetType.BUILDING.equals(this.assetType)) {
            getAssetLocationForBuilding(this.assetId);
        } else if (AssetType.PROPERTY.equals(this.assetType)) {
            getAssetLocationForProperty(this.assetId);
        } else if (AssetType.PROJECT.equals(this.assetType)) {
            getAssetLocationForProject(this.assetId);
        } else if (AssetType.EQUIPMENT.equals(this.assetType)) {
            getAssetLocationForEquipment(this.assetId);
        }

    }

    /**
     * Get asset location from building table.
     *
     * @param buildingId building code
     */
    public void getAssetLocationForBuilding(final String buildingId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DbConstants.BUILDING_TABLE,
                    new String[] { DbConstants.BL_ID, DbConstants.PR_ID, DbConstants.SITE_ID,
                            DbConstants.CITY_ID, DbConstants.STATE_ID, DbConstants.CTRY_ID });
        dataSource.addRestriction(
            Restrictions.eq(DbConstants.BUILDING_TABLE, DbConstants.BL_ID, buildingId));
        final DataRecord record = dataSource.getRecord();
        setBuildingCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.BL_ID));
        setPropertyCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.PR_ID));
        setSiteCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.SITE_ID));
        setCityCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.CITY_ID));
        setStateCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.STATE_ID));
        setCtryCode(
            record.getString(DbConstants.BUILDING_TABLE + DbConstants.DOT + DbConstants.CTRY_ID));
    }

    /**
     * Get asset location from building table.
     *
     * @param propertyId property code
     */
    public void getAssetLocationForProperty(final String propertyId) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(
            DbConstants.PROPERTY_TABLE, new String[] { DbConstants.PR_ID, DbConstants.SITE_ID,
                    DbConstants.CITY_ID, DbConstants.STATE_ID, DbConstants.CTRY_ID });
        dataSource.addRestriction(
            Restrictions.eq(DbConstants.PROPERTY_TABLE, DbConstants.PR_ID, propertyId));
        final DataRecord record = dataSource.getRecord();
        setPropertyCode(
            record.getString(DbConstants.PROPERTY_TABLE + DbConstants.DOT + DbConstants.PR_ID));
        setSiteCode(
            record.getString(DbConstants.PROPERTY_TABLE + DbConstants.DOT + DbConstants.SITE_ID));
        setCityCode(
            record.getString(DbConstants.PROPERTY_TABLE + DbConstants.DOT + DbConstants.CITY_ID));
        setStateCode(
            record.getString(DbConstants.PROPERTY_TABLE + DbConstants.DOT + DbConstants.STATE_ID));
        setCtryCode(
            record.getString(DbConstants.PROPERTY_TABLE + DbConstants.DOT + DbConstants.CTRY_ID));
    }

    /**
     * Get asset location from building table.
     *
     * @param siteId site code
     */
    public void getAssetLocationForSite(final String siteId) {
        final DataSource dataSource = DataSourceFactory
            .createDataSourceForFields(DbConstants.SITE_TABLE, new String[] { DbConstants.SITE_ID,
                    DbConstants.CITY_ID, DbConstants.STATE_ID, DbConstants.CTRY_ID });
        dataSource
            .addRestriction(Restrictions.eq(DbConstants.SITE_TABLE, DbConstants.SITE_ID, siteId));
        final DataRecord record = dataSource.getRecord();
        setSiteCode(
            record.getString(DbConstants.SITE_TABLE + DbConstants.DOT + DbConstants.SITE_ID));
        setCityCode(
            record.getString(DbConstants.SITE_TABLE + DbConstants.DOT + DbConstants.CITY_ID));
        setStateCode(
            record.getString(DbConstants.SITE_TABLE + DbConstants.DOT + DbConstants.STATE_ID));
        setCtryCode(
            record.getString(DbConstants.SITE_TABLE + DbConstants.DOT + DbConstants.CTRY_ID));
    }

    /**
     * Get asset location for project.
     *
     * @param projectId project code
     */
    public void getAssetLocationForProject(final String projectId) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(
            DbConstants.PROJECT_TABLE, new String[] { DbConstants.PROJECT_ID, DbConstants.SITE_ID,
                    DbConstants.BL_ID, DbConstants.PR_ID });
        dataSource.addRestriction(
            Restrictions.eq(DbConstants.PROJECT_TABLE, DbConstants.PROJECT_ID, projectId));
        final DataRecord record = dataSource.getRecord();
        final String blId =
                record.getString(DbConstants.PROJECT_TABLE + DbConstants.DOT + DbConstants.BL_ID);
        final String prId =
                record.getString(DbConstants.PROJECT_TABLE + DbConstants.DOT + DbConstants.PR_ID);
        final String siteId =
                record.getString(DbConstants.PROJECT_TABLE + DbConstants.DOT + DbConstants.SITE_ID);

        if (StringUtil.notNullOrEmpty(blId)) {
            getAssetLocationForBuilding(blId);
        } else if (StringUtil.notNullOrEmpty(prId)) {
            getAssetLocationForProperty(prId);
        } else if (StringUtil.notNullOrEmpty(siteId)) {
            getAssetLocationForSite(siteId);
        }
    }

    /**
     * Get asset location for equipment.
     *
     * @param eqId equipment code
     */
    public void getAssetLocationForEquipment(final String eqId) {
        final DataSource dataSource = DataSourceFactory
            .createDataSourceForFields(DbConstants.EQ_TABLE, new String[] { DbConstants.EQ_ID,
                    DbConstants.SITE_ID, DbConstants.BL_ID, DbConstants.PR_ID });
        dataSource.addRestriction(Restrictions.eq(DbConstants.EQ_TABLE, DbConstants.EQ_ID, eqId));
        final DataRecord record = dataSource.getRecord();
        final String blId =
                record.getString(DbConstants.EQ_TABLE + DbConstants.DOT + DbConstants.BL_ID);
        final String prId =
                record.getString(DbConstants.EQ_TABLE + DbConstants.DOT + DbConstants.PR_ID);
        final String siteId =
                record.getString(DbConstants.EQ_TABLE + DbConstants.DOT + DbConstants.SITE_ID);
        if (StringUtil.notNullOrEmpty(blId)) {
            getAssetLocationForBuilding(blId);
        } else if (StringUtil.notNullOrEmpty(prId)) {
            getAssetLocationForProperty(prId);
        } else if (StringUtil.notNullOrEmpty(siteId)) {
            getAssetLocationForSite(siteId);
        }
    }
}
