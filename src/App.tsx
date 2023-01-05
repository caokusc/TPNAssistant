import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
  Center,
  Checkbox,
  Grid,
  NumberInput,
  Radio,
  SegmentedControl,
  Slider,
  Table,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { formatWithOptions } from "util";

type Gender = "Male" | "Female" | "";

function App() {
  const form = useForm({
    initialValues: {
      weightmeasurement: "kg",
      heightmeasurement: "cm",

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

      patientFluidneeds:40,
      patientLipidnonproteincal: 25,
      propofol: 0,
    },
  });

  //let patientABW = form.values.weightmeasurement == kg ? 
  const calcIBW = (() => {
    let patientIBW = 0;
    if (form.values.patientGender == "Male") {
      patientIBW = 50 + 2.3 * (form.values.patientHeight - 60);
    } else if (form.values.patientGender == "Female") {
      patientIBW = 45.5 + 2.3 * (form.values.patientHeight - 60);
    } else {
      Error("IBW error");
    }
    return patientIBW;
  })();

  let patientdosingBW =
    form.values.patientABW / calcIBW > 1.2
      ? calcIBW + 0.25 * (form.values.patientABW - calcIBW)
      : form.values.patientABW;
  let patientObesity =
    form.values.patientABW / calcIBW > 1.2 ? "Obese" : "Not Obese";
  let patientBMI =
    form.values.patientABW != 0 && form.values.patientHeight != 0
      ? form.values.patientABW / (form.values.patientHeight / 39.37) ** 2
      : 0;
  let initdisable = patientBMI == 0 || form.values.patientGender == "" ? true : false;

  const minCalmark = (() => {
    return form.values.patientCaloricStats == "Standard"
      ? 25
      : form.values.patientCaloricStats == "Severe"
      ? 30
      : form.values.patientCaloricStats == "Extensive"
      ? 45
      : form.values.patientCaloricStats == "Obese"
      ? 11
      : form.values.patientCaloricStats == "Obese1"
      ? 22
      : 0;
  })();
  const maxCalmark = (() => {
    return form.values.patientCaloricStats == "Standard"
      ? 30
      : form.values.patientCaloricStats == "Severe"
      ? 40
      : form.values.patientCaloricStats == "Extensive"
      ? 55
      : form.values.patientCaloricStats == "Obese"
      ? 14
      : form.values.patientCaloricStats == "Obese1"
      ? 25
      : 0;
  })();

  const proMarks = [
    { stats: "Maintenance", min: 1.2, max: 1.5 },
    { stats: "Crit1", min: 1.2, max: 2 },
    { stats: "Crit2", min: 2, max: 2 },
    { stats: "Crit3", min: 2.5, max: 2.5 },
    { stats: "CKD1", min: 0.6, max: 0.8 },
    { stats: "CKD2", min: 1.2, max: 2.5 },
    { stats: "Burn", min: 1.5, max: 2 },
  ];

  const proteinmarksmin =
    proMarks[
      proMarks.findIndex(
        (element) => element.stats === form.values.patientProteinStats
      )
    ].min;
  const proteinmarksmax =
    proMarks[
      proMarks.findIndex(
        (element) => element.stats === form.values.patientProteinStats
      )
    ].max;

  let calcCalories = patientBMI<30 ? patientdosingBW * form.values.patientCaloricNeeds :
  patientBMI>=30 && patientBMI<=50 ? form.values.patientABW*form.values.patientCaloricNeeds : patientBMI>50 ? calcIBW*form.values.patientCaloricNeeds : 0;
  let calcproteinsintial = patientBMI<30 ? patientdosingBW * form.values.patientProteinNeeds : calcIBW * form.values.patientProteinNeeds
  let calcProteins = form.values.openAbd
    ? calcproteinsintial +
      (form.values.openAbdamount * form.values.openAbddose)
    : calcproteinsintial;

  let calcFluids = patientdosingBW * form.values.patientFluidneeds;
  let calcNonproteincal = calcCalories - calcProteins * 4;
  let calcLipidscal =
    calcNonproteincal * (form.values.patientLipidnonproteincal / 100);
  let calcCarbohydratescal = calcCalories - (calcProteins * 4 + calcLipidscal);
  let calcGIR =
    calcCarbohydratescal /
    3.4 /
    form.values.patientABW /
    ((calcFluids / 100) * 60);


  return (
    <>
      <Grid>
        <Grid.Col span={4}>
          <NumberInput
            defaultValue={60}
            placeholder="Patient Weight"
            label="Patient Weight in KG"
            variant="filled"
            {...form.getInputProps("patientABW")}
            hideControls
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <SegmentedControl
            {...form.getInputProps("weightmeasurement")}
            data={[
              { label: "Kg", value: "kg" },
              { label: "Lb", value: "lb" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            defaultValue={60}
            placeholder="Patient Height"
            label="Patient Height in Inches"
            variant="filled"
            {...form.getInputProps("patientHeight")}
            hideControls
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <SegmentedControl
            {...form.getInputProps("heightmeasurement")}
            data={[
              { label: "cm", value: "cm" },
              { label: "inches", value: "inches" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <SegmentedControl
            {...form.getInputProps("patientGender")}
            data={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Radio.Group
            name="Calories"
            orientation="vertical"
            label="Select Caloric Requirements"
            spacing="xs"
            offset="sm"
            defaultValue="Standard"
            {...form.getInputProps("patientCaloricStats")}
          >
            <Radio value="Standard" label="Standard" disabled={initdisable} />
            <Radio
              value="Severe"
              label="Severe Inujry"
              disabled={initdisable}
            />
            <Radio
              value="Extensive"
              label="Extensive Trauma/Burn"
              disabled={initdisable}
            />
            <Radio
              value="Obese"
              label="Obese and Critical Illness (BMI 30-50kg/m^2)"
              disabled={patientBMI > 50 || patientBMI < 30 || initdisable}
            />
            <Radio
              value="Obese2"
              label="Obese and Critical Illness (BMI >50kg/m^2)"
              disabled={patientBMI < 50 || initdisable}
            />
          </Radio.Group>

          <Slider
            size="lg"
            labelAlwaysOn
            label={form.values.patientCaloricNeeds + " kcal/kg"}
            step={0.5}
            disabled={initdisable}
            min={minCalmark}
            max={maxCalmark}
            {...form.getInputProps("patientCaloricNeeds")}
            marks={[
              { value: minCalmark, label: minCalmark },
              { value: maxCalmark, label: maxCalmark },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Radio.Group
            name="Proteins"
            orientation="vertical"
            label="Select Protein Requirements"
            spacing="xs"
            offset="sm"
            {...form.getInputProps("patientProteinStats")}
          >
            <Radio
              value="Maintenance"
              label="Standard"
              disabled={initdisable}
            />
            <Radio
              value="Crit1"
              label="Critical Illness (BMI <30kg/m^2)"
              disabled={initdisable || patientBMI > 30}
            />
            <Radio
              value="Crit2"
              label="Critical Illness (BMI 30-40kg/m^2)"
              disabled={patientBMI > 40 || patientBMI < 30 || initdisable}
            />
            <Radio
              value="Crit3"
              label="Critical Illness (BMI >40kg/m^2)"
              disabled={patientBMI < 40 || initdisable}
            />
            <Radio
              value="CKD1"
              label="Renal Failure/CKD"
              disabled={initdisable}
            />
            <Radio
              value="CKD2"
              label="Renal Failure/CKD with Dialysis"
              disabled={initdisable}
            />
            <Radio value="Burn" label="Burn Injury" disabled={initdisable} />
          </Radio.Group>
          <Slider
            size="lg"
            disabled={initdisable}
            labelAlwaysOn
            label={form.values.patientProteinNeeds + " gm/kg"}
            min={proteinmarksmin}
            max={proteinmarksmax}
            step={0.05}
            precision={3}
            {...form.getInputProps("patientProteinNeeds")}
            marks={[
              { value: proteinmarksmin, label: proteinmarksmin },
              { value: proteinmarksmax, label: proteinmarksmax },
            ]}
          />
<br></br>
          <Checkbox label="Open Abdomen" disabled={initdisable} {...form.getInputProps("openAbd")} />
          <div hidden={!form.values.openAbd}>
            <NumberInput
              defaultValue={1}
              placeholder="in L"
              label="Amount Exudate lost in L"
              variant="filled"
              {...form.getInputProps("openAbdamount")}
              hideControls
            />

            <Slider
              size="sm"
              labelAlwaysOn
              disabled={initdisable}
              label={form.values.openAbddose + " gm/L"}
              defaultValue={20}
              min={15}
              max={30}
              step={0.5}
              precision={3}
              {...form.getInputProps("openAbddose")}
              marks={[
                { value: 15, label: 15 },
                { value: 30, label: 30 },
              ]}
            />
          </div>
        </Grid.Col>
        <Grid.Col span={6}>      <Slider
        size="sm"
        disabled={initdisable}
        labelAlwaysOn
        label={form.values.patientFluidneeds + " mL/kg"}
        defaultValue={40}
        min={30}
        max={50}
        step={0.5}
        precision={3}
        {...form.getInputProps("patientFluidneeds")}
        marks={[
          { value: 30, label: 30 },
          { value: 50, label: 50 },
        ]}
      />
      "{calcFluids}" </Grid.Col>
        <Grid.Col span={6}>       <Slider
        size="md"
        disabled={initdisable}
        labelAlwaysOn
        label={form.values.patientLipidnonproteincal + " %"}
        defaultValue={25}
        min={20}
        max={30}
        step={0.5}
        precision={3}
        {...form.getInputProps("patientLipidnonproteincal")}
        marks={[
          { value: 20, label: 20 },
          { value: 30, label: 30 },
        ]}
      />
      <br></br>
                <Checkbox label="Propofol" disabled={initdisable} {...form.getInputProps("propofol")} />
          <div hidden={!form.values.propofol}>
            <NumberInput
              defaultValue={0}
              placeholder="in mL"
              label="Propofol administered in mL"
              variant="filled"
              {...form.getInputProps("propofolvolume")}
              hideControls
            />
          </div>
 </Grid.Col>
      </Grid>
      <Center px={30}>
      <Table horizontalSpacing="sm" verticalSpacing="xs">
      <thead>
        <tr>
          <th>Characteristic</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>      
      <tr>
          <th>IBW</th>
          <th>{calcIBW} kg</th>
        </tr>  <tr>
          <th>BMI</th>
          <th>{patientBMI}</th>
        </tr>
        <tr>
          <th>Dosing Weight</th>
          <th>{patientdosingBW} kg</th>
        </tr>
        <tr>
          <th>Obesity (>120% IBW)</th>
          <th>{patientObesity}</th>
        </tr>
        </tbody>
    </Table>       
      <Table horizontalSpacing="sm" verticalSpacing="xs">
      <thead>
        <tr>
          <th>Macroneutrient</th>
          <th>Amount</th>
          <th>Calories</th>
        </tr>
      </thead>
      <tbody>        <tr>
          <th>Carbohydrates</th>
          <th>{calcCarbohydratescal/3.4} gm</th>
          <th>{calcCarbohydratescal} kcal</th>
        </tr><tr>
          <th>Proteins</th>
          <th>{calcProteins} gm</th>
          <th>{calcProteins*4} kcal</th>
        </tr><tr>
          <th>Lipids</th>
          <th>{calcLipidscal/2} mL (of 20% lipid fomulation)</th>
          <th> {calcLipidscal} kcal</th>
        </tr>
        </tbody>
    </Table>
    </Center>

    Actual Body Weight: {form.values.patientABW}
 Patient Height: {form.values.patientHeight}" "
      {form.values.patientGender}" <br></br>"
      {form.values.patientCaloricStats}" "{calcCalories}"


 "{calcGIR * 1000}"
    </>
  );
}

export default App;
