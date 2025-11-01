const db = require('../config/db');

const getData = async (req, res) => {
  try {
    const snapshot = await db.collection('data').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postData = async (req, res) => {
  try {
    const newData = req.body;
    const docRef = await db.collection('data').add(newData);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getData,
  postData,
};
