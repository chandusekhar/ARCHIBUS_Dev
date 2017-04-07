var Mobile = Mobile || {};

Mobile.control = Mobile.control || {};

Mobile.control.fr = {

    monthNames: [
        {key1: "MONTH_0", key2: 'January', value: 'Janvier'},
        {key1: 'MONTH_1', key2: 'February', value: 'Février'},
        {key1: 'MONTH_2', key2: 'March', value: 'Mars'},
        {key1: 'MONTH_3', key2: 'April', value: 'Avril'},
        {key1: 'MONTH_4', key2: 'May', value: 'Mai'},
        {key1: 'MONTH_5', key2: 'June', value: 'Juin'},
        {key1: 'MONTH_6', key2: 'July', value: 'Juillet'},
        {key1: 'MONTH_7', key2: 'August', value: 'Août'},
        {key1: 'MONTH_8', key2: 'September', value: 'Septembre'},
        {key1: 'MONTH_9', key2: 'October', value: 'Octobre'},
        {key1: 'MONTH_10', key2: 'November', value: 'Novembre'},
        {key1: 'MONTH_11', key2: 'December', value: 'Décembre'}
    ],

    dayNames: [
        {key1: "DAY_0", key2: 'Sunday', value: 'Dimanche'},
        {key1: "DAY_1", key2: 'Monday', value: 'Lundi'},
        {key1: "DAY_2", key2: 'Tuesday', value: 'Mardi'},
        {key1: "DAY_3", key2: 'Wednesday', value: 'Mercredi'},
        {key1: "DAY_4", key2: 'Thursday', value: 'Jeudi'},
        {key1: "DAY_5", key2: 'Friday', value: 'Vendredi'},
        {key1: "DAY_6", key2: 'Saturday', value: 'Samedi'}
    ],

    monthNumbers: [
        {key1: "MONTH_0", key2: 'Jan', value: 'Jan'},
        {key1: "MONTH_1", key2: 'Feb', value: 'Fév'},
        {key1: "MONTH_2", key2: 'Mar', value: 'Mar'},
        {key1: "MONTH_3", key2: 'Apr', value: 'Avr'},
        {key1: "MONTH_4", key2: 'May', value: 'Mai'},
        {key1: "MONTH_5", key2: 'Jun', value: 'Juin'},
        {key1: "MONTH_6", key2: 'Jul', value: 'Juil'},
        {key1: "MONTH_7", key2: 'Aug', value: 'Aoû'},
        {key1: "MONTH_8", key2: 'Sep', value: 'Sep'},
        {key1: "MONTH_9", key2: 'Oct', value: 'Oct'},
        {key1: "MONTH_10", key2: 'Nov', value: 'Nov'},
        {key1: "MONTH_11", key2: 'Dec', value: 'Déc'}
    ],

    picker: [
        {key1: 'DAY_TEXT', key2: 'Day', value: 'Jour'},
        {key1: 'MONTH_TEXT', key2: 'Month', value: 'Mois'},
        {key1: 'YEAR_TEXT', key2: 'Year', value: 'Année'}
    ],

    msgbox: [
        {key1: 'OK_TEXT', key2: 'OK', value: 'OK'},
        {key1: 'CANCEL_TEXT', key2: 'Cancel', value: 'Annuler'},
        {key1: 'YES_TEXT', key2: 'Yes', value: 'OUI'},
        {key1: 'NO_TEXT', key2: 'No', value: 'NON'}
    ],

    nestedlist: [
        {key1: 'DONE_TEXT', key2: 'Done', value: 'Terminé'},
        {key1: 'BACK_TEXT', key2: 'Back', value: 'Précédent'},
        {key1: 'LOADING_TEXT', key2: 'Loading...', value: 'Chargement…'},
        {key1: 'EMPTY_TEXT', key2: 'No items available', value: 'Aucun élément disponible'}
    ]
};

/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.lang.ComponentLocalizer','Ext.picker.Date', function () {

        Common.lang.ComponentLocalizer.setComponentLocalization('fr');

        t.is(Ext.Date.dayNames[0],'Dimanche', 'Day name matches');
        t.is(Ext.Date.monthNames[6],'Juillet', 'Month name matches');

        t.done();
    });


});