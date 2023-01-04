import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { NumberInput, SegmentedControl } from '@mantine/core';
import { useForm } from '@mantine/form';

let patientABW = 0
let patientHeight = 0
type Gender = "Male" | "Female" | ""

function App() {
  
  const form = useForm({
    initialValues: {
      patientABW: 0,
      patientHeight: 0,
      patientGender: "" as Gender,
    },
  })
  const calcIBW = (() => {
    let patientIBW = 1
  if (form.values.patientGender == "Male") {
    patientIBW = 50 + (2.3*(form.values.patientHeight-60))
  }
  else if (form.values.patientGender == "Female") {
    patientIBW = 45.5 + (2.3*(form.values.patientHeight-60))
  }
  else {
    Error("IBW error")
  }
    return patientIBW;
  })();
  
  let patientdosingBW = (form.values.patientABW/calcIBW) > 1.2 ? (calcIBW + (0.25*(form.values.patientABW-calcIBW))) : form.values.patientABW;
  
  return (
    <><NumberInput
      defaultValue={18}
      placeholder="Patient Weight"
      label="Patient Weight"
      variant="filled"
      {...form.getInputProps('patientABW')}
      hideControls />
      
      <NumberInput
        defaultValue={18}
        placeholder="Patient Height"
        label="Patient Height"
        variant="filled"
        {...form.getInputProps('patientHeight')}
        hideControls />

<SegmentedControl
        {...form.getInputProps('patientGender')}
      data={[
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
      ]}
    />

              "{form.values.patientABW}"
              "{form.values.patientHeight}"
              "{form.values.patientGender}"
              "{calcIBW}"
              "{patientdosingBW}"

      </>


  );
}

export default App;
