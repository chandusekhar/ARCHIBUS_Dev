package com.archibus.eventhandler.energy;

import org.apache.commons.math.linear.RealVector;

/**
 * This object holds values for regressions
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class RegressionResultService {

    private RealVector _coeffs;

    private double _residualMean;

    public RegressionResultService(RealVector coeffs, double residualMean) {
        super();
        this._coeffs = coeffs;
        this._residualMean = residualMean;
    }

    public RealVector getCoeffs() {
        return this._coeffs;
    }

    public void setCoeffs(RealVector coeffs) {
        this._coeffs = coeffs;
    }

    public double getResidualMean() {
        return this._residualMean;
    }

    public void setResidualMean(double residualMean) {
        this._residualMean = residualMean;
    }

}
