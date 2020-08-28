const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const Comment = require('../../models/comment');
const checkObjectId = require('../../middleware/checkObjectId');

//@route GET api/event/forum/comment/:id
router.get('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {

        const comment_id = req.params.id;

        try {
            const comment = await Comment.findById(comment_id);
            if (!comment) return res.status(404).json({ msg: "comment not found. Please enter the correct comment id", success: false });

            res.status(200).json({ comment: comment, success: true });

        } catch (e) {
            res.status(400).json({ msg: e.message, success: false });
        }
    })


//@route POST api/event/forum/comment
router.post('/',
    [
        check('user_id').not().notEmpty().withMessage("User id is required"),
        check('forum_id').not().notEmpty().withMessage("Forum id is required"),
        check('content').not().notEmpty().withMessage("comment does not have any content")
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { forum_id, user_id, content } = req.body;

            const forum = await Forum.findById(forum_id);
            if (!forum) return res.status(404).json({ msg: "Forum not found! Please enter the correct forum id", success: false });

            const newComment = await new Comment({
                forum_id: forum._id,
                user_id: user_id,
                content: content
            })

            newComment.save();
            const comment = Comment.findById(newComment._id);
            if (!comment) return res.status(412).json({ msg: "Comment not saved", success: false });

            return res.status(200).json({
                msg: "Comment saved", success: true
            });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false });
        }
    })


//@route DELETE api/event/forum/comment/:id
router.delete('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        const comment_id = req.params.id;
        try {
            const comment = await Comment.findById(comment_id);
            if (!comment) return res.status(404).json({ msg: "Comment does not exist, Please enter the correct comment id!", success: false });

            await comment.remove();

            return res.status(200).json({ msg: "comment deleted", success: true });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false })
        }
    })

module.exports = router;