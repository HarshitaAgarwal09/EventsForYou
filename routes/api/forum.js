const express = require('express');
const router = express.Router();

const Comment = require('../../models/comment');
const Forum = require('../../models/forum');
const checkObjectId = require('../../middleware/checkObjectId');

//@route /api/event/forum/comment
router.use('/comment', require('./comment'));

//@route GET /api/event/forum/:id
router.get('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        const forum_id = req.params.id;

        try {
            const docs = await Comment.find({ forum_id: forum_id });
            if (!docs) throw Error("Some error occured");

            return res.status(200).json(docs);
        }
        catch (err) {

        }
    })


//@route DELETE /api/event/forum/:id
router.delete('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        const forum_id = req.params.id;

        try {
            const forum = await Forum.findById(forum_id);
            if (!forum) throw Error("Forum Not found");

            //delete all comments with this particular forum_id
            await Comment.deleteMany({ forum_id: forum_id });
            //delete forum
            await forum.remove();

            return res.status(200).json({ msg: "Forum deleted!" });
        }
        catch (err) {
            return res.status(500).json({ msg: "Error" });
        }
    })

module.exports = router;