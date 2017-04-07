package com.archibus.eventhandler.energy;

/**
 * This Object holds values needed in the weather_model table.
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 *
 * 23.1 Modified to handle multiple bills per building per bill type per month
 * @author Eric Maxfield
 */
public class RegressionModelVOService {

    private String _buildingId;
    private String _vendorId;
    private String _vendorAccountId;
    private String _billId;
    private String _dataType;
    private String _timePeriod;
    private double _oatH1;
    private double _oatH2;
    private double _oatC1;
    private double _oatC2;
    private double _baseload;
    private double _heating;
    private double _cooling;
    private double _hddCoefficient;
    private double _cddCoefficient;
    private double _residualMean;
    private String _formula;
    
    public String getBuildingId() {
        return this._buildingId;
    }

    public void setBuildingId(final String buildingId) {
        this._buildingId = buildingId;
    }
    
    public String getVendorId() {
        return this._vendorId;
    }

    public void setVendorId(final String vendorId) {
        this._vendorId = vendorId;
    }

    public String getVendorAccountId() {
        return this._vendorAccountId;
    }

    public void setVendorAccountId(final String vendorAccountId) {
        this._vendorAccountId = vendorAccountId;
    }
    
    public String getBillId() {
        return this._billId;
    }

    public void setBillId(final String billId) {
        this._billId = billId;
    }

    public String getDataType() {
        return this._dataType;
    }

    public void setDataType(final String dataType) {
        this._dataType = dataType;
    }

    public String getTimePeriod() {
        return this._timePeriod;
    }

    public void setTimePeriod(final String timePeriod) {
        this._timePeriod = timePeriod;
    }

    public double getBaseload() {
        return this._baseload;
    }

    public void setBaseload(final double baseload) {
        this._baseload = baseload;
    }

    public double getHeating() {
        return this._heating;
    }

    public void setHeating(final double heating) {
        this._heating = heating;
    }

    public double getCooling() {
        return this._cooling;
    }

    public void setCooling(final double cooling) {
        this._cooling = cooling;
    }

    public double getOatH1() {
        return this._oatH1;
    }

    public void setOatH1(final double oatH1) {
        this._oatH1 = oatH1;
    }

    public double getOatH2() {
        return this._oatH2;
    }

    public void setOatH2(final double oatH2) {
        this._oatH2 = oatH2;
    }

    public double getOatC1() {
        return this._oatC1;
    }

    public void setOatC1(final double oatC1) {
        this._oatC1 = oatC1;
    }

    public double getOatC2() {
        return this._oatC2;
    }

    public void setOatC2(final double oatC2) {
        this._oatC2 = oatC2;
    }

    public double getHddCoefficient() {
        return this._hddCoefficient;
    }

    public void setHddCoefficient(final double hddCoefficient) {
        this._hddCoefficient = hddCoefficient;
    }

    public double getCddCoefficient() {
        return this._cddCoefficient;
    }

    public void setCddCoefficient(final double cddCoefficient) {
        this._cddCoefficient = cddCoefficient;
    }

    public double getResidualMean() {
        return this._residualMean;
    }

    public void setResidualMean(final double residualMean) {
        this._residualMean = residualMean;
    }

    public String getFormula() {
        return this._formula;
    }

    public void setFormula(final String formula) {
        this._formula = formula;
    }

}

