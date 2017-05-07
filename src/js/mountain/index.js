/**
 * Created by yonghan on 17/5/6.
 */

console.log('init');

(function(window, $){

    var EVENTS = ['blur', 'change', 'click', 'dblclick', 'error', 'focus', 'keydown', 'keyup', 'mousedown',
        'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll', 'select',
        'submit', 'upload'
    ];

    function Component(){
        this.payload = {};
        this.name = null;
        this.dom = null;
        this.components = [];
    }

    Component.prototype = {
        _init: function(){
            this._generateSetterGetter();
            this._createMethods();

            this._createDom();
            this.created();

            this.bindEvent();
            this._mountDom();

            this.mounted();
        },
        _createMethods: function(){
            var _this = this;
            $.each(this.payload.method, function(key, val){
                _this[key] = val;
                //console.log(key, val())
            });

            if (this.payload.created){
                this.created = this.payload.created
            }

            if (this.payload.mounted){
                this.mounted = this.payload.mounted
            }

        },
        _generateSetterGetter: function(){
            var _this = this;
            if (!this.payload.model){
                this.payload.model = {};
            }

            $.each(Object.keys(this.payload.model), function(n, key){
                Object.defineProperty(_this, key, {
                    get: function(){
                        //console.log('get from getter:', key);
                        return _this.payload.model[key]
                    },
                    enumerable: true,
                    configurable: true,
                    set: function(input){
                        console.log('use setter', key, input);
                        _this.payload.model[key] = input;
                        _this._update();
                    }
                })
            });


        },
        _createDom: function(){
            var tpl = new Template(this.payload.template);
            var html = tpl.render(this);

            this.dom = $(html);
            this._mountComponents()
        },
        bindEvent: function(){
            this._selfBind();
            this._childBind();

        },
        _selfBind: function(){
            var _this = this;
            $.each(EVENTS, function(n, html_event){
                if (_this.dom.attr('m-'+html_event)){
                    var method = _this.dom.attr('m-'+html_event);
                    _this.dom.on(html_event, function(event){
                        _this[method](event)
                        event.stopPropagation();
                        event.preventDefault();
                    });

                }
            });

        },
        _childBind: function(){
            var _this = this;
            $.each(EVENTS, function(n, html_event){
                $.each(_this.dom.find('[m-'+html_event+']'), function(n, dom){
                    var method = $(dom).attr('m-'+html_event);
                    $(dom).on(html_event, function(event){
                        if (_this[method]){
                            _this[method](event);
                        }
                        event.stopPropagation();
                        event.preventDefault();
                    })

                })

            });

        },
        _mountDom: function(){
            if (this.payload.root){
                this.payload.root.append(this.dom)
            }
        },
        _update: function(){
            var index = this.dom.index();

            this.dom.remove();
            this._createDom();
            this.bindEvent();
            if (index === 0){
                this.payload.root.prepend(this.dom);
            }else{
                this.dom.insertAfter(this.payload.root.children()[index - 1]);
            }
        },
        _mountComponents(){
            var _this = this;
            if (!this.payload.components){this.payload.components = []};
            $.each(this.payload.components, function(n, com_structure){
                //console.log(com_structure);
                var format = com_structure.name;
                var sub_dom = Mountain($.extend(true, {}, com_structure));
                //console.log(_this.dom.find(format));
                $.each(_this.dom.find(format), function(n, ori_dom){
                    var parent = $(ori_dom).parent();
                    //console.log(parent.find(format).index());
                    if (parent.find(format).index() === 0){
                        parent.prepend(sub_dom.dom)
                    }else{
                        sub_dom.dom.insertAfter(parent.children()[parent.find(format).index() - 1]);
                    }
                });
                //_this.dom[_this.dom.find(format).index()] = $('<div>1</div>');

            })

        },
        mounted: function(){
            //console.info('original mounted')

        },
        created: function(){
            //console.info('original created')

        }
    };

    function Mountain(payload){
        var ins = new Component;
        ins.payload = payload;
        ins.name = payload.name? '': payload.name;
        ins._init();
        return ins

    }

    function Template(tpl) {
        var
            fn,
            match,
            code = ['var r=[];\nvar _html = function (str) { return str.replace(/&/g, \'&amp;\').replace(/"/g, \'&quot;\').replace(/\'/g, \'&#39;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\'); };'],
            re = /\{\{\s*([a-zA-Z\.\_0-9()]+)(\s*\|\s*safe)?\s*\}\}/m,
            addLine = function (text) {
                code.push('r.push(\'' + text.replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '\');');
            };
        while (match = re.exec(tpl)) {
            if (match.index > 0) {
                addLine(tpl.slice(0, match.index));
            }
            if (match[2]) {
                code.push('r.push(String(this.' + match[1] + '));');
            }
            else {
                code.push('r.push(_html(String(this.' + match[1] + ')));');
            }
            tpl = tpl.substring(match.index + match[0].length);
        }
        addLine(tpl);
        code.push('return r.join(\'\');');
        fn = new Function(code.join('\n'));
        this.render = function (model) {
            return fn.apply(model);
        };
    }

    window.Mountain = Mountain;

})(window, $);



$(document).ready(function(){
    var ColorLabel = {
        name: 'colorLabel',
        template: '<label style="background-color: #0086B3;color: #fff;padding: 5px 10px;" m-click="handleClick">label</label>',
        method: {
            handleClick: function(event){
                console.log('click on label');

            }
        }
    };

    var Hello = {
        name: 'hello',
        template: '<h1 m-click="handleClick"><span>hello {{ user.um }} </span>' +
            '<colorLabel></colorLabel>' +
            '<button m-click="handleConfirm">confirm</button>' +
        '</h1>',
        root: $('#app'),
        model: {
            user: {um: 'hanyong33', name: '韩勇'}
        },
        method: {
            getUserData: function(){
                //console.log('>>>', this.user);
                this.user = {um: 'this', name: 'a'}
            },
            handleClick: function(event){
                console.info('clicked', this.user.um)
                this.getUserData()
            },
            handleConfirm: function(event){
                console.info('click btn')

            }
        },
        created: function(){
            //console.log('rewrite created', this.user)
        },
        mounted: function(){
            //console.log('rewrite mounted', this.user)
        },
        components: [ColorLabel]
    };

    var Welcome = {
        name: 'welcome',
        template: '<button m-click="handleClick">{{name}}</button>',
        root: $('#app'),
        model: {
            name: 'cancel'
        },
        method: {
            handleClick(event){
                this.name = 'ok'

            }
        }
    };


    var dom_payload = $.extend(true, {}, Hello);
    dom_payload.model.user = {um: 'hanyong1', name: 'a'};
    var dom_1_payload = $.extend(true, {}, Hello);
    dom_1_payload.model.user = {um: 'hanyong2', name: 'a'};
    //var color_label = $.extend(true, {}, ColorLabel);
    var dom_welcom = $.extend(true, {}, Welcome);



    var dom = Mountain(dom_payload);
    var dom2 = Mountain(dom_1_payload);
    var dom3 = Mountain(dom_welcom);
    //var dom3 = Mountain(color_label);



    //dom2.getUserData();


    //console.info(dom.user);

});