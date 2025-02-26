import React from "react";

const PhoneMockup: React.FC = () => {
  const DesktopDark = `/images/mockup-1-dark.png`;
  const DesktopLight = `/images/mockup-1-light.png`;

  return (
  <div className="rounded-lg">
    <img className="h-96 w-full hidden dark:hidden object-contain rounded-lg" src={DesktopLight} alt="Mobile Placeholder" />
    <img className="h-96 w-full hidden dark:block object-contain rounded-lg" src={DesktopDark} alt="Mobile Placeholder" />
  </div>
  );
};

export default PhoneMockup;
