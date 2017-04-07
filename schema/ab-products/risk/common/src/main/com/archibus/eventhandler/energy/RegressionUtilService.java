package com.archibus.eventhandler.energy;

import java.util.List;

import org.apache.commons.math.linear.*;
import org.apache.log4j.Logger;

import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * Performs all calculations needed to out put a regression model
 *
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */
public class RegressionUtilService {
    /**
     * Logger to write messages to archibus.log.
     */
    private static Logger log = Logger.getLogger(RegressionUtilService.class);

    /**
     * performLinearRegression performs an ordinary least squares linear regression
     *
     * @param X - the x value input Matrix
     * @param Y - the y value measurement vector
     * @return the resulting coefficient vector
     * @throws RuntimeException
     */
    public static RealVector performLinearRegression(final RealMatrix X, final RealVector Y)
            throws RuntimeException {
        RealVector B;
        RealMatrix t1;
        RealMatrix t2;
        final RealMatrix Xt = X.transpose();

        // the straightforward way is deprecated
        // B = Xt.multiply(X).inverse().multiply(Xt).operate(Y);

        // so here it goes all broken up
        t1 = Xt.multiply(X);

        // EJM V.21.1 - add error log when Singular Matrix error occurs
        // t2 = new LUDecompositionImpl(t1).getSolver().getInverse();
        // B = t2.multiply(Xt).operate(Y);]
        B = t1.getColumnVector(0);
        int vsum = 0;
        for (final double i : B.getData()) {
            vsum += i;
        }
        if (vsum == 0) {
            log.error("Matrix is singular.  Cannot continue regression.");
        } else {
            t2 = new LUDecompositionImpl(t1).getSolver().getInverse();
            B = t2.multiply(Xt).operate(Y);
        }

        return B;
    }

    /**
     * getResiduals calculates the residuals of a previous regression
     *
     * @param X - the x value input Matrix
     * @param Y - the y value measurement vector
     * @param B - the coefficient vector
     * @return the residuals vector
     * @throws RuntimeException
     */
    public static RealVector getResiduals(final RealMatrix X, final RealVector Y,
            final RealVector B) throws RuntimeException {
        RealVector E;
        E = Y.subtract(X.operate(B));

        return E;
    }

    /**
     * getVectorAbsMean returns the mean of the absolute values of the values in a vector
     *
     * @param E
     * @return the mean
     */
    public static double getVectorAbsMean(final RealVector E) {
        int i;
        double sum = 0.0;
        double mean = 0.0;

        for (i = 0; i < E.getDimension(); i++) {
            sum += Math.abs(E.getEntry(i));
        }

        if (E.getDimension() > 0.0) {
            mean = sum / E.getDimension();
        }

        return mean;

    }

    /**
     * getMeasurementVector builds a consumption or demand measurement vector for an heating or
     * cooling model regression
     *
     * @param series
     * @param measurementType
     * @return Calculated Vector
     */
    static RealVector getMeasurementVector(final List<DataRecord> series,
            final String measurementType) throws ExceptionBase {

        double[] vector;
        int index = 0;
        Double measurement;
        Double consumption;
        Double demand;
        if (series.size() < 8) {
            // @translatable
            final String msg1 =
                    "Inadequate data for regression, series size is less than 9 records long.";
            throw new ExceptionBase(msg1);
        }
        final Integer size = series.size();
        vector = new double[(int) Double.parseDouble(size.toString())];

        for (final DataRecord point : series) {
            consumption = Double
                .parseDouble(point.getValue("energy_bl_svc_period.consumption").toString());
            demand = Double.parseDouble(point.getValue("energy_bl_svc_period.demand").toString());

            if (measurementType.equals("CONSUMPTION")) {
                measurement = consumption;
            } else if (measurementType.equals("DEMAND")) {
                measurement = demand;
            } else {
                // @translatable
                final String msg1 = "Invalid regression parameter.";
                throw new ExceptionBase(msg1);
            }

            vector[index++] = measurement;
        }

        return new ArrayRealVector(vector);
    }

    /**
     * getDegreeDayMatrix builds a HDD/CDD/days Matrix for an heating or cooling model regression
     *
     * @param series
     * @param degreeDaysSelected
     * @return Calculated Matrix
     * @throws ExceptionBase
     */
    public static RealMatrix getDegreeDayMatrix(final List<DataRecord> series,
            final String degreeDaysSelected, final String measurementType) {

        double[][] matrix;
        int index = 0;
        double baseloadParam = 1.0;
        Double periodCdd;
        Double periodHdd;
        Double numDays;

        if (series.size() < 8) {
            // @translatable
            final String msg1 =
                    "Inadequate data for regression, series size is less than 9 records long.";
            throw new ExceptionBase(msg1);
        }

        if (degreeDaysSelected.equals("HDD_CDD")) {
            matrix = new double[series.size()][3];
        } else {
            matrix = new double[series.size()][2];
        }

        for (final DataRecord point : series) {
            Double.parseDouble(point.getValue("energy_bl_svc_period.period_oat").toString());
            periodCdd = Double
                .parseDouble(point.getValue("energy_bl_svc_period.period_cdd").toString());
            periodHdd = Double
                .parseDouble(point.getValue("energy_bl_svc_period.period_hdd").toString());
            numDays =
                    Double.parseDouble(point.getValue("energy_bl_svc_period.num_days").toString());

            if (measurementType.equals("DEMAND")) {
                baseloadParam = 1.0;
            } else {
                baseloadParam = numDays;
            }

            if (numDays < 1) {
                // @translatable
                final String msg1 = "Invalid period length, number of dates is less than 1. ";
                throw new ExceptionBase(msg1);
            }

            if (degreeDaysSelected.equals("HDD_CDD")) {
                matrix[index][0] = periodHdd;
                matrix[index][1] = periodCdd;
                matrix[index++][2] = baseloadParam;
            } else if (degreeDaysSelected.equals("HDD")) {
                matrix[index][0] = periodHdd;
                matrix[index++][1] = baseloadParam;
            } else if (degreeDaysSelected.equals("CDD")) {
                matrix[index][0] = periodCdd;
                matrix[index++][1] = baseloadParam;
            } else {
                // @translatable
                final String msg1 = "Invalid regression parameter.";
                throw new ExceptionBase(msg1);
            }
        }

        return new Array2DRowRealMatrix(matrix);
    }

    /**
     * Returns the Vector for day from the Matrix provided
     *
     * @param degreeDayMatrix
     * @return The Vector
     */
    static RealVector getDayVector(final RealMatrix degreeDayMatrix) {
        RealVector dayVector;

        dayVector = degreeDayMatrix.getColumnVector(degreeDayMatrix.getColumnDimension() - 1);
        return dayVector;
    }
}
