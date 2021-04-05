import { ContentType, CategoryType, AppMode } from "./constants";

export const normalizeTextInput = (txt) => {
  return txt ? txt.trim() : "";
};

export const getFileExtension = (filename) => {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined;
};

export const getFileName = (filePath) => {
  return filePath ? filePath.substring(filePath.lastIndexOf("\\") + 1) : "";
};

export const toLocalPath = (file) => {
  return "file://" + file;
};

export const getContentType = (mode) => {
  if (mode === AppMode.MODE_VIDEO) return ContentType.TYPE_VIDEO;
  if (mode === AppMode.MODE_DOCUMENT) return ContentType.TYPE_DOCUMENT;
  if (mode === AppMode.MODE_PHOTO) return ContentType.TYPE_PHOTO;
  return "unknown";
};

export const getCategoryType = (mode) => {
  if (mode === AppMode.MODE_CALENDAR) return CategoryType.TYPE_CALENDAR;
  if (mode === AppMode.MODE_DEVICE) return CategoryType.TYPE_DEVICE;
  if (mode === AppMode.MODE_LOCATION) return CategoryType.TYPE_LOCATION;
  if (mode === AppMode.MODE_MAP) return CategoryType.TYPE_LOCATION; // treat Map as location category
  return "unknown";
};

export const isFileType = (mode) => {
  return (
    mode === AppMode.MODE_VIDEO ||
    mode === AppMode.MODE_DOCUMENT ||
    mode === AppMode.MODE_PHOTO
  );
};

export const isCatetoryType = (mode) => {
  return (
    mode === AppMode.MODE_CALENDAR ||
    mode === AppMode.MODE_DEVICE ||
    mode === AppMode.MODE_LOCATION ||
    mode === AppMode.MODE_MAP
  );
};

export const isSearchType = (mode) => {
  return mode === AppMode.MODE_SEARCH;
};
