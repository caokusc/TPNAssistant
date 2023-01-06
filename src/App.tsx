import { useEffect, useState } from "react";
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
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { formatWithOptions } from "util";
import { useShallowEffect } from "@mantine/hooks";

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

      patientFluidneeds: 40,
      patientLipidnonproteincal: 25,
      propofol: false,
      propofolrate: 0,
      customVolume: false,
      customVolumeamount: 0,
      infusionRate: 100,
    },
  });

  let patientABW =
    form.values.weightmeasurement == "kg"
      ? form.values.patientABW
      : form.values.patientABW / 2.205;
  let patientHeight =
    form.values.heightmeasurement == "inches"
      ? form.values.patientHeight
      : form.values.patientHeight / 2.54;

  const calcIBW = (() => {
    let patientIBW = 0;
    if (form.values.patientGender == "Male") {
      patientIBW = 50 + 2.3 * (patientHeight - 60);
    } else if (form.values.patientGender == "Female") {
      patientIBW = 45.5 + 2.3 * (patientHeight - 60);
    } else {
      Error("IBW error");
    }
    return patientIBW;
  })();

  let patientdosingBW =
    patientABW / calcIBW > 1.2
      ? calcIBW + 0.25 * (patientABW - calcIBW)
      : patientABW;
  let patientObesity = patientABW / calcIBW > 1.2 ? "Obese" : "Not Obese";
  let patientBMI =
    patientABW != 0 && patientHeight != 0
      ? patientABW / (patientHeight / 39.37) ** 2
      : 0;
  let initdisable =
    patientBMI == 0 || form.values.patientGender == "" ? true : false;

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

  const maxCalmark =
    form.values.patientCaloricStats == "Standard"
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

  const proMarks = [
    { stats: "Maintenance", min: 1.2, max: 1.5 },
    { stats: "Crit1", min: 1.2, max: 2 },
    { stats: "Crit2", min: 2, max: 2 },
    { stats: "Crit3", min: 2.5, max: 2.5 },
    { stats: "CKD1", min: 0.6, max: 0.8 },
    { stats: "CKD2", min: 1.2, max: 2.5 },
    { stats: "Burn", min: 1.5, max: 2 },
  ];

  const proteinmarks = proMarks.find((element) => element.stats === form.values.patientProteinStats);
  const proteinmarksmin = proteinmarks?.min!;
  const proteinmarksmax = proteinmarks?.max!;

  let calcCalories =
    patientBMI < 30
      ? patientdosingBW * form.values.patientCaloricNeeds
      : patientBMI >= 30 && patientBMI <= 50
      ? patientABW * form.values.patientCaloricNeeds
      : patientBMI > 50
      ? calcIBW * form.values.patientCaloricNeeds
      : 0;
  let calcproteinsintial =
    patientBMI < 30
      ? patientdosingBW * form.values.patientProteinNeeds
      : calcIBW * form.values.patientProteinNeeds;
  let calcProteins = form.values.openAbd
    ? calcproteinsintial + form.values.openAbdamount * form.values.openAbddose
    : calcproteinsintial;
  let calcFluids =
    form.values.customVolume == true
      ? form.values.customVolumeamount
      : patientdosingBW * form.values.patientFluidneeds;
  let calcNonproteincal = calcCalories - calcProteins * 4;
  let calcLipidscal =
    calcNonproteincal * (form.values.patientLipidnonproteincal / 100);
  let calcLipidsvol = form.values.propofol
    ? (calcLipidscal - form.values.propofolrate * 26.4) / 2
    : calcLipidscal / 2;
  let calcLipidsvolscript =
    form.values.propofol && calcLipidsvol <= 0
      ? "Lipids Satisfied by Propofol Infusion"
      : Math.round(calcLipidsvol) + "mL (of 20% lipid fomulation)";
  let calcLipidscalscript =
    form.values.propofol && calcLipidsvol <= 0
      ? Math.round(form.values.propofolrate * 26.4) +
        " kcal (of propofol infusion)" +
        Math.round(Math.abs(calcLipidscal - form.values.propofolrate * 26.4)) +
        " kcal Excess"
      : form.values.propofol
      ? Math.round(calcLipidscal - form.values.propofolrate * 26.4) +
        " kcal (of 20% lipid fomulation) " +
        Math.round(form.values.propofolrate * 26.4) +
        " kcal (of propofol infusion)"
      : Math.round(calcLipidscal) + " kcal";
  let calcCarbohydratescal = calcCalories - (calcProteins * 4 + calcLipidscal);
  let calcGIR =
    calcCarbohydratescal /
    3.4 /
    patientABW /
    ((calcFluids / form.values.infusionRate) * 60);
  let lipidFrequency =     form.values.propofol && calcLipidsvol <= 0
  ? "Lipids Satisfied by Propofol Infusion"
  : form.values.propofol
  ? Math.round(((calcLipidscal - form.values.propofolrate * 26.4)*3.5)/250)
  : Math.round((calcLipidscal * 3.5) / 250);
  

  const patientCaloricNeeds = form.values.patientCaloricNeeds;
  const patientProteinNeeds = form.values.patientProteinNeeds;

  useEffect(() => {
    if (patientCaloricNeeds < minCalmark){
      form.setValues({ patientCaloricNeeds: minCalmark });
    }
    else if (patientCaloricNeeds > maxCalmark){
      form.setValues({ patientCaloricNeeds: maxCalmark });
    }
  }, [patientCaloricNeeds, minCalmark, maxCalmark]);

  useEffect(() => {
    if (patientProteinNeeds < proteinmarksmin){
      form.setValues({ patientProteinNeeds: proteinmarksmin });
    }
    else if (patientProteinNeeds > proteinmarksmax){
      form.setValues({ patientProteinNeeds: proteinmarksmax });
    }
  }, [patientProteinNeeds, proteinmarksmin, proteinmarksmax]);

  return (
    <>
      <Grid>
        <Grid.Col span={4}>
          <NumberInput
            defaultValue={60}
            placeholder="Patient Weight"
            label={"Patient Weight in " + form.values.weightmeasurement}
            variant="filled"
            {...form.getInputProps("patientABW")}
            hideControls
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <SegmentedControl
          orientation="vertical"
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
            label={"Patient Height in " + form.values.heightmeasurement}
            variant="filled"
            {...form.getInputProps("patientHeight")}
            hideControls
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <SegmentedControl
          orientation="vertical"
            {...form.getInputProps("heightmeasurement")}
            data={[
              { label: "cm", value: "cm" },
              { label: "inches", value: "inches" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Center>

            <SegmentedControl
            size="md"
            color="blue"
              {...form.getInputProps("patientGender")}
              data={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
              ]}
            />
          </Center>        <hr></hr>
        </Grid.Col>

        <Grid.Col span={6} px={50}>
          <Radio.Group
            name="Calories"
            orientation="vertical"
            label="Select Caloric Requirements"
            spacing="xs"
            offset="sm"
            defaultValue="Standard"
            {...form.getInputProps("patientCaloricStats")}
          >
            <Tooltip label="25-30 kcal/kg/day">
              <Radio value="Standard" label="Standard" disabled={initdisable} />
            </Tooltip>
            <Tooltip label="30-40 kcal/kg/day"> 
            <Radio
              value="Severe"
              label="Severe Inujry"
              disabled={initdisable}
            /></Tooltip>
                        <Tooltip label="45-55 kcal/kg/day"> 
            <Radio
              value="Extensive"
              label="Extensive Trauma/Burn"
              disabled={initdisable}
            /></Tooltip>
                        <Tooltip label="11-14 kcal/kg/day by ABW"> 
            <Radio
              value="Obese"
              label="Obese and Critical Illness (BMI 30-50kg/m^2)"
              disabled={patientBMI > 50 || patientBMI < 30 || initdisable}
            /></Tooltip>
                        <Tooltip label="22-25 kcal/kg/day by IBW"> 
            <Radio
              value="Obese2"
              label="Obese and Critical Illness (BMI >50kg/m^2)"
              disabled={patientBMI < 50 || initdisable}
            /></Tooltip>
          </Radio.Group>
          <br></br>
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
        <Grid.Col span={6} px={50}>
          <Radio.Group
            name="Proteins"
            orientation="vertical"
            label="Select Protein Requirements"
            spacing="xs"
            offset="sm"
            {...form.getInputProps("patientProteinStats")}
          >
            <Tooltip label="1.2-1.5 gm/kg/day">
              <Radio
                value="Maintenance"
                label="Standard"
                disabled={initdisable}
              />
            </Tooltip>
            <Tooltip label="1.2-2 gm/kg/day"> 
            <Radio
              value="Crit1"
              label="Critical Illness (BMI <30kg/m^2)"
              disabled={initdisable || patientBMI > 30}
            /></Tooltip>
                        <Tooltip label="2 gm/kg/day by IBW"> 
            <Radio
              value="Crit2"
              label="Critical Illness (BMI 30-40kg/m^2)"
              disabled={patientBMI > 40 || patientBMI < 30 || initdisable}
            /></Tooltip>
                        <Tooltip label="2.5 gm/kg/day by IBW"> 
            <Radio
              value="Crit3"
              label="Critical Illness (BMI >40kg/m^2)"
              disabled={patientBMI < 40 || initdisable}
            /></Tooltip>
                        <Tooltip label="0.6-0.8 gm/kg/day(Not on HD, GFR <30m)"> 
            <Radio
              value="CKD1"
              label="Renal Failure/CKD"
              disabled={initdisable}
            /></Tooltip>
                        <Tooltip label="1.2-2.5 gm/kg/day"> 
            <Radio
              value="CKD2"
              label="Renal Failure/CKD with Dialysis"
              disabled={initdisable}
            /></Tooltip>
                        <Tooltip label="1.5-2 gm/kg/day"> 
            <Radio value="Burn" label="Burn Injury" disabled={initdisable} /></Tooltip>
          </Radio.Group>
          <br></br>
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
          <Tooltip label="Additional 15-30 gm protein per liter exudate lost"> 
          <Checkbox
            label="Open Abdomen"
            disabled={initdisable}
            {...form.getInputProps("openAbd")}
          />
</Tooltip>
          <div hidden={!form.values.openAbd}>
            <NumberInput
              defaultValue={1}
              placeholder="in L"
              label="Amount Exudate lost in L"
              variant="filled"
              {...form.getInputProps("openAbdamount")}
              hideControls
            />
            Additional protein for lost exudate
            <Slider
              size="sm"
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
            <br></br>
          </div>
        </Grid.Col>
        <Grid.Col span={12}>             <hr></hr>     </Grid.Col>
        <Grid.Col span={6} px={50}>
          {" "}
          Fluid Needs
          <Slider
            size="sm"
            disabled={initdisable || form.values.customVolume}
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
          <br></br>
          <Checkbox
            label="Custom Volume"
            disabled={initdisable}
            {...form.getInputProps("customVolume")}
          />
          <div hidden={!form.values.customVolume}>
            <NumberInput
              defaultValue={0}
              placeholder="in mL"
              label="Total TPN Volume in mL"
              variant="filled"
              {...form.getInputProps("customVolumeamount")}
              hideControls
            />
          </div>
        </Grid.Col>
        <Grid.Col span={6} px={50}>
          {" "}
          % Lipids from Nonprotein Calories
          <Slider
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
          <Tooltip label ="Propofol 10mg/ml contains 1.1 kcal/ml"> 
          <Checkbox
            label="Propofol"
            disabled={initdisable}
            {...form.getInputProps("propofol")}
          /></Tooltip>
          <div hidden={!form.values.propofol}>
            <NumberInput
              defaultValue={0}
              placeholder="in mL"
              label="Propofol rate in mL/hr"
              variant="filled"
              {...form.getInputProps("propofolrate")}
              hideControls
            />
          </div>
        </Grid.Col>
        <Grid.Col span={6} px={50}>
          <Tooltip label="Used in GIR estimate"> 
          <NumberInput
            defaultValue={100}
            placeholder="in mL"
            label="Infusion rate in mL/hr"
            disabled={initdisable}
            variant="filled"
            {...form.getInputProps("infusionRate")}
            hideControls
          /></Tooltip><div hidden={initdisable} >GIR: "{Math.round(calcGIR * 100000)/100} mg/kg/min"</div>

        </Grid.Col>
      </Grid>
      <br></br>
      <Center px={30}>
        <Table
          horizontalSpacing="sm"
          verticalSpacing="xs"
          withColumnBorders
          withBorder
        >
          <thead>
            <tr>
              <th>Characteristic</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>IBW</th>
              <th>{Math.round(calcIBW * 10) / 10} kg</th>
            </tr>{" "}
            <tr>
              <th>BMI</th>
              <th>{Math.round(patientBMI * 10) / 10}</th>
            </tr>
            <tr>
              <th>Dosing Weight</th>
              <th>{Math.round(patientdosingBW * 10) / 10} kg</th>
            </tr>
            <tr>
              <th>{"Obesity (>120% IBW)"}</th>
              <th>{patientObesity}</th>
            </tr>
            <tr>
              <th>TPN Volume</th>
              <th>{Math.round(calcFluids / 10) * 10}</th>
            </tr>
          </tbody>
        </Table>
      </Center>
      <Center px={30}>
        <Table
          horizontalSpacing="sm"
          verticalSpacing="xs"
          withColumnBorders
          withBorder
        >
          <thead>
            <tr>
              <th>Macronutrient</th>
              <th>Amount</th>
              <th>Percent by Weight</th>
              <th>Percent by Calories</th>
              <th>Calories</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Carbohydrates</th>
              <th>{Math.round(calcCarbohydratescal / 3.4)} gm</th>
              <th>
                {Math.round((calcCarbohydratescal / 3.4 / calcFluids) * 10000) /
                  100}{" "}
                %
              </th>
              <th>
                {Math.round((calcCarbohydratescal / calcCalories) * 10000) /
                  100}{" "}
                %
              </th>
              <th>{Math.round(calcCarbohydratescal)} kcal</th>
            </tr>
            <tr>
              <th>Proteins</th>
              <th>{Math.round(calcProteins)} gm</th>
              <th>{Math.round((calcProteins / calcFluids) * 10000) / 100} %</th>
              <th>
                {Math.round(((calcProteins * 4) / calcCalories) * 10000) / 100}{" "}
                %
              </th>
              <th>{Math.round(calcProteins * 4)} kcal</th>
            </tr>
            <tr>
              <th>Lipids</th>
              <th>{calcLipidsvolscript}</th>
              <th></th>
              <th>
                {Math.round((calcLipidscal / calcCalories) * 10000) / 100} %
              </th>
              <th> {calcLipidscalscript}</th>
            </tr>
            <tr></tr>
            <tr>
              <th>Total</th>
              <th></th>
              <th></th>
              <th></th>
              <th> {Math.round(calcCalories)} kcal</th>
            </tr>
          </tbody>
        </Table>
      </Center>
      <br></br>
      Suggested Weekly Lipid frequency (20% 250mL): {lipidFrequency}
      <br></br>
    </>
  );
}

export default App;
