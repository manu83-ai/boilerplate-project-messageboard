'use strict';

const Thread = require('../models/thread.js');


module.exports = function (app) {


app.route('/api/threads/:board')

.post(async function(req, res) {

  try {

    const newThread = new Thread({
      board: req.params.board,
      text: req.body.text,
      delete_password: req.body.delete_password
    });

    const savedThread = await newThread.save();

    res.json(savedThread);

  } catch(err) {

    res.status(500).send(err);

  }

})

.get(async function(req, res) {

  try {

    const threads = await Thread.find(
      {
      board: req.params.board
      },
      {
      delete_password: 0,
      reported: 0,
      __v: 0,
      "replies.delete_password": 0,
      "replies.reported": 0,
      "replies.__v": 0
}
    )
    .sort({ bumped_on: -1 })
    .limit(10);

    const formattedThreads = threads.map(thread => {

      const obj = thread.toObject();

      obj.replycount = obj.replies.length;

      obj.replies = obj.replies
        .sort((a, b) => b.created_on - a.created_on)
        .slice(0, 3);

      return obj;

    });

    res.json(formattedThreads);

  } catch(err) {

    res.status(500).send(err);

  }

})

.delete(async function(req, res) {

  try {

    const thread = await Thread.findById(req.body.thread_id);

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    if (thread.delete_password !== req.body.delete_password) {
      return res.send("incorrect password");
    }

    await thread.deleteOne();

    res.send("success");

    } catch(err) {

    res.status(500).send(err);

  }

})

.put(async function(req, res) {

  try {

    const thread = await Thread.findById(req.body.thread_id);

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    thread.reported = true;

    await thread.save();

    res.send("reported");

  } catch(err) {

    res.status(500).send(err);

  }

});

  app.route('/api/replies/:board')

.post(async function(req, res) {

  try {

    const thread = await Thread.findById(req.body.thread_id);

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    thread.replies.push({

      text: req.body.text,

      delete_password: req.body.delete_password

    });

    thread.bumped_on = new Date();

    await thread.save();

    res.json(thread);

  } catch(err) {

    res.status(500).send(err);

  }

})

.get(async function(req, res) {

  try {

    const thread = await Thread.findById(
      req.query.thread_id,
      {
        delete_password: 0,
        reported: 0,
        __v: 0,
        "replies.delete_password": 0,
        "replies.reported": 0,
        "replies.__v": 0
      }
    );

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    res.json(thread);

    } catch(err) {

    res.status(500).send(err);

  }

})

.delete(async function(req, res) {

  try {

    const thread = await Thread.findById(req.body.thread_id);

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    const reply = thread.replies.id(req.body.reply_id);

    if (!reply) {
      return res.status(404).send("Reply not found");
    }

    if (reply.delete_password !== req.body.delete_password) {
      return res.send("incorrect password");
    }

    reply.text = "[deleted]";

    await thread.save();

    res.send("success");

  } catch(err) {

    res.status(500).send(err);

  }

})

.put(async function(req, res) {

  try {

    const thread = await Thread.findById(req.body.thread_id);

    if (!thread) {
      return res.status(404).send("Thread not found");
    }

    const reply = thread.replies.id(req.body.reply_id);

    if (!reply) {
      return res.status(404).send("Reply not found");
    }

    reply.reported = true;

    await thread.save();

    res.send("reported");

  } catch(err) {

    res.status(500).send(err);

  }

});

};
