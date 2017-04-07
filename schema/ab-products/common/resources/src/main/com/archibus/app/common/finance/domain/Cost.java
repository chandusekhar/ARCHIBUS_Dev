package com.archibus.app.common.finance.domain;

import java.text.MessageFormat;
import java.util.Date;

import com.archibus.service.cost.*;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.utility.Utility;

/**
 * This is a base class for concrete Cost types: Actual Cost, Scheduled Cost, and Recurring Cost. It
 * contains properties and methods that are common for all types of costs.
 *
 * @author Ioan Draghici
 *
 *         <p>
 *         SuppressWarnings Justification: this class represent a data base record. Using nested
 *         classes will make the code difficult to understand.
 *         <p>
 *         Confusing ternary: this is the required algorithm: If (amountIncomeBasePayment != 0) {
 *         Apply VAT amount to income payment } else if ( amountExpenseBasePayment != 0){ Apply VAT
 *         amount to expense payment }
 *
 */
@SuppressWarnings({ "PMD.ExcessivePublicCount", "PMD.TooManyFields", "PMD.ConfusingTernary",
"PMD.ExcessiveClassLength" })
public class Cost {

    /**
     * Class name constant.
     */
    static final String CLASS_COST = "Cost";

    // ----------------------- persistent state --------------------------------
    /**
     * Field.
     */
    private String accountId;

    /**
     * Field.
     */
    private double amountExpense;

    /**
     * Field.
     */
    private double amountExpenseBaseBudget;

    /**
     * Field.
     */
    private double amountExpenseBasePayment;

    /**
     * Field.
     */
    private double amountExpenseTotalPayment;

    /**
     * Field.
     */
    private double amountExpenseVatBudget;

    /**
     * Field.
     */
    private double amountExpenseVatPayment;

    /**
     * Field.
     */
    private double amountIncome;

    /**
     * Field.
     */
    private double amountIncomeBaseBudget;

    /**
     * Field.
     */
    private double amountIncomeBasePayment;

    /**
     * Field.
     */
    private double amountIncomeTotalPayment;

    /**
     * Field.
     */
    private double amountIncomeVatBudget;

    /**
     * Field.
     */
    private double amountIncomeVatPayment;

    /**
     * Field. "pa_name" in the database
     */
    private String assetName;

    /**
     * Field.
     */
    private String buildingId;

    /**
     * Field.
     */
    private String camCost;

    /**
     * Field.
     */
    private String costCategoryId;

    /**
     * Field.
     */
    private String ctryId;

    /**
     * Field.
     */
    private String currencyBudget;

    /**
     * Field.
     */
    private String currencyPayment;

    /**
     * Field.
     */
    private Date dateUsedForMcBudget;

    /**
     * Field.
     */
    private Date dateUsedForMcPayment;

    /**
     * Field.
     */
    private String departmentId;

    /**
     * Field.
     */
    private String description;

    /**
     * Field.
     */
    private String divisionId;

    /**
     * Field.
     */
    private double exchangeRateBudget;

    /**
     * Field.
     */
    private double exchangeRateOverride;

    /**
     * Field.
     */
    private double exchangeRatePayment;

    /**
     * Field.
     */
    private int id;

    /**
     * Field.
     */
    private String leaseId;

    /**
     * Field.
     */
    private String option1;

    /**
     * Field.
     */
    private String option2;

    /**
     * Field.
     */
    private String parcelId;

    /**
     * Field.
     */
    private String propertyId;

    /**
     * Field.
     */
    private double vatAmountOverride;

    /**
     * Field.
     */
    private double vatPercentOverride;

    /**
     * Field.
     */
    private double vatPercentValue;
    
    /**
     * Field.
     */
    private String taxBillNum;
    
    /**
     * Field.
     */
    private String taxAuthorityContact;
    
    /**
     * Field.
     */
    private String taxType;

    /**
     * Field.
     */
    private double taxPeriodInMonths;

    /**
     * Field.
     */
    private double taxValueAssessed;

    /**
     * Field.
     */
    private double taxClr;

    // ----------------------- business methods --------------------------------

    /**
     * Recalculate cost field for specified exchange rate.
     *
     * @param exchangeRate exchange rate value
     */
    public void applyExchangeRate(final double exchangeRate) {
        this.amountIncome = this.amountIncomeTotalPayment * exchangeRate;
        this.amountExpense = this.amountExpenseTotalPayment * exchangeRate;

        this.amountIncomeBaseBudget = this.amountIncomeBasePayment * exchangeRate;
        this.amountExpenseBaseBudget = this.amountExpenseBasePayment * exchangeRate;

        this.amountIncomeVatBudget = this.amountIncomeVatPayment * exchangeRate;
        this.amountExpenseVatBudget = this.amountExpenseVatPayment * exchangeRate;
    }

    /**
     * Calculate VAT values.
     *
     * @param isVatExcluded is cost lease exclude VAT
     *
     */
    public void calculateVAT(final boolean isVatExcluded) {

        // check if vatPercentOverride is ON
        boolean vatPercentOverrideOn = true;
        if (this.vatPercentOverride == 0.0) {
            // vatPercentOverride is OFF
            vatPercentOverrideOn = false;
        }

        // check if vatAmountOverride is ON
        boolean vatAmountOverrideOn = true;
        if (this.vatAmountOverride == -1.0) {
            // vatAmountOverride is OFF
            vatAmountOverrideOn = false;
        }

        // if vat is excluded
        if (isVatExcluded) {
            vatPercentOverrideOn = false;
            vatAmountOverrideOn = false;
        }

        if (vatPercentOverrideOn) {
            this.amountIncomeVatPayment =
                    this.amountIncomeBasePayment * this.vatPercentOverride / Constants.ONE_HUNDRED;
            this.amountExpenseVatPayment =
                    this.amountExpenseBasePayment * this.vatPercentOverride / Constants.ONE_HUNDRED;
        } else if (vatAmountOverrideOn) {
            if (this.amountIncomeBasePayment != 0.0) {
                this.amountIncomeVatPayment = this.vatAmountOverride;
                this.amountExpenseVatPayment = 0.0;
            } else if (this.amountExpenseBasePayment != 0.0) {
                this.amountIncomeVatPayment = 0.0;
                this.amountExpenseVatPayment = this.vatAmountOverride;
            }

        } else if (isVatExcluded) {
            this.amountIncomeVatPayment = 0.0;
            this.amountExpenseVatPayment = 0.0;
        } else {
            this.amountIncomeVatPayment =
                    this.amountIncomeBasePayment * this.vatPercentValue / Constants.ONE_HUNDRED;
            this.amountExpenseVatPayment =
                    this.amountExpenseBasePayment * this.vatPercentValue / Constants.ONE_HUNDRED;
        }
    }

    /**
     * Calculate totals for payment fields.
     */
    public void calculatePaymentTotals() {
        this.amountIncomeTotalPayment = this.amountIncomeBasePayment + this.amountIncomeVatPayment;
        this.amountExpenseTotalPayment =
                this.amountExpenseBasePayment + this.amountExpenseVatPayment;
    }

    @Override
    public int hashCode() {
        int result = Utility.HASH_CODE_SEED;
        result = Utility.HASH_CODE_PRIME * result + this.id;
        return result;
    }

    @Override
    public boolean equals(final Object obj) {
        return obj instanceof Cost && this.id == ((Cost) obj).getId()
                && this.getCostClass().equals(((Cost) obj).getCostClass());
    }

    /**
     * Return Cost class type.
     *
     * @return class name costant.
     */
    public String getCostClass() {
        return CLASS_COST;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getAccountId() {
        return this.accountId;
    }

    /**
     * Returns the difference between income and expense.
     *
     * @return double value
     */
    public double getAmount() {
        return this.amountIncome - this.amountExpense;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpense() {
        return this.amountExpense;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpenseBaseBudget() {
        return this.amountExpenseBaseBudget;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpenseBasePayment() {
        return this.amountExpenseBasePayment;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpenseTotalPayment() {
        return this.amountExpenseTotalPayment;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpenseVatBudget() {
        return this.amountExpenseVatBudget;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountExpenseVatPayment() {
        return this.amountExpenseVatPayment;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncome() {
        return this.amountIncome;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncomeBaseBudget() {
        return this.amountIncomeBaseBudget;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncomeBasePayment() {
        return this.amountIncomeBasePayment;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncomeTotalPayment() {
        return this.amountIncomeTotalPayment;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncomeVatBudget() {
        return this.amountIncomeVatBudget;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getAmountIncomeVatPayment() {
        return this.amountIncomeVatPayment;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getAssetName() {
        return this.assetName;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getBuildingId() {
        return this.buildingId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getCostCategoryId() {
        return this.costCategoryId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getCtryId() {
        return this.ctryId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getCurrencyBudget() {
        return this.currencyBudget;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getCurrencyPayment() {
        return this.currencyPayment;
    }

    /**
     * Getter.
     *
     * @return date
     */
    public Date getDateUsedForMcBudget() {
        return this.dateUsedForMcBudget;
    }

    /**
     * Getter.
     *
     * @return date
     */
    public Date getDateUsedForMcPayment() {
        return this.dateUsedForMcPayment;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getDepartmentId() {
        return this.departmentId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getDivisionId() {
        return this.divisionId;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getExchangeRateBudget() {
        return this.exchangeRateBudget;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getExchangeRateOverride() {
        return this.exchangeRateOverride;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getExchangeRatePayment() {
        return this.exchangeRatePayment;
    }

    /**
     * Getter.
     *
     * @return int
     */
    public int getId() {
        return this.id;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getLeaseId() {
        return this.leaseId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getOption1() {
        return this.option1;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getOption2() {
        return this.option2;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getParcelId() {
        return this.parcelId;
    }

    /**
     * Getter.
     *
     * @return string
     */
    public String getPropertyId() {
        return this.propertyId;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getVatAmountOverride() {
        return this.vatAmountOverride;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getVatPercentOverride() {
        return this.vatPercentOverride;
    }

    /**
     * Getter.
     *
     * @return double
     */
    public double getVatPercentValue() {
        return this.vatPercentValue;
    }

    /**
     * Returns true if income is less then expense.
     *
     * @return boolean
     */
    public boolean isExpense() {
        return !isIncome();
    }

    /**
     * Returns true if income is greater then expense.
     *
     * @return boolean
     */
    public boolean isIncome() {
        return this.amountIncome >= this.amountExpense;
    }

    /**
     * Setter.
     *
     * @param accountId account code
     */
    public void setAccountId(final String accountId) {
        this.accountId = accountId;
    }

    /**
     * Setter.
     *
     * @param amountExpense amount expense
     */
    public void setAmountExpense(final double amountExpense) {
        this.amountExpense = amountExpense;
    }

    /**
     * Setter.
     *
     * @param amountExpenseBaseBudget new value
     */
    public void setAmountExpenseBaseBudget(final double amountExpenseBaseBudget) {
        this.amountExpenseBaseBudget = amountExpenseBaseBudget;
    }

    /**
     * Setter.
     *
     * @param amountExpenseBasePayment new value
     */
    public void setAmountExpenseBasePayment(final double amountExpenseBasePayment) {
        this.amountExpenseBasePayment = amountExpenseBasePayment;
    }

    /**
     * Setter.
     *
     * @param amountExpenseTotalPayment new value
     */
    public void setAmountExpenseTotalPayment(final double amountExpenseTotalPayment) {
        this.amountExpenseTotalPayment = amountExpenseTotalPayment;
    }

    /**
     * Setter.
     *
     * @param amountExpenseVatBudget new value
     */
    public void setAmountExpenseVatBudget(final double amountExpenseVatBudget) {
        this.amountExpenseVatBudget = amountExpenseVatBudget;
    }

    /**
     * Setter.
     *
     * @param amountExpenseVatPayment new value
     */
    public void setAmountExpenseVatPayment(final double amountExpenseVatPayment) {
        this.amountExpenseVatPayment = amountExpenseVatPayment;
    }

    /**
     * Setter.
     *
     * @param amountIncome new value
     */
    public void setAmountIncome(final double amountIncome) {
        this.amountIncome = amountIncome;
    }

    /**
     * Setter.
     *
     * @param amountIncomeBaseBudget new value
     */
    public void setAmountIncomeBaseBudget(final double amountIncomeBaseBudget) {
        this.amountIncomeBaseBudget = amountIncomeBaseBudget;
    }

    /**
     * Setter.
     *
     * @param amountIncomeBasePayment new value
     */
    public void setAmountIncomeBasePayment(final double amountIncomeBasePayment) {
        this.amountIncomeBasePayment = amountIncomeBasePayment;
    }

    /**
     * Setter.
     *
     * @param amountIncomeTotalPayment new value
     */
    public void setAmountIncomeTotalPayment(final double amountIncomeTotalPayment) {
        this.amountIncomeTotalPayment = amountIncomeTotalPayment;
    }

    /**
     * Setter.
     *
     * @param amountIncomeVatBudget new value
     */
    public void setAmountIncomeVatBudget(final double amountIncomeVatBudget) {
        this.amountIncomeVatBudget = amountIncomeVatBudget;
    }

    /**
     * Setter.
     *
     * @param amountIncomeVatPayment new value
     */
    public void setAmountIncomeVatPayment(final double amountIncomeVatPayment) {
        this.amountIncomeVatPayment = amountIncomeVatPayment;
    }

    /**
     * Setter.
     *
     * @param assetName new value
     */
    public void setAssetName(final String assetName) {
        this.assetName = assetName;
    }

    /**
     * Setter.
     *
     * @param buildingId new value
     */
    public void setBuildingId(final String buildingId) {
        this.buildingId = buildingId;
    }

    /**
     * Setter.
     *
     * @param costCategoryId new value
     */
    public void setCostCategoryId(final String costCategoryId) {
        this.costCategoryId = costCategoryId;
    }

    /**
     * Setter.
     *
     * @param ctryId new value
     */
    public void setCtryId(final String ctryId) {
        this.ctryId = ctryId;
    }

    /**
     * Setter.
     *
     * @param currencyBudget new value
     */
    public void setCurrencyBudget(final String currencyBudget) {
        this.currencyBudget = currencyBudget;
    }

    /**
     * Setter.
     *
     * @param currencyPayment new value
     */
    public void setCurrencyPayment(final String currencyPayment) {
        this.currencyPayment = currencyPayment;
    }

    /**
     * Setter.
     *
     * @param dateUsedForMcBudget new value
     */
    public void setDateUsedForMcBudget(final Date dateUsedForMcBudget) {
        this.dateUsedForMcBudget = dateUsedForMcBudget;
    }

    /**
     * Setter.
     *
     * @param dateUsedForMcPayment new value
     */
    public void setDateUsedForMcPayment(final Date dateUsedForMcPayment) {
        this.dateUsedForMcPayment = dateUsedForMcPayment;
    }

    /**
     * Setter.
     *
     * @param departmentId new value
     */
    public void setDepartmentId(final String departmentId) {
        this.departmentId = departmentId;
    }

    /**
     * Setter.
     *
     * @param description new value
     */
    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * Setter.
     *
     * @param divisionId new value
     */
    public void setDivisionId(final String divisionId) {
        this.divisionId = divisionId;
    }

    /**
     * Setter.
     *
     * @param exchangeRateBudget new value
     */
    public void setExchangeRateBudget(final double exchangeRateBudget) {
        this.exchangeRateBudget = exchangeRateBudget;
    }

    /**
     * Setter.
     *
     * @param exchangeRateOverride new value
     */
    public void setExchangeRateOverride(final double exchangeRateOverride) {
        this.exchangeRateOverride = exchangeRateOverride;
    }

    /**
     * Setter.
     *
     * @param exchangeRatePayment new value
     */
    public void setExchangeRatePayment(final double exchangeRatePayment) {
        this.exchangeRatePayment = exchangeRatePayment;
    }

    /**
     * Setter.
     *
     * @param id new value
     */
    public void setId(final int id) {
        this.id = id;
    }

    /**
     * Setter.
     *
     * @param leaseId new value
     */
    public void setLeaseId(final String leaseId) {
        this.leaseId = leaseId;
    }

    /**
     * Setter.
     *
     * @param option1 new value
     */
    public void setOption1(final String option1) {
        this.option1 = option1;
    }

    /**
     * Setter.
     *
     * @param option2 new value
     */
    public void setOption2(final String option2) {
        this.option2 = option2;
    }

    /**
     * Setter.
     *
     * @param parcelId new value
     */
    public void setParcelId(final String parcelId) {
        this.parcelId = parcelId;
    }

    /**
     * Setter.
     *
     * @param propertyId new value
     */
    public void setPropertyId(final String propertyId) {
        this.propertyId = propertyId;
    }

    /**
     * Setter.
     *
     * @param vatAmountOverride new value
     */
    public void setVatAmountOverride(final double vatAmountOverride) {
        this.vatAmountOverride = vatAmountOverride;
    }

    /**
     * Setter.
     *
     * @param vatPercentOverride new value
     */
    public void setVatPercentOverride(final double vatPercentOverride) {
        this.vatPercentOverride = vatPercentOverride;
    }

    /**
     * Setter.
     *
     * @param vatPercentValue new value
     */
    public void setVatPercentValue(final double vatPercentValue) {
        this.vatPercentValue = vatPercentValue;
    }

    /**
     * Getter for the camCost property.
     *
     * @see camCost
     * @return the camCost property.
     */
    public String getCamCost() {
        return this.camCost;
    }

    /**
     * Setter for the camCost property.
     *
     * @see camCost
     * @param camCost the camCost to set
     */

    public void setCamCost(final String camCost) {
        this.camCost = camCost;
    }
    
    /**
     * Getter for the taxBillNum property.
     *
     * @see taxBillNum
     * @return the taxBillNum property.
     */
    public String getTaxBillNum() {
        return this.taxBillNum;
    }
    
    /**
     * Setter for the taxBillNum property.
     *
     * @see taxBillNum
     * @param taxBillNum the taxBillNum to set
     */

    public void setTaxBillNum(final String taxBillNum) {
        this.taxBillNum = taxBillNum;
    }
    
    /**
     * Getter for the taxAuthorityContact property.
     *
     * @see taxAuthorityContact
     * @return the taxAuthorityContact property.
     */
    public String getTaxAuthorityContact() {
        return this.taxAuthorityContact;
    }
    
    /**
     * Setter for the taxAuthorityContact property.
     *
     * @see taxAuthorityContact
     * @param taxAuthorityContact the taxAuthorityContact to set
     */

    public void setTaxAuthorityContact(final String taxAuthorityContact) {
        this.taxAuthorityContact = taxAuthorityContact;
    }
    
    /**
     * Getter for the taxType property.
     *
     * @see taxType
     * @return the taxType property.
     */
    public String getTaxType() {
        return this.taxType;
    }
    
    /**
     * Setter for the taxType property.
     *
     * @see taxType
     * @param taxType the taxType to set
     */

    public void setTaxType(final String taxType) {
        this.taxType = taxType;
    }
    
    /**
     * Getter for the taxPeriodInMonths property.
     *
     * @see taxPeriodInMonths
     * @return the taxPeriodInMonths property.
     */
    public double getTaxPeriodInMonths() {
        return this.taxPeriodInMonths;
    }
    
    /**
     * Setter for the taxPeriodInMonths property.
     *
     * @see taxPeriodInMonths
     * @param taxPeriodInMonths the taxPeriodInMonths to set
     */

    public void setTaxPeriodInMonths(final double taxPeriodInMonths) {
        this.taxPeriodInMonths = taxPeriodInMonths;
    }
    
    /**
     * Getter for the taxValueAssessed property.
     *
     * @see taxValueAssessed
     * @return the taxValueAssessed property.
     */
    public double getTaxValueAssessed() {
        return this.taxValueAssessed;
    }
    
    /**
     * Setter for the taxValueAssessed property.
     *
     * @see taxValueAssessed
     * @param taxValueAssessed the taxValueAssessed to set
     */

    public void setTaxValueAssessed(final double taxValueAssessed) {
        this.taxValueAssessed = taxValueAssessed;
    }
    
    /**
     * Getter for the taxClr property.
     *
     * @see taxClr
     * @return the taxClr property.
     */
    public double getTaxClr() {
        return this.taxClr;
    }
    
    /**
     * Setter for the taxClr property.
     *
     * @see taxClr
     * @param taxClr the taxClr to set
     */

    public void setTaxClr(final double taxClr) {
        this.taxClr = taxClr;
    }
    
    @Override
    public String toString() {
        return MessageFormat.format("id [{0}], description [{1}], income [{2}], expense [{3}]",
            new Object[] { Integer.valueOf(this.id), this.description,
                new Double(this.amountIncome), new Double(this.amountExpense) });
    }

    /**
     * Get calculation source currency.
     *
     * @param currencyType currency type
     * @return currency code
     */
    protected String getSourceCurrency(final String currencyType) {
        String currency = "";
        if (Constants.CURRENCY_TYPE_BUDGET.equals(currencyType)) {
            currency = getCurrencyBudget();
        } else {
            currency = getCurrencyPayment();
        }
        return currency;
    }

    /**
     * Get amount income based on cost type and exchange rate type.
     *
     * @param isMcVatEnabled is MC and VAT enabled ?
     * @param isBudgetCurrency is budget currency ?
     * @param vatCost vat cost type (base, vat, total)
     * @return double
     */
    public double getIncomeAmount(final boolean isMcVatEnabled, final boolean isBudgetCurrency,
            final VatCost vatCost) {
        double incomeAmount = this.amountIncome;
        if (isMcVatEnabled && isBudgetCurrency) {
            if (VatCost.BASE.equals(vatCost)) {
                incomeAmount = this.amountIncomeBaseBudget;
            } else if (VatCost.VAT.equals(vatCost)) {
                incomeAmount = this.amountIncomeVatBudget;
            }
        } else if (isMcVatEnabled) {
            if (VatCost.BASE.equals(vatCost)) {
                incomeAmount = this.amountIncomeBasePayment;
            } else if (VatCost.VAT.equals(vatCost)) {
                incomeAmount = this.amountIncomeVatPayment;
            } else {
                incomeAmount = this.amountIncomeTotalPayment;
            }
        }
        return incomeAmount;
    }

    /**
     * Get amount expense based on cost type and exchange rate type.
     *
     * @param isMcVatEnabled is MC and VAT enabled ?
     * @param isBudgetCurrency is budget currency ?
     * @param vatCost vat cost type (base, vat, total)
     * @return double
     */
    public double getExpenseAmount(final boolean isMcVatEnabled, final boolean isBudgetCurrency,
            final VatCost vatCost) {
        double expenseAmount = this.amountExpense;
        if (isMcVatEnabled && isBudgetCurrency) {
            if (VatCost.BASE.equals(vatCost)) {
                expenseAmount = this.amountExpenseBaseBudget;
            } else if (VatCost.VAT.equals(vatCost)) {
                expenseAmount = this.amountExpenseVatBudget;
            }
        } else if (isMcVatEnabled) {
            if (VatCost.BASE.equals(vatCost)) {
                expenseAmount = this.amountExpenseBasePayment;
            } else if (VatCost.VAT.equals(vatCost)) {
                expenseAmount = this.amountExpenseVatPayment;
            } else {
                expenseAmount = this.amountExpenseTotalPayment;
            }
        }
        return expenseAmount;
    }

    /**
     * Returns value of the asset assignment field for this rule (e.q. building ID).
     *
     * @param assetKey asset key
     * @return asset id
     */
    public String getAssetId(final String assetKey) {
        String assetId = null;
        if (assetKey.equals(CostProjection.ASSET_KEY_DIVISION)) {
            assetId = getDivisionId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_DEPARTMENT)) {
            assetId = getDepartmentId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_BUILDING)) {
            assetId = getBuildingId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_PROPERTY)) {
            assetId = getPropertyId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_ACCOUNT)) {
            assetId = getAccountId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_LEASE)) {
            assetId = getLeaseId();
        } else if (assetKey.equals(CostProjection.ASSET_KEY_PARCEL)) {
            assetId = getParcelId();
        }
        return assetId;
    }

}
