package com.archibus.app.common.depreciation.impl;

import static com.archibus.app.common.depreciation.Constants.*;

import java.util.*;

import com.archibus.app.common.depreciation.dao.*;
import com.archibus.app.common.depreciation.dao.datasource.*;
import com.archibus.app.common.depreciation.domain.*;
import com.archibus.app.common.depreciation.service.*;
import com.archibus.app.common.finanal.dao.IFinancialAnalysisParametersDao;
import com.archibus.app.common.finanal.dao.datasource.FinancialAnalysisParametersDataSource;
import com.archibus.app.common.finanal.domain.FinancialAnalysisParameter;
import com.archibus.datasource.data.DataSet;
import com.archibus.jobmanager.JobBase;

/**
 * Depreciation Service implementation.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationService extends JobBase implements IDepreciationService {

    /**
     * Reference to custom data source used to load depreciable equipment.These references are set
     * by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IEquipmentDao<Equipment> equipmentDao;

    /**
     * Reference to custom data source used to load depreciable furniture.These references are set
     * by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IFurnitureDao<Furniture> furnitureDao;

    /**
     * Reference to custom data source used to load depreciation report.These references are set by
     * the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IDepreciationReportDao<DepreciationReport> depreciationReportDao;

    /**
     * Reference to custom data source used to load financial analysis parameter.These references
     * are set by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IFinancialAnalysisParametersDao<FinancialAnalysisParameter> financialParametersDao;

    /**
     * Reference to custom data source used to load property type.These references are set by the
     * Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private IPropertyTypeDao<PropertyType> propertyTypeDao;

    /** {@inheritDoc} */

    @Override
    public void updateDepreciation() {
        initPerRequestState();
        // start depreciation calculation job
        final DepreciationJob depreciationJob = new DepreciationJob();
        depreciationJob.setJobStatus(this.status);
        depreciationJob.setEquipmentDao(this.equipmentDao);
        depreciationJob.setFurnitureDao(this.furnitureDao);
        depreciationJob.calculateDepreciation();
    }

    /** {@inheritDoc} */

    @Override
    public void updateEquipmentDepreciation() {
        initPerRequestState();
        // start depreciation calculation job
        final DepreciationJob depreciationJob = new DepreciationJob();
        depreciationJob.setJobStatus(this.status);
        depreciationJob.setEquipmentDao(this.equipmentDao);
        depreciationJob.calculateEquipmentDepreciation();
    }

    /** {@inheritDoc} */

    @Override
    public void updateFurnitureDepreciation() {
        initPerRequestState();
        // start depreciation calculation job
        final DepreciationJob depreciationJob = new DepreciationJob();
        depreciationJob.setJobStatus(this.status);
        depreciationJob.setFurnitureDao(this.furnitureDao);
        depreciationJob.calculateFurnitureDepreciation();
    }

    /** {@inheritDoc} */

    @Override
    public void updateDepreciationForAssetType(final String assetType) {
        initPerRequestState();
        final DepreciationReport depreciationReport = this.depreciationReportDao.getActiveReport();
        updateDepreciationForAssetTypeAndReport(assetType, depreciationReport);
    }

    /** {@inheritDoc} */

    @Override
    public void updateDepreciationForAssetTypeAndReport(final String assetType,
            final String reportId) {
        initPerRequestState();
        final DepreciationReport depreciationReport =
                this.depreciationReportDao.getReportById(reportId);
        updateDepreciationForAssetTypeAndReport(assetType, depreciationReport);
    }

    /** {@inheritDoc} */

    @Override
    public double calculateDepreciationForFinParamAndPeriodAndTimeSpan(final int finParamId,
            final Date dateStart, final Date dateEnd, final String timeSpan) {
        initPerRequestState();
        final Map<Date, Double> depreciations = calculateDepreciationForFinParamPeriodAndTimeSpan(
            finParamId, dateStart, dateEnd, timeSpan);
        double depreciationValue = 0.0;
        final Iterator<Date> itDepreciation = depreciations.keySet().iterator();
        while (itDepreciation.hasNext()) {
            final Date depreciationDate = itDepreciation.next();
            final Double currentValue = depreciations.get(depreciationDate);
            depreciationValue = depreciationValue + currentValue;
        }
        return depreciationValue;
    }

    /** {@inheritDoc} */

    @Override
    public DataSet calculateDepreciationValuesForFinParamAndPeriodAndTimeSpan(final int finParamId,
            final Date dateStart, final Date dateEnd, final String timeSpan) {
        initPerRequestState();
        final Map<Date, Double> depreciations = calculateDepreciationForFinParamPeriodAndTimeSpan(
            finParamId, dateStart, dateEnd, timeSpan);
        return DepreciationServiceHelper.createDepreciationsDataSet(finParamId, depreciations);

    }

    /**
     * Calculate depreciation for financial parameter on time period with specified time span.
     *
     * @param finParamId financial parameter id
     * @param dateStart date start
     * @param dateEnd date end
     * @param timeSpan time span
     * @return Map<Date, Double>
     */
    private Map<Date, Double> calculateDepreciationForFinParamPeriodAndTimeSpan(
            final int finParamId, final Date dateStart, final Date dateEnd, final String timeSpan) {
        final FinancialAnalysisParameter financialParameter =
                this.financialParametersDao.getFinancialParameterById(finParamId);
        final PropertyType propertyType =
                this.propertyTypeDao.getPropertyTypeByName(financialParameter.getPropertyType());
        return DepreciationServiceHelper.calculateDepreciationForFinParamPeriodAndTimeSpan(
            financialParameter, propertyType, dateStart, dateEnd, timeSpan);
    }

    /**
     * Setter for the equipmentDao property.
     *
     * @see equipmentDao
     * @param equipmentDao the equipmentDao to set
     */

    public void setEquipmentDao(final IEquipmentDao<Equipment> equipmentDao) {
        this.equipmentDao = equipmentDao;
    }

    /**
     * Setter for the furnitureDao property.
     *
     * @see furnitureDao
     * @param furnitureDao the furnitureDao to set
     */

    public void setFurnitureDao(final IFurnitureDao<Furniture> furnitureDao) {
        this.furnitureDao = furnitureDao;
    }

    /**
     * Setter for the depreciationReportDao property.
     *
     * @see depreciationReportDao
     * @param depreciationReportDao the depreciationReportDao to set
     */

    public void setDepreciationReportDao(
            final IDepreciationReportDao<DepreciationReport> depreciationReportDao) {
        this.depreciationReportDao = depreciationReportDao;
    }

    /**
     * Update depreciation for asset type and depreciation report.
     *
     * @param assetType asset type
     * @param depreciationReport depreciation report
     */
    private void updateDepreciationForAssetTypeAndReport(final String assetType,
            final DepreciationReport depreciationReport) {
        final DepreciationJob depreciationJob = new DepreciationJob();
        depreciationJob.setEquipmentDao(this.equipmentDao);
        depreciationJob.setFurnitureDao(this.furnitureDao);

        if (EQ_TABLE.equals(assetType)) {
            depreciationJob.calculateEquipmentDepreciationForReport(depreciationReport);
        } else if (TA_TABLE.equals(assetType)) {
            depreciationJob.calculateFurnitureDepreciationForReport(depreciationReport);
        }
    }

    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        if (this.depreciationReportDao == null) {
            this.depreciationReportDao = new DepreciationReportDataSource();
        }
        if (this.equipmentDao == null) {
            this.equipmentDao = new EquipmentDataSource();
        }
        if (this.furnitureDao == null) {
            this.furnitureDao = new FurnitureDataSource();
        }
        if (this.financialParametersDao == null) {
            this.financialParametersDao = new FinancialAnalysisParametersDataSource();
        }
        if (this.propertyTypeDao == null) {
            this.propertyTypeDao = new PropertyTypeDataSource();
        }
    }

}
