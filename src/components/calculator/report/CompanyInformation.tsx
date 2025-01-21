interface CompanyInformationProps {
  formData: {
    name: string;
    companyName: string;
    email: string;
    phone: string;
  };
}

export const CompanyInformation = ({ formData }: CompanyInformationProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg md:text-xl font-semibold">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <p className="text-xs md:text-sm text-gray-500">Contact Name</p>
          <p className="text-sm md:text-base font-medium">{formData.name}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-500">Company</p>
          <p className="text-sm md:text-base font-medium">{formData.companyName}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-500">Email</p>
          <p className="text-sm md:text-base font-medium break-all">{formData.email}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-500">Phone</p>
          <p className="text-sm md:text-base font-medium">{formData.phone}</p>
        </div>
      </div>
    </div>
  );
};