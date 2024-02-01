const {User, Op, fn, col} = require('../../models/orm/Postgesql');

module.exports.getAlls = async (req, res)=>{
    let count = await User.findAll({attributes: [[fn('count', col('_id')), 'total']]});

    const whereClause = {name: {[Op.like]:'%'+req.query._name+'%'}};
    if (req.query._age) {whereClause.age = req.query._age;} 
    
    User.findAll({
        where: whereClause,
        limit: parseInt(req.query._limit),
        order: [['_id', 'DESC']],
    })
    .then((data)=>{
        res.json({"rows":data,"total":count[0].toJSON().total});
    });
};

module.exports.adds = (req, res)=>{
    const photo = req.PHOTO_PARSED;

    User.create({"name":req.body.name, "age":req.body.age, "photo":photo})
    .then((entry)=>{
        res.json({"newId":entry._id, "photo":photo});
    });
};

module.exports.edits = (req, res)=>{
    const photo = req.PHOTO_PARSED;

    User.update({"name":req.body.name, "age":req.body.age, "photo":photo}, {where:{_id: req.params.id}})
    .then(()=>{
        res.json({"photo":photo});
    });
};

module.exports.removes = (req, res)=>{
    User.destroy({where:{_id: req.params.id}})
    .then(()=>{
        const whereClause = {
            _id: {[Op.lt]: parseInt(req.query.lasttableid)},
            name: {[Op.like]: '%'+req.query._name+'%'},
        };
        if (req.query._age) {whereClause.age = req.query._age;}
    
        User.findAll({
            where: whereClause,
            order: [['_id', 'DESC']],
        })
        .then((entries)=>{
            res.json(entries);
        });
    });
};