
var defineGenRuleDefineTab_Controller = View.createController('defineGenRuleDefineTab_Controller', {

    ////////////////////////////Event Handler////////////////////////////////////////
    
    afterInitialDataFetch: function(){
        this.setRecurringPatternLabel();
    },
    
    criteria_form_afterRefresh: function(){
        this.loadRecord();
    },
    recurring_pattern_form_onSaveRule: function(){
        this.onSaveGenerationRule();
    },
    
    /////////////////////////////Logic function///////////////////////////////////////
    
    /**
     * save the pmgen record
     */
    onSaveGenerationRule: function(){
        var element = $('ndays');
        if (!validationIntegerOrSmallint(element, true)) {
            return;
        }
        
        if (isCriteriaExists()) {
            View.showMessage('error', getMessage('criteriaExists'));
            return;
        }
        
        if (isCriteriaConflict()) {
            var controller = this;
            View.confirm(getMessage('criteriaConflict'), function(button){
                if (button == 'yes') {
                    controller.saveRule();
                }
            });
        }
        else {
            this.saveRule();
        }
    },
    
    /**
     * load record
     */
    loadRecord: function(){
        this.group_para_form.show(true);
        this.recurring_pattern_form.show(true);
        this.other_option_form.show(true);
        var pmgenId = this.criteria_form.getFieldValue('pmgen.pmgen_id');
        var type = this.criteria_form.getFieldValue('pmgen.pm_type');
        if (pmgenId) {
            var groupParam = this.criteria_form.getFieldValue('pmgen.group_param');
            var recurringRule = this.criteria_form.getFieldValue('pmgen.recurring_rule');
            var dateStart = this.criteria_form.getFieldValue('pmgen.date_start');
            var genNewPmsd = this.criteria_form.getFieldValue('pmgen.gen_new_pmsd');
            var usePmGroup = this.criteria_form.getFieldValue('pmgen.use_pm_group');
            setGroupParamPanel(type, groupParam);
            setRecurringPatternPanel(dateStart, recurringRule);
            setOtherOptionPanel(genNewPmsd, usePmGroup)
        }
        else {
            setGroupParamPanel(type, "one_pms");
            setRecurringPatternPanel();
            setOtherOptionPanel("1", "1")
        }
    },
    
    setRecurringPatternLabel: function(){
        $("weekly_sun").nextSibling.nodeValue = getMessage("bdOpt2_1");
        $("weekly_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
        $("weekly_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
        $("weekly_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
        $("weekly_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
        $("weekly_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
        $("weekly_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
        $("first").nextSibling.nodeValue = getMessage("bdOpt3_1_1");
        $("second").nextSibling.nodeValue = getMessage("bdOpt3_1_2");
        $("third").nextSibling.nodeValue = getMessage("bdOpt3_1_3");
        $("fourth").nextSibling.nodeValue = getMessage("bdOpt3_1_4");
        $("last").nextSibling.nodeValue = getMessage("bdOpt3_1_5");
        $("month_sun").nextSibling.nodeValue = getMessage("bdOpt2_1");
        $("month_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
        $("month_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
        $("month_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
        $("month_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
        $("month_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
        $("month_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
        
        $("bifirst").nextSibling.nodeValue = getMessage("bdOpt3_1_1");
        $("bisecond").nextSibling.nodeValue = getMessage("bdOpt3_1_2");
        $("bithird").nextSibling.nodeValue = getMessage("bdOpt3_1_3");
        $("bifourth").nextSibling.nodeValue = getMessage("bdOpt3_1_4");
        $("bilast").nextSibling.nodeValue = getMessage("bdOpt3_1_5");
        $("bimonth_sun").nextSibling.nodeValue = getMessage("bdOpt2_1");
        $("bimonth_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
        $("bimonth_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
        $("bimonth_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
        $("bimonth_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
        $("bimonth_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
        $("bimonth_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
        
        $("trifirst").nextSibling.nodeValue = getMessage("bdOpt3_1_1");
        $("trisecond").nextSibling.nodeValue = getMessage("bdOpt3_1_2");
        $("trithird").nextSibling.nodeValue = getMessage("bdOpt3_1_3");
        $("trifourth").nextSibling.nodeValue = getMessage("bdOpt3_1_4");
        $("trilast").nextSibling.nodeValue = getMessage("bdOpt3_1_5");
        $("trimonth_sun").nextSibling.nodeValue = getMessage("bdOpt2_1");
        $("trimonth_mon").nextSibling.nodeValue = getMessage("bdOpt2_2");
        $("trimonth_tue").nextSibling.nodeValue = getMessage("bdOpt2_3");
        $("trimonth_wed").nextSibling.nodeValue = getMessage("bdOpt2_4");
        $("trimonth_thu").nextSibling.nodeValue = getMessage("bdOpt2_5");
        $("trimonth_fri").nextSibling.nodeValue = getMessage("bdOpt2_6");
        $("trimonth_sat").nextSibling.nodeValue = getMessage("bdOpt2_7");
    },
    
    saveRule: function(){
        var recurringPattern = new RecurringPattern();
        recurringPattern.type = getSelectedRadioButton("recurring_type");
        recurringPattern.value1 = getRecurringPatternValue1(recurringPattern.type);
        recurringPattern.value2 = getRecurringPatternValue2(recurringPattern.type);
        recurringPattern.dateStart = this.recurring_pattern_form.getFieldValue('pmgen.date_start');
        if (!recurringPattern.valid()) {
            return;
        }
        this.criteria_form.setFieldValue("pmgen.group_param", getSelectedRadioButton("pmgen.group_param"));
        this.criteria_form.setFieldValue("pmgen.date_start", this.recurring_pattern_form.getFieldValue("pmgen.date_start"));
        this.criteria_form.setFieldValue("pmgen.recurring_rule", recurringPattern.xmlPattern);
        this.criteria_form.setFieldValue("pmgen.gen_new_pmsd", ($('pmgen.gen_new_pmsd').checked) ? 1 : 0);
        this.criteria_form.setFieldValue("pmgen.use_pm_group", ($('pmgen.use_pm_group').checked) ? 1 : 0);
        this.criteria_form.save();
    }
});

function setGroupParamPanel(type, groupParam){
    if (type == 'EQPM') {
        $("eq_subcomponent_group").style.display = "";
        $("eq_std_group").style.display = "";
        $("eq_id_group").style.display = "";
        $("room_group").style.display = "none";
    }
    else {
        $("eq_subcomponent_group").style.display = "none";
        $("eq_std_group").style.display = "none";
        $("eq_id_group").style.display = "none";
        $("room_group").style.display = "";
    }
    
    var radios = document.getElementsByName("pmgen.group_param");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].value == groupParam) {
            radios[i].checked = true;
            break;
        }
    }
}

function setOtherOptionPanel(genNewPmsd, usePmGroup){
    if (genNewPmsd == '1') {
        $('pmgen.gen_new_pmsd').checked = true;
    }
    else {
        $('pmgen.gen_new_pmsd').checked = false;
    }
    
    if (usePmGroup == '1') {
        $('pmgen.use_pm_group').checked = true;
    }
    else {
        $('pmgen.use_pm_group').checked = false;
    }
}

function setRecurringPatternPanel(dateStart, xmlRecurringPattern){
    $('day').checked = false;
    $('week').checked = false;
    $('month').checked = false;
    $('bimonth').checked = false;
    $('trimonth').checked = false;
    enabledDay(true);
    enabledWeek(true);
    enabledMonth('', true);
    enabledMonth('bi', true);
    enabledMonth('tri', true);
    
    var form = View.panels.get('recurring_pattern_form');
    if (dateStart) {
        form.setFieldValue("pmgen.date_start", dateStart);
    }
    else {
        form.setFieldValue("pmgen.date_start", "");
    }
    
    if (xmlRecurringPattern) {
        var recurringPattern = new RecurringPattern();
        recurringPattern.xmlPattern = xmlRecurringPattern;
        recurringPattern.decode();
        $(recurringPattern.type).checked = true;
        onSelectRecurringType();
        if (recurringPattern.type == 'day') {
            $("ndays").value = recurringPattern.value1;
        }
        
        if (recurringPattern.type == 'week') {
            var week = recurringPattern.value1.split(',')
            $("weekly_mon").checked = parseInt(week[0]);
            $("weekly_tue").checked = parseInt(week[1]);
            $("weekly_wed").checked = parseInt(week[2]);
            $("weekly_thu").checked = parseInt(week[3]);
            $("weekly_fri").checked = parseInt(week[4]);
            $("weekly_sat").checked = parseInt(week[5]);
            $("weekly_sun").checked = parseInt(week[6]);
        }
        
        if (recurringPattern.type == 'month') {
            getMonthRadioElByValue('', recurringPattern.value1).checked = true;
            getMonthRadioElByValue('', recurringPattern.value2).checked = true;
        }
        
        if (recurringPattern.type == 'bimonth') {
            getMonthRadioElByValue('bi', recurringPattern.value1).checked = true;
            getMonthRadioElByValue('bi', recurringPattern.value2).checked = true;
        }
        
        if (recurringPattern.type == 'trimonth') {
            getMonthRadioElByValue('tri', recurringPattern.value1).checked = true;
            getMonthRadioElByValue('tri', recurringPattern.value2).checked = true;
        }
    }
}

/**
 * Returns value of the selected radio button.
 * @param {name} Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}


/**
 * Returns value1 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue1(type){
    var value1 = '';
    if (type == 'day') {
        value1 = document.getElementById("ndays").value;
    }
    
    if (type == 'week') {
        value1 = ((document.getElementById("weekly_mon").checked) ? '1' : '0') + ',' +
        ((document.getElementById("weekly_tue").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_wed").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_thu").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_fri").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sat").checked) ? '1' : '0') +
        ',' +
        ((document.getElementById("weekly_sun").checked) ? '1' : '0')
    }
    
    if (type == 'month') {
        value1 = getSelectedRadioButton("monthly_value1");
    }
    
    if (type == 'bimonth') {
        value1 = getSelectedRadioButton("bimonthly_value1");
    }
    
    if (type == 'trimonth') {
        value1 = getSelectedRadioButton("trimonthly_value1");
    }
    
    return value1;
}

/**
 * Returns value2 of the selected recurring type.
 * @param {type} recurring type.
 */
function getRecurringPatternValue2(type){
    var value2 = '';
    if (type == 'month') {
        value2 = getSelectedRadioButton("monthly_value2");
    }
    
    if (type == 'bimonth') {
        value2 = getSelectedRadioButton("bimonthly_value2");
    }
    
    if (type == 'trimonth') {
        value2 = getSelectedRadioButton("trimonthly_value2");
    }
    
    return value2;
}

/**
 * onclick event handler for radio recurring_type.
 */
function onSelectRecurringType(){
    var type = getSelectedRadioButton("recurring_type");
    if (type == "day") {
        enabledDay(true);
        enabledWeek(false);
        enabledMonth('', false);
        enabledMonth('bi', false);
        enabledMonth('tri', false);
    }
    if (type == "week") {
        enabledDay(false);
        enabledWeek(true);
        enabledMonth('', false);
        enabledMonth('bi', false);
        enabledMonth('tri', false);
    }
    if (type == "month") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', true);
        enabledMonth('bi', false);
        enabledMonth('tri', false);
    }
    if (type == "bimonth") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', false);
        enabledMonth('bi', true);
        enabledMonth('tri', false);
    }
    if (type == "trimonth") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth('', false);
        enabledMonth('bi', false);
        enabledMonth('tri', true);
    }
}

/**
 * enable or disable the radio 'day'.
 * @param {isEnabled} is enable.
 */
function enabledDay(isEnabled){
    $("ndays").disabled = !isEnabled;
    $("ndays").value = "";
}

/**
 * enable or disable the radio 'week'.
 * @param {isEnabled} is enable.
 */
function enabledWeek(isEnabled){
    $("weekly_mon").disabled = !isEnabled;
    $("weekly_tue").disabled = !isEnabled;
    $("weekly_wed").disabled = !isEnabled;
    $("weekly_thu").disabled = !isEnabled;
    $("weekly_fri").disabled = !isEnabled;
    $("weekly_sat").disabled = !isEnabled;
    $("weekly_sun").disabled = !isEnabled;
    $("weekly_mon").checked = false;
    $("weekly_tue").checked = false;
    $("weekly_wed").checked = false;
    $("weekly_thu").checked = false;
    $("weekly_fri").checked = false;
    $("weekly_sat").checked = false;
    $("weekly_sun").checked = false;
}

/**
 * enable or disable the radio 'month','bimonth' or 'trimonth'.
 * @param {isEnabled} is enable.
 */
function enabledMonth(prefix, isEnabled){
    $(prefix + "first").disabled = !isEnabled;
    $(prefix + "second").disabled = !isEnabled;
    $(prefix + "third").disabled = !isEnabled;
    $(prefix + "fourth").disabled = !isEnabled;
    $(prefix + "last").disabled = !isEnabled;
    $(prefix + "month_mon").disabled = !isEnabled;
    $(prefix + "month_tue").disabled = !isEnabled;
    $(prefix + "month_wed").disabled = !isEnabled;
    $(prefix + "month_thu").disabled = !isEnabled;
    $(prefix + "month_fri").disabled = !isEnabled;
    $(prefix + "month_sat").disabled = !isEnabled;
    $(prefix + "month_sun").disabled = !isEnabled;
    $(prefix + "first").checked = false;
    $(prefix + "second").checked = false;
    $(prefix + "third").checked = false;
    $(prefix + "fourth").checked = false;
    $(prefix + "last").checked = false;
    $(prefix + "month_mon").checked = false;
    $(prefix + "month_tue").checked = false;
    $(prefix + "month_wed").checked = false;
    $(prefix + "month_thu").checked = false;
    $(prefix + "month_fri").checked = false;
    $(prefix + "month_sat").checked = false;
    $(prefix + "month_sun").checked = false;
}

/**
 * get month radio HTML Element according the given prefix and value
 * @param {prefix} '' || 'bi' || 'tri'
 * @param {value} '1st' || '2nd' || '3rd' || '4th' || 'last' || 'mon' || 'tue' || 'wed' || 'thu' || 'fri'|| 'sat' || 'sun'
 */
function getMonthRadioElByValue(prefix, value){
    var El = null;
    if (value == '1st') {
        El = $(prefix + "first");
    }
    if (value == '2nd') {
        El = $(prefix + "second");
    }
    if (value == '3rd') {
        El = $(prefix + "third");
    }
    if (value == '4th') {
        El = $(prefix + "fourth");
    }
    if (value == 'last') {
        El = $(prefix + "last");
    }
    if (value == 'mon') {
        El = $(prefix + "month_mon");
    }
    if (value == 'tue') {
        El = $(prefix + "month_tue");
    }
    if (value == 'wed') {
        El = $(prefix + "month_wed");
    }
    if (value == 'thu') {
        El = $(prefix + "month_thu");
    }
    if (value == 'fri') {
        El = $(prefix + "month_fri");
    }
    if (value == 'sat') {
        El = $(prefix + "month_sat");
    }
    if (value == 'sun') {
        El = $(prefix + "month_sun");
    }
    return El;
}

/**
 * judge wheter the criteria panel value already exists
 */
function isCriteriaExists(){
    var isExists = false;
    var form = View.panels.get('criteria_form');
    var pmgenId = form.getFieldValue('pmgen.pmgen_id');
    var pmType = form.getFieldValue('pmgen.pm_type');
    var siteId = form.getFieldValue('pmgen.site_id');
    var blId = form.getFieldValue('pmgen.bl_id');
    var flId = form.getFieldValue('pmgen.fl_id');
    var pmsGroup = form.getFieldValue('pmgen.pm_group');
    var trade = form.getFieldValue('pmgen.tr_id');
    
    var restriction = new Ab.view.Restriction;
    if (pmgenId) {
        restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
    }
    
    if (pmType) {
        restriction.addClause('pmgen.pm_type', pmType, '=');
    }
    
    if (siteId) {
        restriction.addClause('pmgen.site_id', siteId, '=');
    }
    else {
        restriction.addClause('pmgen.site_id', '', 'IS NULL');
    }
    
    if (blId) {
        restriction.addClause('pmgen.bl_id', blId, '=');
    }
    else {
        restriction.addClause('pmgen.bl_id', '', 'IS NULL');
    }
    
    if (flId) {
        restriction.addClause('pmgen.fl_id', flId, '=');
    }
    else {
        restriction.addClause('pmgen.fl_id', '', 'IS NULL');
    }
    
    if (pmsGroup) {
        restriction.addClause('pmgen.pm_group', pmsGroup, '=');
    }
    else {
        restriction.addClause('pmgen.pm_group', '', 'IS NULL');
    }
    
    if (trade) {
        restriction.addClause('pmgen.tr_id', trade, '=');
    }
    else {
        restriction.addClause('pmgen.tr_id', '', 'IS NULL');
    }
    
    var records = View.dataSources.get('ds_ab-pm-gen-rule-def_pmgen').getRecords(restriction);
    if (records.length > 0) {
        isExists = true;
    }
    return isExists;
}

/**
 * judge wheter the criteria panel value may conflict with existing record
 */
function isCriteriaConflict(){
    var isConflict = false;
    var ds = View.dataSources.get('ds_ab-pm-gen-rule-def_pmgen');
    var form = View.panels.get('criteria_form');
    var pmgenId = form.getFieldValue('pmgen.pmgen_id');
    var pmType = form.getFieldValue('pmgen.pm_type');
    var siteId = form.getFieldValue('pmgen.site_id');
    var blId = form.getFieldValue('pmgen.bl_id');
    var flId = form.getFieldValue('pmgen.fl_id');
    var pmsGroup = form.getFieldValue('pmgen.pm_group');
    var trade = form.getFieldValue('pmgen.tr_id');
    var restriction = null;
    //IF only A is entered, THEN B and C should not exist as other pmgen records
    if ((siteId || blId || flId) && !pmsGroup && !trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.pm_group', '', 'IS NOT NULL');
        restriction.addClause('pmgen.tr_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.pm_type', pmType, '=', ')AND(');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    //IF only B is entered, THEN A and C should not exist as other pgmen records
    if (!(siteId || blId || flId) && pmsGroup && !trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.tr_id', '', 'IS NOT NULL');
        restriction.addClause('pmgen.site_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.bl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.fl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.pm_type', pmType, '=', ')AND(');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    //IF only C is entered, THEN A and B should not exist as other pmgen records
    if (!(siteId || blId || flId) && !pmsGroup && trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.pm_group', '', 'IS NOT NULL');
        restriction.addClause('pmgen.site_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.bl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.fl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.pm_type', pmType, '=', ')AND(');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    //IF A and B are entered, THEN C should not exist as other pmgen records
    if ((siteId || blId || flId) && pmsGroup && !trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.tr_id', '', 'IS NOT NULL');
        restriction.addClause('pmgen.pm_type', pmType, '=');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    //IF A and C are entered, THEN B should not exist as other pmgen records
    if ((siteId || blId || flId) && !pmsGroup && trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.pm_group', '', 'IS NOT NULL');
        restriction.addClause('pmgen.pm_type', pmType, '=');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    //IF B and C are entered, THEN A should not exist as other pmgen records
    if (!(siteId || blId || flId) && pmsGroup && trade) {
        restriction = new Ab.view.Restriction;
        restriction.addClause('pmgen.site_id', '', 'IS NOT NULL');
        restriction.addClause('pmgen.bl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.fl_id', '', 'IS NOT NULL', 'OR');
        restriction.addClause('pmgen.pm_type', pmType, '=', ')AND(');
        if (pmgenId) {
            restriction.addClause('pmgen.pmgen_id', pmgenId, '!=');
        }
        if (ds.getRecords(restriction).length > 0) {
            isConflict = true;
        }
    }
    return isConflict;
}


RecurringPattern = Base.extend({
    type: null, // recurring type.
    value1: null, // the first value of the selected type
    value2: null, // the second value of the selected type
    xmlPattern: null, // the encode xml recurring pattern
    dateStart: null, // the start date of recurring pattern
    constructor: function(type, value1, value2, xmlPattern, dateStart){
        if (type != undefined) 
            this.type = type;
        
        if (value1 != undefined) 
            this.value1 = value1;
        
        if (value2 != undefined) 
            this.value2 = value2;
        
        if (xmlPattern != undefined) 
            this.xmlPattern = xmlPattern;
        
        if (dateStart != undefined) 
            this.dateStart = dateStart;
    },
    
    //decode the xml pattern
    decode: function(){
        var xmlDocument = parseXml(this.xmlPattern, null, true);
        var nodes = selectNodes(xmlDocument, null, '//recurring');
        if (nodes.length > 0) {
            this.type = nodes[0].getAttribute('type');
            this.value1 = nodes[0].getAttribute('value1');
            this.value2 = nodes[0].getAttribute('value2');
        }
    },
    
    //encode to xml pattern
    encode: function(){
        this.xmlPattern = '<recurring type="' + this.type + '" value1="' + this.value1 + '"'
        if (this.value2 != null) {
            this.xmlPattern += ' value2="' + this.value2 + '"';
        }
        this.xmlPattern += '/>';
    },
    
    //validate the recurring pattern
    valid: function(){
        if (!this.dateStart) {
            View.showMessage(getMessage('noDateStart'));
            return;
        }
        
        if (!this.type) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'day' && !this.value1) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'week' && this.value1.indexOf('1') < 0) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'month' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'bimonth' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'trimonth' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        this.encode();
        if (this.type != 'day') {
			//judge wheter the given start date match the given recurring rule.file='PreventiveMaintenanceCommonHandler.java'
            try {
                var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-isDateStartMatchRule', this.xmlPattern,this.dateStart);
                if (valueExists(result.jsonExpression) && result.jsonExpression == 'false') {
                    View.showMessage('error', getMessage('dateStartNotMatchRule'));
                    return false;
                }
            } 
            catch (e) {
                Workflow.handleError(e);
            }
        }
        
        return true;
    }
    
});
