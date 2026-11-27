
const assert=require('assert');
const Roof=require('./roof-pitch.js');
const Deck=require('./deck-material.js');
const Wall=require('./retaining-wall.js');
const Gravel=require('./gravel.js');
const Mulch=require('./mulch.js');
const Fence=require('./fence.js');
const Concrete=require('./concrete.js');
const Paint=require('./paint.js');
const Tile=require('./tile-flooring.js');
function near(a,b,t=1e-6){assert(Math.abs(a-b)<t,`${a} != ${b}`)}
let r=Roof.calculate({rise:'6',run:'12'}); assert(r.ok); near(r.data.pitchPer12,6); near(r.data.slopePercent,50); near(r.data.angleDeg,26.565051);
assert(!Roof.calculate({rise:'6',run:'0'}).ok);
r=Deck.calculate({length:'16',width:'12',direction:'length',boardWidth:'5.5',gap:'0.25',boardLength:'16',waste:'10'}); assert(r.ok); assert(r.data.boards>0);
r=Wall.calculate({length:'20',height:'3',blockLength:'16',blockHeight:'8',waste:'5'}); assert(r.ok); assert(r.data.blocks>0);
r=Gravel.calculate({length:'20',width:'10',depth:'3',material:'stone'}); assert(r.ok); near(r.data.cuYd,20*10*0.25/27);
r=Mulch.calculate({length:'12',width:'8',depth:'3'}); assert(r.ok); near(r.data.cuYd,12*8*0.25/27); assert(r.data.bags2>0);
r=Fence.calculate({length:'100',spacing:'8',layout:'run'}); assert(r.ok); assert.equal(r.data.posts,14);
r=Fence.calculate({length:'100',spacing:'8',layout:'loop'}); assert(r.ok); assert.equal(r.data.posts,13);
r=Concrete.calculate({length:'10',width:'10',thickness:'4',qty:'1',waste:'0'}); assert(r.ok); near(r.data.cuFt,100/3);
r=Paint.calculate({length:'14',width:'12',height:'8',doors:'1',windows:'2',coats:'2',coverage:'350',ceiling:'no'}); assert(r.ok); near(r.data.wallArea,416); near(r.data.openings,50);
r=Tile.calculate({length:'12',width:'10',tileLength:'12',tileWidth:'12',gap:'0',waste:'10',perBox:'10'}); assert(r.ok); assert.equal(r.data.pieces,132); assert.equal(r.data.boxes,14);
r=Tile.calculate({length:'12',width:'10',tileLength:'12',tileWidth:'12',gap:'0',waste:'-1',perBox:'10'}); assert(!r.ok);
console.log('PASS: 12 deterministic formula and validation checks');
