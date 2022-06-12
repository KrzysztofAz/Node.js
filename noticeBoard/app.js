require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();

const { init, getNotices, getNotice, deleteNotice, addNotice, updateNotice } = require('./db');

app.use(express.json());

init().then(() => {
    app.get('/notices', async (req, res) => {
        const notices = await getNotices();
        res.send(notices);
    });

    app.get('/notices/:id', async (req, res) => {
        const { id } = req.params;
        const notice = await getNotice(id);

        if (notice) {
            res.send(notice);
        }

        res.statusCode = status.NOT_FOUND;
        res.send();
    });

    app.post('/notices', async (req, res) => {
        const newNotice = req.body;

        const result = await addNotice(newNotice);
      
        if (result.insertedCount === 1) {
            res.statusCode = status.CREATED;
        } else {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
        }

        res.send();
    });

    app.patch('/notices/:id', async (req, res) => {
        const { id } = req.params;
        const modifiedNotice = req.body;

        if (modifiedNotice == null) {
            res.statusCode = status.BAD_REQUEST;
        } else {
            const result = await updateNotice(id, modifiedNotice);

            if (result.modifiedCount === 1) {
                res.statusCode = status.NO_CONTENT;
            } else if (result.matchedCount === 1) {
                res.statusCode = status.CONFLICT;
            } else {
                res.statusCode = status.NOT_FOUND;
            }
        }

        res.send();
    });

    app.delete('/notices/:id', async (req, res) => {
        const { id } = req.params;
        const result = await deleteNotice(id);

        if (result.deletedCount == 1){
            res.statusCode = status.NO_CONTENT;
        } else {
            res.statusCode = status.NOT_FOUND;
        }

        res.send();
    });
})
.finally(() => {
    app.get('/heartbeat', (req, res) => {
        res.send(new Date());
    });
    
    app.listen(process.env.PORT, () => console.log(`server started`));
});
