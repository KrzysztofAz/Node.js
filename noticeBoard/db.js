const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const url = process.env.MONGODB_CONNECTION;

const noticeCollectionName = 'notices';

let db;
let noticesCollection;

const init = () =>
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .then((client) => {
            db = client.db(process.env.MONGODB_DBNAME);
            noticesCollection = db.collection(noticeCollectionName);
        })
        .catch(error => console.log(error));

const getNotices = () => {
    return noticesCollection.find().toArray();
}

const getNotice = (id) => {
    return noticesCollection.findOne({ _id: new ObjectId(id) });
}

const deleteNotice = (id) => {
    return noticesCollection.deleteOne({ _id: new ObjectId(id) });
}

const addNotice = (newNotice) => {
    newNotice.createdTime = new Date();
    return noticesCollection.insertOne(newNotice);
}

const updateNotice = (id, modifiedNotice) => {
    return noticesCollection.updateOne(
        { _id: new ObjectId(id)},
        { $set: { "title": (modifiedNotice.title), 
                    "description": (modifiedNotice.description), 
                    "category": (modifiedNotice.category), 
                    "price": (modifiedNotice.price)
                }}
    );
}

module.exports = { init, getNotices, getNotice, deleteNotice, addNotice, updateNotice };