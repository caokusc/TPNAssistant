import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Checkbox, NumberInput, Radio, SegmentedControl, Slider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { formatWithOptions } from "util";

type Gender = "Male" | "Female" | ""

function App() {
  
  const form = useForm({
    initialValues: {
      patientABW: 0,
      patientHeight: 0,
      patientGender: "" as Gender,

      patientCaloricStats: "Standard",
      patientCaloricNeeds: 0,

      patientProteinStats: "Maintenance",
      patientProteinNeeds: 0,

      openAbd: false,
      openAbddose: 0,
      openAbdamount: 0,
    },
  })
  const calcIBW = (() => {
    let patientIBW = 0
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
  let patientObesity = (form.values.patientABW/calcIBW) > 1.2 ? "Obese" : "Not Obese"
  let patientBMI = (form.values.patientABW != 0 && form.values.patientHeight != 0) ? form.values.patientABW/(form.values.patientHeight/39.37)**2 : 0
  let radiodisabled = (patientBMI == 0) ? true : false

  const minCalmark = (() => {
    return (form.values.patientCaloricStats == "Standard") ? 25
          : (form.values.patientCaloricStats == "Severe") ? 30
          : (form.values.patientCaloricStats == "Extensive") ? 45
          : (form.values.patientCaloricStats == "Obese") ? 11
          : (form.values.patientCaloricStats == "Obese1") ? 22
          : 0;
  })();
  const maxCalmark = (() => {
    return (form.values.patientCaloricStats == "Standard") ? 30
          : (form.values.patientCaloricStats == "Severe") ? 40
          : (form.values.patientCaloricStats == "Extensive") ? 55
          : (form.values.patientCaloricStats == "Obese") ? 14
          : (form.values.patientCaloricStats == "Obese1") ? 25
          : 0;
  })();

  const proMarks = 
  [{stats:"Maintenance", min:1.2, max:1.5},
  {stats:"Crit1", min:1.2, max:2},
  {stats:"Crit2", min:2, max:2},
  {stats:"Crit3", min:2.5, max:2.5},
  {stats:"CKD1", min:0.6, max:0.8},
  {stats:"CKD2", min:1.2, max:2.5},
  {stats:"Burn", min:1.5, max:2}
]


const proteinmarksmin = proMarks[proMarks.findIndex(element => element.stats === form.values.patientProteinStats)].min
const proteinmarksmax = proMarks[proMarks.findIndex(element => element.stats === form.values.patientProteinStats)].max

let calcCalories = patientdosingBW*form.values.patientCaloricNeeds
let calcProteins = form.values.openAbd ? (patientdosingBW*form.values.patientProteinNeeds)+(form.values.openAbdamount*form.values.openAbddose): patientdosingBW*form.values.patientProteinNeeds


  return (
    <><NumberInput
      defaultValue={60}
      placeholder="Patient Weight"
      label="Patient Weight"
      variant="filled"
      {...form.getInputProps('patientABW')}
      hideControls />
      
      <NumberInput
        defaultValue={60}
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
              "{patientObesity}"
              "{patientdosingBW}"
              "{patientBMI}"
              
      <Radio.Group
      name="Calories"
      orientation="vertical"
      label="Select Caloric Requirements"
      spacing="xs"
      offset="sm"
      defaultValue="Standard"
      {...form.getInputProps('patientCaloricStats')}
    >
      <Radio value="Standard" label="Standard" disabled={radiodisabled}/>
      <Radio value="Severe" label="Severe Inujry" disabled={radiodisabled}/>
      <Radio value="Extensive" label="Extensive Trauma/Burn" disabled={radiodisabled}/>
      <Radio value="Obese" label="Obese and Critical Illness (BMI 30-50kg/m^2)" disabled= {patientBMI>50 || patientBMI<30 || radiodisabled}/>
      <Radio value="Obese2" label="Obese and Critical Illness (BMI >50kg/m^2)" disabled= {patientBMI<50 || radiodisabled} />
    </Radio.Group>

    <Slider
      size="lg"
      labelAlwaysOn
      min={minCalmark}
      max={maxCalmark}
      {...form.getInputProps('patientCaloricNeeds')}
      marks={[
        { value: minCalmark, label: minCalmark },
        { value: maxCalmark, label: maxCalmark },
      ]}
    />
<br></br>
 "{form.values.patientCaloricStats}"
 "{calcCalories}"


 <Radio.Group
      name="Proteins"
      orientation="vertical"
      label="Select Protein Requirements"
      spacing="xs"
      offset="sm"
      {...form.getInputProps('patientProteinStats')}
    >
      <Radio value="Maintenance" label="Standard" disabled={radiodisabled}/>
      <Radio value="Crit1" label="Critical Illness (BMI <30kg/m^2)" disabled={radiodisabled || patientBMI>30}/>
      <Radio value="Crit2" label="Critical Illness (BMI 30-40kg/m^2)" disabled={patientBMI>40 || patientBMI<30 ||radiodisabled}/>
      <Radio value="Crit3" label="Critical Illness (BMI >40kg/m^2)" disabled= {patientBMI<40 || radiodisabled}/>
      <Radio value="CKD1" label="Renal Failure/CKD" disabled= {radiodisabled} />
      <Radio value="CKD2" label="Renal Failure/CKD with Dialysis" disabled= {radiodisabled} />
      <Radio value="Burn" label="Burn Injury" disabled= {radiodisabled} />
    </Radio.Group>

    <Slider
      size="lg"
      labelAlwaysOn
      min={proteinmarksmin}
      max={proteinmarksmax}
      step = {0.1}
      precision = {3}
      {...form.getInputProps('patientProteinNeeds')}
      marks={[
        { value: proteinmarksmin, label: proteinmarksmin },
        { value: proteinmarksmax, label: proteinmarksmax },
      ]}
    />
     "{form.values.patientProteinStats}"
    "{calcProteins}"


    <Checkbox
      label="Open Abdomen"
      {...form.getInputProps('openAbd')}
    />
    <div hidden ={!form.values.openAbd}>
    <NumberInput
        defaultValue={1}
        placeholder="in L"
        label="Amount Exudate lost"
        variant="filled"
        {...form.getInputProps('openAbdamount')}
        hideControls />
        
        <Slider
      size="sm"
      labelAlwaysOn
      label = {form.values.openAbddose + "gm/L"}
      defaultValue={20}
      min={15}
      max={30}
      step = {0.5}
      precision = {3}
      {...form.getInputProps('openAbddose')}
      marks={[
        { value: 15, label: 15 },
        { value: 30, label: 30 },
      ]}
    />
</div>


      </>



  );
}

export default App;
