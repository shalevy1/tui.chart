/**
 * @fileoverview Test seriesGroup.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesGroup = require('../../src/js/dataModels/seriesGroup'),
    SeriesItem = require('../../src/js/dataModels/seriesItem');

describe('test seriesGroup', function() {
    var seriesGroup;

    beforeEach(function() {
        seriesGroup = new SeriesGroup();
    });

    describe('_makeValues()', function() {
        it('seriesItem들에서 values를 추출합니다.', function() {
            var actual, expected;
            seriesGroup.items = [
                new SeriesItem(10),
                new SeriesItem(20),
                new SeriesItem(30),
                new SeriesItem(40)
            ];

            actual = seriesGroup._makeValues();
            expected = [10, 20, 30, 40];

            expect(actual).toEqual(expected);
        });

        it('seriesItem이 range 타입일 경우 start값을 포함하여 추출합니다.', function() {
            var actual, expected;
            seriesGroup.items = [
                new SeriesItem([10, 20]),
                new SeriesItem([20, 30]),
                new SeriesItem([30, 40]),
                new SeriesItem([40, 50])
            ];

            actual = seriesGroup._makeValues();
            expected = [20, 10, 30, 20, 40, 30, 50, 40];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeValuesMapPerStack()', function() {
        it('seriesItem에서 value를 추출하여 stack 기준으로 values map을 생성합니다.', function() {
            var actual, expected;

            seriesGroup.items = [
                new SeriesItem(10, 'st1', []),
                new SeriesItem(20, 'st2', []),
                new SeriesItem(30, 'st1', []),
                new SeriesItem(40, 'st2', [])
            ];

            actual = seriesGroup._makeValuesMapPerStack();
            expected = {
                st1: [10, 30],
                st2: [20, 40]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSumMapPerStack()', function() {
        it('stack으로 구성된 valueMap을 값을 values의 합 으로 대체하여 반환합니다.', function() {
            var actual, expected;

            seriesGroup.items = [
                new SeriesItem(10, 'st1', []),
                new SeriesItem(20, 'st2', []),
                new SeriesItem(30, 'st1', []),
                new SeriesItem(40, 'st2', [])
            ];

            actual = seriesGroup._makeSumMapPerStack();
            expected = {
                st1: 40,
                st2: 60
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('addRatiosWhenPercentStacked()', function() {
        it('percent stacked옵션일 경우에는 dividingNumber를 구하여 baseRatio와 함께 seriesItem.addRatio에 전달 합니다.', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesItem.stack = 'st';
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatiosWhenPercentStacked(0.5);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(20, 0, 0.5);
        });
    });

    describe('addRatiosWhenDivergingStacked()', function() {
        it('diverging stacked옵션일 경우에는 plusSum, minusSum 중 하나를 선택하여 dividingNumber로 선택한 후 baseRatio 0.5와 함께 seriesItem.addRatio에 전달 합니다.', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatiosWhenDivergingStacked(30, 20);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(30, 0, 0.5);
        });
    });

    describe('addRatios()', function() {
        it('addRatios는 전달 받은 divNumber, subValue를 seriesItem.addRatio에 그대로 전달 합니다.', function() {
            var seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

            seriesItem.value = 20;
            seriesGroup.items = [seriesItem];
            seriesGroup.addRatios(20, 10);

            expect(seriesItem.addRatio).toHaveBeenCalledWith(20, 10);
        });
    });
});