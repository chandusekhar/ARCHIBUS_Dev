package com.archibus.app.common.depreciation.impl;

import java.util.*;

import com.archibus.app.common.depreciation.Constants;
import com.archibus.app.common.depreciation.domain.*;
import com.archibus.app.common.depreciation.functions.DepreciationUtils;
import com.archibus.app.common.depreciation.functions.DepreciationUtils.CalculationMethod;
import com.archibus.app.common.finanal.domain.FinancialAnalysisParameter;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;

/**
 *
 * Utility class. Provides methods to calculate asset depreciation.
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class DepreciationServiceHelper {

    /**
     * Constant.
     */
    private static final int ONE_HUNDRED = 100;

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DepreciationServiceHelper() {

    }

    /**
     * Calculate equipment depreciation.
     *
     * @param equipment {@link Equipment}
     * @param propertyType {@link PropertyType}
     * @param report {@link DepreciationReport}
     * @return {@link EquipmentDepreciation}
     */
    public static EquipmentDepreciation calculateEquipmentDepreciation(final Equipment equipment,
            final PropertyType propertyType, final DepreciationReport report) {
        final EquipmentDepreciation equipmentDepreciation = calculateEquipmentDepreciation(
            equipment, propertyType, report.getLastDate(), Constants.TIME_SPAN_MONTH);
        equipmentDepreciation.setReportId(report.getReportId());
        return equipmentDepreciation;

    }

    /**
     * Calculate equipment depreciation for calculation date using a monthly time span.
     *
     * @param equipment {@link Equipment}
     * @param propertyType {@link PropertyType}
     * @param calculationDate calculation date
     * @param timeSpan calculation time span
     * @return {@link EquipmentDepreciation}
     */
    public static EquipmentDepreciation calculateEquipmentDepreciation(final Equipment equipment,
            final PropertyType propertyType, final Date calculationDate, final String timeSpan) {
        final CalculationMethod calculationMethod =
                CalculationMethod.fromString(propertyType.getDeprecMethod());
        final EquipmentDepreciation equipmentDepreciation =
                new EquipmentDepreciation(equipment.getEqId(), null);
        final int totalPeriods = DepreciationDatesHelper
            .getDepreciationLifeTime(propertyType.getDeprecPeriod(), timeSpan);
        final int calendarField =
                Constants.TIME_SPAN_YEAR.equals(timeSpan) ? Calendar.YEAR : Calendar.MONTH;
        final int currentPeriod = DepreciationDatesHelper.getDateDiff(calendarField,
            equipment.getDateInstalled(), calculationDate);
        final double purchasePrice = equipment.getCostPurchase();
        final double salvageValue = equipment.getValueSalvage();
        final double currentDepreciation = calculateCurrentDepreciation(calculationMethod,
            currentPeriod, totalPeriods, purchasePrice, salvageValue);
        final double accumulatedDepreciation = calculateAccumulatedDepreciation(calculationMethod,
            currentPeriod, totalPeriods, purchasePrice, salvageValue);
        final double currentValue = (equipment.getCostPurchase() - accumulatedDepreciation < 0)
                ? 0.0 : equipment.getCostPurchase() - accumulatedDepreciation;

        equipmentDepreciation.setValueCurrentDep(currentDepreciation);
        equipmentDepreciation.setValueAccumDep(accumulatedDepreciation);
        equipmentDepreciation.setValueCurrent(currentValue);
        return equipmentDepreciation;
    }

    /**
     * Calculate furniture depreciation.
     *
     * @param furniture {@link Furniture}
     * @param propertyType {@link PropertyType}
     * @param report {@link DepreciationReport}
     * @return {@link FurnitureDepreciation}
     */
    public static FurnitureDepreciation calculateFurnitureDepreciation(final Furniture furniture,
            final PropertyType propertyType, final DepreciationReport report) {
        final FurnitureDepreciation furnitureDepreciation = calculateFurnitureDepreciation(
            furniture, propertyType, report.getLastDate(), Constants.TIME_SPAN_MONTH);
        furnitureDepreciation.setReportId(report.getReportId());
        return furnitureDepreciation;
    }

    /**
     * Calculate furniture depreciation for calculation date using a monthly time span.
     *
     * @param furniture {@link Furniture}
     * @param propertyType {@link PropertyType}
     * @param calculationDate calculation date
     * @param timeSpan calculation time span
     * @return {@link FurnitureDepreciation}
     */
    public static FurnitureDepreciation calculateFurnitureDepreciation(final Furniture furniture,
            final PropertyType propertyType, final Date calculationDate, final String timeSpan) {
        final CalculationMethod calculationMethod =
                CalculationMethod.fromString(propertyType.getDeprecMethod());
        final FurnitureDepreciation furnitureDepreciation =
                new FurnitureDepreciation(furniture.getTaId(), null);
        final int totalPeriods = DepreciationDatesHelper
            .getDepreciationLifeTime(propertyType.getDeprecPeriod(), timeSpan);
        final int calendarField =
                Constants.TIME_SPAN_YEAR.equals(timeSpan) ? Calendar.YEAR : Calendar.MONTH;
        final int currentPeriod = DepreciationDatesHelper.getDateDiff(calendarField,
            furniture.getDateDelivery(), calculationDate);
        final double purchasePrice = furniture.getValueOriginal();
        final double salvageValue = furniture.getValueSalvage();
        final double currentDepreciation = calculateCurrentDepreciation(calculationMethod,
            currentPeriod, totalPeriods, purchasePrice, salvageValue);
        final double accumulatedDepreciation = calculateAccumulatedDepreciation(calculationMethod,
            currentPeriod, totalPeriods, purchasePrice, salvageValue);

        final double currentValue = (furniture.getValueOriginal() - accumulatedDepreciation < 0)
                ? 0.0 : furniture.getValueOriginal() - accumulatedDepreciation;

        furnitureDepreciation.setValueCurrentDep(currentDepreciation);
        furnitureDepreciation.setValueAccumDep(accumulatedDepreciation);
        furnitureDepreciation.setValueCurrent(currentValue);
        return furnitureDepreciation;
    }

    /**
     * Calculate depreciation for financial parameter on period with specified time span.
     *
     * @param financialParameter financial parameter
     * @param propertyType property type
     * @param dateStart date start
     * @param dateEnd date end
     * @param timeSpan time span
     * @return Map<Date, Double>
     */
    public static Map<Date, Double> calculateDepreciationForFinParamPeriodAndTimeSpan(
            final FinancialAnalysisParameter financialParameter, final PropertyType propertyType,
            final Date dateStart, final Date dateEnd, final String timeSpan) {
        final List<Date> deprecDates =
                DepreciationDatesHelper.getCalculationDates(dateStart, dateEnd, timeSpan);
        final CalculationMethod calculationMethod =
                CalculationMethod.fromString(propertyType.getDeprecMethod());

        final Map<Date, Double> results = new HashMap<Date, Double>();
        for (final Date deprecDate : deprecDates) {
            final double salvageValue = 0.0;
            final int totalPeriods = DepreciationDatesHelper
                .getDepreciationLifeTime(propertyType.getDeprecPeriod(), timeSpan);
            final double costBasisOfDeprec = financialParameter.getCostBasisForDeprec();
            final Date datePurchase = financialParameter.getDatePurchased();
            final int field =
                    Constants.TIME_SPAN_YEAR.equals(timeSpan) ? Calendar.YEAR : Calendar.MONTH;
            final Date deprecDateEnd =
                    DepreciationDatesHelper.getPeriodEndDate(deprecDate, timeSpan);
            final int currentPeriod =
                    DepreciationDatesHelper.getDateDiff(field, datePurchase, deprecDateEnd);

            final double depreciationValue = calculateCurrentDepreciation(calculationMethod,
                currentPeriod, totalPeriods, costBasisOfDeprec, salvageValue);
            results.put(deprecDate, Double.valueOf(depreciationValue));
        }

        return results;
    }

    /**
     * Create new record for financial parameter depreciation.
     *
     * @return DataRecord
     */
    public static DataRecord createFinancialParameterRecord() {

        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.FINANAL_PARAMS);
        dataSource.addField(Constants.FINANAL_PARAMS, Constants.AUTO_NUMBER);
        dataSource.addField(Constants.FINANAL_PARAMS, Constants.COST_PURCHASE);
        dataSource.addField(Constants.FINANAL_PARAMS, Constants.DATE_PURCHASED);

        final DataRecord record = dataSource.createNewRecord();

        return record;
    }

    /**
     * Transform depreciations map to data set.
     *
     *
     * @param financialParamId financial parameter id
     * @param depreciations map with depreciations values
     * @return DataSet
     */
    public static DataSet createDepreciationsDataSet(final int financialParamId,
            final Map<Date, Double> depreciations) {
        final List<DataRecord> records = new ArrayList<DataRecord>();
        final Iterator<Date> itDates = depreciations.keySet().iterator();
        while (itDates.hasNext()) {
            final Date calcDate = itDates.next();
            final Double calcValue = depreciations.get(calcDate);
            final DataRecord record = DepreciationServiceHelper.createFinancialParameterRecord();
            record.setValue("finanal_params.auto_number", financialParamId);
            record.setValue("finanal_params.date_purchased", calcDate);
            record.setValue("finanal_params.cost_purchase", calcValue);
            records.add(record);
        }
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(records);
        return dataSet;
    }

    /**
     * Calculate current depreciation for Nth period.
     *
     * @param calculationMethod calculation method
     * @param currentPeriod current period
     * @param totalPeriods total number of periods
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @return double
     */
    private static double calculateCurrentDepreciation(final CalculationMethod calculationMethod,
            final int currentPeriod, final int totalPeriods, final double purchasePrice,
            final double salvageValue) {
        double currentDepreciation = 0.0;
        if (CalculationMethod.STRAIGHT_LINE.equals(calculationMethod)) {
            currentDepreciation = DepreciationUtils.straightLineDepreciationForNthPeriod(
                currentPeriod, purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.DOUBLE_DECLINING_BALANCE.equals(calculationMethod)) {
            currentDepreciation = DepreciationUtils.doubleDecliningBalanceDepreciationForNthPeriod(
                currentPeriod, purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.SUM_OF_YEAR_DIGITS.equals(calculationMethod)) {
            currentDepreciation = DepreciationUtils.sumOfYearDigitsDepreciationForNthPeriod(
                currentPeriod, purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.FIXED_PERCENTAGE.equals(calculationMethod)) {
            final double depreciationPercentage = (double) totalPeriods / ONE_HUNDRED;
            currentDepreciation = DepreciationUtils.percentageDepreciationForNthPeriod(
                currentPeriod, purchasePrice, depreciationPercentage);
        }
        return currentDepreciation;
    }

    /**
     * Calculate accumulated depreciation until Nth period.
     *
     * @param calculationMethod calculation method
     * @param currentPeriod current period
     * @param totalPeriods total number of periods
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @return double
     */
    private static double calculateAccumulatedDepreciation(
            final CalculationMethod calculationMethod, final int currentPeriod,
            final int totalPeriods, final double purchasePrice, final double salvageValue) {
        double accumulatedDepreciation = 0.0;
        if (CalculationMethod.STRAIGHT_LINE.equals(calculationMethod)) {
            accumulatedDepreciation =
                    DepreciationUtils.straightLineAccumulatedDepreciationForNthPeriod(currentPeriod,
                        purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.DOUBLE_DECLINING_BALANCE.equals(calculationMethod)) {
            accumulatedDepreciation =
                    DepreciationUtils.doubleDecliningBalanceAccumulatedDepreciationForNthPeriod(
                        currentPeriod, purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.SUM_OF_YEAR_DIGITS.equals(calculationMethod)) {
            accumulatedDepreciation =
                    DepreciationUtils.sumOfYearDigitsAccumulatedDepreciationForNthPeriod(
                        currentPeriod, purchasePrice, salvageValue, totalPeriods);
        } else if (CalculationMethod.FIXED_PERCENTAGE.equals(calculationMethod)) {
            final double depreciationPercentage = (double) totalPeriods / ONE_HUNDRED;
            accumulatedDepreciation =
                    DepreciationUtils.percentageAccumulatedDepreciationForNthPeriod(currentPeriod,
                        purchasePrice, depreciationPercentage);
        }
        return accumulatedDepreciation;
    }

}
