<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
 <xsl:output method="html" indent="yes" />
 <xsl:include href="../../../../../ab-system/xsl/constants.xsl" />

 <xsl:variable name="actionCnt" select="6"/>

 <xsl:variable name="activeTab" select="/*/afmTableGroup/message[@name='active_tab']/"/>

 <xsl:variable name="frm_collapse_icon" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-hide-console.gif')"/>
 <xsl:variable name="frm_collapse_icon_title" translatable="true">Expand or Collapse Restriction and Project List Windows</xsl:variable>

 <xsl:variable name="rest">
  <xsl:call-template name="replaceString">
   <xsl:with-param name="textStr" select="concat('.axvw?handler=com.archibus.config.Find&amp;project.project_id=',/*/afmTableGroup/dataSource/data/records/record[1]/@project.project_id)"/>
   <xsl:with-param name="findStr" select="' '"/>
   <xsl:with-param name="replaceStr" select="'%20'"/>
  </xsl:call-template>
 </xsl:variable>

 <xsl:variable name="action1" select="concat('brg-proj-console-planning-menu', $rest)"/>
 <xsl:variable name="title1" translatable="true">Plan</xsl:variable>
 <xsl:variable name="icon1" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-task.gif')"/>

 <xsl:variable name="action2" select="concat('brg-proj-console-procurement-menu', $rest)"/>
 <xsl:variable name="title2" translatable="true">Procure</xsl:variable>
 <xsl:variable name="icon2" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-depend.gif')"/>

 <xsl:variable name="action3" select="concat('brg-proj-console-communications-menu', $rest)"/>
 <xsl:variable name="title3" translatable="true">Communicate</xsl:variable>
 <xsl:variable name="icon3" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-team.gif')"/>

 <xsl:variable name="action4" select="concat('brg-proj-console-schedule-menu', $rest)"/>
 <xsl:variable name="title4" translatable="true">Schedule</xsl:variable>
 <xsl:variable name="icon4" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-gantt.gif')"/>

 <xsl:variable name="action5" select="concat('brg-proj-console-adjustments-menu', $rest)"/>
 <xsl:variable name="title5" translatable="true">Adjust</xsl:variable>
 <xsl:variable name="icon5" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-adjust.gif')"/>

 <xsl:variable name="action6" select="concat('brg-proj-console-costs-menu', $rest)"/>
 <xsl:variable name="title6" translatable="true">Cost</xsl:variable>
 <xsl:variable name="icon6" select="concat($abSchemaSystemGraphicsFolder,'/ab-icon-proj-cost.gif')"/>


 <xsl:variable name="activeTabAction">
   <xsl:choose>
     <xsl:when test="$activeTab='id1'">
       <xsl:value-of select="$action1"/>
     </xsl:when>
     <xsl:when test="$activeTab='id2'">
       <xsl:value-of select="$action2"/>
     </xsl:when>
     <xsl:when test="$activeTab='id3'">
       <xsl:value-of select="$action3"/>
     </xsl:when>
     <xsl:when test="$activeTab='id4'">
       <xsl:value-of select="$action4"/>
     </xsl:when>
     <xsl:when test="$activeTab='id5'">
       <xsl:value-of select="$action5"/>
     </xsl:when>
     <xsl:when test="$activeTab='id6'">
       <xsl:value-of select="$action6"/>
     </xsl:when>
   </xsl:choose>
 </xsl:variable>

 <xsl:template match="/">

	<html>
	    <!-- LinkingCSS in common.xsl includes the default style sheets -->
			<link rel="stylesheet" type="text/css" href="#Attribute%//@relativeFileDirectory%/brg-proj-management-console.css" />
	    <xsl:call-template name="LinkingCSS" />
	    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>
	    <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/brg-proj-management-console-tabmenu.js"><xsl:value-of select="$whiteSpace" /></script>

	    <body class="body" onload='inital("{$abSchemaSystemFolder}", {$actionCnt}, "{$activeTab}", "{$activeTabAction}")'>

        <table align="left" border="1" width="100%" id="table1" cellspacing="0" cellpadding="0" bgcolor="#D2E4FC">

			  <tr  align="left"><td align="left">
          <table class="AbPMConsoleTabTable" align="left" width="100%">
            <tr>

            <td nowrap="1" width="20">
						  <a href="javascript:void(0);" title="{$frm_collapse_icon_title}" onclick='collapseFrames();'><img alt="{$frm_collapse_icon_title}" src="{$frm_collapse_icon}" border="0"/></a>
            </td>
            <td nowrap="1">
              <xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record[1]/@project.project_id"/>
            </td>
            <td align="right" nowrap="1">
              <xsl:variable name="statusValue" select="/*/afmTableGroup/dataSource/data/records/record[1]/@project.status"/>
              <xsl:value-of select="/*/afmTableGroup/dataSource/data/fields/field[@name='status']/enumeration/item[@value=$statusValue]/@displayValue"/>
            </td>
            </tr>
          </table>

        </td></tr>

			  <tr  align="left"><td align="left">
				  <table align="left" ><tr align="left">

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action1}" title="{$title1}" onclick='changeActionFormat("id1");return true;'><img alt="{$title1}" src="{$icon1}" border="0"/></a></td>
					  <td id="id1" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action1}" title="{$title1}" onclick='changeActionFormat("id1");return true;'><xsl:value-of select="$title1"/></a></td>
					  <td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action2}" title="{$title2}" onclick='changeActionFormat("id2");return true;'><img alt="{$title2}" src="{$icon2}" border="0"/></a></td>
					  <td id="id2" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action2}" title="{$title2}" onclick='changeActionFormat("id2");return true;'><xsl:value-of select="$title2"/></a></td>
					  <td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action3}" title="{$title3}" onclick='changeActionFormat("id3");return true;'><img alt="{$title3}" src="{$icon3}" border="0"/></a></td>
					  <td id="id3" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action3}" title="{$title3}" onclick='changeActionFormat("id3");return true;'><xsl:value-of select="$title3"/></a></td>
					  <td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action4}" title="{$title4}" onclick='changeActionFormat("id4");return true;'><img alt="{$title4}" src="{$icon4}" border="0"/></a></td>
					  <td id="id4" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action4}" title="{$title4}" onclick='changeActionFormat("id4");return true;'><xsl:value-of select="$title4"/></a></td>
					  <td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action5}" title="{$title5}" onclick='changeActionFormat("id5");return true;'><img alt="{$title5}" src="{$icon5}" border="0"/></a></td>
					  <td id="id6" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action6}" title="{$title6}" onclick='changeActionFormat("id6");return true;'><xsl:value-of select="$title6"/></a></td>
					  <td  nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">   |  </td>

				    <td nowrap="1" valign="middle" align="right" >
						  <a  target="dashboardcontent" href="{$action6}" title="{$title6}" onclick='changeActionFormat("id6");return true;'><img alt="{$title6}" src="{$icon6}" border="0"/></a></td>
					  <td id="id5" nowrap="1" valign="middle" align="right" class="alterViewTopFrameAction">
						  <a  target="dashboardcontent" href="{$action5}" title="{$title5}" onclick='changeActionFormat("id5");return true;'><xsl:value-of select="$title5"/></a></td>

				  </tr>
				  </table>
			  </td></tr>
			  </table>

	    </body>
	</html>
  </xsl:template>

  <xsl:include href="../../../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../../../ab-system/xsl/ab-utils.xsl" />
</xsl:stylesheet>
