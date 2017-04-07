update gb_fp_airc_data
set avg_fuel = (select (gb_fp_airc_data.avg_fuel_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_airc_data.units_type and bill_unit_id = gb_fp_airc_data.units)

update gb_fp_carbon_data
set content = (select (gb_fp_carbon_data.content_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_carbon_data.units_type and bill_unit_id = gb_fp_carbon_data.units)

update gb_fp_comm_airc_data
set ch4 = (select (gb_fp_comm_airc_data.ch4_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_comm_airc_data.ch4_n2o_units_type and bill_unit_id = gb_fp_comm_airc_data.ch4_n2o_units),
n2o = (select (gb_fp_comm_airc_data.n2o_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_comm_airc_data.ch4_n2o_units_type and bill_unit_id = gb_fp_comm_airc_data.ch4_n2o_units),
co2 = (select (gb_fp_comm_airc_data.co2_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_comm_airc_data.co2_units_type and bill_unit_id = gb_fp_comm_airc_data.co2_units)

update gb_fp_egrid_subregions
set ch4 = (select (gb_fp_egrid_subregions.ch4_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_egrid_subregions.ch4_n2o_units_type and bill_unit_id = gb_fp_egrid_subregions.ch4_n2o_units),
n2o = (select (gb_fp_egrid_subregions.n2o_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_egrid_subregions.ch4_n2o_units_type and bill_unit_id = gb_fp_egrid_subregions.ch4_n2o_units),
co2 = (select (gb_fp_egrid_subregions.co2_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_egrid_subregions.co2_units_type and bill_unit_id = gb_fp_egrid_subregions.co2_units)

update gb_fp_emiss_data
set ch4 = (select (gb_fp_emiss_data.ch4_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_emiss_data.units_type and bill_unit_id = gb_fp_emiss_data.units),
n2o = (select (gb_fp_emiss_data.n2o_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_emiss_data.units_type and bill_unit_id = gb_fp_emiss_data.units)

update gb_fp_fuel_dens_data
set fuel_density = (select (gb_fp_fuel_dens_data.fuel_density_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_fuel_dens_data.units_type and bill_unit_id = gb_fp_fuel_dens_data.units)

update gb_fp_heat_data
set content = (select (gb_fp_heat_data.content_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_heat_data.units_type and bill_unit_id = gb_fp_heat_data.units)

update gb_fp_mobile_data
set ch4 = (select (gb_fp_mobile_data.ch4_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_mobile_data.ch4_n2o_units_type and bill_unit_id = gb_fp_mobile_data.ch4_n2o_units),
n2o = (select (gb_fp_mobile_data.n2o_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_mobile_data.ch4_n2o_units_type and bill_unit_id = gb_fp_mobile_data.ch4_n2o_units),
co2 = (select (gb_fp_mobile_data.co2_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_mobile_data.co2_units_type and bill_unit_id = gb_fp_mobile_data.co2_units)

update gb_fp_refrig_data
set charge = (select (gb_fp_refrig_data.charge_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_refrig_data.units_type and bill_unit_id = gb_fp_refrig_data.units)

update gb_fp_waste_liq_data
set bod5_wastewater = (select (gb_fp_waste_liq_data.bod5_wastewater_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_liq_data.units_type and bill_unit_id = gb_fp_waste_liq_data.units)

update gb_fp_waste_sol_data
set carbon_sequestration = (select (gb_fp_waste_sol_data.carbon_sequestration_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
combustion = (select (gb_fp_waste_sol_data.combustion_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
composite_disposal = (select (gb_fp_waste_sol_data.composite_disposal_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
composite_downstream = (select (gb_fp_waste_sol_data.composite_downstream_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
landfilling = (select (gb_fp_waste_sol_data.landfilling_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
manufacture_mix = (select (gb_fp_waste_sol_data.manufacture_mix_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
manufacture_recycled = (select (gb_fp_waste_sol_data.manufacture_recycled_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
raw_acquisition = (select (gb_fp_waste_sol_data.raw_acquisition_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units),
recycling = (select (gb_fp_waste_sol_data.recycling_entry * conversion_factor) from bill_unit where bill_type_id = gb_fp_waste_sol_data.units_type and bill_unit_id = gb_fp_waste_sol_data.units)

commit;