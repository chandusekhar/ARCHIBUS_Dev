<?xml version="1.0" encoding="UTF-8"?>
<!-- Ying Qin -->
<!-- 2007-03-21 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="//title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript">
                                function refreshTarget()
                                {
                                  var bl_id = "", fl_id = "", rm_id = "", strSerialized = "";
                                  if(opener!=null)
                                  {
                                     var strSerialized=opener.document.getElementById("documentManagerTargetRefresh").value;
                                     var formName=opener.selected_formname;

                                     var strTarget = opener.name;

                                     if(strTarget==null || strTarget=="") { return; }

                                     var objForm = opener.document.forms[formName];

                                     if(objForm!=null) {
                                       bl_id = "bl_id='" + convert2validXMLValue(trim(opener.selected_building)) + "'";
                                       fl_id = "fl_id='" +convert2validXMLValue(trim(opener.selected_floor)) + "'";
                                       rm_id = "rm_id='" +convert2validXMLValue(trim(opener.selected_room)) + "'";

                                       var strXMLSQLTransaction = '<afmAction type="render" state="ab-eq-locate-detail.axvw" response="true">';
                                       strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions><userInputRecordsFlag>';
                                       strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="' + bl_id + ' AND ' + fl_id + ' AND ' + rm_id + '">';
                                       strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
                                       strXMLSQLTransaction = strXMLSQLTransaction + '</userInputRecordsFlag></restrictions>';
                                       strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';

                                       //send request to server
                                       sendingDataFromHiddenForm('',strXMLSQLTransaction, strTarget, '',false,'');

                                       window.close();
                                    }
                                  }
                                }
			</script>
		</head>
		<body onload="refreshTarget()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<table align="center" valign="middle">
				<tr><td style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;color:red">
					<p><xsl:value-of select="/*/title"/></p>
				</td></tr>
			</table>

			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


