package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;
import org.apache.commons.math.linear.Array2DRowRealMatrix;
import org.apache.commons.math.linear.ArrayRealVector;
import org.apache.commons.math.linear.RealVector;


public class TestRegressionUtil extends DataSourceTestBase {

    public final void testPerformLinearRegression() {
        
        double[][] xvals = {{3.0,7.0},
                {0.0, 7.0},
                {1.0, 2.0},
                {7.0, 1.0},
                {5.0, 3.0},
                {2.0, 2.0}};
        double [] yvals = {83, 72, 28, 40, 55, 24};
                
        Array2DRowRealMatrix X = new Array2DRowRealMatrix(xvals);
        ArrayRealVector Y = new ArrayRealVector(yvals);
        
        try {
            RealVector B = RegressionUtilService.performLinearRegression(X, Y);
            //B.print(10, 2);
            assertNotNull("B", B);
            assertEquals(4.33, B.getEntry(0), 0.05);
            assertEquals(10.19, B.getEntry(1), 0.05);
        }
        catch (Exception e) {
            fail(e.getMessage());
        }
        
        
    }
    
    public final void testGetResiduals() {
        
        double[][] xvals = {{3.0,7.0},
                {0.0, 7.0},
                {1.0, 2.0},
                {7.0, 1.0},
                {5.0, 3.0},
                {2.0, 2.0}};
        double [] yvals = {83, 72, 28, 40, 55, 24};
                
        Array2DRowRealMatrix X = new Array2DRowRealMatrix(xvals);
        ArrayRealVector Y = new ArrayRealVector(yvals);
        
        try {
            RealVector B = RegressionUtilService.performLinearRegression(X, Y);
            assertNotNull("B", B);
            RealVector E = RegressionUtilService.getResiduals(X, Y, B);
            assertNotNull("E", E);
            assertEquals(-1.32, E.getEntry(0), 0.05);
            assertEquals(0.67, E.getEntry(1), 0.05);
            assertEquals(3.29, E.getEntry(2), 0.05);
            assertEquals(-0.5, E.getEntry(3), 0.05);
            assertEquals(2.78, E.getEntry(4), 0.05);
            assertEquals(-5.04, E.getEntry(5), 0.05);
        }
        catch (Exception e) {
            fail(e.getMessage());
        }
    }
    
    public final void testGetVectorAbsMean() {
        
        double[][] xvals = {{3.0,7.0},
                {0.0, 7.0},
                {1.0, 2.0},
                {7.0, 1.0},
                {5.0, 3.0},
                {2.0, 2.0}};
        double [] yvals = {83, 72, 28, 40, 55, 24};
                
        Array2DRowRealMatrix X = new Array2DRowRealMatrix(xvals);
        ArrayRealVector Y = new ArrayRealVector(yvals);
        
        try {
            RealVector B = RegressionUtilService.performLinearRegression(X, Y);
            assertNotNull("B", B);
            RealVector E = RegressionUtilService.getResiduals(X, Y, B);
            assertNotNull("E", E);
            double mean = RegressionUtilService.getVectorAbsMean(E);
            assertEquals(2.27, mean, 0.05);
        }
        catch (Exception e) {
            fail(e.getMessage());
        }
    }
}