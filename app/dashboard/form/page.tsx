'use client'

import React from "react";
import DynamicForm from "@/components/FormBuilder";

const DynamicFormPage = () => {
  return (
    <div style={{  margin: "auto", padding: "20px" }}>
      <DynamicForm num="16" subcarpeta="1" />
    </div>
  );
};

export default DynamicFormPage;
