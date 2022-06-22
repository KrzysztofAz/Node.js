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
    let notice ={};
    notice.title = newNotice.title;
    notice.description = newNotice.description;
    notice.author = newNotice.author;
    notice.category = newNotice.category;
    notice.tags = newNotice.tags;
    notice.price = newNotice.price;
    notice.createdTime = new Date().toString();
    return noticesCollection.insertOne(notice);
}

const updateNotice = (id, modifiedNotice) => {
    return noticesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                "title": (modifiedNotice.title),
                "description": (modifiedNotice.description),
                "category": (modifiedNotice.category),
                "tags": (modifiedNotice.tags),
                "price": (modifiedNotice.price)
            }
        }
    );
}

module.exports = { init, getNotices, getNotice, deleteNotice, addNotice, updateNotice };
