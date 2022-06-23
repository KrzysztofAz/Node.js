require("dotenv").config();
const express = require("express");
const status = require("http-status");
const app = express();
const fs = require("fs");

const {
  init,
  getNotices,
  getNotice,
  deleteNotice,
  addNotice,
  updateNotice,
} = require("./db");

let isDebug;
if (process.argv[2] == "debug") {
  isDebug = true;
} else {
  isDebug = false;
}
const saveTasks = (req, res, next) => {
  if (isDebug) {
    const data = new Date() + " " + req.method + " " + req.path;
    const file = "debug.txt";
    fs.appendFile(file, data + "\n", "utf8", (err) => {
      if (err) {
        throw err;
      }
    });
    next();
  } else {
    next();
  }
};

app.use(express.json(), saveTasks);

init()
  .then(() => {
    app.get("/notices", async (req, res) => {
      try {
        let notices = await getNotices();
        if (req.query.author) {
          notices = notices.filter(
            (notice) => notice.author == req.query.author
          );
        } else if (req.query.description) {
          notices = notices.filter((notice) =>
            notice.description.includes(req.query.description)
          );
        } else if (req.query.title) {
          notices = notices.filter((notice) =>
            notice.title.includes(req.query.title)
          );
        } else if (req.query.tags) {
          notices = notices.filter((notice) =>
            notice.tags.includes(req.query.tags)
          );
        } else if (req.query.minprice && req.query.maxprice) {
          notices = notices.filter(
            (notice) =>
              (notice.price * 1 >= req.query.minprice) &
              (notice.price * 1 <= req.query.maxprice)
          );
        } else if (req.query.minyear && req.query.maxyear) {
          notices = notices.filter(
            (notice) =>
              (notice.createdTime.toString().substr(11, 4) >=
                req.query.minyear) &
              (notice.createdTime.toString().substr(11, 4) <= req.query.maxyear)
          );
        }
        if (notices.length === 0) {
          res.statusCode = status.NO_CONTENT;
          console.log("NO_CONTENT. CODE: " + res.statusCode);
          res.send("NO_CONTENT. CODE: " + res.statusCode);
        } else {
          res.statusCode = status.OK;
          console.log("STATUS_OK: " + res.statusCode);
          res.send(notices);
        }
      } catch (error) {
        res.statusCode = status.INTERNAL_SERVER_ERROR;
        console.log("ERROR: " + error);
        res.send("INTERNAL_SERVER_ERROR. CODE: " + res.statusCode);
      }
    });

    app.get("/notices/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const notice = await getNotice(id);
        if (notice) {
          res.send(notice);
        }

        res.statusCode = status.NOT_FOUND;
        console.log("NOT_FOUND. CODE: " + res.statusCode);
        res.send("NOT_FOUND. CODE: " + res.statusCode);
      } catch (error) {
        res.statusCode = status.INTERNAL_SERVER_ERROR;
        console.log("ERROR: " + error);
        res.send("INTERNAL_SERVER_ERROR. CODE: " + res.statusCode);
      }
    });

    app.post("/notices", async (req, res) => {
      try {
        const newNotice = req.body;
        if (
          !newNotice.title ||
          !newNotice.description ||
          !newNotice.author ||
          !newNotice.tags ||
          !newNotice.category ||
          !newNotice.price ||
          !newNotice.phone ||
          !newNotice.city
        ) {
          res.statusCode = status.BAD_REQUEST;
          console.log("BAD_REQUEST. CODE: " + res.statusCode);
          res.send("BAD_REQUEST. CODE: " + res.statusCode);
        } else {
          const result = await addNotice(newNotice);
          if (result.insertedCount === 1) {
            res.statusCode = status.CREATED;
            console.log("CREATED_NOTICE. CODE: " + res.statusCode);
            res.send("CREATED_NOTICE. CODE: " + res.statusCode);
          }
        }
      } catch (error) {
        res.statusCode = status.INTERNAL_SERVER_ERROR;
        console.log("ERROR: " + error);
        res.send("INTERNAL_SERVER_ERROR. CODE: " + res.statusCode);
      }
    });

    app.patch("/notices/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const modifiedNotice = req.body;
        if (modifiedNotice == null) {
          res.statusCode = status.BAD_REQUEST;
          console.log("BAD_REQUEST. CODE: " + res.statusCode);
          res.send("BAD_REQUEST. CODE: " + res.statusCode);
        } else {
          const result = await updateNotice(id, modifiedNotice);

          if (result.modifiedCount === 1) {
            res.statusCode = status.NO_CONTENT;
            console.log("NOTICE_MODIFIED. CODE: " + res.statusCode);
            res.send("NOTICE_MODIFIED: " + res.statusCode);
          } else if (result.matchedCount === 1) {
            res.statusCode = status.CONFLICT;
            console.log("NOTHING_TO_UPDATE. " + res.statusCode);
            res.send("NOTHING_TO_UPDATE. " + res.statusCode);
          } else {
            res.statusCode = status.NOT_FOUND;
            console.log("NOT_FOUND. " + res.statusCode);
            res.send("NOT_FOUND. " + res.statusCode);
          }
        }
      } catch (error) {
        res.statusCode = status.INTERNAL_SERVER_ERROR;
        console.log("ERROR: " + error);
        res.send("INTERNAL_SERVER_ERROR. CODE: " + res.statusCode);
      }
    });

    app.delete("/notices/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await deleteNotice(id);
        if (result.deletedCount == 1) {
          res.statusCode = status.NO_CONTENT;
          console.log("NOTICE_DELETED: " + res.statusCode);
          res.send("NOTICE_DELETED: " + res.statusCode);
        } else {
          res.statusCode = status.NOT_FOUND;
          console.log("NOT_FOUND. " + res.statusCode);
          res.send("NOT_FOUND. " + res.statusCode);
        }
      } catch (error) {
        res.statusCode = status.INTERNAL_SERVER_ERROR;
        console.log("ERROR: " + error);
        res.send("INTERNAL_SERVER_ERROR. CODE: " + res.statusCode);
      }
    });

    app.get("/heartbeat", (req, res) => {
      res.send(new Date().toString());
    });
  })
  .finally(() => {
    app.all("*", (req, res) => {
      res.statusCode = status.NOT_FOUND;
      res.sendFile(__dirname + "/404.jpg");
    });
    app.listen(process.env.PORT, () => console.log("server started"));
  });
