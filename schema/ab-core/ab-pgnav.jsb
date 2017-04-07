<?xml version="1.0" encoding="utf-8"?>
<project path="" name="ab-pgnav" author="ARCHIBUS Inc" version="2.0" copyright="$projectName&#xD;&#xA;Copyright(c) 2006-2008, $author.&#xD;&#xA;&#xD;&#xA;" output="$project" source="False" source-dir="$output\source" minify="False" min-dir="$output" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="" />
  <target name="PgNav" file="$output\ab-pgnav.js" debug="True" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="controls\ab-namespace-no-ext.js" />
    <include name="controls\ab-workflow-standalone.js" />
    <include name="libraries\jquery\hovertip\hovertip.js" />
    <include name="page-navigation\js\vendor\html2canvas.js" />
    <include name="page-navigation\js\vendor\jquery.contextMenu.js" />
    <include name="page-navigation\js\vendor\jquery.mousewheel.js" />
    <include name="page-navigation\js\vendor\jquery.sparkline-2.1.js" />
    <include name="page-navigation\js\vendor\jquery.ui.position.js" />
    <include name="page-navigation\js\ab-pgnav-alerts-list.js" />
    <include name="page-navigation\js\ab-pgnav-bucket-paging.js" />
    <include name="page-navigation\js\ab-pgnav-context-menu.js" />
    <include name="page-navigation\js\ab-pgnav-file-management.js" />
    <include name="page-navigation\js\ab-pgnav-history.js" />
    <include name="page-navigation\js\ab-pgnav-localization.js" />
    <include name="page-navigation\js\ab-pgnav-my-favorites.js" />
    <include name="page-navigation\js\ab-pgnav-my-favorites-dialog.js" />
    <include name="page-navigation\js\ab-pgnav-page-navigator.js" />
    <include name="page-navigation\js\ab-pgnav-reporting.js" />
    <include name="page-navigation\js\ab-pgnav-runtime-controls.js" />
    <include name="page-navigation\js\ab-pgnav-sibling-tasks.js" />
    <include name="page-navigation\js\ab-pgnav-user-menu.js" />
    <include name="page-navigation\js\ab-pgnav-view-controller.js" />
    <include name="page-navigation\js\ab-pgnav-view-type.js" />
    <include name="page-navigation\js\plugins.js" />
    <include name="page-navigation\js\page-editor\ab-pgnav-editor-controller.js" />
    <include name="page-navigation\js\page-editor\ab-pgnav-editor-dragdrop.js" />
    <include name="page-navigation\js\page-editor\ab-pgnav-editor-parser.js" />
    <include name="page-navigation\js\page-editor\ab-pgnav-editor-services.js" />
    <include name="page-navigation\js\page-editor\ab-pgnav-editor-view.js" />
    <include name="page-navigation\js\vendor\leaflet.js" />
    <include name="page-navigation\js\vendor\esri-leaflet.js" />
    <include name="page-navigation\js\vendor\google-maps-api.js" />
    <include name="page-navigation\js\leaflet-google.js" />
    <include name="page-navigation\js\leaflet-markercluster.js" />
    <include name="page-navigation\js\ab-pgnav-map.js" />
  </target>
  <file name="controls\ab-namespace-no-ext.js" path="controls" />
  <file name="controls\ab-workflow-standalone.js" path="controls" />
  <file name="libraries\jquery\hovertip\hovertip.js" path="libraries\jquery\hovertip" />
  <file name="page-navigation\js\vendor\html2canvas.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\jquery.contextMenu.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\jquery.mousewheel.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\jquery.sparkline-2.1.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\jquery.ui.position.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\ab-pgnav-alerts-list.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-bucket-paging.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-user-menu.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-context-menu.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-file-management.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-history.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-localization.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-my-favorites.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-my-favorites-dialog.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-page-navigator.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-reporting.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-runtime-controls.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-sibling-tasks.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-view-controller.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-view-type.js" path="page-navigation\js" />
  <file name="page-navigation\js\plugins.js" path="page-navigation\js" />
  <file name="page-navigation\js\page-editor\ab-pgnav-editor-controller.js" path="page-navigation\js\page-editor" />
  <file name="page-navigation\js\page-editor\ab-pgnav-editor-dragdrop.js" path="page-navigation\js\page-editor" />
  <file name="page-navigation\js\page-editor\ab-pgnav-editor-parser.js" path="page-navigation\js\page-editor" />
  <file name="page-navigation\js\page-editor\ab-pgnav-editor-services.js" path="page-navigation\js\page-editor" />
  <file name="page-navigation\js\page-editor\ab-pgnav-editor-view.js" path="page-navigation\js\page-editor" />
  <file name="page-navigation\js\vendor\leaflet.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\esri-leaflet.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\vendor\google-maps-api.js" path="page-navigation\js\vendor" />
  <file name="page-navigation\js\leaflet-google.js" path="page-navigation\js" />
  <file name="page-navigation\js\leaflet-markercluster.js" path="page-navigation\js" />
  <file name="page-navigation\js\ab-pgnav-map.js" path="page-navigation\js" />
</project>