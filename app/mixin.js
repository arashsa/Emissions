assign = require('object.assign');

function classMixin(...mixins) {
    var Class = function(...args) {
        mixins.forEach((mixin) =>
            mixin.constructor && mixin.constructor.call(this, ...args)
        );
    };

    assign(Class.prototype, ...mixins);

    return Class;
};

function mixin() {
    return assign({}, ...mixins);
}

module.exports = { mixin, classMixin };
