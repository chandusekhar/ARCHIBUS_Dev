This folder contains JavaScript API examples.
All examples use MVC pattern and implement custom Controller object.


Working with Data
---------------------------------------------------------------------------------------------------
data/ab-ex-prg-data.axvw (.js)

- loading and saving data records using DataSource object;
- operations on date and time fields;
- formatting field values to localized strings;
- displaying records in column report panel;


Data View
---------------------------------------------------------------------------------------------------

dataviw/ab-ex-prg-data-view.axvw (.js)

- using Ab.DataView control to display custom data report similar to 15.1 column report;
- the DataSource, HTML template for record display, and all localizable titles are defined in AXVW;
- the custom JS code uses DataSource to retrieve the data records, 
  and Ab.DataView control to display them using HTML template defined in AXVW;


Drag and Drop
---------------------------------------------------------------------------------------------------
dragdrop/ab-ex-user-rpocs.axvw (.js)

- implementing drag and drop between standard tree and grid panels;
- setting panel WFR parameters in JS and using them in custom SQL in AXVW;
- creating data records in the code with consequent saving them using DataSource object;
- displaying confirmation dialogs;


Forms and Wizards
---------------------------------------------------------------------------------------------------
form/ab-ex-prg-form.axvw (.js)

- master example file;

form/ab-ex-prg-form-simple.axvw (.js)

- simple form with save;

form/ab-ex-prg-form-validation.axvw (.js)

- text, number and date field validation;

form/ab-ex-prg-form-wizard.axvw (.js)

- implementing workflow using tab panel;
- event listeners for custom HTML controls;
- copying data records from edit form to column report for review, without saving;
- using custom WFR to save multiple records from different tables;


Customizing Standard Grid Panel
---------------------------------------------------------------------------------------------------
grid/ab-ex-prg-legend-grid.axvw (.js)

- iterating through grid rows and cells;
- customizing cell style.


Using Third-party Tree Control
---------------------------------------------------------------------------------------------------
ab-ex-pnav-edit.axvw (.js)

- using stock Ext.JS TreePanel control to display ARCHIBUS data;
- creating and passing restrictions to DataSource object;

ab-ex-pnav-edit-column-tree.axvw (.js)

- using customized Ext.JS TreePanel control with extra columns to display ARCHIBUS data;

ab-column-tree.css
ab-column-tree.js 

- required files for the ab-ex-pnav-edit-column-tree.axvw example view (borrowed from Ext.JS);
