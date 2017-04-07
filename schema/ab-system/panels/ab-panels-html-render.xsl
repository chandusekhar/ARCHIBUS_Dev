<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-02-16 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:import href="../xsl/constants.xsl" />
    <xsl:template match="/">
        <html>
            <title>
                <xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
            </title>
            <head>
                <xsl:call-template name="helper_htmlHeader"/>
            </head>
            <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
                <xsl:call-template name="common">
                    <xsl:with-param name="title" select="/*/title"/>
                    <xsl:with-param name="debug" select="//@debug"/>
                    <xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
                    <xsl:with-param name="xml" select="$xml"/>
                </xsl:call-template>
                <xsl:call-template name="afmTableGroups">
                    <xsl:with-param name="afmTableGroups" select="//afmTableGroup"/>
                </xsl:call-template>
            </body>
        </html>
    </xsl:template>

    <xsl:template name="helper_htmlHeader">
        <xsl:call-template name="LinkingCSS"/>

<!--  retain for 16.4, but do not use for 16.3 patches

        <xsl:variable name="is_degug_mode" select="//@debug"/>
        <xsl:if test="$is_degug_mode='' or $is_degug_mode!='true'">
            <script language="JavaScript" src="{$abSchemaSystemFolder}/javascript/ab-common-scripts.js"><xsl:value-of select="$whiteSpace"/></script>
        </xsl:if>
        <xsl:if test="$is_degug_mode!='' and $is_degug_mode='true'">
-->
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/edit-forms.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/base/base.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/json/jsonrpc.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/yui/yahoo.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/yui/dom.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/yui/event.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/yui/treeview.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-namespace.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-workflow.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-view.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-command.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-component.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/ab-form.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/grid/ab-grid.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/grid/ab-reportgrid.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/grid/ab-miniconsole.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/tree/ab-tree.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/component/tree/ab-tree-actions.js"><xsl:value-of select="$whiteSpace"/></script>
            <script language="JavaScript" src="{$abSchemaSystemFolder}/../ab-core/views/ab-secure.js"><xsl:value-of select="$whiteSpace"/></script>

<!--
        </xsl:if>
-->
        <script language="JavaScript" src="/archibus/dwr/engine.js"><xsl:value-of select="$whiteSpace"/></script>
        <script language="JavaScript" src="/archibus/dwr/util.js"><xsl:value-of select="$whiteSpace"/></script>
        <script language="JavaScript" src="/archibus/dwr/interface/workflow.js"><xsl:value-of select="$whiteSpace"/></script>

        <script language="JavaScript" src="/archibus/dwr/interface/DocumentService.js"><xsl:value-of select="$whiteSpace"/></script>

        <xsl:call-template name="SetUpLocales"/>
        <xsl:for-each select="//afmTableGroup/dataSource/data/charts/chart">
            <xsl:copy-of select="map"/>
        </xsl:for-each>
        <xsl:for-each select="//formatting/js">
            <xsl:variable name="customized_js" select="@file"/>
            <xsl:if test="$customized_js">
                <script language="JavaScript" src="{$customized_js}"><xsl:value-of select="$whiteSpace"/></script>
            </xsl:if>
        </xsl:for-each>
        <xsl:for-each select="//style[@type='text/css']">
            <xsl:copy-of select="."/>
        </xsl:for-each>
        <script language="JavaScript">contextPath='<xsl:value-of select="//preferences/@relativeAppPath"/>';</script>
    </xsl:template>

    <xsl:include href="../xsl/common.xsl" />
    <xsl:include href="../xsl/locale.xsl" />
    <xsl:include href="../xsl/inputs-validation.xsl" />
    <xsl:include href="ab-panels-table-groups.xsl" />
    <xsl:include href="ab-panels.xsl" />
    <xsl:include href="ab-panels-form.xsl" />
    <xsl:include href="ab-panels-console.xsl" />
    <xsl:include href="ab-panels-report.xsl" />
    <xsl:include href="ab-panels-grid.xsl" />
    <xsl:include href="ab-panels-tree.xsl" />
</xsl:stylesheet>
