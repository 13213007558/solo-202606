import React from "react";
import { useParams } from "react-router-dom";

const ExhibitionDetail = () => {
  const { id } = useParams();
  return <div style={{ padding: "24px", color: "#fff" }}>Exhibition: {id}</div>;
};

export default ExhibitionDetail;
