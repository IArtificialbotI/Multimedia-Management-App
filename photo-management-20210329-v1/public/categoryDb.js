const Datastore = require("nedb");
const categoryDb = new Datastore({ filename: "category.db", autoload: true });

//set automatic compaction
categoryDb.persistence.setAutocompactionInterval(5000);

const upsertLocation = (info) => {
  console.log("db-upsert-category-location info:", info);
  const doc = {
    type: info.type,
    sort1: info.country,
    sort2: info.region,
    previewPath: info.previewPath,
    previewType: info.previewType,
    lat: info.lat,
    lon: info.lon,
    data: {
      country: info.country,
      region: info.region,
    },
  };
  return new Promise((resolve, reject) => {
    categoryDb.update(
      {
        type: info.type,
        data: {
          country: info.country,
          region: info.region,
        },
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

const upsertCalendar = (info) => {
  console.log("db-upsert-category-calendar info:", info);
  const doc = {
    type: info.type,
    sort1: info.year,
    sort2: info.month,
    previewPath: info.previewPath,
    previewType: info.previewType,
    data: {
      year: info.year,
      month: info.month,
    },
  };
  return new Promise((resolve, reject) => {
    categoryDb.update(
      {
        type: info.type,
        data: {
          year: info.year,
          month: info.month,
        },
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

const upsertDevice = (info) => {
  console.log("db-upsert-category-device info:", info);
  const doc = {
    type: info.type,
    sort1: info.device,
    sort2: "",
    previewPath: info.previewPath,
    previewType: info.previewType,
    data: {
      device: info.device,
    },
  };
  return new Promise((resolve, reject) => {
    categoryDb.update(
      {
        type: info.type,
        data: {
          device: info.device,
        },
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

const upsert = (categoryInfo) => {
  console.log("db-upsert-category categoryInfo:", categoryInfo);

  if (categoryInfo.type === "location") {
    return upsertLocation(categoryInfo);
  }

  if (categoryInfo.type === "calendar") {
    return upsertCalendar(categoryInfo);
  }

  if (categoryInfo.type === "device") {
    return upsertDevice(categoryInfo);
  }
};

const findByCategory = (findInfo) => {
  console.log("db-find-categories-by-category findInfo:", findInfo);

  const info = {
    type: findInfo.type || "calendar",
    offset: findInfo.offset || 0,
    limit: findInfo.limit || 100,
  };

  return new Promise((resolve, reject) => {
    categoryDb
      .find({ type: info.type })
      .sort({ sort1: 1, sort2: 1 })
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

module.exports = {
  upsert,
  findByCategory,
};
