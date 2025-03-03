'use client'

import React from "react";
import DynamicForm from "@/components/dynamicForm";

const DynamicFormPage = () => {
  return (
    <div style={{  margin: "auto", padding: "20px" }}>
      <DynamicForm num="12" subcarpeta="21" />
    </div>
  );
};

export default DynamicFormPage;
