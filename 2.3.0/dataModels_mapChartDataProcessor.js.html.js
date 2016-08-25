tui.util.defineNamespace("fedoc.content", {});
fedoc.content["dataModels_mapChartDataProcessor.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Data processor for map chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar DataProcessor = require('./dataProcessor');\nvar renderUtil = require('../helpers/renderUtil');\n\n/**\n * Raw series data.\n * @typedef {Array.&lt;{code: string, name: ?string, data: number}>} rawSeriesData\n */\n\n/**\n * Value map.\n * @typedef {{value: number, label: string, name: ?string}} valueMap\n */\n\nvar MapChartDataProcessor = tui.util.defineClass(DataProcessor, /** @lends MapChartDataProcessor.prototype */{\n    /**\n     * Data processor for map chart.\n     * @constructs MapChartDataProcessor\n     * @extends DataProcessor\n     */\n    init: function() {\n        DataProcessor.apply(this, arguments);\n    },\n\n    /**\n     * Update raw data.\n     * @param {{series: rawSeriesData}} rawData raw data\n     */\n    initData: function(rawData) {\n        this.rawData = rawData;\n\n        /**\n         * value map\n         * @type {valueMap}\n         */\n        this.valueMap = null;\n    },\n\n    /**\n     * Make value map.\n     * @returns {valueMap} value map\n     * @private\n     */\n    _makeValueMap: function() {\n        var rawSeriesData = this.rawData.series;\n        var valueMap = {};\n        var formatFunctions = this._findFormatFunctions();\n\n        tui.util.forEachArray(rawSeriesData, function(datum) {\n            var result = {\n                value: datum.data,\n                label: renderUtil.formatValue(datum.data, formatFunctions, 'map', 'series')\n            };\n\n            if (datum.name) {\n                result.name = datum.name;\n            }\n\n            if (datum.labelCoordinate) {\n                result.labelCoordinate = datum.labelCoordinate;\n            }\n\n            valueMap[datum.code] = result;\n        });\n\n        return valueMap;\n    },\n\n    /**\n     * Get value map.\n     * @returns {number} value\n     */\n    getValueMap: function() {\n        if (!this.valueMap) {\n            this.valueMap = this._makeValueMap();\n        }\n\n        return this.valueMap;\n    },\n\n    /**\n     * Get values.\n     * @returns {Array.&lt;number>} picked values.\n     */\n    getValues: function() {\n        return tui.util.pluck(this.getValueMap(), 'value');\n    },\n\n    /**\n     * Get valueMap datum.\n     * @param {string} code map code\n     * @returns {{code: string, name: string, label: number,\n     *              labelCoordinate: {x: number, y: number}}} valueMap datum\n     */\n    getValueMapDatum: function(code) {\n        return this.getValueMap()[code];\n    },\n\n    /**\n     * Add data ratios of map chart.\n     * @param {{min: number, max: number}} limit axis limit\n     */\n    addDataRatios: function(limit) {\n        var min = limit.min,\n            max = limit.max - min;\n        tui.util.forEach(this.getValueMap(), function(map) {\n            map.ratio = (map.value - min) / max;\n        });\n    }\n});\n\nmodule.exports = MapChartDataProcessor;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"