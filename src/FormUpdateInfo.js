import { useEffect, useState } from "react";
import { Form, DatePicker, Layout, Input, Button } from "antd";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { getFileName, normalizeTextInput } from "./utils";
import { openNotificationSuccess, openNotificationError } from "./notification";
import moment from "moment";
import "./FormUpdateInfo.css";

// require this module for geocoding [internet required]
import { OpenStreetMapProvider } from "leaflet-geosearch";
const osmProvider = new OpenStreetMapProvider();

const DATE_TIME_PICKER_FORMAT = "YYYY-MM-DD HH:mm:ss";

const FormUpdateInfo = ({ file, contentType, onSuccess }) => {
  const [form] = Form.useForm();
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");

  // update country, region, device, timestamp if the file is changed
  useEffect(() => {
    console.log("on file changed", file);
    if (file && file.path && form) {
      form.setFieldsValue({
        datetime: moment(file.timestamp),
        device: file.device,
        country: file.country,
        region: file.region,
      });
      setCountry(file.country);
    }
  }, [file, form]);

  const onFinish = async (fieldsValue) => {
    const values = {
      timestamp: new Date(fieldsValue["datetime"]).getTime(),
      device: normalizeTextInput(fieldsValue.device),
      country: normalizeTextInput(fieldsValue.country),
      region: normalizeTextInput(fieldsValue.region),
      type: contentType,
      path: file.path,
      timeCreated: file.timeCreated,
    };

    // upsert to location category
    if (values.country || values.region) {
      const country = values.country || "";
      const region = values.region || "";
      const address = country + " " + region;

      try {
        const results = await osmProvider.search({ query: address });
        if (results && results.length > 0) {
          console.log("geocoding search result:", results);
          values.lat = results[0].x;
          values.lon = results[0].y;
        } else {
          console.log("geocoding empty result,", country, region);
        }
      } catch (error) {
        console.log("geocoding error,", country, region);
      }
    }

    console.log("FormUpdateInfo onFinish:", values);

    try {
      const result = await window.electron.ipcRenderer.invoke(
        "db-import-file",
        JSON.stringify(values)
      );
      console.log("result of db-import-file success:", result);
      openNotificationSuccess(
        "Import",
        "Import file with information successfully"
      );
      onSuccess(file);
    } catch (error) {
      console.log("result of db-import-file error:", error);
      openNotificationError("Import", "Import file with information error");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("FormUpdateInfo failed:", errorInfo);
  };

  return (
    <Layout className="form-update-info-container">
      <h3 className="info-file-name">File Name: {getFileName(file.path)}</h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item name="datetime" label="Select Date:">
          <DatePicker showTime format={DATE_TIME_PICKER_FORMAT} />
        </Form.Item>

        <Form.Item name="device" label="Input Device:">
          <Input />
        </Form.Item>

        <Form.Item name="country" label="Select Country:">
          <CountryDropdown value={country} onChange={setCountry} />
        </Form.Item>

        <Form.Item name="region" label="Select Region:">
          <RegionDropdown
            country={country}
            value={region}
            onChange={setRegion}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {file._id ? "Update" : "Import"}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default FormUpdateInfo;
