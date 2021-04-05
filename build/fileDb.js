const Datastore = require("nedb");
const fileDb = new Datastore({ filename: "file.db", autoload: true });

//set automatic compaction
fileDb.persistence.setAutocompactionInterval(5000);

const upsert = (fileInfo) => {
  console.log("db-import-file fileInfo:", fileInfo);

  // update timestamp
  const timestamp = fileInfo.timestamp || new Date().getTime();
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  const doc = {
    timestamp,
    year,
    month,
    device: fileInfo.device || "",
    country: fileInfo.country || "",
    region: fileInfo.region || "",
    type: fileInfo.type,
    path: fileInfo.path,
    timeCreated: fileInfo.timeCreated || new Date().getTime(),
    timeUpdated: new Date().getTime(),
  };

  return new Promise((resolve, reject) => {
    fileDb.update(
      {
        path: doc.path,
      },
      doc,
      { upsert: true },
      (err, numReplaced, newDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve({ newDoc, numReplaced });
        }
      }
    );
  });
};

const findByType = (findInfo) => {
  console.log("db-find-files-by-type findInfo:", findInfo);

  const info = {
    type: findInfo.type || "photo",
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    fileDb
      .find({ type: info.type })
      .sort({ timeUpdated: -1 })
      .skip(info.offset)
      .limit(info.limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const findByCategoryCalendar = (findInfo) => {
  console.log("db-find-files-by-category-calendar findInfo:", findInfo);
  const info = {
    year: findInfo.category.data.year,
    month: findInfo.category.data.month,
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    fileDb
      .find({ year: info.year, month: info.month })
      .sort({ timeUpdated: -1 })
      .skip(info.offset)
      .limit(info.limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const findByCategoryDevice = (findInfo) => {
  console.log("db-find-files-by-category-device findInfo:", findInfo);
  const info = {
    device: findInfo.category.data.device,
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    fileDb
      .find({ device: info.device })
      .sort({ timeUpdated: -1 })
      .skip(info.offset)
      .limit(info.limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const findByCategoryLocation = (findInfo) => {
  console.log("db-find-files-by-category-location findInfo:", findInfo);
  const info = {
    country: findInfo.category.data.country,
    region: findInfo.category.data.region,
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    fileDb
      .find({ country: info.country, region: info.region || "" })
      .sort({ timeUpdated: -1 })
      .skip(info.offset)
      .limit(info.limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const findByCategory = (findInfo) => {
  if (findInfo.category.type === "calendar") {
    return findByCategoryCalendar(findInfo);
  }

  if (findInfo.category.type === "device") {
    return findByCategoryDevice(findInfo);
  }

  if (findInfo.category.type === "location") {
    return findByCategoryLocation(findInfo);
  }
};

const findBySearch = (findInfo) => {
  console.log("db-find-files-by-search findInfo:", findInfo);
  const text = findInfo.text ? findInfo.text.toLowerCase() : "";
  const info = {
    text: text,
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    fileDb
      .find({
        $where: function () {
          const condition =
            (this.path && this.path.toLowerCase().includes(info.text)) ||
            (this.country && this.country.toLowerCase().includes(info.text)) ||
            (this.region && this.region.toLowerCase().includes(info.text)) ||
            (this.device && this.device.toLowerCase().includes(info.text));
          return !!condition;
        },
      })
      .sort({ timeUpdated: -1 })
      .skip(info.offset)
      .limit(info.limit)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

const getByPath = (path) => {
  console.log("db-get-file-by-path path:", path);

  return new Promise((resolve, reject) => {
    fileDb
      .find({ path })
      .limit(1)
      .exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
};

module.exports = {
  upsert,
  findByType,
  findByCategory,
  findBySearch,
  getByPath,
};
