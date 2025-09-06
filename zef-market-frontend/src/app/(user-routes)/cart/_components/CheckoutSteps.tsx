"use client";

import { Stepper, Step, StepLabel, Box } from "@mui/material";

interface CheckoutStepsProps {
  activeStep: number; // 0 = Cart, 1 = Checkout, 2 = Order
}

const steps = ["Cart", "Checkout", "Order"];

export default function CheckoutSteps({ activeStep }: CheckoutStepsProps) {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepLabel-root .Mui-completed": {
            color: "success.main", // completed step
          },
          "& .MuiStepLabel-root .Mui-active": {
            color: "primary.main", // active step
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
