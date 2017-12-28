<template lang="pug">
    .v-table
        .v-table__thead
            .v-table__thead__tr
                .v-table__thead__tr-th(
                    v-for="(th, index) in theadList"
                    :class="{'asc': th.sort === 'asc', 'desc': th.sort === 'desc'}"
                    :style="{'width': th.width + 'px'}"
                )
                    .v-table__thead__tr-th-content {{th.name}}
                    .v-table__thead__tr-th-resize(
                        @mousedown.stop="onMousedown($event, index)"
                    )
                    
        .v-table__tbody
            .v-table__tbody__tr(
                v-for="tr in tbodyList"
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

        .v-table__tpagination
            button.prev &lt;
            ul
                li
                    button 1
            button.next &gt;

</template>

<script type="text/javascript">
    import ResizeHandler from './resize';
    import utils from './event.utils';

    export default {
        name: "vueTable",

        data() {
            return {
                // 表格头部列表数据
                theadList: [{
                    name: 'id',
                    width: 100,
                    sort: 'asc'
                },{
                    name: 'name',
                    width: 100,
                    sort: null
                },{
                    name: 'sex',
                    width: 100,
                    sort: null
                },{
                    name: 'tel',
                    width: 100,
                    sort: null
                }],

                // 表格内容列表
                tbodyList: [
                    [1,'a','1',1391313131],
                    [2,'b','1',1391313131],
                    [3,'c','0',1391313131]
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
                    minWidth: 20
                }
            }
        },

        created() {
        },

        mounted() {
            this.init();
        },

        methods: {
            init() {
                this.resizeHandler = new ResizeHandler(this, this.resizeOptions);
            },

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
            }
        }
    }
</script>

<style lang="sass">

    .v-table
        box-sizing: content-box;
        border: 1px solid #e0e0e0;
        border-bottom: 2px solid #9e9e9e;

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

        &__thead
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
                        outline: 1px solid red

                    &-content
                        flex: 1
                        color: #757575;
                        @extend %text-ellipsis;

        &__tbody
            &__tr
                display: flex
                position: relative

                &-td
                    height: 30px
                    line-height: 30px
                    border-top: 1px solid #eaeff0;
                    border-right: 1px solid #e0e0e0;
                    color: #757575;

                    &:last-child
                        border-right: none

        &__tfooter
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
            display: flex
            align-items: center
            justify-content: center;

            button
                background-color: transparent
                border: none

            ul
                margin: 0
                padding: 0

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
</style>