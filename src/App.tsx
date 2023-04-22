import { useEffect, useRef, useState } from "react";
import {
  Box,
  Center,
  Checkbox,
  Grid,
  NumberInput,
  Radio,
  SegmentedControl,
  Slider,
  Table,
  Tabs,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";

type Gender = "Male" | "Female" | "";

function App() {
  const form = useForm({
    initialValues: {
      weightmeasurement: "kg",
      heightmeasurement: "cm",

      patientABW: 0,
      patientDosingWeight: 0,
      patientHeight: 0,
      patientGender: "" as Gender,

      patientCaloricStats: "Standard",
      patientCaloricNeeds: 0,

      patientProteinStats: "Maintenance",
      patientProteinNeeds: 0,

      openAbd: false,
      openAbddose: 20,
      openAbdamount: 0,

      patientFluidneeds: 40,
      patientLipidnonproteincal: 25,
      propofol: false,
      propofolrate: 0,
      customVolume: false,
      customVolumeamount: 2000,
      infusionRate: 100,

      sodiumMEQ: 0,
      potassiumMEQ: 0,
      magnesiumMEQ: 0,
      calciumMEQ: 0,
    },
  });

  const [dosingmethodmanual, setDosingmethod] = useState(false);
  function dosingselect() {
    if (dosingmethodmanual == false) {setDosingmethod(true);}
    else {setDosingmethod(false)}
    form.setValues({ patientCaloricStats: "Standard"});
    form.setValues({ patientProteinStats: "Maintenance"});
  }

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
    if (dosingmethodmanual == true) {patientIBW = 0;}
    else if (form.values.patientGender == "Male") {
      patientIBW = 50 + 2.3 * (patientHeight - 60);
    } else if (form.values.patientGender == "Female") {
      patientIBW = 45.5 + 2.3 * (patientHeight - 60);
    } else {
      Error("IBW error");
    }
    return patientIBW;
  })();

  let patientdosingBW =
  dosingmethodmanual ? form.values.patientDosingWeight :(
    patientABW / calcIBW > 1.2
      ? calcIBW + 0.25 * (patientABW - calcIBW)
      : patientABW);

  let patientObesity = dosingmethodmanual ? "N/A" : (patientABW / calcIBW > 1.2 ? "Obese" : "Not Obese");
  let patientBMI = dosingmethodmanual ? 0 : (
    patientABW != 0 && patientHeight != 0
      ? patientABW / (patientHeight / 39.37) ** 2
      : 0);
  let initdisable = dosingmethodmanual && patientdosingBW !=0 ? false :(
    patientBMI == 0 || form.values.patientGender == "" ? true : false);
    
      const calMarks = [
        { stats: "Standard", min: 25, max: 30 },
        { stats: "Severe", min: 30, max: 40 },
        { stats: "Extensive", min: 45, max: 55 },
        { stats: "Obese", min: 11, max: 14 },
        { stats: "Obese1", min: 22, max: 25 },
      ];
  const caloriemarks = calMarks.find(
    (element) => element.stats === form.values.patientCaloricStats
  );
  const caloriemarksmin = caloriemarks?.min!;
  const caloriemarksmax = caloriemarks?.max!;

  const proMarks = [
    { stats: "Maintenance", min: 1.2, max: 1.5 },
    { stats: "Crit1", min: 1.2, max: 2 },
    { stats: "Crit2", min: 2, max: 2 },
    { stats: "Crit3", min: 2.5, max: 2.5 },
    { stats: "CKD1", min: 0.6, max: 0.8 },
    { stats: "CKD2", min: 1.2, max: 2.5 },
    { stats: "Burn", min: 1.5, max: 2 },
  ];

  const proteinmarks = proMarks.find(
    (element) => element.stats === form.values.patientProteinStats
  );
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
      : Math.round(calcLipidsvol) + "mL (20% lipid fomulation)";
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
  let calcGIR = dosingmethodmanual == true ?
    calcCarbohydratescal /
    3.4 /
    patientdosingBW /
    ((calcFluids / form.values.infusionRate) * 60):
    calcCarbohydratescal /
    3.4 /
    patientABW /
    ((calcFluids / form.values.infusionRate) * 60);

  let lipidFrequency =
    form.values.propofol && calcLipidsvol <= 0
      ? "Lipids Satisfied by Propofol Infusion"
      : form.values.propofol
      ? Math.round(
          ((calcLipidscal - form.values.propofolrate * 26.4) * 3.5) / 250
        )
      : Math.round((calcLipidscal * 3.5) / 250);

  let dosingWeightDescrition =
    patientABW / calcIBW > 1.2
      ? "(>120% IBW): Uses adjusted body weight unless specified"
      : "(<120% IBW): Uses actual body weight";

  const patientCaloricNeeds = form.values.patientCaloricNeeds;
  const patientProteinNeeds = form.values.patientProteinNeeds;

  useEffect(() => {
    if (patientCaloricNeeds < caloriemarksmin) {
      form.setValues({ patientCaloricNeeds: caloriemarksmin });
    } else if (patientCaloricNeeds > caloriemarksmax) {
      form.setValues({ patientCaloricNeeds: caloriemarksmax });
    }
  }, [patientCaloricNeeds, caloriemarksmin, caloriemarksmax]);

  useEffect(() => {
    if (patientProteinNeeds < proteinmarksmin) {
      form.setValues({ patientProteinNeeds: proteinmarksmin });
    } else if (patientProteinNeeds > proteinmarksmax) {
      form.setValues({ patientProteinNeeds: proteinmarksmax });
    }
  }, [patientProteinNeeds, proteinmarksmin, proteinmarksmax]);



  let calcOsmolarity =
    calcLipidsvol > 0
      ? (calcProteins * 10 +
          calcCarbohydratescal * 1.47 +
          calcLipidsvol * 0.14) /
          calcFluids +
        (form.values.calciumMEQ * 1.4 +
          form.values.magnesiumMEQ * 1 +
          form.values.potassiumMEQ * 2 +
          form.values.sodiumMEQ * 2) /
          1000
      : (calcProteins * 10 + calcCarbohydratescal * 1.47) / calcFluids +
        (form.values.calciumMEQ * 1.4 +
          form.values.magnesiumMEQ * 1 +
          form.values.potassiumMEQ * 2 +
          form.values.sodiumMEQ * 2) /
          1000;

  return (
    <>
          <Tabs variant="pills" orientation="vertical" defaultValue="calculate" onTabChange={dosingselect}>
        <Tabs.List>
          <Tabs.Tab value="calculate" disabled={!dosingmethodmanual}>Calculate Dosing Weight</Tabs.Tab>
          <Tabs.Tab value="custom" disabled={dosingmethodmanual}>Manual Dosing Weight</Tabs.Tab>
        </Tabs.List>

  
      <Tabs.Panel value="calculate" pl="xs">
        <Grid columns={24}>
          <Grid.Col span={2} offset={1}>
          <SegmentedControl
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[3],
            })}
            orientation="vertical"
            {...form.getInputProps("weightmeasurement")}
            data={[
              { label: "Kg", value: "kg" },
              { label: "Lb", value: "lb" },
            ]}
            
          />
        </Grid.Col>
        <Grid.Col span={6} pr={10}>
          <NumberInput
            defaultValue={60}
            placeholder="Patient Weight"
            label={"Patient Weight in " + form.values.weightmeasurement}
            variant="filled"
            {...form.getInputProps("patientABW")}
            hideControls
            ta="center"
            styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
          />
        </Grid.Col>
        
        <Grid.Col span={2} offset={2}>
          <SegmentedControl
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[3],
            })}
            orientation="vertical"
            {...form.getInputProps("heightmeasurement")}
            data={[
              { label: "cm", value: "cm" },
              { label: "inches", value: "inches" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            defaultValue={60}
            placeholder="Patient Height"
            label={"Patient Height in " + form.values.heightmeasurement}
            variant="filled"
            {...form.getInputProps("patientHeight")}
            hideControls
            ta="center"
            styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
          />
        </Grid.Col>
        <Grid.Col span={2}></Grid.Col>
        <Grid.Col span={20}>
          <Center>
            <Box
              sx={(theme) => ({
                backgroundColor: theme.colors.gray[6],
                textAlign: "center",
                padding: 1,
                borderRadius: theme.radius.md,
              })}
            >
              <SegmentedControl
                sx={(theme) => ({
                  backgroundColor: theme.colors.gray[2],
                  borderRadius: theme.radius.md,
                })}
                color={form.values.patientGender == "Male" ? "blue" : "pink"}
                size="md"
                {...form.getInputProps("patientGender")}
                data={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
              />
            </Box>
          </Center>{" "}

        </Grid.Col>
        </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="custom" pl="xs">
          <Grid columns={24}>        
            <Grid.Col span={1} offset={1}>
          <SegmentedControl
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[3],
            })}
            orientation="vertical"
            {...form.getInputProps("weightmeasurement")}
            data={[
              { label: "Kg", value: "kg" },
              { label: "Lb", value: "lb" },
            ]}
          /></Grid.Col>
        <Grid.Col span={6} offset={1}>
        <NumberInput
            defaultValue={0}
            placeholder="Enter Dosing Weight"
            label={"Dosing Weight in " + form.values.weightmeasurement}
            variant="filled"
            {...form.getInputProps("patientDosingWeight")}
            hideControls
            ta="center"
            styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
          />
</Grid.Col>
</Grid>
            
</Tabs.Panel>        
</Tabs>
<hr></hr>
<Grid>
        <Grid.Col span={6} px={50}>
          <Radio.Group
            name="Calories"
            orientation="vertical"
            label="Select Caloric Requirements"
            spacing={5}
            offset="xs"
            size="sm"
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
              />
            </Tooltip>
            <Tooltip label="45-55 kcal/kg/day">
              <Radio
                value="Extensive"
                label="Extensive Trauma/Burn"
                disabled={initdisable}
              />
            </Tooltip>
            <div  hidden={dosingmethodmanual}>
            <Tooltip label="11-14 kcal/kg/day by ABW">
              <Radio
                value="Obese"
                label="Obese and Critical Illness (BMI 30-50kg/m^2)"
                disabled={patientBMI > 50 || patientBMI < 30 || initdisable}
              />
            </Tooltip>
            <Tooltip label="22-25 kcal/kg/day by IBW">
              <Radio
                value="Obese2"
                label="Obese and Critical Illness (BMI >50kg/m^2)"
                disabled={patientBMI < 50 || initdisable}
              />
            </Tooltip></div>
          </Radio.Group>
          <br></br>
          <Slider
            size="md"
            labelAlwaysOn
            label={form.values.patientCaloricNeeds + " kcal/kg"}
            step={0.5}
            disabled={initdisable}
            min={caloriemarksmin}
            max={caloriemarksmax}
            {...form.getInputProps("patientCaloricNeeds")}
            marks={[
              { value: caloriemarksmin, label: caloriemarksmin },
              { value: caloriemarksmax, label: caloriemarksmax },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={6} px={50}>
          <Radio.Group
            name="Proteins"
            orientation="vertical"
            label="Select Protein Requirements"
            spacing={2}
            offset={2}
            size="sm"
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
              />
            </Tooltip>
            <div hidden={dosingmethodmanual}>
            <Tooltip label="2 gm/kg/day by IBW">
              <Radio
                value="Crit2"
                label="Critical Illness (BMI 30-40kg/m^2)"
                disabled={patientBMI > 40 || patientBMI < 30 || initdisable}
              />
            </Tooltip>
            <Tooltip label="2.5 gm/kg/day by IBW">
              <Radio
                value="Crit3"
                label="Critical Illness (BMI >40kg/m^2)"
                disabled={patientBMI < 40 || initdisable}
              />
            </Tooltip></div>
            <Tooltip label="0.6-0.8 gm/kg/day(Not on HD, GFR <30m)">
              <Radio
                value="CKD1"
                label="Renal Failure/CKD"
                disabled={initdisable}
              />
            </Tooltip>
            <Tooltip label="1.2-2.5 gm/kg/day">
              <Radio
                value="CKD2"
                label="Renal Failure/CKD with Dialysis"
                disabled={initdisable}
              />
            </Tooltip>
            <Tooltip label="1.5-2 gm/kg/day">
              <Radio value="Burn" label="Burn Injury" disabled={initdisable} />
            </Tooltip>
          </Radio.Group>
          <br></br>
          <Slider
            size="md"
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
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
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
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
            />
            Additional protein for lost exudate per liter
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
        <Grid.Col span={12}>
          {" "}
          <hr></hr>{" "}
        </Grid.Col>
        <Grid.Col span={6} px={50}>
          {" "}
          <div hidden={form.values.customVolume}>
          TPN Volume by Weight
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
          </div>
                    <div hidden={!form.values.customVolume}>
            <NumberInput
              defaultValue={2000}
              placeholder="in mL"
              label="Total TPN Volume in mL"
              variant="filled"
              {...form.getInputProps("customVolumeamount")}
              hideControls
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
            />
          </div>
          <br></br>
          <Checkbox
            label="Custom TPN Volume"
            disabled={initdisable}
            {...form.getInputProps("customVolume")}
            styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
          />

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
            styles={{ track: { backgroundColor: 'red'} }}
          />
          <br></br>
          
          <Tooltip label="Propofol 10mg/ml contains 1.1 kcal/ml">
            <Checkbox
              label="Active Propofol Infusion"
              disabled={initdisable}
              {...form.getInputProps("propofol")}
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
            />
          </Tooltip>
          <div hidden={!form.values.propofol}>
            <NumberInput
              defaultValue={0}
              placeholder="in mL"
              label="Propofol rate in mL/hr"
              variant="filled"
              {...form.getInputProps("propofolrate")}
              hideControls
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
            />
          </div>
        </Grid.Col>
      </Grid>
      <Center px={40} mt={10} 
       >
<Table
          horizontalSpacing="xs"
          verticalSpacing={7}
          withColumnBorders
          withBorder
        sx={{
          backgroundColor: "lightgray",
        }}
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
      <Center>
        {" "}
        <b>
          {" "}
          TPN Volume: {Math.round(calcFluids / 10) * 10} mL <br></br>
          Suggested Weekly Lipid frequency (20% 250mL): {lipidFrequency}
        </b>{" "}
      </Center>

      <br></br>
      <Tabs variant="pills" orientation="vertical" defaultValue="basic info">
        <Tabs.List>
          <Tabs.Tab value="basic info">Basic Info</Tabs.Tab>
          <Tabs.Tab value="osmolarity">Osmolarity</Tabs.Tab>
          <Tabs.Tab value="GIR">GIR</Tabs.Tab>
          <Tabs.Tab value="formula">Formula</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basic info" pl="xs">
          <Center px={50}>
            <Table
              highlightOnHover
              horizontalSpacing="sm"
              verticalSpacing="xs"
              withColumnBorders
              withBorder
              sx={{
                backgroundColor: "lightgray",
              }}
            >
              <thead>
                <tr>
                  <th>Characteristic</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <Tooltip.Floating
                  position="right"
                  width={150}
                  multiline
                  label="Male: [50kg + 2.3 x (Height(Inches) - 60]    Female: [45.5kg + 2.3 x (Height(Inches) - 60]"
                >
                  <tr hidden={dosingmethodmanual}>
                    <th>IBW</th>
                    <th>{Math.round(calcIBW * 10) / 10} kg</th>
                  </tr>
                </Tooltip.Floating>
                <tr hidden={dosingmethodmanual}>
                  <th>BMI</th>
                  <th>
                    {Math.round(patientBMI * 10) / 10} kg/m<sup>2</sup>
                  </th>
                </tr>
                <Tooltip.Floating label={dosingWeightDescrition}>
                  <tr>
                    <th>Dosing Weight</th>
                    <th>{Math.round(patientdosingBW * 10) / 10} kg</th>
                  </tr>
                </Tooltip.Floating>
                <tr hidden={dosingmethodmanual}>
                  <th>{"Obesity (>120% IBW)"}</th>
                  <th>{patientObesity}</th>
                </tr>
              </tbody>
            </Table>     
     
          </Center>
<Box               sx={(theme) => ({
                padding: 20,
                borderRadius: theme.radius.md,
              })} > </Box> 
        </Tabs.Panel>

        <Tabs.Panel value="osmolarity" pl="xs">
          <Grid columns={24}>
            {" "}
            <Grid.Col span={7} offset={1}>
              <NumberInput
                defaultValue={0}
                placeholder="in mEq/L"
                label="Na Chloride, Acetate or Phosphate salt in mEq/L"
                disabled={initdisable}
                variant="filled"
                {...form.getInputProps("sodiumMEQ")}
                hideControls
                styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
              />
              <NumberInput
                defaultValue={0}
                placeholder="in mEq/L"
                label="K Chloride, Acetate or Phosphate salt in mEq/L"
                disabled={initdisable}
                variant="filled"
                {...form.getInputProps("potassiumMEQ")}
                hideControls
                styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
              />
              <NumberInput
                defaultValue={0}
                placeholder="in mEq/L"
                label="Magnesium sulfate in mEq/L"
                disabled={initdisable}
                variant="filled"
                {...form.getInputProps("magnesiumMEQ")}
                hideControls
                styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
              />
              <NumberInput
                defaultValue={0}
                placeholder="in mEq/L"
                label="Calcium Gluconate in mEq/L"
                disabled={initdisable}
                variant="filled"
                {...form.getInputProps("calciumMEQ")}
                hideControls
                styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
              />
              <br></br>
              <br></br>
            </Grid.Col>
            <br></br>
            Estimated Osmolarity: {Math.round(calcOsmolarity * 100000) /
              100}{" "}
            mOsm/L{" "}
          </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="GIR">
            <Grid align="center">
              <Grid.Col span={3}>
                        <Tooltip label="Used in GIR estimate with Total Volume and Carbohydrates">  
                          <NumberInput
              defaultValue={100}
              placeholder="in mL"
              label="TPN Infusion rate in mL/hr"
              disabled={initdisable}
              variant="filled"
              {...form.getInputProps("infusionRate")}
              hideControls
              styles={{ input: { backgroundColor: 'lightgrey', borderColor: 'black' } }}
              mx={50}
            />           
            </Tooltip> 
            </Grid.Col>
            <Grid.Col span={3}>
          <div hidden={initdisable}>
            GIR: {Math.round(calcGIR * 100000) / 100} mg/kg/min
          </div>
            </Grid.Col>
            </Grid>

        </Tabs.Panel>
        <Tabs.Panel value="formula" pl="xs">
          <Center>
            {
              "Ideal Body Weight (IBW): Male: [50kg + 2.3 x (Height(Inches) - 60]   "
            }{" "}
            <br></br>
            {
              "Ideal Body Weight (IBW):  Female: [45.5kg + 2.3 x (Height(Inches) - 60]  "
            }{" "}
            <br></br> <br></br>
            {
              "Adjusted Body Weight (AjBW): IBW + 0.25 x (Height(Inches)-IBW)"
            }{" "}
            <br></br>
            {"Dosing Body Weight: Actual BW [If ABW < 120% IBW]"}
            <br></br>
            {"Dosing Body Weight: Adjusted BW [If ABW > 120% IBW]"}
            <br></br>
            {"Body Mass Index (BMI): Weight(kg) / Height(m)^2"} <br></br>{" "}
            <br></br>
            {"Dextrose/Carbohydrate/Sugar = 3.4kcal/g"} <br></br>
            {"Proteins = 4kcal/g"} <br></br>
            {"Lipids (20% Concentration)= 2kcal/mL"} <br></br>
            {"Propofol (10mg/ml Concentration)= 1.1kcal/mL"} <br></br> <br></br>
            {"Kg = 2.205 x lb"} <br></br>
            {"Inches = 2.54 x cm"} <br></br> <br></br>
            {"GIR = [Total Carbohydrates(g)/Weight(kg)] / [Total Fluid Volume(mL)/Infusion Rate(mL/hr*60min/hr)]"} <br></br>
          </Center>
          <br></br>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default App;
