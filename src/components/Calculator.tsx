import { Card } from "@/components/ui/card";
import { StepIndicator } from "./calculator/StepIndicator";
import { IntroductionStep } from "./calculator/IntroductionStep";
import { PersonalInfoStep } from "./calculator/PersonalInfoStep";
import { ContactInfoStep } from "./calculator/ContactInfoStep";
import { CostEstimateStep } from "./calculator/CostEstimateStep";
import { ReviewStep } from "./calculator/ReviewStep";
import { DetailedReportDialog } from "./calculator/DetailedReportDialog";
import { NavigationButtons } from "./calculator/NavigationButtons";
import { CalculatorHeader } from "./calculator/CalculatorHeader";
import { useCalculator } from "@/hooks/useCalculator";

const Calculator = () => {
  const costPerMinute = 0.05;
  const {
    step,
    showReport,
    formData,
    handleInputChange,
    handleNext,
    handleBack,
    handleSubmit,
    setShowReport,
  } = useCalculator(costPerMinute);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 glass-card animate-fade-in">
        <CalculatorHeader
          title="Chatsites Voice AI Calculator"
          subtitle="Calculate your estimated monthly costs"
        />

        <StepIndicator currentStep={step} totalSteps={5} />

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          {step === 1 && <IntroductionStep />}

          {step === 2 && (
            <PersonalInfoStep formData={formData} onChange={handleInputChange} />
          )}

          {step === 3 && (
            <ContactInfoStep formData={formData} onChange={handleInputChange} />
          )}

          {step === 4 && (
            <CostEstimateStep
              formData={formData}
              onChange={handleInputChange}
              costPerMinute={costPerMinute}
            />
          )}

          {step === 5 && (
            <ReviewStep formData={formData} costPerMinute={costPerMinute} />
          )}

          <NavigationButtons
            step={step}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        </form>
      </Card>

      <DetailedReportDialog
        open={showReport}
        onOpenChange={setShowReport}
        formData={formData}
        costPerMinute={costPerMinute}
      />
    </div>
  );
};

export default Calculator;