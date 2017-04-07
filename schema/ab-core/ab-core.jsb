<?xml version="1.0" encoding="utf-8"?>
<project path="" name="ab-core" author="ARCHIBUS Inc" version="2.0" copyright="$projectName&#xD;&#xA;Copyright(c) 2006-2008, $author.&#xD;&#xA;&#xD;&#xA;" output="$project" source="False" source-dir="$output\source" minify="False" min-dir="$output" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="" />
  <file name="controls\compatibility\calendar.js" path="controls\compatibility" />
  <file name="controls\compatibility\common.js" path="controls\compatibility" />
  <file name="controls\compatibility\date-time.js" path="controls\compatibility" />
  <file name="controls\compatibility\inputs-validation.js" path="controls\compatibility" />
  <file name="controls\compatibility\locale.js" path="controls\compatibility" />
  <file name="controls\grid\ab-grid.js" path="controls\grid" />
  <file name="controls\grid\ab-miniconsole.js" path="controls\grid" />
  <file name="controls\grid\ab-reportgrid.js" path="controls\grid" />
  <file name="controls\grid\ab-select-value.js" path="controls\grid" />
  <file name="controls\ab-column-report.js" path="controls" />
  <file name="controls\ab-command.js" path="controls" />
  <file name="controls\ab-component.js" path="controls" />
  <file name="controls\ab-form.js" path="controls" />
  <file name="controls\ab-layout.js" path="controls" />
  <file name="controls\ab-namespace.js" path="controls" />
  <file name="controls\ab-tabs.js" path="controls" />
  <file name="controls\ab-view.js" path="controls" />
  <file name="controls\ab-workflow.js" path="controls" />
  <file name="libraries\base\base.js" path="libraries\base" />
  <file name="libraries\json\jsonrpc.js" path="libraries\json" />
  <target name="Core" file="$output\ab-core.js" debug="True" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="libraries\ext-mif\miframe.js" />
    <include name="controls\compatibility\common.js" />
    <include name="controls\compatibility\locale.js" />
    <include name="controls\compatibility\date-time.js" />
    <include name="controls\compatibility\inputs-validation.js" />
    <include name="controls\compatibility\calendar.js" />
    <include name="controls\compatibility\reports.js" />
    <include name="libraries\base\base.js" />
    <include name="libraries\json\jsonrpc.js" />
    <include name="libraries\jst\trimpath-template.js" />
    <include name="libraries\yui\yahoo.js" />
    <include name="libraries\yui\dom.js" />
    <include name="libraries\yui\event.js" />
    <include name="libraries\yui\treeview.js" />
    <include name="libraries\yui\logger.js" />
    <include name="libraries\jquery\js\jquery-1.11.3.min.js" />
    <include name="libraries\jquery\js\jquery-ui-1.11.4.custom.min.js" />
    <include name="libraries\underscore\underscore-min.js" />
    <include name="libraries\backbone\backbone-min.js" />
    <include name="libraries\handlebars\handlebars.js" />
    <include name="libraries\placeholders\Placeholders.js" />
    <include name="libraries\flex\FABridge.js" />
    <include name="libraries\util\acadcolormanager.js" />
    <include name="libraries\svg\rgbcolor.js" />
    <include name="libraries\svg\StackBlur.js" />
    <include name="libraries\svg\canvg.js" />
    <include name="controls\ab-namespace.js" />
    <include name="controls\ab-data.js" />
    <include name="controls\ab-workflow.js" />
    <include name="controls\ab-view.js" />
    <include name="controls\ab-command.js" />
    <include name="controls\ab-component.js" />
    <include name="controls\ab-layout.js" />
    <include name="controls\ab-tabs.js" />
    <include name="controls\ab-form.js" />
    <include name="controls\ab-form-autocomplete.js" />
    <include name="controls\ab-column-report.js" />
    <include name="controls\ab-scroller.js" />
    <include name="controls\grid\ab-grid.js" />
    <include name="controls\grid\ab-reportgrid.js" />
    <include name="controls\grid\ab-miniconsole.js" />
    <include name="controls\grid\ab-categorygrid.js" />
    <include name="controls\tree\ab-tree.js" />
    <include name="controls\tree\ab-treetable.js" />
    <include name="controls\grid\ab-select-value.js" />
    <include name="controls\tree\ab-select-value-tree.js" />
    <include name="controls\ab-data-view.js" />
    <include name="controls\ab-cross-table.js" />
    <include name="controls\ab-flash-component.js" />
    <include name="controls\drawing\ab-dwgviewer.js" />
    <include name="controls\drawing\svg\ab-svg-capture-control.js" />
    <include name="controls\chart\ab-chart-common.js" />
    <include name="controls\chart\ab-chart.js" />
    <include name="controls\paginate\ab-paginated-base-report.js" />
    <include name="controls\paginate\ab-paginated-results-report.js" />
    <include name="controls\paginate\ab-paginated-progress-report.js" />
    <include name="views\ab-secure.js" />
    <include name="libraries\amcharts\amcharts.js" />
    <include name="libraries\amcharts\exporting\amexport.js" />
    <include name="libraries\amcharts\exporting\jspdf.js" />
    <include name="libraries\amcharts\exporting\jspdf.plugin.addimage.js" />
    <include name="libraries\amcharts\exporting\filesaver.js" />
    <include name="libraries\amcharts\serial.js" />
    <include name="libraries\amcharts\pie.js" />
    <include name="controls\htmlchart\ab-htmlchart-config.js" />
    <include name="controls\htmlchart\ab-htmlchart-control-base.js" />
    <include name="controls\htmlchart\ab-htmlchart-control-serial.js" />
    <include name="controls\htmlchart\ab-htmlchart-control-pie.js" />
    <include name="controls\htmlchart\ab-htmlchart-control.js" />
    <include name="controls\htmlchart\ab-htmlchart.js" />
  </target>
  <file name="controls\compatibility\reports.js" path="controls\compatibility" />
  <file name="libraries\jst\trimpath-template.js" path="libraries\jst" />
  <file name="controls\tree\ab-select-value-tree.js" path="controls\tree" />
  <file name="controls\tree\ab-tree.js" path="controls\tree" />
  <file name="libraries\yui\yahoo.js" path="libraries\yui" />
  <file name="libraries\yui\dom.js" path="libraries\yui" />
  <file name="libraries\yui\event.js" path="libraries\yui" />
  <file name="libraries\yui\treeview.js" path="libraries\yui" />
  <file name="controls\ab-data.js" path="controls" />
  <file name="controls\ab-data-view.js" path="controls" />
  <file name="libraries\yui\logger.js" path="libraries\yui" />
  <file name="libraries\ext-mif\miframe.js" path="libraries\ext-mif" />
  <file name="libraries\flex\AC_OETags.js" path="libraries\flex" />
  <file name="libraries\flex\FABridge.js" path="libraries\flex" />
  <file name="controls\drawing\ab-dwgviewer.js" path="controls\drawing" />
  <file name="controls\drawing\svg\ab-svg-capture-control.js" path="controls\drawing\svg" />
  <file name="libraries\util\acadcolormanager.js" path="libraries\util" />
  <file name="libraries\svg\rgbcolor.js" path="libraries\svg\rgbcolor.js" />
  <file name="libraries\svg\StackBlur.js" path="libraries\svg\StackBlur.js" />
  <file name="libraries\svg\canvg.js" path="libraries\svg\canvg.js" />
  <file name="controls\ab-flash-component.js" path="controls" />
  <file name="controls\chart\ab-chart-common.js" path="controls\chart" />
  <file name="controls\chart\ab-chart.js" path="controls\chart" />
  <file name="controls\ab-cross-table.js" path="controls" />
  <file name="controls\paginate\ab-paginated-base-report.js" path="controls\paginate" />
  <file name="controls\paginate\ab-paginated-results-report.js" path="controls\paginate" />
  <file name="controls\paginate\ab-paginated-progress-report.js" path="controls\paginate" />
  <file name="views\ab-secure.js" path="views" />
  <file name="controls\grid\ab-categorygrid.js" path="controls\grid" />
  <file name="controls\tree\ab-treetable.js" path="controls\tree" />
  <file name="controls\ab-form-autocomplete.js" path="controls" />
  <file name="controls\ab-scroller.js" path="controls" />
  <file name="libraries\jquery\js\jquery-1.11.3.min.js" path="libraries\jquery\js" />
  <file name="libraries\jquery\js\jquery-ui-1.11.4.custom.min.js" path="libraries\jquery\js" />
  <file name="libraries\underscore\underscore-min.js" path="libraries\underscore" />
  <file name="libraries\backbone\backbone-min.js" path="libraries\backbone" />
  <file name="libraries\amcharts\amcharts.js" path="libraries\amcharts" />
  <file name="libraries\amcharts\exporting\amexport.js" path="libraries\amcharts\exporting" />
  <file name="libraries\amcharts\exporting\filesaver.js" path="libraries\amcharts\exporting" />
  <file name="libraries\amcharts\serial.js" path="libraries\amcharts" />
  <file name="libraries\amcharts\pie.js" path="libraries\amcharts" />
  <file name="controls\htmlchart\ab-htmlchart-config.js" path="controls\htmlchart" />
  <file name="controls\htmlchart\ab-htmlchart-control-base.js" path="controls\htmlchart" />
  <file name="controls\htmlchart\ab-htmlchart-control-serial.js" path="controls\htmlchart" />
  <file name="controls\htmlchart\ab-htmlchart-control-pie.js" path="controls\htmlchart" />
  <file name="controls\htmlchart\ab-htmlchart-control.js" path="controls\htmlchart" />
  <file name="controls\htmlchart\ab-htmlchart.js" path="controls\htmlchart" />
  <file name="libraries\handlebars\handlebars.js" path="libraries\handlebars" />
  <file name="libraries\placeholders\Placeholders.js" path="libraries\placeholders" />
  <file name="libraries\amcharts\exporting\jspdf.plugin.addimage.js" path="libraries\amcharts\exporting" />
  <file name="libraries\amcharts\exporting\jspdf.js" path="libraries\amcharts\exporting" />
</project>