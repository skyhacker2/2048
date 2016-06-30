cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        scoreLabel: cc.Label,
        restartBtn: cc.Button
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function(game) {
        this.game = game;
    },

    show: function() {
        this.node.setPosition(0,0);
        this.scoreLabel.getComponent(cc.Label).string = "" + this.game.currentScore;
    },

    hide: function() {
        this.node.x = 3000;
    },

    onRestartBtnTouched: function() {
        this.hide();
        this.game.restart();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
