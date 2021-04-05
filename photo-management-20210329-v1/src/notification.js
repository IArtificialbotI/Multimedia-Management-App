import { notification } from "antd";

export const openNotificationWithIcon = (type, title, description) => {
  notification[type]({
    message: title,
    description: description,
  });
};

export const openNotificationSuccess = (title, description) => {
  openNotificationWithIcon("success", title, description);
};

export const openNotificationInfo = (title, description) => {
  openNotificationWithIcon("info", title, description);
};

export const openNotificationWarning = (title, description) => {
  openNotificationWithIcon("warning", title, description);
};

export const openNotificationError = (title, description) => {
  openNotificationWithIcon("error", title, description);
};
