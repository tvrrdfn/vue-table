<template lang="pug">
    .v-table
        .v-table__thead
            .v-table__thead__tr
                .v-table__thead__tr-th(
                    v-for="(thead, index) in headList"
                    :class="{'asc': thead.sort === 'asc', 'desc': thead.sort === 'desc'}"
                    :style="{'width': thead.width + 'px'}"
                    :data-name="thead.name"
                )
                    .v-table__thead__tr-th-content {{thead.name}}
                    .v-table__thead__tr-th-resize(
                        table-resize="true"
                        :data-index="index"
                        @mousedown.stop="onMousedown($event, thead, index)"
                        @mousemove.stop="onMousemove($event, thead, index)"
                        @mouseup.stop="onMouseup($event, thead, index)"
                    )
                    
        .v-table__tbody
            .v-table__tbody__tr
                .v-table__tbody__tr-td 1
                .v-table__tbody__tr-td abc
                .v-table__tbody__tr-td 1
                .v-table__tbody__tr-td 123131
            .v-table__tbody__tr
                .v-table__tbody__tr-td 1
                .v-table__tbody__tr-td abc
                .v-table__tbody__tr-td 1
                .v-table__tbody__tr-td 123131

        .v-table__tfooter
            .v-table__tfooter__tr
                .v-table__tfooter__tr-th 总计
                .v-table__tfooter__tr-th 3
                .v-table__tfooter__tr-th 4
                .v-table__tfooter__tr-th 5

        .v-table__tpagination
            button.prev &lt;
            ul
                li
                    button 1
            button.next &gt;

</template>

<script type="text/javascript">
    const THROTTLE_TIME = 14;

    var utils = {
        // 属性拷贝
        extend: function (mod, opt) {
            if (!opt) return mod;
            var conf = {};
            for (var attr in mod)
                conf[attr] = typeof opt[attr] !== "undefined" ? opt[attr] : mod[attr];
            return conf;
        },

        // 克隆节点
        clone: function (node) {
            var obj = {};
            for (var attr in node)
                if (node.hasOwnProperty(attr))
                    obj[attr] = node[attr];
            return obj;
        },

        searchUp: function(node, arg) {
            if (!node || node === document.body || node === document) return undefined; // 向上递归到顶就停
            if (typeof arg == 'function'){
                if(arg.call(null, node)) return node;
            }else{
                if(node.classList.contains(arg)) return node;
            }
            return this.searchUp(node.parentNode, arg);
        },

        getOffset: function(node, offset, parent) {
            if (!parent)
                return node.getBoundingClientRect();
            offset = offset || {top: 0, left: 0};
            if (node === null || node === parent) return offset;
            offset.top += node.offsetTop;
            offset.left += node.offsetLeft;
            return this.getOffset(node.offsetParent, offset, parent);
        },

        uuid: function () {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";
            return s.join("");
        }
    };

    var handleEvent = {
        init: function (isbind, instance) {
            this.instance = instance;
            console.log(instance)
            if (this.isbind) return;
            this.isbind = isbind;
            this.globalUnbind();
            this.globalBind();
        },

        globalBind: function () {
            document.addEventListener('mousedown', this.mouseDown, false);
            document.addEventListener('mousemove', this.mouseMove, false);
            document.addEventListener('mouseup', this.mouseUp, false);
            document.addEventListener('click', this.click, true);
            this.isbind = true;
        },

        globalUnbind: function () {
            document.removeEventListener('mousedown', this.mouseDown, false);
            document.removeEventListener('mousemove', this.mouseMove, false);
            document.removeEventListener('mouseup', this.mouseUp, false);
            document.removeEventListener('click', this.click, true);
            this.isbind = false;
        },

        mouseDown: function (event) {
            console.log(event);
            // 是否点击了拖拽节点
            var ele = utils.searchUp(event.target, node => node.getAttribute('table-resize') == 'true');
            if (!ele) return;

            handleEvent.dragStart = true;
            // 记录位置, 通过比较拖拽距离来判断是否是拖拽, 如果是拖拽则阻止冒泡. 不触发点击事件
            handleEvent.distance = 1;
            handleEvent.distanceX = event.pageX;
            handleEvent.distanceY = event.pageY;
            handleEvent.offsetX = event.offsetX || 0;
            handleEvent.offsetY = event.offsetY || 0;
            handleEvent.event = event;
            handleEvent.ele = ele;
        },

        mouseMove: function (event) {
            // 函数节流
            if (!handleEvent.throttle(new Date().getTime())) return;

            // 开始拖拽
            if (handleEvent.dragStart && handleEvent.isDrag(event)) {
                handleEvent.dragStart = false;
                dragdrop.dragStart(handleEvent.event, handleEvent.offsetX, handleEvent.offsetY, handleEvent.ele, handleEvent.instance);
                return;
            }

            dragdrop.drag(event);
        },

        mouseUp: function (event) {
            dragdrop.dragEnd(event);
            // 清理临时变量
            delete handleEvent.ele;
            delete handleEvent.distance;
            delete handleEvent.distanceX;
            delete handleEvent.distanceY;
            delete handleEvent.offsetX;
            delete handleEvent.offsetY;
            delete handleEvent.dragStart;
            delete handleEvent.event;
        },

        click: function (event) {
            if (!handleEvent.dragStart && handleEvent.dragStart !== undefined) {
                // event.preventDefault();
                event.stopPropagation();
                delete handleEvent.dragStart;
            }
        },

        isDrag: function (event) {
            var distanceX = Math.abs(event.pageX - handleEvent.distanceX || 0),
                distanceY = Math.abs(event.pageY - handleEvent.distanceY || 0);
            if (handleEvent.distance < distanceX || handleEvent.distance < distanceY) {
                return true;
            }
        },

        throttle: function (now) {
            var time = new Date().getTime();
            this.throttle = function (now) {
                if (now - time > THROTTLE_TIME) {
                    time = now;
                    return true;
                }
                return false;
            };
            this.throttle(now);
        }
    }

    var dragdrop = {
        instance: null,
        isDrag: false,                  // 是否开始拖拽
        el: null,                       // 当前开始拖拽元素
        dragElement: null,              // 当前拖拽元素
        dragNode: null,                 // 当前拖拽节点数据
        dragCoveredNode: null,          // 当前拖拽覆盖节点
        offsetX: null,
        offsetY: null,

        // 开始拖拽
        dragStart: function (event, offsetX, offsetY, ele, instance) {
            this.ele = ele;
            this.isDrag = true;

            var targetOffset = this.getOffset(event.target);
            var eleOffset = this.getOffset(ele);

            this.instance = instance;
            this.dragElement = this.ele;
            this.offsetX = offsetX || 0;
            this.offsetY = offsetY || 0;

            console.log(targetOffset, eleOffset);
            this.instance.dragstart(event, this.offsetX);
        },

        // 正在拖拽
        drag: function (event) {

            // 拖拽状态, 拖拽元素
            if (!this.isDrag && !this.dragNode) return;

            // 移动拖拽节点
            this.moveDragElement(event);
            this.instance.dragging(event);
        },

        // 结束拖拽
        dragEnd: function (event) {
            if (this.isDrag) {
                console.log("dragend", this.state);

                this.instance && this.instance.dragend();
                this.isDrag = false;
            }
        },

        // 移动拖拽节点
        moveDragElement: function (event) {
            var x = event.pageX - this.offsetX;
            var y = event.pageY - this.offsetY;

            console.log(event.offsetX, this.offsetX, event.offsetX - this.offsetX)
            this.dragElement && (this.dragElement.style.cssText = 'top:' + y + 'px;left:' + x + 'px;');
        },

        getOffset: function(node, offset, parent) {
            if (!parent)
                return node.getBoundingClientRect();
            offset = offset || {top: 0, left: 0};
            if (node === null || node === parent) return offset;
            offset.top += node.offsetTop;
            offset.left += node.offsetLeft;
            return this.getOffset(node.offsetParent, offset, parent);
        },

        /**====== get set 方法======**/

        get isDrag() {return this._isDrag;},
        set isDrag(value) {
            this._isDrag = value;

            // 拖拽结束
            if(value === false){
                this.dragNode = null;

                // 移除body上的临时拖拽节点
                this.dragElement = null;

                this.group = null;

                // 清理临时变量
                this.state = {};
                this.ele = null;

                // 清理临时坐标
                this.offsetX = null;
                this.offsetY = null;
                this.dragNodeCoord = null;
                this.dragCoveredNode = null;
            }
        }
    };


    export default {
        name: "vueTable",

        data() {
            return {
                eleWidth: null,
                headerMinWidth: 20,
                headList: [{
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
                dragHandle: null
            }
        },

        created() {
            console.log('created')
            // handleEvent.init(true, this);
        },

        mounted() {
            this.init();
        },

        methods: {
            init() {
                this.eleWidth = this.$el.offsetWidth;
            },

            onMousedown(event, item, index) {
                console.log('onMousedown', item)

                this.dragHandle = {
                    item: item,
                    dragStart: true,
                    distance: 1,
                    distanceX: event.pageX,
                    distanceY: event.pageY,
                    offsetX: event.offsetX || 0,
                    offsetY: event.offsetY || 0,
                    event: event,
                    ele: document.querySelector('[data-name="' + item.name + '"]')
                }
            },

            onMousemove(event, thead, index) {
                // if(!this.handleEvent || !this.handleEvent.dragStart){
                //     return
                // }
                // console.log(this.handleEvent, event.offsetX, event.offsetY)
                // console.log('onMousemove', thead)

                // let nextItem = this.headList[index + 1]
                // if(index === this.headList.length - 1){
                //     nextItem = this.headList[index - 1];
                // }

                // let x = this.handleEvent.offsetX - event.offsetX,
                //     currItemWidth = parseFloat(thead.width) + x,
                //     nextItemWidth = parseFloat(nextItem.width) - x;

                // let nextIndex = index === this.headList.length - 1 ? index - 1 : index + 1;
                
                // if(currItemWidth >= this.headerMinWidth && nextItemWidth >= this.headerMinWidth){
                //     thead.width = currItemWidth;
                //     this.$set(this.headList[nextIndex], 'width', nextItemWidth);
                // }


                // 函数节流
                if (!handleEvent.throttle(new Date().getTime())) return;

                // 开始拖拽
                if (this.dragHandle && this.dragHandle.dragStart && this.domIsDrag(event)) {
                    this.dragHandle.dragStart = false;
                    this.dragstart(event);
                    return;
                }
                this.drag(event);
            },

            domIsDrag(event) {
                var distanceX = Math.abs(event.pageX - this.dragHandle.distanceX || 0),
                    distanceY = Math.abs(event.pageY - this.dragHandle.distanceY || 0);
                if (this.dragHandle.distance < distanceX || this.dragHandle.distance < distanceY) {
                    return true;
                }
            },

            onMouseup(event, thead) {
                // console.log('onMouseup', thead)
                // // this.$set(this, 'handleEvent', null);
                // this.handleEvent = null;
                // console.log(this.handleEvent)
                if (this.isDrag) {
                    console.log("dragend");
                    this.isDrag = false;
                }
                this.dragHandle = null;
            },

            dragstart() {
                this.isDrag = true;
                console.log('dragstart')
            },

            // 正在拖拽
            drag(event) {
                // 拖拽状态, 拖拽元素
                if (!this.isDrag || !this.dragHandle || !this.dragHandle.item) return;

                // 移动拖拽节点
                this.moveDragElement(event);
                this.dragging(event);
            },

            // 移动拖拽节点
            moveDragElement(event) {
                // var x = event.pageX - this.offsetX;
                // var y = event.pageY - this.offsetY;
                let x = event.offsetX - this.dragHandle.offsetX
                console.log(event.offsetX, this.dragHandle.offsetX, x)
                console.log(this.dragHandle.item)

                this.dragHandle.item.width += x;
                // this.dragElement && (this.dragElement.style.cssText = 'top:' + y + 'px;left:' + x + 'px;');
            },

            dragging(event) {
                console.log('dragging')
            },

            dragend(event) {
                if (this.isDrag) {
                    console.log("dragend");
                    this.isDrag = false;
                }
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

        &__tbody
            &__tr
                display: flex
                position: relative

                &-td
                    height: 30px
                    line-height: 30px
                    flex: 1
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
                    flex: 1
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

</style>