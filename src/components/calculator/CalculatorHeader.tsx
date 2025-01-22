interface CalculatorHeaderProps {
  title: string;
  subtitle: string;
}

export const CalculatorHeader = ({ title, subtitle }: CalculatorHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};