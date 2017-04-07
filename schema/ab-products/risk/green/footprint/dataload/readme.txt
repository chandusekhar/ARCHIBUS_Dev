The file ConvertFactorsEntryValues.sql (located in schema\ab-products\risk\green\footprint\dataload) is a SQL script that you have to run against the database server if you import data into the Green Building Background Data tables that represent the Carbon Footprint Protocols, listed below.

Those tables use two fields for every factor:  one field is used on forms for the user to enter a value in units that the user selects on the same form.  This field has a name with a suffix of "_entry".  The other field is a calculated field that stores the converted "_entry" field value in a fixed internal units.  The name of this field is the same as the "_entry" field without the suffix.  For example:  gb_fp_refrig_data.charge_entry and gb_fp_refrig_data.charge.

If you import data into any of the tables below, you should omit the calculated field counterparts of any "_entry" fields.  Import data into the fields with the "_entry" suffix, and also populate the corresponding units fields, named as or with a suffix of "units" and "units_type".  The fields named as or with the suffix "units_type" MUST have a specific value that is unique to each field.  These values are shown below.  The values used in the "units" and "units_type" fields are validated against the bill_unit.units and bill_unit.units_type fields.

There are 3 tables below with two values for units_type.  This means there are two fields in the table with a suffix of "_units_type".  Use the first value for the ch4_n2o_units_type field, and the 2nd value for the co2_units_type field.


After you import data into any of the tables below using the procedure above, execute the ConvertFactorsEntryValues.sql script against your database server to convert the values in the "_entry" fields (which are in the units specified in your load file) into the Green Building internal units for each field and store them in the calculated fields.


Table Name		Required units_type field value(s)
===================	========================================================
gb_fp_airc_data		AIRCRAFT FUEL CONSUMPTION
gb_fp_carbon_data	CARBON CONTENT
gb_fp_comm_airc_data	COMMERC AIR CH4-N2O EMISSIONS, COMMERC AIR CO2 EMISSIONS
gb_fp_egrid_subregions	EGRID CH4-N2O EMISSIONS, EGRID CO2 EMISSIONS
gb_fp_emiss_data	FUEL EMISSIONS
gb_fp_fuel_dens_data	FUEL DENSITY
gb_fp_heat_data		HEAT CONTENT
gb_fp_mobile_data	MOBILE CH4-N2O EMISSIONS, MOBILE CO2 EMISSIONS
gb_fp_refrig_data	REFRIGERATION EMISSIONS
gb_fp_waste_liq_data	WASTE WATER EMISSIONS
gb_fp_waste_sol_data	SOLID WASTE EMISSIONS

