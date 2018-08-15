const Tag = require('../../models/tag');

module.exports = async (req, res) => {
    try {
        const tags = await Tag.query()
            .innerJoin('tagTree', 'tag.id', 'tagTree.tagId')
            .where('tagTree.parentId', null)
            .eager('children(orderBySequence).^', {
                orderBySequence: builder => {
                    builder.orderBy('sequence');
                },
            })
            .orderBy('tagTree.sequence');

        res.send({items: tags});
    } catch (e) {
        console.error('❌  GET /tags: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
