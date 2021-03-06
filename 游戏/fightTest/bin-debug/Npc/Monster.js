var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/**怪物 */
/**
 * 病毒 不同形态  是否不同形态融合过 分数 速度 移动方向：向量
 * type
 * type 相同融合 一样的变大
 *      不同  用大圈背景圈起
 *      (圈起中有相同的融合) 背景大圈用动画
 *      写个碰撞检测工具   融合过的 相同可再融合   不同不可融合 规定活动范围 碰撞向切线的反向运动
 *      没碰撞过的一直向英雄移动  碰撞过的保持原来轨迹
 *
 * 两张病毒列表
 *            1.原始病毒，会与英雄碰撞
 *            2.融合后的病毒  与原始病毒和其他融合后的病毒有碰撞
 *
 *
 * Map  表内的东西碰撞
 *
 * 每个list中的东西自动碰撞  放到另外一层
 *
 */
var Monster = (function (_super) {
    __extends(Monster, _super);
    /**TODO:状态,不知道是否需要，英雄需要状态复活，死亡，正常*/
    function Monster(type, x, y, speed, size) {
        var _this = _super.call(this, speed, size) || this;
        /**怪物类型 */
        //private _type:number;
        /**移动方向 */
        //private _vc:touch.Vector;
        /**内部病毒列表 */
        _this._MonsterList = [];
        _this.shape = new egret.Shape();
        _this._canMix = true;
        _this.type = type;
        _this.x = x;
        _this.y = y;
        _this.width = 60;
        _this.height = 60;
        _this.objectID = "Monster" + egret.getTimer();
        _this.init();
        _this.initHitArea();
        return _this;
    }
    /**初始化图片将图片添加到地图上 */
    Monster.prototype.init = function () {
        var pic = new LBitmap("monster_" + this.type + "_png", this.size * 60, this.size * 60);
        // pic.x = 0;
        // pic.y = 0;
        // pic.width = 60;
        // pic.height = 60;
        // pic.bitmap.texture = RES.getRes("monster_"+this.type+"_png");
        this.picBox.push(pic);
        for (var i = 0; i < this.picBox.length; i++) {
            this.addChild(this.picBox[i]);
        }
    };
    /**设置碰撞区域 */
    Monster.prototype.initHitArea = function () {
        for (var i = 0; i < this.picBox.length; i++) {
            var hitArea = new HitArea(HitArea.CIRCLE, "Monster" + this.type);
            //hitArea.setCircle(this.picBox[i].x,this.picBox[i].y,30*this.size);
            var shape = hitArea.setCircle(this.x, this.y, 30 * this.size);
            this.addChild(shape);
            this.addHitArea(hitArea);
        }
    };
    Object.defineProperty(Monster.prototype, "canMix", {
        // private drawcircle(x:number, y:number,radio:number):void {
        //     var shape:egret.Shape = this.shape;
        //     shape.graphics.beginFill(0xff0000 + Math.floor(Math.random() * 100) * (0xffffff / 100), 1);
        //     shape.graphics.lineStyle(2, 0xff0000 + Math.floor(Math.random() * 100) * (0xffffff / 100));
        //     shape.graphics.drawCircle(x, y, radio);
        //     shape.graphics.endFill();
        //     shape.alpha = 0.5;
        // }
        // //初始化赋值
        // private initCircle(x:number,y:number,radio:number):void {
        //     var shape:egret.Shape = this.shape;
        //     this.addChild(shape);
        //     this.drawcircle(x,y,radio);
        // }
        /**不同形态融合 默认可以融合
         * 相同融合不改变状态，
         * 不同融合之后改变状态，变为类型不同不可以融合 */
        get: function () {
            return this._canMix;
        },
        set: function (canMix) {
            this._canMix = canMix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Monster.prototype, "MonsterList", {
        get: function () {
            return this._MonsterList;
        },
        /**内部病毒列表 */
        set: function (list) {
            this._MonsterList = list;
        },
        enumerable: true,
        configurable: true
    });
    /**病毒类型
     * 相同病毒融合类型不变，删除一个病毒，留一个大的
     * 不同类型病毒融合，类型依然不变，
     * 将病毒从碰撞病毒列表中删除 + 在碰撞病毒列表中加个大的病毒
     * 不同类型的病毒融合过的病毒是新类型
     * 病毒移动份两种   碰撞病毒向英雄移动
     *                 非碰撞病毒沿原路线移动
     */
    // public set type(type:number){
    //     this._type = type;
    // }
    // public get type():number{
    //     return this._type;
    // }
    /**
     * 病毒方向
     *         1.一直向着英雄
     *         2.不随英雄移动，碰撞后向相反方向移动
     */
    // public set vc(vc:touch.Vector){
    //     this._vc = vc;
    // }
    // public get vc():touch.Vector{
    //     return this._vc;
    // }
    /**
     * 怪物移动
     */
    Monster.prototype.move = function () {
        this.x -= this.dir.x * this.speed * GData.MonsterSpeedfactor;
        this.y -= this.dir.y * this.speed * GData.MonsterSpeedfactor;
        for (var i = 0; i < this.HitAreas.length; i++) {
            this.HitAreas[i].collider.move(this.x, this.y);
        }
    };
    /**销毁英雄 */
    Monster.prototype.destoryHero = function () {
        this.destroyObj();
    };
    /**TODO:检测碰撞 */
    Monster.prototype.checkingCollision = function (obj) {
        // //TODO:碰撞到怪物 分情况
        // if(obj instanceof Monster)
        // {
        //     if(this.checkHit(obj).result == true) 
        //     {    
        //         obj.setCollisionID(this.objectID);
        //         this.collisionIn(obj,this.checkHit(obj).part);
        //     }
        //     else if(obj.collisionID==this.objectID) {
        //         obj.setCollisionID(null);
        //         //this.collisionOut(obj);
        //     }
        // }
        // //TODO:如果是技能
        // else if(obj instanceof Skill){
        //     console.log("怪物碰到技能")
        //     //TODO:如果是碰到就消失的技能。。。。
        //     //如果不是不用管
        // }
    };
    /**怪物与怪物碰撞 */
    //TODO:子类复写，监听碰撞
    Monster.prototype.collisionIn = function (obj, part) {
        if (obj instanceof Monster) {
            //合到新病毒就不再参与全局碰撞只检测自己内部的碰撞
            //如果类型相同  变大  删除obj 与 this 中较小的那个 大的那个变大
            //两个向中心移动
            if (obj.type == this.type) {
                //两个都是融合过的
                //
                //两个都是一样的
                if (obj.score <= this.score) {
                    this.score += obj.score;
                    // console.log(" 病毒碰撞this.score 类型相同,删除小的")
                    //TODO:删除小的自己变大
                }
                else {
                    obj.score += this.score;
                    // console.log(" 病毒碰撞obj.score 类型相同,删除小的")
                    //TODO:删除自己obj变大
                }
            }
            else {
                //如果两个其中有一个是可以融合的
                if (obj.canMix || this.canMix) {
                    //TODO:融合
                    //改变剩下的type
                    console.log("如果两个其中有一个是可以融合的");
                }
                else {
                    console.log("列表中不能融合");
                    //TODO:改变方向
                    //列表中的不能融合的
                }
                //在两个病毒中间新产生一个大小是两个相加的大小位置在两个病毒连线中间
                //所有病毒加到新病毒中 小病毒按原轨迹运动
            }
        }
        else if (obj instanceof Skill) {
            //TODO:如果是碰到就消失的技能。。。。
            //如果不是不用管
            console.log("碰到技能");
            obj.destroyObj();
            RoleManager.instance.removeUnit(obj);
        }
    };
    return Monster;
}(Npc));
__reflect(Monster.prototype, "Monster");
//# sourceMappingURL=Monster.js.map