const db = require('../config/db');

const getData = async (req, res) => {
  try {
    const snapshot = await db.ref('data').once('value');
    const data = snapshot.val();
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postData = async (req, res) => {
  try {
    const newData = req.body;
    const newPostRef = db.ref('data').push();
    await newPostRef.set(newData);
    res.status(201).json({ id: newPostRef.key });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getData,
  postData,
};
