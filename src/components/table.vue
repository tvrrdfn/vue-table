<template lang="pug">
    .v-table
        .v-table__wrap
            .v-table__thead
                .v-table__thead__tr
                    .v-table__thead__tr-th(
                        v-for="(th, index) in theadList"
                        :class="directionCls(index)"
                        :style="{'width': th.width + 'px'}"
                        @click="onSort(index)"
                    )
                        .v-table__thead__tr-th-content {{th.name}}
                        .v-table__thead__tr-th-resize(
                            @mousedown.stop="onMousedown($event, index)"
                        )
                        
            .v-table__tbody
                .v-table__tbody__tr(
                    v-for="tr in paginationData"
                )
                    .v-table__tbody__tr-td(
                        v-for="(td, index) in tr"
                        :style="{'width': theadList[index].width + 'px'}"
                    ) {{td}}

            .v-table__tfooter
                .v-table__tfooter__tr(
                    v-for="tr in footerList"
                )
                    .v-table__tfooter__tr-th(
                        v-for="(th, index) in tr"
                        :style="{'width': theadList[index].width + 'px'}"
                    ) {{th}}

        pagination(
            ref="pagination"
            :data="tbodyList"
            :currentPage="pagination.currentPage"
            :pageLength="pagination.pageLength"
            @change="onPaginationChange"
        )
        <!-- .v-table__tpagination
            button.prev &lt;
            ul
                li
                    button 1
            button.next &gt; -->

</template>

<script type="text/javascript">
    import pagination from './pagination/pagination.vue';
    import ResizeHandler from './resize/resize';
    import Sorter from './sorter/sorter';

    function pluck(arr, attr) {
        return arr.map(function (obj) {
            return obj[attr];
        });
    }

    function isEmptyArray(arr) {
        return arr == null || arr.length === 0;
    }

    export default {
        name: "vueTable",

        props: {
            // 排序参数,是二维数组,支持多列排序
            orders: {
                type: Array,
                default() {
                    return [[0, 'desc']];
                }
            },

            features: {
                type: Object,
                default() {
                    return {sortable: true}
                }
            },

            // 分页对象
            pagination: {
                type: Object,
                default() {
                    return {
                        currentPage: 1,
                        pageLength: 3
                    };
                }
            }
        },

        data() {
            return {
                // 表格头部列表数据
                theadList: [{
                    name: 'id',
                    width: 100,
                    sort: 'asc',
                    dataType:"NUMBER"
                },{
                    name: 'name',
                    width: 100,
                    sort: null,
                    dataType:"STRING"
                },{
                    name: 'sex',
                    width: 100,
                    sort: null,
                    dataType:"NUMBER"
                },{
                    name: 'tel',
                    width: 100,
                    sort: null,
                    dataType:"NUMBER"
                }],

                // 表格内容列表
                tbodyList: [
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136],
                    [1,'a','1',137],
                    [2,'b','1',134],
                    [3,'c','0',136]
                ],

                // 表格底部列表
                footerList: [
                    ["总计",3,4,5]
                ],

                // 拖拽相关配置
                resizeHandler: null, // 拖拽实例
                dragIndex: null, //当前拖拽层索引
                nextIndex: null, //联动层索引
                resizeOptions: { // 拖拽配置
                    distance: 10,
                    minWidth: 40
                },

                // 排序相关设置
                sorter: null, // 用来排序的实例对象
                currentSortingColumn: { // 当前正在排序的列
                    0: 'asc'
                },

                // 分页相关
                paginationData: null // 分页后展示数据
            }
        },

        created() {
            if(this.features.sortable){
                this.initSorter();
            }
        },

        mounted() {
            this.init();
        },

        methods: {
            init() {
                this.resizeHandler = new ResizeHandler(this, this.resizeOptions);
            },

            /********** 拖拽相关 **********/

            onMousedown(event, index) {
                this.dragIndex = index;
                this.nextIndex = index === this.theadList.length - 1 ? index - 1 : index + 1;

                let dragWidth = this.theadList[this.dragIndex].width,
                    nextWidth = this.theadList[this.nextIndex].width;

                this.resizeHandler._init(event, dragWidth, nextWidth);
            },

            // 移动拖拽节点
            dragstart(event, item, index) {
                console.log('dragstart', item, index);
            },

            dragging(event, currWidth, nextWidth) {
                this.theadList[this.dragIndex].width = currWidth;
                this.theadList[this.nextIndex].width = nextWidth;
            },

            dragend(event) {
                console.log('dragend')
            },


            /********** 排序相关 **********/

            initSorter() {
                this.sorter = new Sorter(this.tbodyList, this.orders,
                    pluck(this.theadList, 'comparator'), pluck(this.theadList, 'dataType'));

                if (!isEmptyArray(this.orders)) {
                    let last = this.orders[this.orders.length - 1],
                        index = last[0],
                        direction = last[1];
                    this.currentSortingColumn = {[index]: direction};
                }
            },

            onSort(index) {
                if(!this.features.sortable) return;
                var opp = this.opposites(this.currentSortingColumn[index]);
                this.currentSortingColumn = {[index]: opp};
                this.sorter.sort(index, opp);
            },

            opposites(direction) {
                var mapper = {'desc': 'asc', 'asc': 'desc'};
                return direction ? mapper[direction] : 'asc';
            },

            directionCls(index) {
                if(!this.features.sortable) return "no_sortable";
                return this.currentSortingColumn[index];
            },


            /********** 分页相关 **********/

            onPaginationChange(data) {
                this.paginationData = data;
            },
        },

        components: {
            pagination
        }
    }
</script>

<style lang="sass">

    .v-table
        @extend %flex-inner
        box-sizing: content-box

        *,
        *:before,
        *:after
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            margin: 0;
            padding: 0;

        *:focus
            outline: 0 !important;

        &__wrap
            display: flex
            flex-direction: column
            border: 1px solid #e0e0e0

        &__thead
            @extend %flex-inner

            &__tr
                display: flex
                position: relative

                &-th
                    height: 30px
                    line-height: 30px
                    cursor: pointer;
                    border-bottom: 2px solid #9e9e9e;
                    border-right: 1px solid #e0e0e0;
                    position: relative
                    display: flex
                    align-items: center
                    justify-content: space-between

                    &::after
                        content: '';
                        position: absolute;
                        top: 0;
                        right: 6px;
                        width: 10px;
                        height: 100%;
                        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAYAAACjd+4vAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTAzM0Y3RTg3QkIwMTFFNTg4QzRBQzMxQjgyN0FCMEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTAzM0Y3RTk3QkIwMTFFNTg4QzRBQzMxQjgyN0FCMEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMDMzRjdFNjdCQjAxMUU1ODhDNEFDMzFCODI3QUIwRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxMDMzRjdFNzdCQjAxMUU1ODhDNEFDMzFCODI3QUIwRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv5DQtgAAABySURBVHjaYnzw4AEDEvgPxIxY2OgALLf1TStBdVnGsxgfPnwIZsvLy8PVMaEZRgygijqmgbAUZjHdLQUBFrT4waeJKHWgOAXR086mYaiDxjVGHNMVsJAQbIzUVEesjxmpqQ6UrZgGwlJifEwTS0EAIMAAvaokzh+9ibIAAAAASUVORK5CYII=') no-repeat 0;

                    &:last-child
                        border-right: none

                        .v-table__thead__tr-th-resize
                            display: none

                    &.asc:after
                        background-position: -20px

                    &.desc:after
                        background-position: -10px

                    &-resize
                        height: 100%
                        flex: 0 0 10px
                        cursor: col-resize;
                        user-select: none;

                    &-content
                        @extend %text-ellipsis
                        flex: 1
                        color: #757575

        &__tbody
            @extend %flex-inner

            &__tr
                display: flex
                position: relative

                &-td
                    height: 30px
                    line-height: 30px
                    border-top: 1px solid #eaeff0;
                    border-right: 1px solid #e0e0e0;
                    color: #757575;
                    @extend %text-ellipsis

                    &:last-child
                        border-right: none

        &__tfooter
            @extend %flex-inner

            &__tr
                display: flex
                position: relative
                border-top: 1px solid #eaeff0;

                &-th
                    cursor: pointer;
                    border-bottom: 2px solid #9e9e9e;
                    border-right: 1px solid #e0e0e0;
                    color: #757575;

                    &:last-child
                        border-right: none

        &__tpagination
            @extend %flex-center

            button
                cursor: pointer
                background-color: transparent
                border: none
                padding: 0 5px

                &.disable
                    cursor: default
                    color: #bdbdbd
                &.active
                    color: #9ccc65

            ul
                margin: 0
                padding: 0
                display: flex
                align-items: center

                li
                    padding: 0
                    list-style: none


    %text-ellipsis
        display: block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        //解决safari浏览器下悬浮会自动显示title现象
        &::before
          content: '';
          display: block;

    %flex-center
        display: flex;
        justify-content: center;
        align-items: center;

    %flex-inner
        display: inline-flex
        flex-direction: column

</style>