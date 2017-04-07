package com.archibus.service.common.report.pdf;

/**
 *
 * Provides scale information.
 *
 * Used by DisplayInfo.java.
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public class ScaleInfo {
    /**
     * scaleDisplayNames.
     */
    private String[] scaleDisplayNames = Constants.SCALE_IMPERIAL;

    /**
     * scaleFactors.
     */
    private double[] scaleFactors = Constants.SCALES_FACTORS_IMPERIAL;

    /**
     * scaleDisplayPattern.
     */
    private String scaleDisplayPattern = Constants.SCALE_DISPLAYED_PATTERN_IMPERIAL;

    /**
     * pointConversionFactor.
     */
    private transient double pointConversionFactor = Constants.INCHE_TO_POINTS;

    /**
     * scaleBarNumbers.
     */
    private transient String[] scaleBarNumbers = Constants.SCALE_BAR_IMPERIAL;

    /**
     * unit.
     */
    private String unit = Constants.IMPERIAL;

    /**
     *
     * Initializes.
     *
     * @param unitName unit name.
     * @param baseUnitName base unit name.
     */
    public void init(final String unitName, final String baseUnitName) {
        this.setUnit(unitName);
        if (Constants.METRIC.equalsIgnoreCase(unitName)) {
            this.scaleDisplayNames = Constants.SCALE_METRIC;
            
            this.scaleFactors = Constants.SCALES_FACTORS_METRIC;
            
            this.scaleDisplayPattern = Constants.SCALE_DISPLAYED_PATTERN_METRIC;
            
            this.scaleBarNumbers = Constants.SCALE_BAR_METRIC;
            
            if ("centimeters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.CM_TO_POINTS;
            } else if ("millimeters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.MM_TO_POINTS;
            } else if ("meters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.M_TO_POINTS;
            }
        }
    }
    
    /**
     *
     * Gets ScaleDisplayNames.
     *
     * @return String[].
     */
    public String[] getScaleDisplayNames() {
        return this.scaleDisplayNames.clone();
    }

    /**
     *
     * Sets ScaleDisplayNames.
     *
     * @param scaleDisplayNames .
     */
    public void setScaleDisplayNames(final String[] scaleDisplayNames) {
        this.scaleDisplayNames = scaleDisplayNames.clone();
    }

    /**
     *
     * Gets ScaleFactors.
     *
     * @return double[].
     */
    public double[] getScaleFactors() {
        return this.scaleFactors.clone();
    }

    /**
     *
     * Sets ScaleFactors.
     *
     * @param scaleFactors double[].
     */
    public void setScaleFactors(final double[] scaleFactors) {
        this.scaleFactors = scaleFactors.clone();
    }

    /**
     *
     * Gets ScaleDisplayPattern.
     *
     * @return String.
     */
    public String getScaleDisplayPattern() {
        return this.scaleDisplayPattern;
    }

    /**
     *
     * Sets ScaleDisplayPattern.
     *
     * @param scaleDisplayPattern String.
     */
    public void setScaleDisplayPattern(final String scaleDisplayPattern) {
        this.scaleDisplayPattern = scaleDisplayPattern;
    }

    /**
     *
     * Gets PointConversionFactor.
     *
     * @return double.
     */
    public double getPointConversionFactor() {
        return this.pointConversionFactor;
    }

    /**
     *
     * Sets PointConversionFactor.
     *
     * @param pointConversionFactor double.
     */
    public void setPointConversionFactor(final double pointConversionFactor) {
        this.pointConversionFactor = pointConversionFactor;
    }

    /**
     *
     * Gets ScaleBarNumbers.
     *
     * @return String[].
     */
    public String[] getScaleBarNumbers() {
        return this.scaleBarNumbers.clone();
    }

    /**
     *
     * Sets ScaleBarNumbers.
     *
     * @param scaleBarNumbers String[] .
     */
    public void setScaleBarNumbers(final String[] scaleBarNumbers) {
        this.scaleBarNumbers = scaleBarNumbers.clone();
    }

    /**
     *
     * TGets Unit.
     *
     * @return unit name.
     */
    public String getUnit() {
        return this.unit;
    }

    /**
     *
     * Sets tUnit.
     *
     * @param unit name.
     */
    public void setUnit(final String unit) {
        this.unit = unit;
    }
}
