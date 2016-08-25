tui.util.defineNamespace("fedoc.content", {});
fedoc.content["customEvents_areaTypeDataModel.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview AreaTypeDataModel is data model for custom event of area type.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar concat = Array.prototype.concat;\n\nvar AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {\n    /**\n     * AreaTypeDataModel is data mode for custom event of area type.\n     * @constructs AreaTypeDataModel\n     * @param {object} seriesInfo series info\n     */\n    init: function(seriesInfo) {\n        this.data = this._makeData(seriesInfo.data.groupPositions, seriesInfo.chartType);\n    },\n\n    /**\n     * Make data for detecting mouse event.\n     * @param {Array.&lt;Array.&lt;object>>} groupPositions - group positions\n     * @param {string} chartType - chart type\n     * @returns {Array}\n     * @private\n     */\n    _makeData: function(groupPositions, chartType) {\n        var data;\n\n        groupPositions = tui.util.pivot(groupPositions);\n        data = tui.util.map(groupPositions, function(positions, groupIndex) {\n            return tui.util.map(positions, function(position, index) {\n                var datum = null;\n\n                if (position) {\n                    datum = {\n                        chartType: chartType,\n                        indexes: {\n                            groupIndex: groupIndex,\n                            index: index\n                        },\n                        bound: position\n                    };\n                }\n\n                return datum;\n            });\n        });\n\n        return tui.util.filter(concat.apply([], data), function(datum) {\n            return !!datum;\n        });\n    },\n\n    /**\n     * Find Data.\n     * @param {{x: number, y: number}} layerPosition - layer position\n     * @returns {object}\n     */\n    findData: function(layerPosition) {\n        var result = null;\n        var minX = 10000;\n        var minY = 10000;\n        var foundData = [];\n\n        tui.util.forEach(this.data, function(datum) {\n            var diff = Math.abs(layerPosition.x - datum.bound.left);\n            if (minX > diff) {\n                minX = diff;\n                foundData = [datum];\n            } else if (minX === diff) {\n                foundData.push(datum);\n            }\n        });\n\n        tui.util.forEach(foundData, function(datum) {\n            var diff = Math.abs(layerPosition.y - datum.bound.top);\n            if (minY > diff) {\n                minY = diff;\n                result = datum;\n            }\n        });\n\n        return result;\n    },\n\n    /**\n     * Find data by indexes.\n     * @param {number} groupIndex - group index\n     * @param {number} index - index\n     * @returns {object}\n     * @private\n     */\n    _findDataByIndexes: function(groupIndex, index) {\n        var foundData = null;\n\n        tui.util.forEachArray(this.data, function(datum) {\n            if (datum.indexes.groupIndex === groupIndex &amp;&amp; datum.indexes.index === index) {\n                foundData = datum;\n            }\n\n            return !foundData;\n        });\n\n        return foundData;\n    },\n\n    /**\n     * Get first data.\n     * @param {number} index - index\n     * @returns {object}\n     */\n    getFirstData: function(index) {\n        return this._findDataByIndexes(0, index);\n    },\n\n    /**\n     * Get last data.\n     * @param {number} index - index\n     * @returns {object}\n     */\n    getLastData: function(index) {\n        var lastGroupIndex = this.data.length - 1;\n\n        return this._findDataByIndexes(lastGroupIndex, index);\n    }\n});\n\nmodule.exports = AreaTypeDataModel;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"