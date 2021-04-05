import { Empty } from "antd";

const EmptyData = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Empty />
    </div>
  );
};

export default EmptyData;
