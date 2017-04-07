<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle Navigator XML data-->
<!-- javascript variables or functions used here are in common.js  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
   <!-- importing constants.xsl which contains constant XSLT variables -->
   <xsl:import href="constants.xsl" />
   <!-- specified XSLT variables for this XSLT file -->
   
   <xsl:output method="html" indent="no" />
   <xsl:template match="/">
      <html>
      <title>
         <xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
      </title>
      <head>
         <!-- css and javascript files  -->
         <!-- linking path must be related to the folder in which xml is being processed -->
         <xsl:call-template name="LinkingCSS"/>
         <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>  
         <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-ep-common.js"><xsl:value-of select="$whiteSpace"/></script>  
         <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-all-levels.js"><xsl:value-of select="$whiteSpace"/></script>
      </head>
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
         <table class="showingTgrpTitleTable">
            <tr><td nowrap="1">
               <xsl:variable name="requery" translatable="true">Requery</xsl:variable>
               <xsl:text/><xsl:value-of select="/*/afmTableGroup[position()=1]/title"/><xsl:value-of select="$whiteSpace"/><span style="width:10"><br /></span>
               <a  href="#" style="cursor:hand" name="topRequeryButton" ID="topRequeryButton" onclick="window.location.reload()"><img alt="{$requery}" src="{$abSchemaSystemGraphicsFolder}/ab-requery-icon.gif" border="0"/><xsl:value-of select="$whiteSpace"/><span translatable="true">Requery</span></a>   
            <hr /></td></tr>
         </table>
         <!-- overwrite javascript variable values -->
         <script language="javascript">
            abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
         </script>
         <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) &gt; 0">
            <!-- going through each afmTableGroup -->
            <xsl:for-each select="/*/afmTableGroup">
                  <xsl:call-template name="tree-model">
                     <xsl:with-param name="afmTableGroupNodes" select="."/>
                     <xsl:with-param name="margin-left" select="0"/>
                     <xsl:with-param name="hasChildren" select="'false'"/>
                     <xsl:with-param name="nodeID" select="generate-id()"/>
                  </xsl:call-template>
            </xsl:for-each>
            <!-- if tree view has attr isTreeExpanded='false' or hasn't such attr -->
            <!-- the tree will not dafultly be expanded -->
            <xsl:variable name="isTreeExpanded">
               <xsl:choose>
                  <xsl:when test="//afmXmlView/@isTreeExpanded"><xsl:value-of select="//afmXmlView/@isTreeExpanded"/></xsl:when>
                  <xsl:otherwise>false</xsl:otherwise>
               </xsl:choose>
            </xsl:variable>
            <xsl:if test="$isTreeExpanded='false'">
               <script language="javascript">
                  ShrinkAllParentNodes();
               </script>
            </xsl:if>
         </xsl:if>
         <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) = 0">
            <div>
               <table style="margin-left:10">   
                  <tr><td class="instruction">
                     <span translatable="true">No Items.</span>
                  </td></tr>
               </table>
            </div>
         </xsl:if>
         <!-- check if there is a report records max limitaion -->
         <xsl:variable name="moreRecords" select="//afmTableGroup/dataSource/data/records/@moreRecords"/>
         <xsl:if test="$moreRecords='true'">
            <div>
            <table><tr>
               <td  class="instruction" align="center" valign="top">
                  <p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
               </td>   
            </tr></table>
            </div>
         </xsl:if>
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

   <!-- xsl template: tree-model -->
   <xsl:template name="tree-model">
      <xsl:param name="afmTableGroupNodes"/>
      <xsl:param name="margin-left"/>
      <xsl:param name="hasChildren"/>
      <xsl:param name="nodeID"/>
      <xsl:param name="UpAfmAction"/>
      <xsl:choose>
         <!-- there are subnodes under currently-processing node-->
         <xsl:when test="count($afmTableGroupNodes/afmTableGroup)>0">
            <!-- processing the individual afmTableGroup -->
            <xsl:call-template name="detailedContent">
               <xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
               <xsl:with-param name="margin-left" select="$margin-left"/>
               <xsl:with-param name="hasChildren" select="'true'"/>
               <xsl:with-param name="nodeID" select="$nodeID"/>
            </xsl:call-template>
            <div ID='{$nodeID}'>
               <!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
               <xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
                  <xsl:call-template name="tree-model">
                     <xsl:with-param name="afmTableGroupNodes" select="."/>
                     <xsl:with-param name="margin-left" select="$margin-left+1"/>
                     <xsl:with-param name="hasChildren" select="'false'"/>
                     <xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
                  </xsl:call-template>
               </xsl:for-each>
            </div>
         </xsl:when>
         <xsl:otherwise>
            <xsl:call-template name="detailedContent">
               <xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
               <xsl:with-param name="margin-left" select="$margin-left"/>
               <xsl:with-param name="hasChildren" select="$hasChildren"/>
               <xsl:with-param name="nodeID" select="$nodeID"/>
            </xsl:call-template>
         </xsl:otherwise>
      </xsl:choose>
   </xsl:template>

   <!-- xsl template: detailedContent -->
   <xsl:template name="detailedContent">
   <xsl:param name="afmTableGroupPath"/>
   <xsl:param name="hasChildren"/>
   <xsl:param name="margin-left"/>
   <xsl:param name="nodeID"/>
   <xsl:param name="UpAfmAction"/>
      <xsl:variable name="UpAfmAction" select="$afmTableGroupPath/afmAction[@role='showParent']"/>
      <xsl:variable name="role" select="$afmTableGroupPath/dataSource/data/fields//field[@role='title']"/>
      <table nowrap="1" style='margin-left:{$margin-left*10}pt;'>
         <xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
            <xsl:variable name="afmAction" select="afmAction[@type='select']"/>
            <tr nowrap="1">
               <xsl:choose>
                  <xsl:when test="$hasChildren='false'">
                     <xsl:choose>
                        <xsl:when test="count($afmAction)>0">
                           <!--xsl:variable name="SerializedString" select="$afmAction/@serialized"/-->
                           <xsl:variable name="ID" select="concat($nodeID,'_',position())"/>
                           <td nowrap="1">
                              <img alt="-" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-task.gif" BORDER="0" ID="IMG_{concat($nodeID,'_',position())}" />
                           </td>
                           <xsl:choose>
                              <xsl:when test="count($role) &gt; 0">
                                 <xsl:for-each select="@*">
                                    <xsl:variable name="index" select="position()"/>
                                    <xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
                                    <xsl:if test="$field/@role='title'">
                                       <td nowrap="1" class="treeLeafNodeTitles">
                                          <a href="#" onclick='ChangeItToActiveItem("{$ID}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'>
                                             <xsl:value-of select="."/>
                                          </a>
                                       </td>
                                    </xsl:if>
                                 </xsl:for-each>
                              </xsl:when>
                              <xsl:otherwise>
                                 <xsl:variable name="URLTitile">
                                    <xsl:for-each select="@*">
                                       <xsl:if test="position() != 1 and string-length()>0">-</xsl:if>
                                       <xsl:value-of select="."/>
                                    </xsl:for-each>
                                 </xsl:variable>
                                 <xsl:variable name="epField">
                                    <xsl:for-each select="@*">
                                       <xsl:value-of select="name()"/>
                                    </xsl:for-each>
                                 </xsl:variable>
                                 <td nowrap="1" class="treeLeafNodeTitles">
                                    <a href="#" onclick='epSaveBLFL("{$epField}={$URLTitile}");ChangeItToActiveItem("{$ID}","","{$afmAction/@serialized}","{$afmAction/@frame}");return false;'>
                                       <xsl:value-of select="$URLTitile"/>
                                    </a>
                                 </td>
                              </xsl:otherwise>
                           </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                           <!-- ??????????? -->
                           <xsl:for-each select="@*">
                              <xsl:variable name="index" select="position()"/>
                              <xsl:variable name="down" translatable="true">Down</xsl:variable>
                              <xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
                              <xsl:if test="$field/@role='title'">
                                 <td class="treeParentNodeTitles" nowrap="1">
                                    <xsl:value-of select="."/>
                                 </td>
                              </xsl:if>
                           </xsl:for-each>
                           <xsl:if test="count($UpAfmAction) &gt; 0">
                              <td>
                                 <A title="{$UpAfmAction/title}" href="#" onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,""); return false;'>
                                    <img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-nav-level-down.gif" border="0"/>
                                 </A>
                              </td>
                           </xsl:if>
                        </xsl:otherwise>
                     </xsl:choose>
                  </xsl:when>
                  <xsl:otherwise>
                     <script language="javascript">
                        <xsl:text>AddParentNodeToArray('</xsl:text><xsl:value-of select="$nodeID"/><xsl:text>');</xsl:text>
                     </script>
                     <td nowrap="1" class="cursorSelector" onclick='HiddenIt(this, "{$nodeID}");'>
                        <img alt="-" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-exp.gif"  BORDER="0" ID='IMG_1_{$nodeID}'/>
                     </td>
                     <xsl:choose>
                        <xsl:when test="count($role) &gt; 0">
                           <xsl:for-each select="@*">
                              <xsl:variable name="index" select="position()"/>
                              <xsl:variable name="field" select="$afmTableGroupPath/dataSource/data/fields/field[position()=$index]"/>
                              <xsl:if test="$field/@role='title'">
                                 <td class="treeParentNodeTitles" nowrap="1">
                                    <xsl:value-of select="."/>
                                 </td>
                                 <xsl:if test="count($UpAfmAction) &gt; 0">
                                    <td>
                                       <A title="{$UpAfmAction/title}" href="#" onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,""); return false;'>
                                          <img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-nav-level-down.gif" border="0"/>
                                       </A>
                                    </td>
                                 </xsl:if>
                              </xsl:if>
                           </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                           <td class="treeParentNodeTitles" nowrap="1">
                              <xsl:value-of select="@*[position()=1]"/>
                           </td>
                           <xsl:if test="count($UpAfmAction) &gt; 0">
                              <td>
                                 <A title="{$UpAfmAction/title}" href="#" onclick='sendingDataFromHiddenForm("","{$UpAfmAction/@serialized}","{$UpAfmAction/@frame}","",false,""); return false;'>
                                    <img alt="{$down}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-nav-level-down.gif" border="0"/>
                                 </A>
                              </td>
                           </xsl:if>
                        </xsl:otherwise>
                     </xsl:choose>
                  </xsl:otherwise>
               </xsl:choose>
            </tr>
         </xsl:for-each>
         <xsl:if test="count($afmTableGroupPath/dataSource/data/records/record)=0">
            <tr><td class="instruction"><span translatable="true">No Items.</span></td></tr>
         </xsl:if>
      </table>
   </xsl:template>
   <!-- including template model XSLT files called in XSLT -->
   <xsl:include href="common.xsl" />
</xsl:stylesheet>


